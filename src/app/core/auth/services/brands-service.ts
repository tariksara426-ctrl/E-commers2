import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {
  private apiUrl = 'https://ecommerce.routemisr.com/api/v1/brands'; // رابط الـ API للـ Brands

  constructor(private http: HttpClient) {}

  getAllBrands(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}