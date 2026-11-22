import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/ecommerce.models';
import { CartService } from '../../core/services/cart.service';
import { ProductsService } from '../../core/services/products.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private readonly productsService = inject(ProductsService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  productsList: Product[] = [];
  isLoading = true;
  addingToCartId: string | null = null;
  totalProducts = 0;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getProducts({ limit: 40 }).subscribe({
      next: (res) => {
        this.productsList = res.data || [];
        this.totalProducts = res.results || this.productsList.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isLoading = false;
      },
    });
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
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

  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(product._id).subscribe();
  }
}
