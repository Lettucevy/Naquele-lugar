import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Order } from '../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css'
})
export class TrackingComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  searchInput = signal<string>('');
  orders = signal<Order[]>([]);
  loading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  ngOnInit() {
    const orderId = this.route.snapshot.queryParamMap.get('id');
    if (orderId) {
      this.searchInput.set(orderId);
      this.searchOrders();
    }
  }

  searchOrders() {
    const input = this.searchInput().trim();
    if (!input) {
      Swal.fire({
        title: 'Ops!',
        text: 'Por favor, digite o número do pedido ou telefone.',
        icon: 'warning',
        background: '#1a1a1a',
        color: '#fff'
      });
      return;
    }

    this.loading.set(true);
    this.hasSearched.set(true);
    this.orders.set([]);

    if (input.length < 5 && /^\d+$/.test(input)) {
      this.apiService.trackOrderById(Number(input)).subscribe({
        next: (data: Order) => {
          this.loading.set(false);
          this.orders.set(data && data.ID ? [data] : []);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.orders.set([]);
          console.error('Erro ao buscar pedido por ID:', err);
        }
      });
    } else {
      const phone = input.replace(/\D/g, '');
      this.apiService.trackOrderByPhone(phone).subscribe({
        next: (data: Order[]) => {
          this.loading.set(false);
          this.orders.set(data || []);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.orders.set([]);
          console.error('Erro ao buscar pedidos por telefone:', err);
        }
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR');
  }

  getStatusClass(status: string): string {
    const normalized = (status || '').toLowerCase().replace(/ /g, '-');
    return `status-${normalized}`;
  }
}
