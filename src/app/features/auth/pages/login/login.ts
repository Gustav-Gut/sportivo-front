import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SchoolsService } from '../../../../core/services/schools.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  loginForm: FormGroup;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  currentStep = signal<number>(1);
  schoolInfo = signal<{ name: string, logoUrl: string, defaultLanguage: string } | null>(null);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private schoolsService = inject(SchoolsService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      schoolSlug: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onNext(): void {
    const slug = this.loginForm.get('schoolSlug')?.value;
    if (slug) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.schoolsService.getPublicInfo(slug).subscribe({
        next: (info) => {
          this.isLoading.set(false);
          if (info) {
            this.schoolInfo.set(info);
            this.translate.use(info.defaultLanguage);
            this.currentStep.set(2);
          } else {
            this.errorMessage.set('School not found. Please check the code.');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Could not verify school code. Please try again.');
        }
      });
    }
  }

  onBack(): void {
    this.currentStep.set(1);
    this.schoolInfo.set(null);
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { email, password, schoolSlug } = this.loginForm.value;

      this.authService.login(email, password, schoolSlug).subscribe({
        next: () => {
          this.router.navigate(['/finances/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Login failed. Please verify your credentials.');
        }
      });
    }
  }
}
