import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateDaySlotDto } from './dto/create-day-slot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Events & Slots')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active events' })
  async getEvents() {
    return this.eventsService.findAllEvents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details by ID' })
  async getEventById(@Param('id') id: string) {
    return this.eventsService.findEventById(id);
  }

  @Get(':id/slots')
  @ApiOperation({ summary: 'Get day slots for an event (Cached via Redis)' })
  async getEventDaySlots(@Param('id') id: string) {
    return this.eventsService.getDaySlotsCached(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Admin/Organizer only)' })
  async createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(dto);
  }

  @Post(':id/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a day slot with capacity and pricing to an event' })
  async addDaySlot(@Param('id') eventId: string, @Body() dto: CreateDaySlotDto) {
    return this.eventsService.addDaySlot(eventId, dto);
  }
}
