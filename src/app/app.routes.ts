import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(r => r.authRoutes)
    },
    {
        path: 'finances',
        canActivate: [authGuard],
        loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayout),
        loadChildren: () => import('./features/finances/finances.routes').then(r => r.financesRoutes)
    },
    {
        path: 'users',
        canActivate: [authGuard],
        loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayout),
        loadChildren: () => import('./features/users/users.routes').then(r => r.usersRoutes)
    },
    {
        path: 'school',
        canActivate: [authGuard],
        loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayout),
        loadChildren: () => import('./features/schools/schools.routes').then(r => r.schoolsRoutes)
    },
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    }
];
