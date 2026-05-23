import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
}

interface LoginUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
}

export interface LoginResponse {
    success: boolean;
    user: LoginUser;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    public isAuthenticated = signal<boolean>(false);
    public isInitialized = signal<boolean>(false);
    public currentUser = signal<CurrentUser | null>(null);

    constructor(private http: HttpClient) {
        this.checkAuthStatus().subscribe();
    }

    login(email: string, password: string, schoolSlug: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
            email,
            password,
            schoolSlug
        }, { withCredentials: true }).pipe(
            tap(response => {
                if (response.success) {
                    this.isAuthenticated.set(true);
                    this.currentUser.set({
                        userId: response.user.id,
                        firstName: response.user.firstName,
                        lastName: response.user.lastName,
                        email: response.user.email,
                        roles: response.user.roles,
                    });
                }
            })
        );
    }

    logout() {
        return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.isAuthenticated.set(false);
                this.currentUser.set(null);
            })
        );
    }

    checkAuthStatus(): Observable<any> {
        return this.http.get<{ authenticated: boolean; user: CurrentUser }>(
            `${this.apiUrl}/auth/check`, { withCredentials: true }
        ).pipe(
            tap({
                next: (response) => {
                    this.isAuthenticated.set(true);
                    this.isInitialized.set(true);
                    this.currentUser.set(response.user);
                },
                error: () => {
                    this.isAuthenticated.set(false);
                    this.isInitialized.set(true);
                    this.currentUser.set(null);
                }
            })
        );
    }
}
