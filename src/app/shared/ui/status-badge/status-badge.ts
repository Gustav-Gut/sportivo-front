import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type StatusBadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

/**
 * Status indicator badge: a colored dot + label.
 * Used for Active/Inactive, Paid/Pending/Overdue, etc.
 *
 * Usage:
 * <app-status-badge
 *   [variant]="school()?.active ? 'success' : 'danger'"
 *   [label]="(school()?.active ? 'COMMON.STATUS.ACTIVE' : 'COMMON.STATUS.INACTIVE') | translate">
 * </app-status-badge>
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  variant = input<StatusBadgeVariant>('success');
  label = input<string>('');
}
