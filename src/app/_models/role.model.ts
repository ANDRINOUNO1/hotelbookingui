export enum Role {
    Admin = 'Admin',
    frontdeskUser = 'frontdeskUser',
    SuperAdmin = 'SuperAdmin'
}

export const SUPER_ADMIN_ACCOUNT = {
    email: 'superadmin@example.com',
    role: Role.SuperAdmin
}; 