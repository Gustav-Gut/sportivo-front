import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DrawerComponent } from '../drawer/drawer';
import { DrawerSectionComponent } from '../drawer-section/drawer-section';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DrawerComponent, DrawerSectionComponent],
  templateUrl: './invoice-modal.html',
  styleUrl: './invoice-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceModal {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  
  isOpen = input<boolean>(false);
  onClosed = output<void>();

  isSubmitting = false;

  invoiceForm = this.fb.group({
    studentId: ['', Validators.required],
    concept: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    dueDate: ['', Validators.required],
    paymentMethod: ['card', Validators.required]
  });

  closeModal() {
    this.invoiceForm.reset({ paymentMethod: 'card' });
    this.onClosed.emit();
  }

  onSubmit() {
    if (this.invoiceForm.invalid) return;
    
    this.isSubmitting = true;
    // Simulate API call
    setTimeout(() => {
      this.toastService.success('NOTIFICATIONS.INVOICE_CREATED', { 
        id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        name: 'Selected Student' // In real app, we'd get the name from the selected ID
      });
      this.isSubmitting = false;
      this.closeModal();
    }, 800);
  }
}
