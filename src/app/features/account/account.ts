import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AddressItem } from '../../core/models/ecommerce.models';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly addressService = inject(AddressService);

  activeTab: 'addresses' | 'settings' = 'addresses';

  // Addresses
  addresses: AddressItem[] = [];
  isLoadingAddresses = true;
  showAddAddressModal = false;
  addressForm: FormGroup;
  isSavingAddress = false;

  // Settings: Profile Form
  profileForm: FormGroup;
  isSavingProfile = false;
  profileSuccessMsg = '';
  profileErrorMsg = '';

  // Settings: Password Form
  passwordForm: FormGroup;
  isSavingPassword = false;
  passwordSuccessMsg = '';
  passwordErrorMsg = '';
  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  constructor() {
    this.addressForm = this.fb.group({
      name: ['', [Validators.required]],
      details: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      city: ['', [Validators.required]],
    });

    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      name: [user?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^01[0125][0-9]{8}$/)]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rePassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const p1 = control.get('password')?.value;
    const p2 = control.get('rePassword')?.value;
    if (p1 && p2 && p1 !== p2) {
      control.get('rePassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  switchTab(tab: 'addresses' | 'settings'): void {
    this.activeTab = tab;
  }

  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.addressService.getAddresses().subscribe({
      next: (res) => {
        this.addresses = res.data || [];
        this.isLoadingAddresses = false;
      },
      error: () => {
        this.isLoadingAddresses = false;
      },
    });
  }

  openAddAddressModal(): void {
    this.addressForm.reset();
    this.showAddAddressModal = true;
  }

  closeAddAddressModal(): void {
    this.showAddAddressModal = false;
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSavingAddress = true;
    this.addressService.addAddress(this.addressForm.value).subscribe({
      next: (res) => {
        this.addresses = res.data || [];
        this.isSavingAddress = false;
        this.showAddAddressModal = false;
      },
      error: (err) => {
        this.isSavingAddress = false;
        alert(err.error?.message || 'Failed to add address.');
      },
    });
  }

  deleteAddress(id: string): void {
    if (!confirm('Are you sure you want to delete this address?')) return;
    this.addressService.removeAddress(id).subscribe({
      next: (res) => {
        this.addresses = res.data || [];
      },
    });
  }

  saveProfile(): void {
    this.profileSuccessMsg = '';
    this.profileErrorMsg = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.authService.updateMe(this.profileForm.value).subscribe({
      next: () => {
        this.isSavingProfile = false;
        this.profileSuccessMsg = 'Profile updated successfully!';
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileErrorMsg = err.error?.message || 'Failed to update profile.';
      },
    });
  }

  changePassword(): void {
    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword = true;
    this.authService.changeMyPassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordSuccessMsg = 'Password changed successfully!';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.passwordErrorMsg = err.error?.message || 'Failed to change password.';
      },
    });
  }
}
