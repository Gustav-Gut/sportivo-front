import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlansService, Plan } from '../../../../core/services/plans.service';
import { PaymentsService } from '../../../../core/services/payments.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer';
import { DrawerSectionComponent } from '../../../../shared/ui/drawer-section/drawer-section';
import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header';
import { SectionCardComponent } from '../../../../shared/ui/section-card/section-card';
import { SectionHeaderComponent } from '../../../../shared/ui/section-header/section-header';
import { LoadingComponent } from '../../../../shared/ui/loading/loading';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge';

@Component({
  selector: 'app-school-payment-plans',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    DrawerComponent,
    DrawerSectionComponent,
    PageLayoutComponent,
    PageHeaderComponent,
    SectionCardComponent,
    SectionHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
    FormFieldComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './school-payment-plans.html',
  styleUrl: './school-payment-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolPaymentPlans implements OnInit {
  private plansService = inject(PlansService);
  private paymentsService = inject(PaymentsService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private fb = inject(FormBuilder);

  // State (signals)
  plans = signal<Plan[]>([]);
  isLoadingPlans = signal<boolean>(true);
  showPlanModal = signal<boolean>(false);
  showEnrollModal = signal<boolean>(false);
  isAdult = signal<boolean>(true);

  // Accordion state for drawers
  planOpenSection = signal<number>(1);
  enrollOpenSection = signal<number>(1);

  // Forms
  planForm: FormGroup;
  enrollForm: FormGroup;

  // ── Accordion toggles ────────────────────────────────
  togglePlanSection(n: number) {
    this.planOpenSection.set(this.planOpenSection() === n ? 0 : n);
  }

  toggleEnrollSection(n: number) {
    this.enrollOpenSection.set(this.enrollOpenSection() === n ? 0 : n);
  }

  // ── Section completion checks (for green ticks) ──────
  planSection1Done(): boolean {
    return this.planForm.valid;
  }

  enrollSection1Done(): boolean {
    return !!this.enrollForm.get('planId')?.valid;
  }

  enrollSection2Done(): boolean {
    const f = this.enrollForm;
    return ['studentRut', 'studentFirstName', 'studentLastName', 'studentEmail']
      .every(k => f.get(k)?.valid);
  }

  enrollSection3Done(): boolean {
    if (this.isAdult()) return true; // No tutor required for adults
    const f = this.enrollForm;
    return ['tutorRut', 'tutorFirstName', 'tutorLastName', 'tutorEmail']
      .every(k => f.get(k)?.valid);
  }

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
      this.isAdult.set(isAdult);
      this.updateTutorValidators(isAdult);
    });
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.isLoadingPlans.set(true);
    this.plansService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.isLoadingPlans.set(false);
      },
      error: () => {
        this.toast.error('NOTIFICATIONS.PLAN_LOAD_ERROR');
        this.isLoadingPlans.set(false);
      }
    });
  }

  // --- Plan Management ---

  openPlanModal() {
    this.planForm.reset({ price: 0, durationMonths: 1 });
    this.planOpenSection.set(1);
    this.showPlanModal.set(true);
  }

  closePlanModal() {
    this.showPlanModal.set(false);
  }

  savePlan() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const value = this.planForm.value;
    this.plansService.createPlan(value).subscribe({
      next: (newPlan) => {
        this.toast.success('NOTIFICATIONS.PLAN_CREATE_SUCCESS');
        this.closePlanModal();
        this.plans.update(current => [...current, newPlan]);
      },
      error: () => this.toast.error('NOTIFICATIONS.PLAN_CREATE_ERROR')
    });
  }

  async deletePlan(id: string) {
    const confirmed = await this.confirmService.ask({
      title: 'MODALS.DELETE_PLAN_TITLE',
      message: 'MODALS.DELETE_PLAN_MSG',
      confirmText: 'MODALS.DELETE',
      danger: true
    });

    if (!confirmed) return;

    this.plansService.deletePlan(id).subscribe({
      next: () => {
        this.toast.success('NOTIFICATIONS.PLAN_DELETE_SUCCESS');
        this.plans.update(current => current.filter(p => p.id !== id));
      },
      error: () => this.toast.error('NOTIFICATIONS.PLAN_DELETE_ERROR')
    });
  }

  // --- Enrollment Management ---

  openEnrollModal() {
    const defaultPlanId = this.plans().length > 0 ? this.plans()[0].id : '';
    this.enrollForm.reset({
      planId: defaultPlanId,
      isAdult: true,
      relationType: 'Padre/Madre'
    });
    this.isAdult.set(true);
    this.updateTutorValidators(true);
    this.enrollOpenSection.set(1);
    this.showEnrollModal.set(true);
  }

  closeEnrollModal() {
    this.showEnrollModal.set(false);
  }

  private updateTutorValidators(isAdult: boolean) {
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

  async submitEnrollment() {
    if (this.enrollForm.invalid) {
      this.enrollForm.markAllAsTouched();
      return;
    }

    const value = this.enrollForm.value;

    this.paymentsService.enrollStudent(value).subscribe({
      next: async (res) => {
        this.toast.success('NOTIFICATIONS.ENROLL_PLAN_SUCCESS');
        this.closeEnrollModal();

        const openLink = await this.confirmService.ask({
          title: 'MODALS.OPEN_PAYMENT_LINK_TITLE',
          message: 'MODALS.OPEN_PAYMENT_LINK_MSG',
          confirmText: 'MODALS.OPEN_LINK_BTN'
        });

        if (openLink) {
          window.open(res.link, '_blank');
        }
      },
      error: () => this.toast.error('NOTIFICATIONS.ENROLL_PLAN_ERROR')
    });
  }
}
