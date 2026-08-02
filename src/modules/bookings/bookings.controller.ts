import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary:
      'Book day ticket or subscription pass (Protected by Redis Lock + DB Pessimistic Lock)',
  })
  async createBooking(@GetUser('id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(userId, dto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get current user booking history' })
  async getMyBookings(@GetUser('id') userId: string) {
    return this.bookingsService.getUserBookings(userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking and release day slot tickets' })
  async cancelBooking(@GetUser('id') userId: string, @Param('id') bookingId: string) {
    return this.bookingsService.cancelBooking(userId, bookingId);
  }
}
