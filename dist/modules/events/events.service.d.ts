import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { DaySlot } from './entities/day-slot.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateDaySlotDto } from './dto/create-day-slot.dto';
import { RedisService } from '../redis/redis.service';
export declare class EventsService {
    private eventRepository;
    private daySlotRepository;
    private redisService;
    constructor(eventRepository: Repository<Event>, daySlotRepository: Repository<DaySlot>, redisService: RedisService);
    createEvent(dto: CreateEventDto): Promise<Event>;
    addDaySlot(eventId: string, dto: CreateDaySlotDto): Promise<DaySlot>;
    findAllEvents(): Promise<Event[]>;
    findEventById(id: string): Promise<Event>;
    getDaySlotsCached(eventId: string): Promise<DaySlot[]>;
    findSlotById(slotId: string): Promise<DaySlot>;
}
