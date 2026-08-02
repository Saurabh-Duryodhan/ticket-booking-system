import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingProcessor extends WorkerHost {
    private bookingsService;
    private readonly logger;
    constructor(bookingsService: BookingsService);
    process(job: Job<{
        userId: string;
        dto: CreateBookingDto;
    }>): Promise<any>;
}
