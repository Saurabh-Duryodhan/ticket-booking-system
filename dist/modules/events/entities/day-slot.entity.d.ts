import { Event } from './event.entity';
import { Booking } from '../../bookings/entities/booking.entity';
export declare class DaySlot {
    id: string;
    eventId: string;
    event: Event;
    date: string;
    totalTickets: number;
    availableTickets: number;
    price: number;
    version: number;
    bookings: Booking[];
    createdAt: Date;
    updatedAt: Date;
}
