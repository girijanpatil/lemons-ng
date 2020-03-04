import { User } from './user';

export interface Auth {
    token: string;
    refreshToken: string;
    success: boolean;
    errors: string[];
    user: User;
}
