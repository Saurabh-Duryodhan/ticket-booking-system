import { User } from '../../users/entities/user.entity';
import { DaySlot } from '../../events/entities/day-slot.entity';
import { BookingStatus } from '../../../common/enums/booking-status.enum';
import { BookingType } from '../../../common/enums/booking-type.enum';
export declare class Booking {
    id: string;
    userId: string;
    user: User;
    daySlotId: string;
    daySlot: DaySlot;
    bookingType: BookingType;
    ticketQuantity: number;
    totalAmount: number;
    status: BookingStatus;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
