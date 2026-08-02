import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
export declare class SubscriptionsService {
    private planRepository;
    private userSubRepository;
    constructor(planRepository: Repository<SubscriptionPlan>, userSubRepository: Repository<UserSubscription>);
    createPlan(dto: CreatePlanDto): Promise<SubscriptionPlan>;
    findAllPlans(): Promise<SubscriptionPlan[]>;
    findPlanById(id: string): Promise<SubscriptionPlan>;
    subscribeUser(userId: string, planId: string): Promise<UserSubscription>;
    getActiveSubscription(userId: string): Promise<UserSubscription | null>;
}
