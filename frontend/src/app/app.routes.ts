import { Routes } from '@angular/router';
import { adminGuard, kitchenGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent)
  },
  {
    path: 'tracking',
    loadComponent: () => import('./components/tracking/tracking.component').then(m => m.TrackingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'kitchen',
    loadComponent: () => import('./components/kitchen/kitchen.component').then(m => m.KitchenComponent),
    canActivate: [kitchenGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
