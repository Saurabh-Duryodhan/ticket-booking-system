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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_plan_entity_1 = require("./entities/subscription-plan.entity");
const user_subscription_entity_1 = require("./entities/user-subscription.entity");
const subscription_status_enum_1 = require("../../common/enums/subscription-status.enum");
let SubscriptionsService = class SubscriptionsService {
    constructor(planRepository, userSubRepository) {
        this.planRepository = planRepository;
        this.userSubRepository = userSubRepository;
    }
    async createPlan(dto) {
        const plan = this.planRepository.create(dto);
        return this.planRepository.save(plan);
    }
    async findAllPlans() {
        return this.planRepository.find({ where: { isActive: true } });
    }
    async findPlanById(id) {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan) {
            throw new common_1.NotFoundException(`Subscription plan ${id} not found`);
        }
        return plan;
    }
    async subscribeUser(userId, planId) {
        const plan = await this.findPlanById(planId);
        await this.userSubRepository.update({ userId, status: subscription_status_enum_1.SubscriptionStatus.ACTIVE }, { status: subscription_status_enum_1.SubscriptionStatus.CANCELLED });
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);
        const subscription = this.userSubRepository.create({
            userId,
            planId: plan.id,
            startDate,
            endDate,
            status: subscription_status_enum_1.SubscriptionStatus.ACTIVE,
        });
        return this.userSubRepository.save(subscription);
    }
    async getActiveSubscription(userId) {
        const sub = await this.userSubRepository.findOne({
            where: { userId, status: subscription_status_enum_1.SubscriptionStatus.ACTIVE },
            relations: ['plan'],
            order: { createdAt: 'DESC' },
        });
        if (sub && new Date() > sub.endDate) {
            sub.status = subscription_status_enum_1.SubscriptionStatus.EXPIRED;
            await this.userSubRepository.save(sub);
            return null;
        }
        return sub;
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(user_subscription_entity_1.UserSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map