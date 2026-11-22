import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  searchQuery = '';
  isMobileMenuOpen = false;

  onSearch(): void {
    if (this.searchQuery.trim()) {
      void this.router.navigate(['/shop'], {
        queryParams: { keyword: this.searchQuery.trim() },
      });
    }
  }

  logout(): void {
    this.authService.logout(true);
  }
}
