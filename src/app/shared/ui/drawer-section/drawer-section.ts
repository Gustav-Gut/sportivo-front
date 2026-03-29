import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable collapsible section for use inside app-drawer.
 *
 * Usage:
 * ---------------------------------------------------------------
 * <app-drawer-section
 *   [number]="1"
 *   title="Basic Information"
 *   [isOpen]="openSection() === 1"
 *   [isDone]="section1Done()"
 *   (toggle)="toggleSection(1)">
 *
 *   <!-- your fields go here -->
 *
 * </app-drawer-section>
 * ---------------------------------------------------------------
 */
@Component({
  selector: 'app-drawer-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer-section.html',
  styleUrls: ['./drawer-section.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerSectionComponent {
  /** Step number shown in the badge */
  @Input() number: number = 1;

  /** Section title */
  @Input() title: string = '';

  /** Optional subtitle shown when section is collapsed */
  @Input() subtitle: string = '';

  /** Whether this section is expanded */
  @Input() isOpen: boolean = false;

  /** Whether this section's required fields are all filled */
  @Input() isDone: boolean = false;

  /** Emitted when the user clicks the header to toggle */
  @Output() toggle = new EventEmitter<void>();
}
