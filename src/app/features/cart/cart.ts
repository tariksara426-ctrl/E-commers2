import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartData, CartProduct } from '../../core/models/ecommerce.models';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  cartData: CartData | null = null;
  cartProducts: CartProduct[] = [];
  numOfCartItems = 0;
  totalCartPrice = 0;
  isLoading = true;
  isClearing = false;
  updatingItemId: string | null = null;
  removingItemId: string | null = null;

  promoCode = '';
  promoApplied = false;
  promoDiscount = 0;

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getLoggedUserCart().subscribe({
      next: (res) => {
        this.cartData = res?.data || null;
        this.cartProducts = res?.data?.products || [];
        this.numOfCartItems = res?.numOfCartItems || this.cartProducts.length;
        this.totalCartPrice = res?.data?.totalCartPrice || 0;
        this.isLoading = false;
      },
      error: () => {
        this.cartData = null;
        this.cartProducts = [];
        this.numOfCartItems = 0;
        this.totalCartPrice = 0;
        this.isLoading = false;
      },
    });
  }

  updateQuantity(productId: string, currentCount: number, change: number): void {
    const newCount = currentCount + change;
    if (newCount < 1) {
      this.removeItem(productId);
      return;
    }

    this.updatingItemId = productId;
    this.cartService.updateItemQuantity(productId, newCount).subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.cartProducts = res.data.products;
        this.numOfCartItems = res.numOfCartItems;
        this.totalCartPrice = res.data.totalCartPrice;
        this.updatingItemId = null;
      },
      error: () => {
        this.updatingItemId = null;
      },
    });
  }

  removeItem(productId: string): void {
    this.removingItemId = productId;
    this.cartService.removeCartItem(productId).subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.cartProducts = res.data.products;
        this.numOfCartItems = res.numOfCartItems;
        this.totalCartPrice = res.data.totalCartPrice;
        this.removingItemId = null;
      },
      error: () => {
        this.removingItemId = null;
      },
    });
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to remove all items from your cart?')) return;
    this.isClearing = true;
    this.cartService.clearUserCart().subscribe({
      next: () => {
        this.cartProducts = [];
        this.numOfCartItems = 0;
        this.totalCartPrice = 0;
        this.isClearing = false;
      },
      error: () => {
        this.isClearing = false;
      },
    });
  }

  applyPromo(): void {
    if (this.promoCode.trim().toUpperCase() === 'ORGANIC40') {
      this.promoApplied = true;
      this.promoDiscount = Math.round(this.totalCartPrice * 0.4);
      alert('Promo code applied! 40% discount granted.');
    } else if (this.promoCode.trim().toUpperCase() === 'FRESH25') {
      this.promoApplied = true;
      this.promoDiscount = Math.round(this.totalCartPrice * 0.25);
      alert('Promo code applied! 25% discount granted.');
    } else {
      alert('Invalid promo code. Try ORGANIC40 or FRESH25.');
    }
  }

  get finalPrice(): number {
    return Math.max(0, this.totalCartPrice - this.promoDiscount);
  }

  proceedToCheckout(): void {
    void this.router.navigate(['/checkout']);
  }
}
