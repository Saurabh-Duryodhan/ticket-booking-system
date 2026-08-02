"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const booking_entity_1 = require("./entities/booking.entity");
const day_slot_entity_1 = require("../events/entities/day-slot.entity");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const redis_service_1 = require("../redis/redis.service");
const booking_status_enum_1 = require("../../common/enums/booking-status.enum");
const booking_type_enum_1 = require("../../common/enums/booking-type.enum");
let BookingsService = BookingsService_1 = class BookingsService {
    constructor(bookingRepository, daySlotRepository, subscriptionsService, redisService, dataSource, bookingQueue) {
        this.bookingRepository = bookingRepository;
        this.daySlotRepository = daySlotRepository;
        this.subscriptionsService = subscriptionsService;
        this.redisService = redisService;
        this.dataSource = dataSource;
        this.bookingQueue = bookingQueue;
        this.logger = new common_1.Logger(BookingsService_1.name);
    }
    async createBooking(userId, dto) {
        if (dto.useQueue) {
            const job = await this.bookingQueue.add('process-booking', {
                userId,
                dto,
            });
            return {
                message: 'Booking request queued successfully',
                jobId: job.id,
                status: 'QUEUED',
            };
        }
        return this.executeBookingTransaction(userId, dto);
    }
    async executeBookingTransaction(userId, dto) {
        const qty = dto.ticketQuantity || 1;
        const lockKey = `lock:slot:${dto.daySlotId}`;
        const lockValue = `${userId}:${Date.now()}`;
        const acquired = await this.redisService.acquireLockWithRetry(lockKey, lockValue, 5000);
        if (!acquired) {
            throw new common_1.ConflictException('Server is handling high traffic for this slot. Please try again.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const slot = await queryRunner.manager.findOne(day_slot_entity_1.DaySlot, {
                where: { id: dto.daySlotId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!slot) {
                throw new common_1.NotFoundException(`Day slot ${dto.daySlotId} not found`);
            }
            if (slot.availableTickets < qty) {
                throw new common_1.BadRequestException(`Not enough tickets available. Requested: ${qty}, Available: ${slot.availableTickets}`);
            }
            let totalAmount = 0;
            if (dto.bookingType === booking_type_enum_1.BookingType.SUBSCRIPTION_PASS) {
                const sub = await this.subscriptionsService.getActiveSubscription(userId);
                if (!sub) {
                    throw new common_1.BadRequestException('User does not have an active subscription');
                }
                const existingCount = await queryRunner.manager.count(booking_entity_1.Booking, {
                    where: {
                        userId,
                        daySlotId: dto.daySlotId,
                        bookingType: booking_type_enum_1.BookingType.SUBSCRIPTION_PASS,
                        status: booking_status_enum_1.BookingStatus.CONFIRMED,
                    },
                });
                if (existingCount + qty > sub.plan.dailyPassLimit) {
                    throw new common_1.BadRequestException(`Subscription daily pass limit reached for date ${slot.date}. Allowed: ${sub.plan.dailyPassLimit}, Already booked: ${existingCount}`);
                }
                totalAmount = 0;
            }
            else {
                totalAmount = Number(slot.price) * qty;
            }
            slot.availableTickets -= qty;
            await queryRunner.manager.save(slot);
            const booking = queryRunner.manager.create(booking_entity_1.Booking, {
                userId,
                daySlotId: slot.id,
                bookingType: dto.bookingType,
                ticketQuantity: qty,
                totalAmount,
                status: booking_status_enum_1.BookingStatus.CONFIRMED,
            });
            const savedBooking = await queryRunner.manager.save(booking);
            await queryRunner.commitTransaction();
            await this.redisService.del(`event_slots_${slot.eventId}`);
            return savedBooking;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
            await this.redisService.releaseLock(lockKey, lockValue);
        }
    }
    async getUserBookings(userId) {
        return this.bookingRepository.find({
            where: { userId },
            relations: ['daySlot', 'daySlot.event'],
            order: { createdAt: 'DESC' },
        });
    }
    async cancelBooking(userId, bookingId) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId, userId },
            relations: ['daySlot'],
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking ${bookingId} not found`);
        }
        if (booking.status === booking_status_enum_1.BookingStatus.CANCELLED) {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            booking.status = booking_status_enum_1.BookingStatus.CANCELLED;
            await queryRunner.manager.save(booking);
            const slot = await queryRunner.manager.findOne(day_slot_entity_1.DaySlot, {
                where: { id: booking.daySlotId },
                lock: { mode: 'pessimistic_write' },
            });
            if (slot) {
                slot.availableTickets += booking.ticketQuantity;
                await queryRunner.manager.save(slot);
                await this.redisService.del(`event_slots_${slot.eventId}`);
            }
            await queryRunner.commitTransaction();
            return booking;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(day_slot_entity_1.DaySlot)),
    __param(5, (0, bullmq_1.InjectQueue)('booking-queue')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        subscriptions_service_1.SubscriptionsService,
        redis_service_1.RedisService,
        typeorm_2.DataSource,
        bullmq_2.Queue])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map