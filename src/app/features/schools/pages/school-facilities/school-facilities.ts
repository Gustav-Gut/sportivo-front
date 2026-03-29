import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FacilitiesService, Facility } from '../../../../core/services/facilities.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-school-facilities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './school-facilities.html',
  styleUrls: ['./school-facilities.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolFacilitiesComponent implements OnInit {
  private facilitiesService = inject(FacilitiesService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  facilities = signal<Facility[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);

  facilityForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit() {
    this.loadFacilities();
  }

  loadFacilities() {
    this.isLoading.set(true);
    this.facilitiesService.getFacilities().subscribe({
      next: (data) => {
        this.facilities.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Failed to load facilities');
        this.isLoading.set(false);
      }
    });
  }

  onCreate() {
    if (this.facilityForm.invalid) {
      this.toast.warning('Please enter a valid facility name');
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
        this.toast.success('Facility added successfully');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create facility');
        this.isSubmitting.set(false);
      }
    });
  }

  onDelete(facility: Facility) {
    if (facility._count?.lessons && facility._count.lessons > 0) {
       this.toast.warning('Cannot delete facility with active classes assigned');
       return;
    }

    this.confirmService.ask({
      title: 'Delete Facility?',
      message: `Are you sure you want to delete "${facility.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    }).then((confirmed) => {
      if (confirmed) {
        this.facilitiesService.deleteFacility(facility.id).subscribe({
          next: () => {
            this.facilities.update(current => current.filter(f => f.id !== facility.id));
            this.toast.success('Facility deleted');
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Failed to delete facility');
          }
        });
      }
    });
  }
}
