import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    createBooking(userId: string, dto: CreateBookingDto): Promise<import("./entities/booking.entity").Booking | {
        message: string;
        jobId: string;
        status: string;
    }>;
    getMyBookings(userId: string): Promise<import("./entities/booking.entity").Booking[]>;
    cancelBooking(userId: string, bookingId: string): Promise<import("./entities/booking.entity").Booking>;
}
