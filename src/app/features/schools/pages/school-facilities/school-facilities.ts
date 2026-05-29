import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FacilitiesService, Facility } from '../../../../core/services/facilities.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PageLayoutComponent } from '../../../../shared/ui/page-layout/page-layout';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header';
import { LoadingComponent } from '../../../../shared/ui/loading/loading';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { SectionCardComponent } from '../../../../shared/ui/section-card/section-card';
import { SectionHeaderComponent } from '../../../../shared/ui/section-header/section-header';
import { InlineQuickAddComponent } from '../../../../shared/ui/inline-quick-add/inline-quick-add';

@Component({
  selector: 'app-school-facilities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageLayoutComponent,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
    SectionCardComponent,
    SectionHeaderComponent,
    InlineQuickAddComponent,
  ],
  templateUrl: './school-facilities.html',
  styleUrls: ['./school-facilities.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolFacilitiesComponent implements OnInit {
  private facilitiesService = inject(FacilitiesService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  @ViewChild('addInput') addInput?: ElementRef<HTMLInputElement>;

  facilities = signal<Facility[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  showAddForm = signal(false);

  facilityForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit() {
    this.loadFacilities();
  }

  toggleAddForm() {
    const willOpen = !this.showAddForm();
    this.showAddForm.set(willOpen);
    if (willOpen) {
      // Focus input after expand animation starts
      setTimeout(() => this.addInput?.nativeElement.focus(), 50);
    } else {
      // Clear any unsaved input on collapse
      this.facilityForm.reset();
    }
  }

  loadFacilities() {
    this.isLoading.set(true);
    this.facilitiesService.getFacilities().subscribe({
      next: (data) => {
        this.facilities.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toast.error('NOTIFICATIONS.FACILITY_LOAD_ERROR');
        this.isLoading.set(false);
      }
    });
  }

  onCreate() {
    if (this.facilityForm.invalid) {
      this.toast.warning('NOTIFICATIONS.FACILITY_NAME_ERROR');
      return;
    }

    this.isSubmitting.set(true);
    const data = this.facilityForm.value as { name: string };
    
    this.facilitiesService.createFacility(data).subscribe({
      next: (newFacility) => {
        // Mock count initially for smooth UI
        const addedFacility = { ...newFacility, _count: { lessons: 0 } };
        this.facilities.update(current => [...current, addedFacility]);
        this.facilityForm.reset();
        this.toast.success('NOTIFICATIONS.FACILITY_ADD_SUCCESS');
        this.isSubmitting.set(false);
        // Keep form open and refocus for quick consecutive adds
        setTimeout(() => this.addInput?.nativeElement.focus(), 0);
      },
      error: (err) => {
        this.toast.error('NOTIFICATIONS.FACILITY_ADD_ERROR');
        this.isSubmitting.set(false);
      }
    });
  }

  onDelete(facility: Facility) {
    if (facility._count?.lessons && facility._count.lessons > 0) {
       this.toast.warning('NOTIFICATIONS.FACILITY_DELETE_RESTRICT');
       return;
    }

    this.confirmService.ask({
      title: 'MODALS.DELETE_FACILITY_TITLE',
      message: 'MODALS.DELETE_FACILITY_MSG',
      params: { name: facility.name },
      confirmText: 'MODALS.DELETE',
      danger: true
    }).then((confirmed) => {
      if (confirmed) {
        this.facilitiesService.deleteFacility(facility.id).subscribe({
          next: () => {
            this.facilities.update(current => current.filter(f => f.id !== facility.id));
            this.toast.success('NOTIFICATIONS.FACILITY_DELETE_SUCCESS');
          },
          error: (err) => {
            this.toast.error('NOTIFICATIONS.FACILITY_DELETE_ERROR');
          }
        });
      }
    });
  }
}
