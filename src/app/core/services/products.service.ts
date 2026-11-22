import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Brand, Category, Product, SubCategory } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getProducts(filterParams: Record<string, any> = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();
    Object.keys(filterParams).forEach((key) => {
      const val = filterParams[key];
      if (val !== null && val !== undefined && val !== '') {
        params = params.set(key, val.toString());
      }
    });

    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/api/v1/products`, { params });
  }

  getProductById(id: string): Observable<{ data: Product }> {
    return this.http.get<{ data: Product }>(`${this.baseUrl}/api/v1/products/${id}`);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/api/v1/categories`);
  }

  getCategoryById(id: string): Observable<{ data: Category }> {
    return this.http.get<{ data: Category }>(`${this.baseUrl}/api/v1/categories/${id}`);
  }

  getSubcategoriesOnCategory(categoryId: string): Observable<ApiResponse<SubCategory[]>> {
    return this.http.get<ApiResponse<SubCategory[]>>(
      `${this.baseUrl}/api/v1/categories/${categoryId}/subcategories`
    );
  }

  getAllBrands(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>(`${this.baseUrl}/api/v1/brands`);
  }

  getBrandById(id: string): Observable<{ data: Brand }> {
    return this.http.get<{ data: Brand }>(`${this.baseUrl}/api/v1/brands/${id}`);
  }
}
