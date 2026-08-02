import { SubscriptionsService } from './subscriptions.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';
export declare class SubscriptionsController {
    private readonly subService;
    constructor(subService: SubscriptionsService);
    getPlans(): Promise<import("./entities/subscription-plan.entity").SubscriptionPlan[]>;
    createPlan(dto: CreatePlanDto): Promise<import("./entities/subscription-plan.entity").SubscriptionPlan>;
    subscribe(userId: string, dto: SubscribeDto): Promise<import("./entities/user-subscription.entity").UserSubscription>;
    getMySubscription(userId: string): Promise<import("./entities/user-subscription.entity").UserSubscription>;
}
