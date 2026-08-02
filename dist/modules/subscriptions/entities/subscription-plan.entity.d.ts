import { UserSubscription } from './user-subscription.entity';
export declare class SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    durationDays: number;
    dailyPassLimit: number;
    description: string;
    isActive: boolean;
    userSubscriptions: UserSubscription[];
    createdAt: Date;
    updatedAt: Date;
}
