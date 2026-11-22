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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  apiErrorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^[A-Za-z0-9@#$%^&*!]{6,}$/),
          ],
        ],
        rePassword: ['', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
        terms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const rePassword = control.get('rePassword')?.value;
    if (password && rePassword && password !== rePassword) {
      control.get('rePassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  getPasswordStrength(): { text: string; class: string; width: string } {
    const val = this.registerForm.get('password')?.value || '';
    if (!val) return { text: '', class: '', width: '0%' };
    if (val.length < 6) return { text: 'Weak', class: 'weak', width: '30%' };
    const hasLetters = /[a-zA-Z]/.test(val);
    const hasNumbers = /\d/.test(val);
    const hasSpecial = /[@#$%^&*!]/.test(val);

    if (hasLetters && hasNumbers && hasSpecial && val.length >= 8) {
      return { text: 'Strong', class: 'strong', width: '100%' };
    }
    if ((hasLetters && hasNumbers) || (hasLetters && hasSpecial)) {
      return { text: 'Medium', class: 'medium', width: '65%' };
    }
    return { text: 'Weak', class: 'weak', width: '30%' };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.apiErrorMessage = '';
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.registerForm.value;

    this.authService
      .signup({
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        rePassword: formValue.rePassword,
        phone: formValue.phone,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.message === 'success') {
            void this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.apiErrorMessage =
            err.error?.message || 'Registration failed. Please verify your details.';
        },
      });
  }
}
