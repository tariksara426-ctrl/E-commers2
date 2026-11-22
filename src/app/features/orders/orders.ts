import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models/ecommerce.models';
import { AuthService } from '../../core/services/auth.service';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly authService = inject(AuthService);

  orders: Order[] = [];
  isLoading = true;
  expandedOrderIds = new Set<string>();

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const user = this.authService.currentUser();
    const userId = user?.id || user?._id || '';

    if (userId) {
      this.ordersService.getUserOrders(userId).subscribe({
        next: (res) => {
          this.orders = res || [];
          if (this.orders.length > 0) {
            this.expandedOrderIds.add(this.orders[0]._id);
          }
          this.isLoading = false;
        },
        error: () => {
          this.orders = [];
          this.isLoading = false;
        },
      });
    } else {
      this.ordersService.getAllOrders().subscribe({
        next: (res) => {
          this.orders = res.data || [];
          if (this.orders.length > 0) {
            this.expandedOrderIds.add(this.orders[0]._id);
          }
          this.isLoading = false;
        },
        error: () => {
          this.orders = [];
          this.isLoading = false;
        },
      });
    }
  }

  toggleOrder(orderId: string): void {
    if (this.expandedOrderIds.has(orderId)) {
      this.expandedOrderIds.delete(orderId);
    } else {
      this.expandedOrderIds.add(orderId);
    }
  }

  isExpanded(orderId: string): boolean {
    return this.expandedOrderIds.has(orderId);
  }
}
