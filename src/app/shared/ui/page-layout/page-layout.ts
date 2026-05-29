import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Standard page layout wrapper used in all main views.
 * Provides the responsive container with max-width 1200px centered.
 *
 * Usage:
 * <app-page-layout>
 *   <app-page-header ...></app-page-header>
 *   <app-section-card>...</app-section-card>
 * </app-page-layout>
 */
@Component({
  selector: 'app-page-layout',
  standalone: true,
  templateUrl: './page-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLayoutComponent {}
