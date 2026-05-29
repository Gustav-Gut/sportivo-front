import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * Inline SVG spinner. Inherits color from parent via `currentColor`.
 *
 * Sizes:
 *  - sm: 4x4 (16px) - default, for use inside buttons
 *  - md: 6x6 (24px)
 *  - lg: 8x8 (32px)
 *
 * For full-page loading with a message, use <app-loading> instead.
 *
 * Usage:
 * <app-spinner size="sm" class="text-white" />
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('sm');
}
