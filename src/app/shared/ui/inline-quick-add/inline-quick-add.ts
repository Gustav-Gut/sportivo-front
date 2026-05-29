import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner';

/**
 * Inline quick-add pattern: a toggle button that reveals an expandable input
 * area below with a submit micro-button on the right.
 *
 * Variants supported:
 *  - Text input (Enter to submit + click micro-button) — wrap in a parent <form>
 *  - Select dropdown (click micro-button only) — no form needed
 *
 * The micro-button is `type="button"` and only emits (submit) — for native
 * Enter-key submission with a text input, wrap the component in a parent
 * `<form (ngSubmit)="...">` and the input inside.
 *
 * Slots:
 *  - `[header]`: content on the left of the toggle row (typically <app-section-header>)
 *  - default: the actual input/select element (use class="form-input pr-14")
 *
 * Usage (text input):
 * <form [formGroup]="form" (ngSubmit)="onAdd()">
 *   <app-inline-quick-add
 *     [open]="showAdd()"
 *     [label]="(showAdd() ? 'MODALS.CANCEL' : 'ADD_BTN') | translate"
 *     [submitDisabled]="form.invalid || saving()"
 *     [isSubmitting]="saving()"
 *     (toggle)="toggleAdd()"
 *     (submit)="onAdd()">
 *
 *     <app-section-header header icon="..." [title]="..." [bordered]="false" />
 *     <input #addInput formControlName="name" class="form-input pr-14" />
 *   </app-inline-quick-add>
 * </form>
 *
 * Usage (select):
 * <app-inline-quick-add ... (submit)="onAddItem()">
 *   <app-section-header header ... />
 *   <div class="relative">
 *     <select [(ngModel)]="selected" class="form-input pr-14 appearance-none">...</select>
 *     <span class="material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
 *   </div>
 * </app-inline-quick-add>
 */
@Component({
  selector: 'app-inline-quick-add',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './inline-quick-add.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class InlineQuickAddComponent {
  open = input<boolean>(false);
  label = input<string>('');
  icon = input<string>('add');
  submitDisabled = input<boolean>(false);
  isSubmitting = input<boolean>(false);

  toggle = output<void>();
  submit = output<void>();

  onToggle() {
    this.toggle.emit();
  }

  onSubmit() {
    this.submit.emit();
  }
}
