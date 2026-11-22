import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../core/models/ecommerce.models';
import { CartService } from '../../core/services/cart.service';
import { ProductsService } from '../../core/services/products.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedImage: string = '';
  quantity: number = 1;
  activeTab: 'details' | 'reviews' | 'shipping' = 'details';

  isLoading = true;
  isAddingToCart = false;
  isBuyingNow = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProductDetails(id);
      }
    });
  }

  loadProductDetails(id: string): void {
    this.isLoading = true;
    this.productsService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res.data;
        this.selectedImage = this.product.images?.[0] || this.product.imageCover;
        this.quantity = 1;
        this.isLoading = false;

        // Load related products from same category
        if (this.product.category?._id) {
          this.loadRelatedProducts(this.product.category._id);
        }
      },
      error: (err) => {
        console.error('Error loading product details:', err);
        this.isLoading = false;
      },
    });
  }

  loadRelatedProducts(categoryId: string): void {
    this.productsService
      .getProducts({ category: categoryId, limit: 6 })
      .subscribe({
        next: (res) => {
          this.relatedProducts = (res.data || []).filter(
            (p) => p._id !== this.product?._id
          );
        },
      });
  }

  selectImage(img: string): void {
    this.selectedImage = img;
  }

  incrementQty(): void {
    const max = this.product?.quantity || 99;
    if (this.quantity < max) {
      this.quantity++;
    }
  }

  decrementQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  get totalPrice(): number {
    if (!this.product) return 0;
    const price = this.product.priceAfterDiscount || this.product.price;
    return price * this.quantity;
  }

  addToCart(): void {
    if (!this.product) return;
    this.isAddingToCart = true;
    this.cartService.addToCart(this.product._id).subscribe({
      next: () => {
        if (this.quantity > 1) {
          this.cartService.updateItemQuantity(this.product!._id, this.quantity).subscribe();
        }
        this.isAddingToCart = false;
      },
      error: () => {
        this.isAddingToCart = false;
      },
    });
  }

  buyNow(): void {
    if (!this.product) return;
    this.isBuyingNow = true;
    this.cartService.addToCart(this.product._id).subscribe({
      next: () => {
        this.isBuyingNow = false;
        void this.router.navigate(['/checkout']);
      },
      error: () => {
        this.isBuyingNow = false;
      },
    });
  }

  toggleWishlist(): void {
    if (!this.product) return;
    this.wishlistService.toggleWishlist(this.product._id).subscribe();
  }

  shareProduct(): void {
    if (navigator.share) {
      void navigator.share({
        title: this.product?.title,
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  }
}
