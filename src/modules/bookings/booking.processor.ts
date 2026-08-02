import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Processor('booking-queue')
export class BookingProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingProcessor.name);

  constructor(private bookingsService: BookingsService) {
    super();
  }

  async process(job: Job<{ userId: string; dto: CreateBookingDto }>): Promise<any> {
    this.logger.log(`Processing queued booking job ${job.id} for user ${job.data.userId}`);
    try {
      const result = await this.bookingsService.executeBookingTransaction(
        job.data.userId,
        job.data.dto,
      );
      this.logger.log(`Job ${job.id} succeeded. Booking ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }
}
