import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';
import { guestGuard } from './core/auth/guards/guest-guard';

// Features
import { Account } from './features/account/account';
import { BrandDetails } from './features/brand-details/brand-details';
import { Brands } from './features/brands/brands';
import { Cart } from './features/cart/cart';
import { Categories } from './features/categories/categories';
import { Checkout } from './features/checkout/checkout';
import { ForgotPassword } from './features/forgot-password/forgot-password';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { NotFoundPage } from './features/not-found-page/not-found-page';
import { Orders } from './features/orders/orders';
import { ProductDetails } from './features/product-details/product-details';
import { Products } from './features/products/products';
import { Register } from './features/register/register';
import { Shop } from './features/shop/shop';
import { Wishlist } from './features/wishlist/wishlist';

export const routes: Routes = [
  // Public Browsing Routes
  { path: '', component: Home },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'shop', component: Shop },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetails },
  { path: 'product-details/:id', component: ProductDetails },
  { path: 'categories', component: Categories },
  { path: 'brands', component: Brands },
  { path: 'brands-details/:id', component: BrandDetails },
  { path: 'brand-details/:id', component: BrandDetails },

  // Auth Routes (Guest Only)
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'signin', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'signup', redirectTo: 'register', pathMatch: 'full' },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [guestGuard] },

  // Protected User Routes (Require Token)
  { path: 'cart', component: Cart, canActivate: [authGuard] },
  { path: 'wishlist', component: Wishlist, canActivate: [authGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: 'account', component: Account, canActivate: [authGuard] },
  { path: 'orders', component: Orders, canActivate: [authGuard] },

  // Wildcard 404
  { path: '**', component: NotFoundPage },
];
