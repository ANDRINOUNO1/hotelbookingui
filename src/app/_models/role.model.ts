export enum Role {
    Admin = 'Admin',
    frontdeskUser = 'frontdeskUser',
    SuperAdmin = 'SuperAdmin'
}

export const SUPER_ADMIN_ACCOUNT = {
    username: 'superadmin',
    role: Role.SuperAdmin
}; 