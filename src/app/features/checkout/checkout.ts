import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AddressItem, CartData, CartProduct } from '../../core/models/ecommerce.models';
import { AddressService } from '../../core/services/address.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly addressService = inject(AddressService);
  private readonly router = inject(Router);

  checkoutForm: FormGroup;
  cartData: CartData | null = null;
  cartProducts: CartProduct[] = [];
  cartId: string = '';
  totalPrice = 0;

  savedAddresses: AddressItem[] = [];
  selectedAddressId: string | null = null;
  useCustomAddress = false;

  paymentMethod: 'cash' | 'online' = 'cash';
  isLoading = true;
  isSubmitting = false;
  apiErrorMessage = '';

  constructor() {
    this.checkoutForm = this.fb.group({
      city: ['', [Validators.required]],
      details: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    });
  }

  ngOnInit(): void {
    this.loadCartAndAddresses();
  }

  loadCartAndAddresses(): void {
    this.isLoading = true;

    // Load Cart
    this.cartService.getLoggedUserCart().subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.cartId = res.cartId || res.data?._id || '';
        this.cartProducts = res.data?.products || [];
        this.totalPrice = res.data?.totalCartPrice || 0;
        this.isLoading = false;

        if (this.cartProducts.length === 0) {
          void this.router.navigate(['/cart']);
        }
      },
      error: () => {
        this.isLoading = false;
        void this.router.navigate(['/cart']);
      },
    });

    // Load Saved Addresses
    this.addressService.getAddresses().subscribe({
      next: (res) => {
        this.savedAddresses = res.data || [];
        if (this.savedAddresses.length > 0) {
          this.selectAddress(this.savedAddresses[0]);
        } else {
          this.useCustomAddress = true;
        }
      },
    });
  }

  selectAddress(address: AddressItem): void {
    this.selectedAddressId = address._id;
    this.useCustomAddress = false;
    this.checkoutForm.patchValue({
      city: address.city,
      details: address.details,
      phone: address.phone,
    });
  }

  enableCustomAddress(): void {
    this.useCustomAddress = true;
    this.selectedAddressId = null;
    this.checkoutForm.reset();
  }

  setPaymentMethod(method: 'cash' | 'online'): void {
    this.paymentMethod = method;
  }

  onSubmit(): void {
    this.apiErrorMessage = '';

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.cartId) {
      this.apiErrorMessage = 'Could not find cart. Please try again.';
      return;
    }

    this.isSubmitting = true;
    const shippingAddress = this.checkoutForm.value;

    if (this.paymentMethod === 'cash') {
      this.ordersService.createCashOrder(this.cartId, shippingAddress).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.cartService.refreshCartCount();
          alert('Order placed successfully! Thank you for shopping with FreshCart.');
          void this.router.navigate(['/orders']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.apiErrorMessage =
            err.error?.message || 'Failed to place cash order. Please try again.';
        },
      });
    } else {
      // Online payment via Stripe session
      this.ordersService
        .checkoutSession(this.cartId, shippingAddress, window.location.origin + '/orders')
        .subscribe({
          next: (res) => {
            this.isSubmitting = false;
            if (res.session?.url) {
              window.location.href = res.session.url;
            } else {
              void this.router.navigate(['/orders']);
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this.apiErrorMessage =
              err.error?.message || 'Failed to initiate online payment.';
          },
        });
    }
  }
}
