import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../src/modules/users/entities/user.entity';
import { SubscriptionPlan } from '../src/modules/subscriptions/entities/subscription-plan.entity';
import { UserSubscription } from '../src/modules/subscriptions/entities/user-subscription.entity';
import { Event } from '../src/modules/events/entities/event.entity';
import { DaySlot } from '../src/modules/events/entities/day-slot.entity';
import { Booking } from '../src/modules/bookings/entities/booking.entity';
import { Role } from '../src/common/enums/role.enum';
import { SubscriptionStatus } from '../src/common/enums/subscription-status.enum';
import { BookingType } from '../src/common/enums/booking-type.enum';
import { BookingStatus } from '../src/common/enums/booking-status.enum';
import configuration from '../src/config/configuration';

async function seed() {
  console.log('🌱 Starting Database Seeding...');
  const config = configuration();

  const dataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    entities: [User, SubscriptionPlan, UserSubscription, Event, DaySlot, Booking],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to PostgreSQL Database.');

  // 1. Seed Users
  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const userRepo = dataSource.getRepository(User);

  let admin = await userRepo.findOne({ where: { email: 'admin@ticketbooking.com' } });
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        email: 'admin@ticketbooking.com',
        fullName: 'System Administrator',
        password: passwordHash,
        role: Role.ADMIN,
      }),
    );
  }

  let organizer = await userRepo.findOne({ where: { email: 'organizer@ticketbooking.com' } });
  if (!organizer) {
    organizer = await userRepo.save(
      userRepo.create({
        email: 'organizer@ticketbooking.com',
        fullName: 'Event Organizer',
        password: passwordHash,
        role: Role.ORGANIZER,
      }),
    );
  }

  let vipUser = await userRepo.findOne({ where: { email: 'vip_user@ticketbooking.com' } });
  if (!vipUser) {
    vipUser = await userRepo.save(
      userRepo.create({
        email: 'vip_user@ticketbooking.com',
        fullName: 'VIP Subscriber User',
        password: passwordHash,
        role: Role.USER,
      }),
    );
  }

  let dayUser = await userRepo.findOne({ where: { email: 'day_user@ticketbooking.com' } });
  if (!dayUser) {
    dayUser = await userRepo.save(
      userRepo.create({
        email: 'day_user@ticketbooking.com',
        fullName: 'Day Basis Customer',
        password: passwordHash,
        role: Role.USER,
      }),
    );
  }

  // 2. Seed Subscription Plans
  console.log('Seeding Subscription Plans...');
  const planRepo = dataSource.getRepository(SubscriptionPlan);

  const defaultPlans = [
    {
      name: 'Single Day Pass',
      price: 9.99,
      durationDays: 1,
      dailyPassLimit: 1,
      description: 'Grants access to 1 event slot for a single day.',
    },
    {
      name: 'Monthly VIP Pass',
      price: 49.99,
      durationDays: 30,
      dailyPassLimit: 1,
      description: 'Grants 1 free event pass per day for 30 consecutive days.',
    },
    {
      name: 'Monthly Unlimited Pass',
      price: 99.99,
      durationDays: 30,
      dailyPassLimit: 3,
      description: 'Grants up to 3 event passes per day for 30 consecutive days.',
    },
    {
      name: 'Annual Premium Pass',
      price: 499.99,
      durationDays: 365,
      dailyPassLimit: 2,
      description: 'Premium annual subscription with 2 passes per day all year round.',
    },
  ];

  const createdPlans: SubscriptionPlan[] = [];
  for (const p of defaultPlans) {
    let plan = await planRepo.findOne({ where: { name: p.name } });
    if (!plan) {
      plan = await planRepo.save(planRepo.create(p));
    }
    createdPlans.push(plan);
  }

  // 3. Seed User Subscriptions
  console.log('Seeding User Subscriptions...');
  const userSubRepo = dataSource.getRepository(UserSubscription);

  let activeSub = await userSubRepo.findOne({ where: { userId: vipUser.id } });
  if (!activeSub) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    activeSub = await userSubRepo.save(
      userSubRepo.create({
        userId: vipUser.id,
        planId: createdPlans[1].id, // Monthly VIP Pass
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
      }),
    );
  }

  // 4. Seed Events & Day Slots
  console.log('Seeding Events & Day Slots...');
  const eventRepo = dataSource.getRepository(Event);
  const slotRepo = dataSource.getRepository(DaySlot);

  let event1 = await eventRepo.findOne({ where: { title: 'Grand Music Festival 2026' } });
  if (!event1) {
    event1 = await eventRepo.save(
      eventRepo.create({
        title: 'Grand Music Festival 2026',
        description: 'Multi-day outdoor music festival featuring world-renowned artists',
        location: 'Metropolitan Arena, Main Stage',
      }),
    );
  }

  let event2 = await eventRepo.findOne({ where: { title: 'Tech Innovation Summit 2026' } });
  if (!event2) {
    event2 = await eventRepo.save(
      eventRepo.create({
        title: 'Tech Innovation Summit 2026',
        description: 'Premier artificial intelligence and tech engineering conference',
        location: 'Silicon Convention Center',
      }),
    );
  }

  // Create Day Slots for the next 7 days
  const today = new Date();
  const createdSlots: DaySlot[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // Event 1 Slot
    let slot1 = await slotRepo.findOne({ where: { eventId: event1.id, date: dateStr } });
    if (!slot1) {
      slot1 = await slotRepo.save(
        slotRepo.create({
          eventId: event1.id,
          date: dateStr,
          totalTickets: 100,
          availableTickets: 100,
          price: 25.0,
        }),
      );
    }
    createdSlots.push(slot1);

    // Event 2 Slot
    let slot2 = await slotRepo.findOne({ where: { eventId: event2.id, date: dateStr } });
    if (!slot2) {
      slot2 = await slotRepo.save(
        slotRepo.create({
          eventId: event2.id,
          date: dateStr,
          totalTickets: 50,
          availableTickets: 50,
          price: 15.0,
        }),
      );
    }
    createdSlots.push(slot2);
  }

  // 5. Seed Bookings / Orders
  console.log('Seeding Bookings & Orders...');
  const bookingRepo = dataSource.getRepository(Booking);

  // VIP user subscription booking
  const existingVipBooking = await bookingRepo.findOne({
    where: { userId: vipUser.id, daySlotId: createdSlots[0].id },
  });
  if (!existingVipBooking) {
    await bookingRepo.save(
      bookingRepo.create({
        userId: vipUser.id,
        daySlotId: createdSlots[0].id,
        bookingType: BookingType.SUBSCRIPTION_PASS,
        ticketQuantity: 1,
        totalAmount: 0.0,
        status: BookingStatus.CONFIRMED,
      }),
    );
    // Decrement slot tickets
    createdSlots[0].availableTickets -= 1;
    await slotRepo.save(createdSlots[0]);
  }

  // Day user ticket booking
  const existingDayBooking = await bookingRepo.findOne({
    where: { userId: dayUser.id, daySlotId: createdSlots[1].id },
  });
  if (!existingDayBooking) {
    await bookingRepo.save(
      bookingRepo.create({
        userId: dayUser.id,
        daySlotId: createdSlots[1].id,
        bookingType: BookingType.DAY_TICKET,
        ticketQuantity: 2,
        totalAmount: 30.0, // 2 * $15.00
        status: BookingStatus.CONFIRMED,
      }),
    );
    // Decrement slot tickets
    createdSlots[1].availableTickets -= 2;
    await slotRepo.save(createdSlots[1]);
  }

  console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('----------------------------------------------------');
  console.log('Credentials Summary:');
  console.log('  Admin:       admin@ticketbooking.com / password123');
  console.log('  Organizer:   organizer@ticketbooking.com / password123');
  console.log('  VIP User:    vip_user@ticketbooking.com / password123');
  console.log('  Day User:    day_user@ticketbooking.com / password123');
  console.log('----------------------------------------------------');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
