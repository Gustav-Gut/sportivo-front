import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal<boolean>(false);
  expandedMenu = signal<string | null>('school');
  isUserMenuOpen = signal<boolean>(false);

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  }

  toggleUserMenu(): void {
    if (this.isCollapsed()) return;
    this.isUserMenuOpen.update(v => !v);
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  toggleSidebar() {
    this.isCollapsed.update(val => !val);
    if (!this.isCollapsed() && !this.expandedMenu()) {
       // Keep it as is
    } else if (this.isCollapsed()) {
       this.expandedMenu.set(null); // Optional: close submenus when collapsing sidebar
    }
  }

  toggleMenu(menu: string) {
    if (this.isCollapsed()) {
      this.isCollapsed.set(false);
      this.expandedMenu.set(menu);
      return;
    }
    this.expandedMenu.update(current => current === menu ? null : menu);
  }
}
