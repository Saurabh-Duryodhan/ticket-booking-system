import { Repository, DataSource } from 'typeorm';
import { Queue } from 'bullmq';
import { Booking } from './entities/booking.entity';
import { DaySlot } from '../events/entities/day-slot.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RedisService } from '../redis/redis.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsService {
    private bookingRepository;
    private daySlotRepository;
    private subscriptionsService;
    private redisService;
    private dataSource;
    private bookingQueue;
    private readonly logger;
    constructor(bookingRepository: Repository<Booking>, daySlotRepository: Repository<DaySlot>, subscriptionsService: SubscriptionsService, redisService: RedisService, dataSource: DataSource, bookingQueue: Queue);
    createBooking(userId: string, dto: CreateBookingDto): Promise<Booking | {
        message: string;
        jobId: string;
        status: string;
    }>;
    executeBookingTransaction(userId: string, dto: CreateBookingDto): Promise<Booking>;
    getUserBookings(userId: string): Promise<Booking[]>;
    cancelBooking(userId: string, bookingId: string): Promise<Booking>;
}
