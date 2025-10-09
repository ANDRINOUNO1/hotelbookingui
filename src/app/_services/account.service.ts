import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SecureStorageService } from './secure-storage.service';

const baseUrl = `${environment.apiUrl}/accounts`;

import { Account } from '../_models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

    constructor(
        private router: Router,
        private http: HttpClient,
        private secureStorage: SecureStorageService
    ) {
        // Initialize from secure storage if available
        const storedAccount = this.secureStorage.getSecureItem('account');
        this.accountSubject = new BehaviorSubject<Account | null>(storedAccount);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account | null {
        return this.accountSubject.value;
    }

   login(usernameOrEmail: string, password: string) {
    return this.http.post<any>(
        `${baseUrl}/authenticate`,
        { email: usernameOrEmail, password }, 
        { withCredentials: true }
    ).pipe(
        map(account => {
            this.accountSubject.next(account);
            // Store sensitive data securely
            this.secureStorage.setSecureItem('account', account);
            // Store non-sensitive data normally for debugging
            this.secureStorage.setItem('user_info', this.secureStorage.obfuscateSensitiveData(account));
            this.startRefreshTokenTimer();
            return account;
        }),
        catchError(err => {
            this.accountSubject.next(null);
            this.secureStorage.removeSecureItem('account');
            this.secureStorage.removeItem('user_info');
            throw err;
        })
    );
}


    logout() {
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
        this.stopRefreshTokenTimer();
        this.accountSubject.next(null);
        this.secureStorage.removeSecureItem('account');
        this.secureStorage.removeItem('user_info');
        this.router.navigate(['/account/login']);
    }

    // Optionally, validate session with backend on app start
    validateSession() {
        return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
            .pipe(
                map(account => {
                    this.accountSubject.next(account);
                    this.secureStorage.setSecureItem('account', account);
                    this.secureStorage.setItem('user_info', this.secureStorage.obfuscateSensitiveData(account));
                    this.startRefreshTokenTimer();
                    return account;
                }),
                catchError(err => {
                    this.accountSubject.next(null);
                    this.secureStorage.removeSecureItem('account');
                    this.secureStorage.removeItem('user_info');
                    return of(null);
                })
            );
    }

    refreshToken() {
        return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
            .pipe(map((account) => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    register(account: Account) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }
    
    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email });
    }
    
    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }
    
    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`);
    }
    
    create(params: any) {
        return this.http.post(baseUrl, params);
    }
    
    update(id: string, params: any) {
        return this.http.put(`${baseUrl}/${id}`, params)
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (account.id === this.accountValue?.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }
    
    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(finalize(() => {
                if (id === this.accountValue?.id)
                    this.logout();
            }));
    }

    // helper methods

    private refreshTokenTimeout: any;

    private startRefreshTokenTimer() {
        if (!this.accountValue?.jwtToken) return;
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
} 