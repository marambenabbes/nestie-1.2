import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { ChatbotComponent } from '../../shared/chatbot/chatbot.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    ChatbotComponent
  ],
  template: `
    <div class="flex h-screen font-poppins">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-card flex flex-col border-r border-mama-pink-light">
        <!-- Logo -->
        <div class="p-6 text-center border-b border-mama-pink-light">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-mama-pink to-mama-lavender mb-2">
            <mat-icon class="text-white">favorite</mat-icon>
          </div>
          <h1 class="text-xl font-bold text-mama-rose">Nestie AI</h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
          <a *ngFor="let item of navItems" [routerLink]="item.route" routerLinkActive="bg-mama-pink-light text-mama-rose"
             class="flex items-center px-6 py-3 text-gray-600 hover:bg-mama-pink-light hover:text-mama-rose transition-all duration-200 mx-2 rounded-xl mb-1">
            <mat-icon class="mr-3 !text-xl">{{ item.icon }}</mat-icon>
            <span class="text-sm font-medium">{{ item.label }}</span>
          </a>

          <!-- Doctor nav items -->
          <div *ngIf="authService.hasRole(['DOCTOR', 'ADMIN'])" class="mt-4 pt-4 border-t border-mama-lavender-light mx-4">
            <p class="px-2 text-xs font-semibold text-mama-lavender-dark uppercase tracking-wider mb-2">Doctor</p>
            <a routerLink="doctor" routerLinkActive="bg-mama-lavender-light text-mama-purple"
               class="flex items-center px-6 py-3 text-gray-600 hover:bg-mama-lavender-light hover:text-mama-purple transition-all duration-200 mx-2 rounded-xl">
              <mat-icon class="mr-3">medical_services</mat-icon>
              <span class="text-sm font-medium">Doctor Panel</span>
            </a>
          </div>

          <!-- Admin nav items -->
          <div *ngIf="authService.hasRole(['ADMIN'])" class="mt-2">
            <p class="px-6 text-xs font-semibold text-mama-peach-dark uppercase tracking-wider mb-2">Admin</p>
            <a routerLink="admin" routerLinkActive="bg-mama-peach-light text-orange-600"
               class="flex items-center px-6 py-3 text-gray-600 hover:bg-mama-peach-light hover:text-orange-600 transition-all duration-200 mx-2 rounded-xl">
              <mat-icon class="mr-3">admin_panel_settings</mat-icon>
              <span class="text-sm font-medium">Admin Panel</span>
            </a>
          </div>
        </nav>

        <!-- User info -->
        <div class="p-4 border-t border-mama-pink-light">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-mama-pink to-mama-lavender flex items-center justify-center">
              <span class="text-white font-semibold text-sm">{{ userInitials }}</span>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-semibold text-gray-700">{{ authService.user()?.fullName }}</p>
              <p class="text-xs text-gray-400">{{ authService.user()?.role }}</p>
            </div>
            <button mat-icon-button (click)="authService.logout()" matTooltip="Logout">
              <mat-icon class="text-gray-400">logout</mat-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-gradient-to-br from-mama-cream to-mama-pink-light p-6">
        <router-outlet></router-outlet>
      </main>

      <!-- AI Chatbot -->
      <app-chatbot></app-chatbot>
    </div>
  `
})
export class LayoutComponent {
  private allNavItems = [
    { route: '/dashboard', icon: 'dashboard', label: 'Dashboard', hideForRoles: ['DOCTOR'] },
    { route: 'pregnancy', icon: 'pregnant_woman', label: 'Pregnancy Profile', hideForRoles: ['DOCTOR'] },
    { route: 'appointments', icon: 'calendar_today', label: 'Appointments', hideForRoles: ['DOCTOR'] },
    { route: 'symptoms', icon: 'monitor_heart', label: 'Symptoms', hideForRoles: ['DOCTOR'] },
    { route: 'nutrition', icon: 'restaurant', label: 'Nutrition', hideForRoles: ['DOCTOR'] },
    { route: 'medications', icon: 'medication', label: 'Medications', hideForRoles: ['DOCTOR'] },
    { route: 'growth', icon: 'child_friendly', label: 'Baby Growth', hideForRoles: ['DOCTOR'] },
    { route: 'baby-preview', icon: 'auto_awesome', label: 'Baby Preview', hideForRoles: ['DOCTOR'] },
  ];

  get navItems() {
    const role = this.authService.user()?.role;
    return this.allNavItems.filter(item => !item.hideForRoles || !item.hideForRoles.includes(role!));
  }

  constructor(public authService: AuthService) {}

  get userInitials(): string {
    const name = this.authService.user()?.fullName || '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
