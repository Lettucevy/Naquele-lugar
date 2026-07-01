import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Product } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  private apiService = inject(ApiService);
  cartService = inject(CartService);
  private router = inject(Router);

  menuItems = signal<Product[]>([]);
  selectedCategory = signal<string>('Todos');
  cartOpen = signal<boolean>(false);
  checkoutOpen = signal<boolean>(false);

  // Form Fields
  clientName = signal<string>('');
  clientPhone = signal<string>('');

  // Dynamically compute categories from menu items
  categories = computed(() => {
    const items = this.menuItems();
    const cats = new Set(items.map(item => item.Categoria).filter(Boolean) as string[]);
    return ['Todos', ...Array.from(cats)];
  });

  // Filter menu items dynamically
  filteredItems = computed(() => {
    const items = this.menuItems();
    const cat = this.selectedCategory();
    if (cat === 'Todos') {
      return items;
    }
    return items.filter(item => item.Categoria === cat);
  });

  ngOnInit() {
    this.fetchMenu();
  }

  fetchMenu() {
    this.apiService.getMenu().subscribe({
      next: (items) => {
        this.menuItems.set(items);
      },
      error: (err) => {
        console.error('Erro ao carregar cardápio:', err);
        // Fallback items if server is offline during load
        this.menuItems.set([
          { ID: 1, CategoriaID: 1, Nome: 'Cerveja Asahi', Descricao: 'Cerveja japonesa premium 350ml.', Preco: 18.00, ImagemURL: '/img/asahi.jpg', Disponivel: true, Categoria: 'Bebidas' },
          { ID: 2, CategoriaID: 8, Nome: 'Yakitori de Frango', Descricao: 'Espetinho de frango grelhado.', Preco: 15.00, ImagemURL: '/img/yakitori.jpg', Disponivel: true, Categoria: 'Yakitori' },
          { ID: 3, CategoriaID: 2, Nome: 'Sashimi de Salmão', Descricao: '5 fatias de salmão fresco.', Preco: 25.00, ImagemURL: '/img/sushi-combo.jpg', Disponivel: true, Categoria: 'Sushi' }
        ]);
      }
    });
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  toggleCart(open: boolean) {
    this.cartOpen.set(open);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.toggleCart(true);
  }

  openCheckout() {
    if (this.cartService.count() === 0) {
      Swal.fire({
        title: 'Ops!',
        text: 'Seu carrinho está vazio!',
        icon: 'warning',
        background: '#1a1a1a',
        color: '#fff'
      });
      return;
    }
    this.checkoutOpen.set(true);
  }

  closeCheckout() {
    this.checkoutOpen.set(false);
  }

  submitOrder() {
    const orderData = {
      cliente: this.clientName(),
      telefone: this.clientPhone(),
      itens: this.cartService.items(),
      total: this.cartService.total()
    };

    this.apiService.createOrder(orderData).subscribe({
      next: (res) => {
        if (res.success) {
          this.clientName.set('');
          this.clientPhone.set('');
          this.cartService.clearCart();
          this.closeCheckout();
          this.toggleCart(false);

          Swal.fire({
            title: 'Pedido Realizado! 🍱',
            text: `Seu pedido #${res.pedidoId} foi recebido com sucesso.`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Rastrear Pedido',
            cancelButtonText: 'Fechar',
            confirmButtonColor: '#3b82f6',
            background: '#1e293b',
            color: '#fff'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/tracking'], { queryParams: { id: res.pedidoId } });
            }
          });
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Erro!',
          text: 'Não conseguimos enviar seu pedido. Tente novamente.',
          icon: 'error',
          background: '#1e293b',
          color: '#fff'
        });
      }
    });
  }
}
