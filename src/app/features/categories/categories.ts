import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Category, SubCategory } from '../../core/models/ecommerce.models';
import { ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);

  categories: Category[] = [];
  isLoading = true;

  // Selected Category Subcategories Modal/Drawer
  selectedCategory: Category | null = null;
  subcategories: SubCategory[] = [];
  isLoadingSub = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  openSubcategories(category: Category, event: Event): void {
    event.stopPropagation();
    this.selectedCategory = category;
    this.isLoadingSub = true;
    this.subcategories = [];

    this.productsService.getSubcategoriesOnCategory(category._id).subscribe({
      next: (res) => {
        this.subcategories = res.data || [];
        this.isLoadingSub = false;
      },
      error: () => {
        this.isLoadingSub = false;
      },
    });
  }

  closeModal(): void {
    this.selectedCategory = null;
    this.subcategories = [];
  }

  goToShopWithCategory(catId: string): void {
    void this.router.navigate(['/shop'], { queryParams: { category: catId } });
  }
}
