import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    RouterOutlet,
    MenubarModule, 
    ButtonModule, 
    AvatarModule
  ],
  template: `
    <div class="layout-wrapper">
      <p-menubar [model]="items" styleClass="layout-menubar">
        <ng-template pTemplate="start">
          <span class="text-xl font-bold text-primary">Gestor de Tareas</span>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="flex align-items-center gap-2">
            <p-avatar icon="pi pi-user" styleClass="mr-2"></p-avatar>
            <p-button 
              icon="pi pi-sign-out" 
              [text]="true" 
              severity="secondary"
              (onClick)="logout()" 
              pTooltip="Cerrar sesión">
            </p-button>
          </div>
        </ng-template>
      </p-menubar>
      
      <main class="layout-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .layout-main {
      flex: 1;
      padding: 1rem;
      background-color: var(--surface-ground);
    }
    
    :host ::ng-deep .layout-menubar {
      border-radius: 0;
      border-top: none;
      border-left: none;
      border-right: none;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  items: MenuItem[] = [
    {
      label: 'Tareas',
      icon: 'pi pi-list',
      routerLink: '/tasks/list'
    },
    {
      label: 'Nueva Tarea',
      icon: 'pi pi-plus',
      routerLink: '/tasks/create'
    },
    {
      label: 'Dashboard de Logs',
      icon: 'pi pi-chart-bar',
      routerLink: '/dash-logs'
    }
  ];

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
