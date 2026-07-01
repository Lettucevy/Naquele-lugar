import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  // Computed signals for reactive UI updates
  items = this.cartItems.asReadonly();

  total = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  });

  count = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantidade, 0);
  });

  addToCart(product: { ID: number; Nome: string; Preco: number }) {
    this.cartItems.update(current => {
      const existing = current.find(item => item.id === product.ID);
      if (existing) {
        return current.map(item => 
          item.id === product.ID 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...current, { id: product.ID, nome: product.Nome, preco: product.Preco, quantidade: 1 }];
      }
    });
  }

  removeFromCart(id: number) {
    this.cartItems.update(current => current.filter(item => item.id !== id));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
