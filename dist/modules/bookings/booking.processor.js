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
var BookingProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
let BookingProcessor = BookingProcessor_1 = class BookingProcessor extends bullmq_1.WorkerHost {
    constructor(bookingsService) {
        super();
        this.bookingsService = bookingsService;
        this.logger = new common_1.Logger(BookingProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`Processing queued booking job ${job.id} for user ${job.data.userId}`);
        try {
            const result = await this.bookingsService.executeBookingTransaction(job.data.userId, job.data.dto);
            this.logger.log(`Job ${job.id} succeeded. Booking ID: ${result.id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`);
            throw error;
        }
    }
};
exports.BookingProcessor = BookingProcessor;
exports.BookingProcessor = BookingProcessor = BookingProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('booking-queue'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingProcessor);
//# sourceMappingURL=booking.processor.js.map