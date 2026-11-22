import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WishlistResponse } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/wishlist`;

  readonly wishlistCount = signal<number>(0);
  readonly wishlistIds = signal<Set<string>>(new Set());

  constructor() {
    this.refreshWishlist();
  }

  refreshWishlist(): void {
    const token = localStorage.getItem('userToken');
    if (!token) {
      this.wishlistCount.set(0);
      this.wishlistIds.set(new Set());
      return;
    }
    this.getLoggedUserWishlist().subscribe({
      next: (res) => {
        const ids = new Set<string>((res.data || []).map((item) => item._id));
        this.wishlistIds.set(ids);
        this.wishlistCount.set(res.count || ids.size);
      },
      error: () => {
        this.wishlistCount.set(0);
        this.wishlistIds.set(new Set());
      },
    });
  }

  getLoggedUserWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(this.baseUrl);
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post<any>(this.baseUrl, { productId }).pipe(
      tap((res) => {
        const ids = new Set(this.wishlistIds());
        ids.add(productId);
        this.wishlistIds.set(ids);
        this.wishlistCount.set(res.data?.length || ids.size);
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${productId}`).pipe(
      tap((res) => {
        const ids = new Set(this.wishlistIds());
        ids.delete(productId);
        this.wishlistIds.set(ids);
        this.wishlistCount.set(res.data?.length || ids.size);
      })
    );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistIds().has(productId);
  }

  toggleWishlist(productId: string): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }
}
