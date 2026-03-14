import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isInitialized()) {
        return authService.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
    }

    return authService.checkAuthStatus().pipe(
        map(() => true),
        catchError(() => of(router.createUrlTree(['/auth/login'])))
    );
};
