import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Event } from './event.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('day_slots')
@Index(['eventId', 'date'], { unique: true })
export class DaySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, (event) => event.daySlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD format

  @Column()
  totalTickets: number;

  @Column()
  availableTickets: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @VersionColumn()
  version: number; // For TypeORM Optimistic Lock protection option

  @OneToMany(() => Booking, (booking) => booking.daySlot)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
