import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SchoolsService, School } from '../../services/schools.service';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './mobile-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private schoolsService = inject(SchoolsService);

  isOpen = signal(false);
  school = signal<School | null>(null);

  ngOnInit() {
    this.loadSchoolLogo();

    // Close menu automatically whenever route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.close();
    });
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  logout() {
    this.close();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  private loadSchoolLogo() {
    this.schoolsService.getSchool().subscribe({
      next: (data) => this.school.set(data),
      error: () => console.error('Failed to load school logo for mobile menu')
    });
  }
}
