import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums/role.enum';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: Role;
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
            role: Role;
            subscriptions: import("../subscriptions/entities/user-subscription.entity").UserSubscription[];
            bookings: import("../bookings/entities/booking.entity").Booking[];
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    private generateToken;
}
