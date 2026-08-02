# Scalable Ticket Booking System Backend

A production-grade, highly scalable ticket booking system backend built using **NestJS**, **TypeORM**, **PostgreSQL**, **Redis**, and **BullMQ**, fully documented with **Swagger / OpenAPI**.

Supports **subscription-based models** (daily quota/passes), **day-basis ticket bookings**, and enterprise-grade **high concurrency control** (preventing double booking / overbooking under peak loads).

---

## Technical Stack & Features

- **Framework**: NestJS (TypeScript, Modular Architecture)
- **Database & ORM**: PostgreSQL 16 + TypeORM
- **Caching & Locking**: Redis 7 (`ioredis`) with Redis Distributed Lock Strategy
- **Queueing Engine**: BullMQ for handling high-concurrency peak booking spikes
- **Authentication**: JWT Auth with Role-Based Access Control (Customer, Admin, Organizer)
- **API Documentation**: OpenAPI / Swagger UI at `/api/docs`
- **Response Handling**: Global Validation Pipe, HttpException Filter, and Response Transform Interceptor

---

## Domain Architecture

### 1. Subscription-Based Model
- Admins create **Subscription Plans** (e.g. *VIP Pass* at $49.99/month, granting 1 free daily ticket reservation).
- Users subscribe to a plan, and the system tracks active user subscriptions and enforces **daily pass limits** automatically upon booking.

### 2. Day-Basis Ticket Booking Model
- Admins/Organizers schedule **Events** and define date-specific **Day Slots** with ticket capacity (e.g., Aug 15: 100 tickets at $25.00 each).
- Users select target date slots and purchase single or multi-ticket day passes.

### 3. Enterprise Concurrency Control (Zero Overbooking)
To guarantee zero double-booking even under thousands of simultaneous requests:
1. **Redis Key Lock (`lock:slot:<slotId>`)**: Prevents duplicate simultaneous race conditions on the same day slot.
2. **Database Pessimistic Locking (`SELECT FOR UPDATE`)**: Locks the specific `day_slots` row inside a TypeORM transaction during capacity check and ticket decrement.
3. **Atomic Decrement (`availableTickets = availableTickets - qty`)**: Ensures database level thread safety across clustered node instances.
4. **BullMQ Async Queuing Option**: Supports enqueuing booking jobs for async processing during mega flash sales.

---

## Quick Start Guide

### 1. Start Infrastructure (PostgreSQL & Redis)
Use Docker Compose to spin up PostgreSQL and Redis:
```bash
docker-compose up -d
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already pre-configured for local docker containers):
```bash
cp .env.example .env
```

### 3. Seed Initial Database Data
Populate subscription plans, sample users, events, day slots, and bookings:
```bash
npm run seed
```

### 4. Start NestJS Backend API
```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 4. Interactive Swagger Documentation
Open your browser and navigate to:
```
http://localhost:3000/api/docs
```
You can explore, test, and execute all endpoints interactively with JWT Bearer Token authorization.

---

## Testing High Concurrency Protection

Run the included concurrency test script to simulate 15 simultaneous booking requests for a slot with only 5 available tickets:

```bash
npm run test:concurrency
```

### Expected Output:
- **Total Requests**: 15
- **Successful Bookings**: 5
- **Failed (Overbooking Blocked)**: 10
- **Remaining Available Tickets in Database**: 0
- **Status**: ✅ CONCURRENCY TEST PASSED! ZERO OVERBOOKING DETECTED.

---

## API Overview

### 🔑 Authentication (`/api/v1/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user & get JWT token

### 💳 Subscriptions (`/api/v1/subscriptions`)
- `GET /subscriptions/plans` - List active subscription plans
- `POST /subscriptions/plans` - Create subscription plan (*Admin*)
- `POST /subscriptions/subscribe` - Subscribe user to plan
- `GET /subscriptions/my-subscription` - View active user subscription

### 📅 Events & Slots (`/api/v1/events`)
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `GET /events/:id/slots` - Get day slots (*Cached via Redis*)
- `POST /events` - Create event (*Admin/Organizer*)
- `POST /events/:id/slots` - Add day slot with capacity & price (*Admin/Organizer*)

### 🎟️ Bookings (`/api/v1/bookings`)
- `POST /bookings` - Book tickets or subscription pass (*Protected by Redis & DB Locks*)
- `GET /bookings/my-bookings` - User booking history
- `PATCH /bookings/:id/cancel` - Cancel booking and restore ticket capacity
