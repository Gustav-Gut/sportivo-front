import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
    success: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    // A signal to reactively store whether the user is logged in
    public isAuthenticated = signal<boolean>(false);
    public isInitialized = signal<boolean>(false);

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
                }
            })
        );
    }

    logout() {
        return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.isAuthenticated.set(false);
            })
        );
    }

    checkAuthStatus(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/check`, { withCredentials: true }).pipe(
            tap({
                next: () => {
                    this.isAuthenticated.set(true);
                    this.isInitialized.set(true);
                },
                error: () => {
                    this.isAuthenticated.set(false);
                    this.isInitialized.set(true);
                }
            })
        );
    }
}
