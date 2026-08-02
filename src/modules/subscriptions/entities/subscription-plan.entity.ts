import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSubscription } from './user-subscription.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g. "Monthly VIP Pass", "Standard Pass"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  durationDays: number; // e.g. 30 for monthly, 365 for annual

  @Column({ default: 1 })
  dailyPassLimit: number; // Max passes/tickets allowed per day under subscription

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserSubscription, (sub) => sub.plan)
  userSubscriptions: UserSubscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
