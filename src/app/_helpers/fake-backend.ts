import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { Account } from '../_models/account.model';
import { Role } from '../_models/role.model';

const accountsKey = 'fake-accounts';
let accounts: Account[] = JSON.parse(localStorage.getItem(accountsKey) || '[]');

// Seed initial users if not present
if (accounts.length === 0) {
    accounts = [
        {
            id: '1',
            title: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            status: 'Active',
            role: Role.Admin,
            password: 'admin123'
        } as Account,
        {
            id: '2',
            title: 'frontdesk',
            firstName: 'Front',
            lastName: 'Desk',
            email: 'frontdesk@example.com',
            status: 'Active',
            role: Role.frontdeskUser,
            password: 'frontdesk123'
        } as Account
    ];
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        return handleRoute().pipe(materialize(), delay(500), dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/api/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/api/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/api/accounts') && method === 'GET':
                    return getAccounts();
                case url.match(/\/api\/accounts\/\w+$/) && method === 'GET':
                    return getAccountById();
                case url.match(/\/api\/accounts\/\w+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/api\/accounts\/\w+$/) && method === 'DELETE':
                    return deleteAccount();
                default:
                    return next.handle(request);
            }
        }

        // route functions
        function authenticate() {
            const { email, password, username } = body;
            // Try to match by username (title) or email, both with password
            const account = accounts.find(x =>
                ((x.title && x.title.toLowerCase() === (username || '').toLowerCase()) ||
                 (x.email && x.email.toLowerCase() === (email || '').toLowerCase())) &&
                x.password === password &&
                x.status !== 'Inactive'
            );
            if (!account) {
                return error('Email or password is incorrect');
            }
            account.jwtToken = 'fake-jwt-token.' + btoa(JSON.stringify({ id: account.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 }));
            return ok({ ...account });
        }

        function register() {
            const account = body as Account;
            if (accounts.find(x => x.email === account.email)) {
                return error('Email is already registered');
            }
            account.id = (accounts.length + 1).toString();
            account.role = Role.frontdeskUser;
            account.status = 'Active';
            account.password = account.password || 'changeme';
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }

        function getAccounts() {
            if (!isLoggedIn()) return unauthorized();
            return ok(accounts);
        }

        function getAccountById() {
            if (!isLoggedIn()) return unauthorized();
            const account = accounts.find(x => x.id === idFromUrl());
            return ok(account);
        }

        function updateAccount() {
            if (!isLoggedIn()) return unauthorized();
            let params = body;
            let account = accounts.find(x => x.id === idFromUrl());
            if (!account) return error('Account not found');
            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok(account);
        }

        function deleteAccount() {
            if (!isLoggedIn()) return unauthorized();
            accounts = accounts.filter(x => x.id !== idFromUrl());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }

        // helper functions
        function ok(body?: any) {
            return of(new HttpResponse({ status: 200, body }));
        }
        function error(message: string) {
            return throwError(() => ({ status: 400, error: { message } }));
        }
        function unauthorized() {
            return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }));
        }
        function isLoggedIn() {
            return headers.get('Authorization')?.startsWith('Bearer fake-jwt-token');
        }
        function idFromUrl() {
            const urlParts = url.split('/');
            return urlParts[urlParts.length - 1];
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
}; 