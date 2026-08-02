import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Monthly Gold Pass', description: 'Name of the subscription plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 49.99, description: 'Price of plan in USD' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 30, description: 'Validity duration in days' })
  @IsNumber()
  @Min(1)
  durationDays: number;

  @ApiProperty({ example: 1, description: 'Maximum ticket/pass reservations allowed per day' })
  @IsNumber()
  @Min(1)
  dailyPassLimit: number;

  @ApiProperty({ example: 'Grants 1 free daily ticket for any available event slot', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
