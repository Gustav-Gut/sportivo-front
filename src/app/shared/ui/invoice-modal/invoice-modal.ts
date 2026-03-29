import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DrawerComponent } from '../drawer/drawer';
import { DrawerSectionComponent } from '../drawer-section/drawer-section';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DrawerComponent, DrawerSectionComponent],
  templateUrl: './invoice-modal.html',
  styleUrl: './invoice-modal.scss'
})
export class InvoiceModal {
  private fb = inject(FormBuilder);
  
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
      console.log('Invoice data:', this.invoiceForm.value);
      this.isSubmitting = false;
      this.closeModal();
    }, 800);
  }
}
