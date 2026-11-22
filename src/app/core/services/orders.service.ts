import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, ShippingAddress } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/orders`;

  createCashOrder(cartId: string, shippingAddress: ShippingAddress): Observable<any> {
    return this.http.post(`${this.baseUrl}/${cartId}`, { shippingAddress });
  }

  checkoutSession(cartId: string, shippingAddress: ShippingAddress, returnUrl: string = window.location.origin): Observable<{ status: string; session: { url: string } }> {
    return this.http.post<{ status: string; session: { url: string } }>(
      `${this.baseUrl}/checkout-session/${cartId}?url=${returnUrl}`,
      { shippingAddress }
    );
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/user/${userId}`);
  }

  getAllOrders(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}
