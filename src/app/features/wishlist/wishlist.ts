import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/ecommerce.models';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  readonly wishlistService = inject(WishlistService);
  readonly cartService = inject(CartService);

  wishlistItems: Product[] = [];
  isLoading = true;
  addingToCartId: string | null = null;
  removingId: string | null = null;

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.wishlistService.getLoggedUserWishlist().subscribe({
      next: (res) => {
        this.wishlistItems = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.wishlistItems = [];
        this.isLoading = false;
      },
    });
  }

  addToCart(product: Product): void {
    this.addingToCartId = product._id;
    this.cartService.addToCart(product._id).subscribe({
      next: () => {
        this.addingToCartId = null;
      },
      error: () => {
        this.addingToCartId = null;
      },
    });
  }

  removeFromWishlist(product: Product): void {
    this.removingId = product._id;
    this.wishlistService.removeFromWishlist(product._id).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter((p) => p._id !== product._id);
        this.removingId = null;
      },
      error: () => {
        this.removingId = null;
      },
    });
  }
}
