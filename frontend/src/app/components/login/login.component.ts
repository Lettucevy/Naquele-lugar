import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = signal('');
  senha = signal('');

  onSubmit() {
    this.authService.login(this.usuario(), this.senha()).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Bem-vindo!',
            text: `Logado como ${res.user.Role}`,
            timer: 1500,
            showConfirmButton: false,
            background: '#1a1a1a',
            color: '#fff'
          }).then(() => {
            if (res.user.Role === 'Admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/kitchen']);
            }
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: err.error?.message || 'Usuário ou senha incorretos.',
          background: '#1a1a1a',
          color: '#fff'
        });
      }
    });
  }
}
