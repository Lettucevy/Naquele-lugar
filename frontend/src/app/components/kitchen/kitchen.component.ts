import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, Order } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './kitchen.component.html',
  styleUrl: './kitchen.component.css'
})
export class KitchenComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  orders = signal<Order[]>([]);
  private pollInterval: any;

  pendingOrders = computed(() => {
    return this.orders().filter(o => o.Status === 'Pendente' || o.Status === 'Em Preparo');
  });

  finishedOrders = computed(() => {
    return this.orders().filter(o => o.Status === 'Concluído').slice(0, 10);
  });

  ngOnInit() {
    this.fetchOrders();
    this.pollInterval = setInterval(() => this.fetchOrders(), 3000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  fetchOrders() {
    this.apiService.getAdminOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: (err) => {
        console.error('Erro ao buscar pedidos na cozinha:', err);
      }
    });
  }

  setStatus(id: number, status: 'Pendente' | 'Em Preparo' | 'Concluído') {
    this.apiService.updateOrderStatus(id, status).subscribe({
      next: () => {
        this.fetchOrders();
      },
      error: (err) => {
        console.error('Erro ao atualizar status do pedido:', err);
      }
    });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('pt-BR');
  }

  getOrderClass(status: string): string {
    return `order-card status-${status.toLowerCase().replace(/ /g, '-')}`;
  }
}
