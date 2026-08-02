import { BookingType } from '../../../common/enums/booking-type.enum';
export declare class CreateBookingDto {
    daySlotId: string;
    bookingType: BookingType;
    ticketQuantity?: number;
    useQueue?: boolean;
}
