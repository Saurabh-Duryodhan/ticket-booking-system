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
exports.CreateBookingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const booking_type_enum_1 = require("../../../common/enums/booking-type.enum");
class CreateBookingDto {
    constructor() {
        this.ticketQuantity = 1;
        this.useQueue = false;
    }
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Day slot ID to book' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "daySlotId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: booking_type_enum_1.BookingType.DAY_TICKET,
        enum: booking_type_enum_1.BookingType,
        description: 'Booking type: DAY_TICKET or SUBSCRIPTION_PASS',
    }),
    (0, class_validator_1.IsEnum)(booking_type_enum_1.BookingType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "bookingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Number of tickets requested (Default: 1)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "ticketQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Set to true if submitting to asynchronous BullMQ queue processing under extreme flash sales',
        required: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBookingDto.prototype, "useQueue", void 0);
//# sourceMappingURL=create-booking.dto.js.map