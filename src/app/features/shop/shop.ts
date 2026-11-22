import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Brand, Category, Product } from '../../core/models/ecommerce.models';
import { CartService } from '../../core/services/cart.service';
import { ProductsService } from '../../core/services/products.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  // Data
  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];

  // Filter States
  searchTerm = '';
  selectedCategories = new Set<string>();
  selectedBrands = new Set<string>();
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedSort = '';
  viewMode: 'grid' | 'list' = 'grid';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  limit = 20;

  isLoading = true;
  addingToCartId: string | null = null;

  ngOnInit(): void {
    this.loadFilterMetadata();

    this.route.queryParams.subscribe((params) => {
      if (params['keyword']) {
        this.searchTerm = params['keyword'];
      }
      if (params['category']) {
        this.selectedCategories.clear();
        this.selectedCategories.add(params['category']);
      }
      if (params['brand']) {
        this.selectedBrands.clear();
        this.selectedBrands.add(params['brand']);
      }
      this.fetchFilteredProducts();
    });
  }

  loadFilterMetadata(): void {
    this.productsService.getCategories().subscribe({
      next: (res) => (this.categories = res.data || []),
    });
    this.productsService.getAllBrands().subscribe({
      next: (res) => (this.brands = res.data || []),
    });
  }

  fetchFilteredProducts(): void {
    this.isLoading = true;

    const queryParams: Record<string, any> = {
      page: this.currentPage,
      limit: this.limit,
    };

    if (this.selectedSort) {
      queryParams['sort'] = this.selectedSort;
    }
    if (this.minPrice !== null && this.minPrice !== undefined && this.minPrice > 0) {
      queryParams['price[gte]'] = this.minPrice;
    }
    if (this.maxPrice !== null && this.maxPrice !== undefined && this.maxPrice > 0) {
      queryParams['price[lte]'] = this.maxPrice;
    }
    if (this.selectedCategories.size > 0) {
      queryParams['category[in]'] = Array.from(this.selectedCategories).join(',');
    }
    if (this.selectedBrands.size > 0) {
      queryParams['brand'] = Array.from(this.selectedBrands)[0];
    }

    this.productsService.getProducts(queryParams).subscribe({
      next: (res) => {
        let result = res.data || [];
        if (this.searchTerm.trim()) {
          const term = this.searchTerm.toLowerCase();
          result = result.filter(
            (p) =>
              p.title.toLowerCase().includes(term) ||
              p.description.toLowerCase().includes(term) ||
              p.category?.name.toLowerCase().includes(term)
          );
        }
        this.products = result;
        this.totalPages = res.metadata?.numberOfPages || 1;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onSearchSubmit(): void {
    this.currentPage = 1;
    this.fetchFilteredProducts();
  }

  toggleCategory(catId: string): void {
    if (this.selectedCategories.has(catId)) {
      this.selectedCategories.delete(catId);
    } else {
      this.selectedCategories.add(catId);
    }
    this.currentPage = 1;
    this.fetchFilteredProducts();
  }

  toggleBrand(brandId: string): void {
    if (this.selectedBrands.has(brandId)) {
      this.selectedBrands.delete(brandId);
    } else {
      this.selectedBrands.add(brandId);
    }
    this.currentPage = 1;
    this.fetchFilteredProducts();
  }

  setQuickPrice(max: number): void {
    this.minPrice = 0;
    this.maxPrice = max;
    this.currentPage = 1;
    this.fetchFilteredProducts();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.fetchFilteredProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchFilteredProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.addingToCartId = product._id;
    this.cartService.addToCart(product._id).subscribe({
      next: () => (this.addingToCartId = null),
      error: () => (this.addingToCartId = null),
    });
  }

  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(product._id).subscribe();
  }
}
