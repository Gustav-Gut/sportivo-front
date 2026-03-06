import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(r => r.authRoutes)
    },
    {
        path: 'finances',
        loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayout),
        loadChildren: () => import('./features/finances/finances.routes').then(r => r.financesRoutes)
    },
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    }
];
