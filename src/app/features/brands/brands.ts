import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BrandsService } from '../../core/auth/services/brands-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brands',
  imports: [CommonModule,RouterLink],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class Brands implements OnInit{

 brandsList: any[] = [];
   isLoading: boolean = true;

   constructor(private _brandsService: BrandsService) {}

   ngOnInit(): void {
     this.getBrands();
   }

  getBrands() {
    this._brandsService.getAllBrands().subscribe({
      next: (response) => {
        this.brandsList = response.data; // الـ API بيرجع الداتا جوه مفتاح اسمه data
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching brands:', err);
        this.isLoading = false;
      }
    });
  }


}


