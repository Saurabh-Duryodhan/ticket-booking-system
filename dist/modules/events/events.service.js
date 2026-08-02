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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./entities/event.entity");
const day_slot_entity_1 = require("./entities/day-slot.entity");
const redis_service_1 = require("../redis/redis.service");
let EventsService = class EventsService {
    constructor(eventRepository, daySlotRepository, redisService) {
        this.eventRepository = eventRepository;
        this.daySlotRepository = daySlotRepository;
        this.redisService = redisService;
    }
    async createEvent(dto) {
        const event = this.eventRepository.create(dto);
        return this.eventRepository.save(event);
    }
    async addDaySlot(eventId, dto) {
        const event = await this.eventRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${eventId} not found`);
        }
        const existing = await this.daySlotRepository.findOne({
            where: { eventId, date: dto.date },
        });
        if (existing) {
            throw new common_1.ConflictException(`Day slot for date ${dto.date} already exists for this event`);
        }
        const slot = this.daySlotRepository.create({
            eventId,
            date: dto.date,
            totalTickets: dto.totalTickets,
            availableTickets: dto.totalTickets,
            price: dto.price,
        });
        const savedSlot = await this.daySlotRepository.save(slot);
        await this.redisService.del(`event_slots_${eventId}`);
        return savedSlot;
    }
    async findAllEvents() {
        return this.eventRepository.find({
            where: { isActive: true },
            relations: ['daySlots'],
            order: { createdAt: 'DESC' },
        });
    }
    async findEventById(id) {
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['daySlots'],
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event ${id} not found`);
        }
        return event;
    }
    async getDaySlotsCached(eventId) {
        const cacheKey = `event_slots_${eventId}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const slots = await this.daySlotRepository.find({
            where: { eventId },
            order: { date: 'ASC' },
        });
        await this.redisService.set(cacheKey, JSON.stringify(slots), 60);
        return slots;
    }
    async findSlotById(slotId) {
        const slot = await this.daySlotRepository.findOne({
            where: { id: slotId },
            relations: ['event'],
        });
        if (!slot) {
            throw new common_1.NotFoundException(`Day slot ${slotId} not found`);
        }
        return slot;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(day_slot_entity_1.DaySlot)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService])
], EventsService);
//# sourceMappingURL=events.service.js.map