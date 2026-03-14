import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserForm {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  // For simplicity, we manage the primary selected role in UI to toggle the specific profile fields
  selectedPrimaryRole = signal<'STUDENT' | 'COACH' | 'TUTOR' | 'ADMIN' | 'SUPERADMIN'>('STUDENT');

  userForm: FormGroup = this.fb.group({
    // Base User Fields
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    rut: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    phone: [''],

    // Role Array
    roles: [['STUDENT'], Validators.required],

    // Student Profile Fields
    student_birthDate: [''],
    student_weight: [''],
    student_height: [''],
    student_bloodType: [''],
    student_medicalNotes: [''],

    // Coach Profile Fields
    coach_specialty: [''],
    coach_yearsExperience: [''],
    coach_certifications: [''],

    // Tutor Profile Fields
    tutor_emergencyContact: [''],
    tutor_occupation: [''],
    tutor_address: ['']
  });

  onRoleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const role = selectElement.value as any;
    this.selectedPrimaryRole.set(role);
    this.userForm.patchValue({ roles: [role] }); // Ensure it's an array for Prisma
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const formValues = this.userForm.value;
    const payload: any = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      rut: formValues.rut,
      email: formValues.email,
      password: formValues.password,
      phone: formValues.phone,
      roles: formValues.roles
    };

    // Attach nested profiles conditionally based on selected role
    const role = this.selectedPrimaryRole();

    if (role === 'STUDENT') {
      payload.studentProfile = {
        birthDate: formValues.student_birthDate ? new Date(formValues.student_birthDate).toISOString() : undefined,
        weight: formValues.student_weight ? parseFloat(formValues.student_weight) : undefined,
        height: formValues.student_height ? parseFloat(formValues.student_height) : undefined,
        bloodType: formValues.student_bloodType || undefined,
        medicalNotes: formValues.student_medicalNotes || undefined
      };
    } else if (role === 'COACH') {
      payload.coachProfile = {
        specialty: formValues.coach_specialty || undefined,
        yearsExperience: formValues.coach_yearsExperience ? parseInt(formValues.coach_yearsExperience, 10) : undefined,
        certifications: formValues.coach_certifications || undefined
      };
    } else if (role === 'TUTOR') {
      payload.tutorProfile = {
        emergencyContact: formValues.tutor_emergencyContact || undefined,
        occupation: formValues.tutor_occupation || undefined,
        address: formValues.tutor_address || undefined
      };
    }

    this.http.post(`${environment.apiUrl}/users`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/users']);
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.errorMessage.set(err.error?.message || 'Failed to create user. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/users']);
  }
}
