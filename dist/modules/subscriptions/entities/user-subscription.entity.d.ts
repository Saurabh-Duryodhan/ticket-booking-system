import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionStatus } from '../../../common/enums/subscription-status.enum';
export declare class UserSubscription {
    id: string;
    userId: string;
    user: User;
    planId: string;
    plan: SubscriptionPlan;
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus;
    createdAt: Date;
    updatedAt: Date;
}
