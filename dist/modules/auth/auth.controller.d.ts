import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import("../../common/enums/role.enum").Role;
            subscriptions: import("../subscriptions/entities/user-subscription.entity").UserSubscription[];
            bookings: import("../bookings/entities/booking.entity").Booking[];
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import("../../common/enums/role.enum").Role;
            subscriptions: import("../subscriptions/entities/user-subscription.entity").UserSubscription[];
            bookings: import("../bookings/entities/booking.entity").Booking[];
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
}
