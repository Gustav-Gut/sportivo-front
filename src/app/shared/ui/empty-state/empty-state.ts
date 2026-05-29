import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

/**
 * Standard empty state block: centered icon + title + optional subtitle.
 *
 * Sizes (controls icon + vertical padding):
 *  - sm: compact, py-8, text-4xl icon — inline within scrollable lists
 *  - md (default): py-12, text-5xl icon — standard placement inside cards
 *  - lg: prominent, py-20, text-6xl icon — primary welcoming/search states
 *
 * Variants:
 *  - framed: adds a dashed border with bg, forces py-24 — used when the
 *            empty state IS the whole content area
 *
 * Usage:
 * <app-empty-state
 *   icon="location_off"
 *   [title]="'EMPTY_TITLE' | translate"
 *   [subtitle]="'EMPTY_SUBTITLE' | translate" />
 *
 * Framed with action:
 * <app-empty-state icon="event_busy" [title]="..." [framed]="true">
 *   <button action ...>Create first lesson</button>
 * </app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class EmptyStateComponent {
  icon = input<string>('inbox');
  title = input<string>('');
  subtitle = input<string>('');
  size = input<EmptyStateSize>('md');
  framed = input<boolean>(false);
}
