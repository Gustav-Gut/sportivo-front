import { Routes } from '@angular/router';

export const schoolsRoutes: Routes = [
    {
        path: '',
        redirectTo: 'info',
        pathMatch: 'full'
    },
    {
        path: 'info',
        loadComponent: () => import('./pages/school-info/school-info').then(m => m.SchoolInfo)
    },
    {
        path: 'sports',
        loadComponent: () => import('./pages/school-sports/school-sports').then(m => m.SchoolSports)
    },
    {
        path: 'payment-plans',
        loadComponent: () => import('./pages/school-payment-plans/school-payment-plans').then(m => m.SchoolPaymentPlans)
    }
];
