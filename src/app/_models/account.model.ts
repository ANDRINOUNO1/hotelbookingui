import { Role } from './role.model';

export class Account {
    id?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: string;
    role?: Role;
    jwtToken?: string;
    password?: string;

    constructor(init?: Partial<Account>) {
        Object.assign(this, init);
    }
} 