import { Role } from '../../../common/enums/role.enum';
import { UserSubscription } from '../../subscriptions/entities/user-subscription.entity';
import { Booking } from '../../bookings/entities/booking.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role: Role;
    subscriptions: UserSubscription[];
    bookings: Booking[];
    createdAt: Date;
    updatedAt: Date;
}
