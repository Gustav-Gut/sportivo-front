import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdvancedDataTable, AdvanceTableColumn } from '../../../../shared/ui/advanced-data-table/advanced-data-table';
import { UsersService, UserListResponse } from '../../../../core/services/users.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, AdvancedDataTable],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserList implements OnInit {
  private usersService = inject(UsersService);
  private router = inject(Router);

  columns: AdvanceTableColumn[] = [
    { key: 'rut', label: 'RUT', type: 'text' },
    { key: 'member', label: 'User', type: 'member' },
    { key: 'roles', label: 'Roles', type: 'status' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  usersData = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.usersService.getUsers().subscribe({
      next: (res: UserListResponse) => {
        // Map backend data to table format
        const mappedData = res.data.map(user => {
          // Join roles
          const activeStatus = user.active ? 'Active' : 'Inactive';
          const combinedRoles = Array.isArray(user.roles) ? user.roles.join(', ') : 'UNKNOWN';

          return {
            id: user.id,
            rut: user.rut,
            member: {
              initials: user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase(),
              name: `${user.firstName} ${user.lastName}`
            },
            email: user.email,
            roles: combinedRoles,
            status: activeStatus
          };
        });
        this.usersData.set(mappedData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading.set(false);
      }
    });
  }

  navigateToCreate() {
    this.router.navigate(['/users/new']);
  }
}
