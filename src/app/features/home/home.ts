import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category, Product } from '../../core/models/ecommerce.models';
import { CartService } from '../../core/services/cart.service';
import { ProductsService } from '../../core/services/products.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly productsService = inject(ProductsService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  categories: Category[] = [];
  featuredProducts: Product[] = [];
  isLoadingCategories = true;
  isLoadingProducts = true;
  addingToCartId: string | null = null;

  // Hero Slider
  currentSlide = 0;
  slides = [
    {
      title: 'Fresh Products Delivered to your Door',
      subtitle: 'Get 20% off your first order',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
      badge: 'Special Offer',
      link: '/shop',
    },
    {
      title: 'Premium Organic Vegetables & Fruits',
      subtitle: '100% certified farm fresh produce',
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1400&q=80',
      badge: 'Best Quality',
      link: '/shop',
    },
    {
      title: 'Exclusive Deals on Daily Essentials',
      subtitle: 'Save up to 40% on top grocery brands',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1400&q=80',
      badge: 'Super Savings',
      link: '/shop',
    },
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.isLoadingCategories = false;
      },
      error: () => {
        this.isLoadingCategories = false;
      },
    });
  }

  loadFeaturedProducts(): void {
    this.productsService.getProducts({ limit: 10, sort: '-ratingsAverage' }).subscribe({
      next: (res) => {
        this.featuredProducts = res.data || [];
        this.isLoadingProducts = false;
      },
      error: () => {
        this.isLoadingProducts = false;
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
      error: (err) => {
        this.addingToCartId = null;
        console.error('Error adding to cart:', err);
      },
    });
  }

  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(product._id).subscribe();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }
}
