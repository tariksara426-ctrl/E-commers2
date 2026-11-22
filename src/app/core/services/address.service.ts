import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddressItem, AddressResponse } from '../models/ecommerce.models';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/addresses`;

  getAddresses(): Observable<AddressResponse> {
    return this.http.get<AddressResponse>(this.baseUrl);
  }

  getAddressById(id: string): Observable<{ status: string; data: AddressItem }> {
    return this.http.get<{ status: string; data: AddressItem }>(`${this.baseUrl}/${id}`);
  }

  addAddress(address: { name: string; details: string; phone: string; city: string }): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(this.baseUrl, address);
  }

  removeAddress(id: string): Observable<AddressResponse> {
    return this.http.delete<AddressResponse>(`${this.baseUrl}/${id}`);
  }
}
