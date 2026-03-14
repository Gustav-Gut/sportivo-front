import { Routes } from '@angular/router';
import { UserList } from './pages/user-list/user-list';
import { UserForm } from './pages/user-form/user-form';
import { authGuard } from '../../core/guards/auth.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    component: UserList,
    canActivate: [authGuard]
  },
  {
    path: 'new',
    component: UserForm,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    component: UserForm,
    canActivate: [authGuard]
  }
];
