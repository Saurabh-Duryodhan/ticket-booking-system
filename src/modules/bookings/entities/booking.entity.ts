import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DaySlot } from '../../events/entities/day-slot.entity';
import { BookingStatus } from '../../../common/enums/booking-status.enum';
import { BookingType } from '../../../common/enums/booking-type.enum';

@Entity('bookings')
@Index(['userId', 'daySlotId'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  daySlotId: string;

  @ManyToOne(() => DaySlot, (slot) => slot.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daySlotId' })
  daySlot: DaySlot;

  @Column({ type: 'enum', enum: BookingType, default: BookingType.DAY_TICKET })
  bookingType: BookingType;

  @Column({ default: 1 })
  ticketQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
