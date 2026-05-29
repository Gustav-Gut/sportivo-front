import { Component, ChangeDetectionStrategy, input } from '@angular/core';

/**
 * Wrapper for a labelled form field. Renders the label with optional required
 * indicator and hint, then projects the actual input element.
 *
 * Use the global classes `.form-input`, `.form-input-sm`, `.form-input-xs`,
 * `.form-textarea`, or `.form-readonly` on the projected input for consistent
 * styling.
 *
 * Usage:
 * <app-form-field
 *   [label]="'USERS.DRAWER.LABEL_FIRST_NAME' | translate"
 *   [required]="true">
 *   <input type="text" formControlName="firstName" class="form-input" placeholder="John" />
 * </app-form-field>
 *
 * With hint:
 * <app-form-field
 *   [label]="'LABEL_PASSWORD_NEW' | translate"
 *   [hint]="'LABEL_PASSWORD_HINT' | translate">
 *   <input type="password" formControlName="password" class="form-input" />
 * </app-form-field>
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' }
})
export class FormFieldComponent {
  label = input<string>('');
  required = input<boolean>(false);
  hint = input<string>('');
}
