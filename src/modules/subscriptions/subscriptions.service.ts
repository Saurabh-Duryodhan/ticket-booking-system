import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,

    @InjectRepository(UserSubscription)
    private userSubRepository: Repository<UserSubscription>,
  ) {}

  async createPlan(dto: CreatePlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({ where: { isActive: true } });
  }

  async findPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Subscription plan ${id} not found`);
    }
    return plan;
  }

  async subscribeUser(userId: string, planId: string): Promise<UserSubscription> {
    const plan = await this.findPlanById(planId);

    // Cancel previous active subscriptions for user
    await this.userSubRepository.update(
      { userId, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.CANCELLED },
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const subscription = this.userSubRepository.create({
      userId,
      planId: plan.id,
      startDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.userSubRepository.save(subscription);
  }

  async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
    const sub = await this.userSubRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });

    if (sub && new Date() > sub.endDate) {
      sub.status = SubscriptionStatus.EXPIRED;
      await this.userSubRepository.save(sub);
      return null;
    }

    return sub;
  }
}
