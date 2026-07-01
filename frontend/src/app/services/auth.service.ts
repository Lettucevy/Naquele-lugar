import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  Usuario: string;
  Role: 'Admin' | 'Cozinha';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private userSignal = signal<User | null>(null);

  currentUser = this.userSignal.asReadonly();
  
  isLoggedIn = computed(() => this.userSignal() !== null);
  isAdmin = computed(() => this.userSignal()?.Role === 'Admin');
  isKitchen = computed(() => this.userSignal()?.Role === 'Cozinha' || this.userSignal()?.Role === 'Admin');

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.userSignal.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }

  login(usuario: string, senha: string): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>('/api/login', { usuario, senha })
      .pipe(
        tap(res => {
          if (res.success && res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
            this.userSignal.set(res.user);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }
}
