import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';
import { BookingType } from '../../../common/enums/booking-type.enum';

export class CreateBookingDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Day slot ID to book' })
  @IsUUID()
  @IsNotEmpty()
  daySlotId: string;

  @ApiProperty({
    example: BookingType.DAY_TICKET,
    enum: BookingType,
    description: 'Booking type: DAY_TICKET or SUBSCRIPTION_PASS',
  })
  @IsEnum(BookingType)
  @IsNotEmpty()
  bookingType: BookingType;

  @ApiProperty({ example: 1, description: 'Number of tickets requested (Default: 1)' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  ticketQuantity?: number = 1;

  @ApiProperty({
    example: false,
    description: 'Set to true if submitting to asynchronous BullMQ queue processing under extreme flash sales',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  useQueue?: boolean = false;
}
