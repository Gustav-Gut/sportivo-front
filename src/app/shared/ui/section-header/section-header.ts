import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * Standard section header used inside cards/forms.
 *
 * Variants:
 *  - bordered (default true): adds a bottom border separator
 *  - bordered=false: for headers that live inside flex rows already bordered by parent
 *
 * Usage:
 * <app-section-header icon="apartment" [title]="'GENERAL_DETAILS' | translate" />
 *
 * With step number:
 * <app-section-header icon="badge" [number]="1" [title]="'ROLE' | translate" />
 *
 * Without bottom border (e.g., when inside a flex row with its own separator):
 * <app-section-header icon="location_on" [title]="'LOCATIONS' | translate" [bordered]="false" />
 */
@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class SectionHeaderComponent {
  icon = input<string>('');
  title = input<string>('');
  number = input<number | null>(null);
  bordered = input<boolean>(true);
}
