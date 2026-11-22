import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentStep = 1; // 1: Email, 2: Verify Code, 3: New Password
  isLoading = false;
  apiErrorMessage = '';
  apiSuccessMessage = '';

  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;

  userEmail = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.step1Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.step2Form = this.fb.group({
      resetCode: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.step3Form = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const p1 = control.get('newPassword')?.value;
    const p2 = control.get('confirmPassword')?.value;
    if (p1 && p2 && p1 !== p2) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  submitStep1(): void {
    this.apiErrorMessage = '';
    this.apiSuccessMessage = '';
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.step1Form.value.email;
    this.userEmail = email;

    this.authService.forgotPasswords(email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.apiSuccessMessage = res.message || 'Reset code sent to your email!';
        this.currentStep = 2;
      },
      error: (err) => {
        this.isLoading = false;
        this.apiErrorMessage = err.error?.message || 'Failed to send reset code. Please check email.';
      },
    });
  }

  submitStep2(): void {
    this.apiErrorMessage = '';
    this.apiSuccessMessage = '';
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const resetCode = this.step2Form.value.resetCode;

    this.authService.verifyResetCode(resetCode).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 3;
      },
      error: (err) => {
        this.isLoading = false;
        this.apiErrorMessage = err.error?.message || 'Invalid or expired verification code.';
      },
    });
  }

  resendCode(): void {
    if (!this.userEmail) return;
    this.isLoading = true;
    this.apiErrorMessage = '';
    this.authService.forgotPasswords(this.userEmail).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.apiSuccessMessage = 'A new code has been sent to your email!';
      },
      error: (err) => {
        this.isLoading = false;
        this.apiErrorMessage = err.error?.message || 'Failed to resend code.';
      },
    });
  }

  submitStep3(): void {
    this.apiErrorMessage = '';
    this.apiSuccessMessage = '';
    if (this.step3Form.invalid) {
      this.step3Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const newPassword = this.step3Form.value.newPassword;

    this.authService.resetPassword({ email: this.userEmail, newPassword }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Password reset successfully! Please sign in with your new password.');
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.apiErrorMessage = err.error?.message || 'Failed to reset password. Please try again.';
      },
    });
  }

  changeEmail(): void {
    this.currentStep = 1;
    this.apiErrorMessage = '';
    this.apiSuccessMessage = '';
  }

  toggleNewPass(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPass(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
