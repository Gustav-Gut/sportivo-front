import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SchoolsService, School } from '../../../../core/services/schools.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-school-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './school-info.html',
  styleUrls: ['./school-info.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolInfo implements OnInit {
  private fb = inject(FormBuilder);
  private schoolsService = inject(SchoolsService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  isSaving = signal(false);
  isUploadingLogo = signal(false);
  school = signal<School | null>(null);

  schoolForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    address: [''],
    email: [''],
    phone: [''],
    website: [''],
    description: ['']
  });

  ngOnInit() {
    this.loadSchool();
  }

  private loadSchool() {
    this.isLoading.set(true);
    this.schoolsService.getSchool().subscribe({
      next: (school) => {
        this.school.set(school);
        this.schoolForm.patchValue({
          name: school.name,
          address: school.address || '',
          email: school.email || '',
          phone: school.phone || '',
          website: school.website || '',
          description: school.description || ''
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading school:', err);
        this.toastService.error('Failed to load school data.');
        this.isLoading.set(false);
      }
    });
  }

  onSaveSchool() {
    if (this.schoolForm.invalid) {
      this.schoolForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const payload = {
      name: this.schoolForm.value.name,
      address: this.schoolForm.value.address || undefined,
      email: this.schoolForm.value.email || undefined,
      phone: this.schoolForm.value.phone || undefined,
      website: this.schoolForm.value.website || undefined,
      description: this.schoolForm.value.description || undefined
    };

    this.schoolsService.updateSchool(payload).subscribe({
      next: (updated) => {
        this.school.set(updated);
        this.isSaving.set(false);
        this.toastService.success('School information updated successfully.');
      },
      error: (err) => {
        console.error('Error updating school:', err);
        this.toastService.error(err.error?.message || 'Failed to update school. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select a valid image file.');
        return;
      }

      this.isUploadingLogo.set(true);
      this.schoolsService.uploadLogo(file).subscribe({
        next: (updatedSchool) => {
          this.school.set(updatedSchool);
          this.isUploadingLogo.set(false);
          this.toastService.success('Logo uploaded successfully.');
        },
        error: (err) => {
          console.error('Error uploading logo:', err);
          this.toastService.error('Failed to upload logo.');
          this.isUploadingLogo.set(false);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
