import { Routes } from '@angular/router';

export const financesRoutes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.Dashboard)
    },
    {
        path: 'payments',
        loadComponent: () => import('./pages/payments/payments').then(c => c.Payments)
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];
