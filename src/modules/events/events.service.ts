import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { DaySlot } from './entities/day-slot.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateDaySlotDto } from './dto/create-day-slot.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(DaySlot)
    private daySlotRepository: Repository<DaySlot>,

    private redisService: RedisService,
  ) {}

  async createEvent(dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(dto);
    return this.eventRepository.save(event);
  }

  async addDaySlot(eventId: string, dto: CreateDaySlotDto): Promise<DaySlot> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const existing = await this.daySlotRepository.findOne({
      where: { eventId, date: dto.date },
    });
    if (existing) {
      throw new ConflictException(`Day slot for date ${dto.date} already exists for this event`);
    }

    const slot = this.daySlotRepository.create({
      eventId,
      date: dto.date,
      totalTickets: dto.totalTickets,
      availableTickets: dto.totalTickets,
      price: dto.price,
    });

    const savedSlot = await this.daySlotRepository.save(slot);

    // Invalidate Redis cache for this event slots
    await this.redisService.del(`event_slots_${eventId}`);

    return savedSlot;
  }

  async findAllEvents(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { isActive: true },
      relations: ['daySlots'],
      order: { createdAt: 'DESC' },
    });
  }

  async findEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['daySlots'],
    });
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }

  async getDaySlotsCached(eventId: string): Promise<DaySlot[]> {
    const cacheKey = `event_slots_${eventId}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const slots = await this.daySlotRepository.find({
      where: { eventId },
      order: { date: 'ASC' },
    });

    // Cache for 60 seconds
    await this.redisService.set(cacheKey, JSON.stringify(slots), 60);

    return slots;
  }

  async findSlotById(slotId: string): Promise<DaySlot> {
    const slot = await this.daySlotRepository.findOne({
      where: { id: slotId },
      relations: ['event'],
    });
    if (!slot) {
      throw new NotFoundException(`Day slot ${slotId} not found`);
    }
    return slot;
  }
}
