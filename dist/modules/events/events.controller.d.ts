import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateDaySlotDto } from './dto/create-day-slot.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    getEvents(): Promise<import("./entities/event.entity").Event[]>;
    getEventById(id: string): Promise<import("./entities/event.entity").Event>;
    getEventDaySlots(id: string): Promise<import("./entities/day-slot.entity").DaySlot[]>;
    createEvent(dto: CreateEventDto): Promise<import("./entities/event.entity").Event>;
    addDaySlot(eventId: string, dto: CreateDaySlotDto): Promise<import("./entities/day-slot.entity").DaySlot>;
}
