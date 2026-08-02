import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Booking } from './entities/booking.entity';
import { DaySlot } from '../events/entities/day-slot.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingProcessor } from './booking.processor';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, DaySlot]),
    BullModule.registerQueue({
      name: 'booking-queue',
    }),
    SubscriptionsModule,
  ],
  providers: [BookingsService, BookingProcessor],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
