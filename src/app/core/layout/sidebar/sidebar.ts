import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  isCollapsed = signal<boolean>(false);
  expandedMenu = signal<string | null>('school'); // Default open

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
