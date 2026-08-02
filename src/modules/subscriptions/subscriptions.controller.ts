import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List all available active subscription plans' })
  async getPlans() {
    return this.subService.findAllPlans();
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription plan (Admin only)' })
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.subService.createPlan(dto);
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe logged-in user to a plan' })
  async subscribe(@GetUser('id') userId: string, @Body() dto: SubscribeDto) {
    return this.subService.subscribeUser(userId, dto.planId);
  }

  @Get('my-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user active subscription' })
  async getMySubscription(@GetUser('id') userId: string) {
    return this.subService.getActiveSubscription(userId);
  }
}
