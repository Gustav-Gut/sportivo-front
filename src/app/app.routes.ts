import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(r => r.authRoutes)
    },
    {
        // Single shared layout for all authenticated routes
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: 'finances',
                loadChildren: () => import('./features/finances/finances.routes').then(r => r.financesRoutes)
            },
            {
                path: 'users',
                loadChildren: () => import('./features/users/users.routes').then(r => r.usersRoutes)
            },
            {
                path: 'school',
                loadChildren: () => import('./features/schools/schools.routes').then(r => r.schoolsRoutes)
            },
            {
                path: 'lessons',
                loadChildren: () => import('./features/lessons/lessons.routes').then(r => r.lessonsRoutes)
            },
            {
                path: '',
                redirectTo: 'finances/dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    }
];
