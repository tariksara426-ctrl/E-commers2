import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../core/services/cart.service'; // تأكدي من مسار الـ CartService الصحيح حسب مشروعك

@Component({
  selector: 'app-brand-details',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './brand-details.html',
  styleUrl: './brand-details.css',
})
export class BrandDetails implements OnInit {
  // استخدام أسلوب الـ inject الحديث المتوافق مع السيرفس لديكِ
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _http = inject(HttpClient);
  private readonly _cartService = inject(CartService);

  brandId: string | null = null;
  brandDetails: any = null;
  brandProducts: any[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe({
      next: (params) => {
        this.brandId = params.get('id');
        if (this.brandId) {
          this.getBrandDetails(this.brandId);
          this.getProductsByBrand(this.brandId);
        }
      }
    });
  }

  // جلب بيانات البراند
  getBrandDetails(id: string) {
    this._http.get(`https://ecommerce.routemisr.com/api/v1/brands/${id}`).subscribe({
      next: (response: any) => {
        this.brandDetails = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching brand details:', err);
        this.isLoading = false;
      }
    });
  }

  // جلب منتجات البراند
  getProductsByBrand(id: string) {
    this._http.get(`https://ecommerce.routemisr.com/api/v1/products?brand=${id}`).subscribe({
      next: (response: any) => {
        this.brandProducts = response.data;
      },
      error: (err) => {
        console.error('Error fetching brand products:', err);
      }
    });
  }

  // دالة الإضافة إلى السلة (تستخدم addToCart الموجودة في الـ CartService)
  addToCart(productId: string) {
    this._cartService.addToCart(productId).subscribe({
      next: (response) => {
        console.log('Product added successfully to cart', response);
        // يمكنك إضافة Toastr هنا لو أردتِ إظهار رسالة نجاح
      },
      error: (err) => {
        console.error('Error adding product to cart', err);
      }
    });
  }
}