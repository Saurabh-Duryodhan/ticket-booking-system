import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Matches } from 'class-validator';

export class CreateDaySlotDto {
  @ApiProperty({ example: '2026-08-15', description: 'Date for ticket slot in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  date: string;

  @ApiProperty({ example: 100, description: 'Total capacity/tickets for this date' })
  @IsNumber()
  @Min(1)
  totalTickets: number;

  @ApiProperty({ example: 25.00, description: 'Price per ticket on day-basis purchase' })
  @IsNumber()
  @Min(0)
  price: number;
}
