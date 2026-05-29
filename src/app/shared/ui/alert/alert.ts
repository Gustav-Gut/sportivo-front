import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

/**
 * Inline alert/banner for error, warning, success, or info messages.
 *
 * Usage:
 * <app-alert variant="error" [message]="errorMessage() | translate" />
 *
 * <app-alert variant="warning">
 *   Custom content via projection
 * </app-alert>
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  variant = input<AlertVariant>('error');
  message = input<string>('');

  get icon(): string {
    switch (this.variant()) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'error':
      default: return 'error';
    }
  }
}
