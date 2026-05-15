import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlansService, Plan } from '../../../../core/services/plans.service';
import { PaymentsService } from '../../../../core/services/payments.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer';
import { DrawerSectionComponent } from '../../../../shared/ui/drawer-section/drawer-section';

@Component({
  selector: 'app-school-payment-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DrawerComponent, DrawerSectionComponent],
  templateUrl: './school-payment-plans.html',
  styleUrl: './school-payment-plans.scss',
})
export class SchoolPaymentPlans implements OnInit {
  private plansService = inject(PlansService);
  private paymentsService = inject(PaymentsService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // State
  plans: Plan[] = [];
  isLoadingPlans = true;

  // Modals
  showPlanModal = false;
  showEnrollModal = false;

  // Forms
  planForm: FormGroup;
  enrollForm: FormGroup;

  isAdult = true;

  constructor() {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(1)]],
      durationMonths: [1, [Validators.required, Validators.min(1)]],
    });

    this.enrollForm = this.fb.group({
      planId: ['', Validators.required],
      isAdult: [true],
      
      // Student info
      studentRut: ['', Validators.required],
      studentFirstName: ['', Validators.required],
      studentLastName: ['', Validators.required],
      studentEmail: ['', [Validators.required, Validators.email]],
      studentPhone: [''],

      // Tutor info (conditionally required later)
      tutorRut: [''],
      tutorFirstName: [''],
      tutorLastName: [''],
      tutorEmail: [''],
      tutorPhone: [''],
      relationType: ['Padre/Madre'],
    });

    this.enrollForm.get('isAdult')?.valueChanges.subscribe(isAdult => {
      this.isAdult = isAdult;
      this.updateTutorValidators(isAdult);
    });
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.isLoadingPlans = true;
    this.plansService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.isLoadingPlans = false;
        this.cdr.detectChanges(); // Force update in case of sync cache response
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al cargar planes de pago');
        this.isLoadingPlans = false;
      }
    });
  }

  // --- Plan Management ---

  openPlanModal() {
    this.planForm.reset({ price: 0, durationMonths: 1 });
    this.showPlanModal = true;
  }

  closePlanModal() {
    this.showPlanModal = false;
  }

  savePlan() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const value = this.planForm.value;
    this.plansService.createPlan(value).subscribe({
      next: (newPlan) => {
        this.toastService.success('Plan creado exitosamente');
        this.closePlanModal();
        this.plans = [...this.plans, newPlan];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al crear plan');
      }
    });
  }

  deletePlan(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este plan?')) return;
    
    this.plansService.deletePlan(id).subscribe({
      next: () => {
        this.toastService.success('Plan eliminado');
        this.plans = this.plans.filter(p => p.id !== id);
        this.cdr.detectChanges();
      },
      error: () => this.toastService.error('No se pudo eliminar el plan')
    });
  }

  // --- Enrollment Management ---

  openEnrollModal() {
    const defaultPlanId = this.plans.length > 0 ? this.plans[0].id : '';
    this.enrollForm.reset({ 
      planId: defaultPlanId, 
      isAdult: true, 
      relationType: 'Padre/Madre' 
    });
    this.isAdult = true;
    this.updateTutorValidators(true);
    this.showEnrollModal = true;
  }

  closeEnrollModal() {
    this.showEnrollModal = false;
  }

  updateTutorValidators(isAdult: boolean) {
    const tutorControls = ['tutorRut', 'tutorFirstName', 'tutorLastName', 'tutorEmail'];
    
    tutorControls.forEach(control => {
      const field = this.enrollForm.get(control);
      if (isAdult) {
        field?.clearValidators();
      } else {
        if (control === 'tutorEmail') {
          field?.setValidators([Validators.required, Validators.email]);
        } else {
          field?.setValidators([Validators.required]);
        }
      }
      field?.updateValueAndValidity();
    });
  }

  submitEnrollment() {
    if (this.enrollForm.invalid) {
      this.enrollForm.markAllAsTouched();
      return;
    }

    const value = this.enrollForm.value;

    this.paymentsService.enrollStudent(value).subscribe({
      next: (res) => {
        this.toastService.success('Alumno inscrito exitosamente');
        this.closeEnrollModal();
        // Redirect to the payment link or show it
        if (confirm('Suscripción generada. ¿Deseas abrir el link de MercadoPago asociado?')) {
          window.open(res.link, '_blank');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al inscribir alumno');
      }
    });
  }
}
