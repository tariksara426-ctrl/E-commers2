import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartResponse } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/cart`;

  readonly cartCount = signal<number>(0);

  constructor() {
    this.refreshCartCount();
  }

  refreshCartCount(): void {
    const token = localStorage.getItem('userToken');
    if (!token) {
      this.cartCount.set(0);
      return;
    }
    this.getLoggedUserCart().subscribe({
      next: (res) => {
        this.cartCount.set(res?.numOfCartItems || 0);
      },
      error: () => {
        this.cartCount.set(0);
      },
    });
  }

  addToCart(productId: string): Observable<CartResponse> {
    return this.http.post<CartResponse>(this.baseUrl, { productId }).pipe(
      tap((res) => {
        if (res?.numOfCartItems !== undefined) {
          this.cartCount.set(res.numOfCartItems);
        }
      })
    );
  }

  getLoggedUserCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.baseUrl).pipe(
      tap((res) => {
        if (res?.numOfCartItems !== undefined) {
          this.cartCount.set(res.numOfCartItems);
        }
      })
    );
  }

  updateItemQuantity(productId: string, count: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.baseUrl}/${productId}`, { count }).pipe(
      tap((res) => {
        if (res?.numOfCartItems !== undefined) {
          this.cartCount.set(res.numOfCartItems);
        }
      })
    );
  }

  removeCartItem(productId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.baseUrl}/${productId}`).pipe(
      tap((res) => {
        if (res?.numOfCartItems !== undefined) {
          this.cartCount.set(res.numOfCartItems);
        }
      })
    );
  }

  clearUserCart(): Observable<any> {
    return this.http.delete(this.baseUrl).pipe(
      tap(() => {
        this.cartCount.set(0);
      })
    );
  }
}
