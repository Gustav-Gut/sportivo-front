import {
  Component, ChangeDetectionStrategy, Input, Output,
  EventEmitter, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable slide-over drawer.
 *
 * Desktop  → slides in from the RIGHT
 * Mobile   → slides up from the BOTTOM (bottom sheet)
 *
 * Usage:
 * ---------------------------------------------------------------
 * <app-drawer
 *   [isOpen]="showDrawer()"
 *   title="New Lesson"
 *   subtitle="Fill in the details below"
 *   icon="add_box"
 *   (closed)="closeDrawer()">
 *
 *   <!-- body content goes here (scrollable) -->
 *   <div>...your form fields...</div>
 *
 *   <!-- footer slot -->
 *   <ng-container drawer-footer>
 *     <button (click)="closeDrawer()">Cancel</button>
 *     <button type="submit">Save</button>
 *   </ng-container>
 * </app-drawer>
 * ---------------------------------------------------------------
 */
@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.html',
  styleUrls: ['./drawer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerComponent {
  /** Controls visibility */
  @Input() isOpen = false;

  /** Header title */
  @Input() title = '';

  /** Optional subtitle below the title */
  @Input() subtitle = '';

  /** Material Symbols icon name shown in the header badge */
  @Input() icon = 'edit';

  /** Drawer width on desktop (md+). Default: 520px */
  @Input() width = '520px';

  /** Emitted when the user closes the drawer (backdrop click or × button) */
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

  /** Close on Escape key */
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) this.close();
  }
}
