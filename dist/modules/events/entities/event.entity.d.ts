import { DaySlot } from './day-slot.entity';
export declare class Event {
    id: string;
    title: string;
    description: string;
    location: string;
    isActive: boolean;
    daySlots: DaySlot[];
    createdAt: Date;
    updatedAt: Date;
}
