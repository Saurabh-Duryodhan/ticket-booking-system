import { Role } from '../../../common/enums/role.enum';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role?: Role;
}
