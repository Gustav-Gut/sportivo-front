import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * Standard page header with title, subtitle, and an optional actions slot.
 *
 * Usage:
 * <app-page-header
 *   [title]="'SCHOOL.INFO_FULL' | translate"
 *   [subtitle]="'SCHOOL.INFO_PAGE.SUBTITLE' | translate">
 *
 *   <!-- Optional action buttons projected into the right side -->
 *   <button actions>...</button>
 * </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  title = input<string>('');
  subtitle = input<string>('');
}
