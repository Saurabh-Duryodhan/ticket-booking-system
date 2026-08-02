import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Booking } from './entities/booking.entity';
import { DaySlot } from '../events/entities/day-slot.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RedisService } from '../redis/redis.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '../../common/enums/booking-status.enum';
import { BookingType } from '../../common/enums/booking-type.enum';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(DaySlot)
    private daySlotRepository: Repository<DaySlot>,

    private subscriptionsService: SubscriptionsService,
    private redisService: RedisService,
    private dataSource: DataSource,

    @InjectQueue('booking-queue')
    private bookingQueue: Queue,
  ) {}

  /**
   * Main booking handler supporting both sync transaction and async queuing
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    if (dto.useQueue) {
      // Async high-concurrency mode via BullMQ
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

  /**
   * Executes transactional booking with Redis Lock + DB Pessimistic FOR UPDATE Lock
   */
  async executeBookingTransaction(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const qty = dto.ticketQuantity || 1;
    const lockKey = `lock:slot:${dto.daySlotId}`;
    const lockValue = `${userId}:${Date.now()}`;

    // 1. Acquire Redis Distributed Lock with spin retry
    const acquired = await this.redisService.acquireLockWithRetry(lockKey, lockValue, 5000);
    if (!acquired) {
      throw new ConflictException('Server is handling high traffic for this slot. Please try again.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Fetch DaySlot with DB Pessimistic Write Lock (SELECT ... FOR UPDATE)
      const slot = await queryRunner.manager.findOne(DaySlot, {
        where: { id: dto.daySlotId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!slot) {
        throw new NotFoundException(`Day slot ${dto.daySlotId} not found`);
      }

      // 3. Verify availability
      if (slot.availableTickets < qty) {
        throw new BadRequestException(
          `Not enough tickets available. Requested: ${qty}, Available: ${slot.availableTickets}`,
        );
      }

      let totalAmount = 0;

      // 4. Validate Subscription vs Day Ticket logic
      if (dto.bookingType === BookingType.SUBSCRIPTION_PASS) {
        const sub = await this.subscriptionsService.getActiveSubscription(userId);
        if (!sub) {
          throw new BadRequestException('User does not have an active subscription');
        }

        // Check daily pass limit for current slot date
        const existingCount = await queryRunner.manager.count(Booking, {
          where: {
            userId,
            daySlotId: dto.daySlotId,
            bookingType: BookingType.SUBSCRIPTION_PASS,
            status: BookingStatus.CONFIRMED,
          },
        });

        if (existingCount + qty > sub.plan.dailyPassLimit) {
          throw new BadRequestException(
            `Subscription daily pass limit reached for date ${slot.date}. Allowed: ${sub.plan.dailyPassLimit}, Already booked: ${existingCount}`,
          );
        }

        totalAmount = 0; // Subscription pass grants free daily ticket access
      } else {
        totalAmount = Number(slot.price) * qty;
      }

      // 5. Atomic decrement available tickets
      slot.availableTickets -= qty;
      await queryRunner.manager.save(slot);

      // 6. Create booking record
      const booking = queryRunner.manager.create(Booking, {
        userId,
        daySlotId: slot.id,
        bookingType: dto.bookingType,
        ticketQuantity: qty,
        totalAmount,
        status: BookingStatus.CONFIRMED,
      });

      const savedBooking = await queryRunner.manager.save(booking);

      // 7. Commit transaction
      await queryRunner.commitTransaction();

      // Invalidate Redis cache
      await this.redisService.del(`event_slots_${slot.eventId}`);

      return savedBooking;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
      // Always release Redis Lock
      await this.redisService.releaseLock(lockKey, lockValue);
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId },
      relations: ['daySlot', 'daySlot.event'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelBooking(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
      relations: ['daySlot'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      booking.status = BookingStatus.CANCELLED;
      await queryRunner.manager.save(booking);

      // Restore available tickets
      const slot = await queryRunner.manager.findOne(DaySlot, {
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
