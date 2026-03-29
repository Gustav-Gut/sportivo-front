import {
  Component, ChangeDetectionStrategy, Input, Output,
  EventEmitter, HostListener, OnChanges, SimpleChanges, signal
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
export class DrawerComponent implements OnChanges {
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

  /** Internal: true while the exit animation is playing */
  isClosing = signal(false);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && !changes['isOpen'].firstChange) {
      const prev = changes['isOpen'].previousValue;
      const curr = changes['isOpen'].currentValue;
      // When parent sets isOpen false, play the exit animation first
      if (prev === true && curr === false) {
        this.isClosing.set(true);
        setTimeout(() => this.isClosing.set(false), 290);
      }
    }
  }

  close() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isClosing.set(false);
      this.closed.emit();
    }, 290);
  }

  /** Close on Escape key */
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen && !this.isClosing()) this.close();
  }
}
