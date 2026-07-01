import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Order, Product, Category, Stats } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  activeTab = signal<string>('orders');
  orders = signal<Order[]>([]);
  stats = signal<Stats | null>(null);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  private pollInterval: any;

  // Category Modal State
  categoryModalOpen = signal<boolean>(false);
  categoryModalTitle = signal<string>('Nova Categoria');
  catId = signal<number | null>(null);
  catNome = signal<string>('');

  // Product Modal State
  productModalOpen = signal<boolean>(false);
  productModalTitle = signal<string>('Novo Produto');
  prodId = signal<number | null>(null);
  prodCat = signal<number>(0);
  prodNome = signal<string>('');
  prodDesc = signal<string>('');
  prodPreco = signal<number>(0);
  prodImg = signal<string>('');
  uploading = signal<boolean>(false);

  ngOnInit() {
    this.loadActiveTabData();
    // Poll orders and stats every 3 seconds
    this.pollInterval = setInterval(() => {
      if (this.activeTab() === 'orders') {
        this.fetchOrders();
        this.fetchStats();
      }
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.loadActiveTabData();
  }

  loadActiveTabData() {
    const tab = this.activeTab();
    if (tab === 'orders') {
      this.fetchOrders();
      this.fetchStats();
    } else if (tab === 'products') {
      this.fetchProducts();
    } else if (tab === 'categories') {
      this.fetchCategories();
    }
  }

  // --- GETTERS ---
  fetchOrders() {
    this.apiService.getAdminOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: (err) => console.error('Erro ao buscar pedidos:', err)
    });
  }

  fetchStats() {
    this.apiService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Erro ao buscar estatísticas:', err)
    });
  }

  fetchProducts() {
    this.apiService.getAdminProducts().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Erro ao buscar produtos:', err)
    });
  }

  fetchCategories() {
    this.apiService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Erro ao buscar categorias:', err)
    });
  }

  // --- ORDER MANAGEMENT ---
  updateOrderStatus(id: number, status: string) {
    this.apiService.updateOrderStatus(id, status).subscribe({
      next: () => this.fetchOrders(),
      error: (err) => console.error('Erro ao atualizar status:', err)
    });
  }

  // --- TOGGLES ---
  toggleProduct(id: number, currentAvailable: boolean) {
    this.apiService.updateProduct(id, { Disponivel: !currentAvailable }).subscribe({
      next: () => this.fetchProducts(),
      error: (err) => console.error('Erro ao alternar status do produto:', err)
    });
  }

  toggleCategory(id: number, currentActive: boolean) {
    this.apiService.updateCategory(id, { ativa: !currentActive }).subscribe({
      next: () => this.fetchCategories(),
      error: (err) => console.error('Erro ao alternar status da categoria:', err)
    });
  }

  // --- CATEGORY MODAL ACTIONS ---
  openCategoryModal(cat?: Category) {
    if (cat) {
      this.categoryModalTitle.set('Editar Categoria');
      this.catId.set(cat.ID);
      this.catNome.set(cat.Nome);
    } else {
      this.categoryModalTitle.set('Nova Categoria');
      this.catId.set(null);
      this.catNome.set('');
    }
    this.categoryModalOpen.set(true);
  }

  closeCategoryModal() {
    this.categoryModalOpen.set(false);
    this.catId.set(null);
    this.catNome.set('');
  }

  submitCategory() {
    const id = this.catId();
    const nome = this.catNome().trim();
    if (!nome) return;

    const req = id
      ? this.apiService.updateCategory(id, { nome })
      : this.apiService.createCategory(nome);

    req.subscribe({
      next: () => {
        this.closeCategoryModal();
        this.fetchCategories();
        Swal.fire({
          title: 'Sucesso!',
          text: 'Categoria salva.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#fff'
        });
      },
      error: (err) => console.error('Erro ao salvar categoria:', err)
    });
  }

  // --- PRODUCT MODAL ACTIONS ---
  openProductModal(prod?: Product) {
    // Make sure we have active categories to select from
    this.apiService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        const activeCats = cats.filter(c => c.Ativa);

        if (prod) {
          this.productModalTitle.set('Editar Produto');
          this.prodId.set(prod.ID);
          this.prodCat.set(prod.CategoriaID);
          this.prodNome.set(prod.Nome);
          this.prodDesc.set(prod.Descricao || '');
          this.prodPreco.set(prod.Preco);
          this.prodImg.set(prod.ImagemURL || '');
        } else {
          this.productModalTitle.set('Novo Produto');
          this.prodId.set(null);
          this.prodCat.set(activeCats[0]?.ID || 0);
          this.prodNome.set('');
          this.prodDesc.set('');
          this.prodPreco.set(0);
          this.prodImg.set('');
        }
        this.productModalOpen.set(true);
      }
    });
  }

  closeProductModal() {
    this.productModalOpen.set(false);
    this.prodId.set(null);
    this.prodNome.set('');
    this.prodDesc.set('');
    this.prodPreco.set(0);
    this.prodImg.set('');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagem', file);

    this.uploading.set(true);
    this.apiService.uploadImage(formData).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.prodImg.set(res.url);
      },
      error: (err) => {
        this.uploading.set(false);
        console.error('Erro ao subir imagem:', err);
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível subir a imagem.',
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff'
        });
      }
    });
  }

  submitProduct() {
    const id = this.prodId();
    const data = {
      categoriaId: Number(this.prodCat()),
      nome: this.prodNome().trim(),
      descricao: this.prodDesc().trim(),
      preco: Number(this.prodPreco()),
      imagemUrl: this.prodImg()
    };

    if (!data.nome || isNaN(data.preco)) return;

    const req = id
      ? this.apiService.updateProduct(id, data)
      : this.apiService.createProduct(data);

    req.subscribe({
      next: () => {
        this.closeProductModal();
        this.fetchProducts();
        Swal.fire({
          title: 'Sucesso!',
          text: 'Produto salvo.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#fff'
        });
      },
      error: (err) => console.error('Erro ao salvar produto:', err)
    });
  }

  // --- HELPERS ---
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR');
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase().replace(/ /g, '-');
  }
}
