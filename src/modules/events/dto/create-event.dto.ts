import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Summer Music Festival 2026', description: 'Event or venue title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '3-day grand outdoor live music experience', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Main Arena, Sector 5', description: 'Event location/venue address' })
  @IsString()
  @IsNotEmpty()
  location: string;
}
