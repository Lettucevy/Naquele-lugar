import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  ID: number;
  CategoriaID: number;
  Nome: string;
  Descricao: string;
  Preco: number;
  ImagemURL: string;
  Disponivel: boolean;
  Categoria?: string;
  CategoriaNome?: string;
}

export interface Category {
  ID: number;
  Nome: string;
  Ativa: boolean;
}

export interface OrderItem {
  id?: number;
  Quantidade: number;
  Nome: string;
  PrecoUnitario: number;
}

export interface Order {
  ID: number;
  DataPedido: string;
  NomeCliente: string;
  TelefoneCliente: string;
  Total: number;
  Status: 'Pendente' | 'Em Preparo' | 'Concluído';
  Itens: OrderItem[];
}

export interface Stats {
  totalVendas: number;
  qtdPedidos: number;
  topItens: { Nome: string; Qtd: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // --- CLIENT MENU & ORDERING ---
  getMenu(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/menu');
  }

  createOrder(order: { cliente: string; telefone: string; itens: any[]; total: number }): Observable<{ success: boolean; pedidoId: number }> {
    return this.http.post<{ success: boolean; pedidoId: number }>('/api/pedidos', order);
  }

  // --- TRACKING ---
  trackOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`/api/tracking/${id}`);
  }

  trackOrderByPhone(phone: string): Observable<Order[]> {
    return this.http.get<Order[]>(`/api/tracking/phone/${phone}`);
  }

  // --- ADMIN & KITCHEN ORDERS ---
  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/admin/pedidos');
  }

  updateOrderStatus(id: number, status: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`/api/admin/pedidos/${id}`, { status });
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>('/api/admin/stats');
  }

  // --- ADMIN CATEGORIES MANAGEMENT ---
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/admin/categorias');
  }

  createCategory(nome: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/admin/categorias', { nome });
  }

  deleteCategory(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`/api/admin/categorias/${id}`);
  }

  updateCategory(id: number, data: { nome?: string; ativa?: boolean }): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`/api/admin/categorias/${id}`, data);
  }

  // --- ADMIN PRODUCTS MANAGEMENT ---
  getAdminProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/admin/produtos');
  }

  createProduct(product: { categoriaId: number; nome: string; descricao: string; preco: number; imagemUrl: string }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/admin/produtos', product);
  }

  updateProduct(id: number, productFields: Record<string, any>): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`/api/admin/produtos/${id}`, productFields);
  }

  // --- IMAGE UPLOAD ---
  uploadImage(formData: FormData): Observable<{ url: string }> {
    return this.http.post<{ url: string }>('/api/admin/upload', formData);
  }
}
