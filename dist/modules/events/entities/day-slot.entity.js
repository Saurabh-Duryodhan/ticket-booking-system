"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaySlot = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
let DaySlot = class DaySlot {
};
exports.DaySlot = DaySlot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DaySlot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DaySlot.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.daySlots, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'eventId' }),
    __metadata("design:type", event_entity_1.Event)
], DaySlot.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], DaySlot.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DaySlot.prototype, "totalTickets", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DaySlot.prototype, "availableTickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DaySlot.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], DaySlot.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.daySlot),
    __metadata("design:type", Array)
], DaySlot.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DaySlot.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DaySlot.prototype, "updatedAt", void 0);
exports.DaySlot = DaySlot = __decorate([
    (0, typeorm_1.Entity)('day_slots'),
    (0, typeorm_1.Index)(['eventId', 'date'], { unique: true })
], DaySlot);
//# sourceMappingURL=day-slot.entity.js.map