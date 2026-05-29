import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Glassmorphism card wrapper used as a section/panel container.
 * Provides the standard elevated dark card styling.
 *
 * Usage:
 * <app-section-card>
 *   <div class="p-8 space-y-6">
 *     <!-- content with whatever padding you need -->
 *   </div>
 * </app-section-card>
 *
 * Note: padding is intentionally left to the consumer since it varies.
 */
@Component({
  selector: 'app-section-card',
  standalone: true,
  templateUrl: './section-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionCardComponent {}
