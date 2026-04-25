import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ChatbotComponent } from '../../shared/chatbot/chatbot.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule,
    ChatbotComponent
  ],
  template: `
    <div class="flex h-screen font-poppins">
      <!-- Sidebar -->
      <aside class="sidebar-glass">
        <!-- Logo -->
        <div class="sidebar-logo">
          <div class="logo-icon">
            <mat-icon class="text-white">favorite</mat-icon>
          </div>
          <h1 class="logo-text">GlowMama</h1>
          <p class="logo-sub">pregnancy companion</p>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems" [routerLink]="item.route" routerLinkActive="nav-active"
             class="nav-item">
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label">{{ item.label }}</span>
          </a>

          <!-- Doctor nav items -->
          <div *ngIf="authService.hasRole(['DOCTOR', 'ADMIN'])" class="nav-section">
            <p class="nav-section-label">Doctor</p>
            <a routerLink="doctor" routerLinkActive="nav-active"
               class="nav-item">
              <mat-icon class="nav-icon">medical_services</mat-icon>
              <span class="nav-label">Doctor Panel</span>
            </a>
            <a routerLink="doctor/education" routerLinkActive="nav-active"
               class="nav-item">
              <mat-icon class="nav-icon">school</mat-icon>
              <span class="nav-label">Lesson Studio</span>
            </a>
          </div>

          <!-- Admin nav items -->
          <div *ngIf="authService.hasRole(['ADMIN'])" class="nav-section">
            <p class="nav-section-label">Admin</p>
            <a routerLink="admin" routerLinkActive="nav-active"
               class="nav-item">
              <mat-icon class="nav-icon">admin_panel_settings</mat-icon>
              <span class="nav-label">Admin Panel</span>
            </a>
          </div>
        </nav>

        <!-- User info -->
        <div class="sidebar-user">
          <div class="user-avatar">
            <span>{{ userInitials }}</span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ authService.user()?.fullName }}</p>
            <p class="user-role">{{ authService.user()?.role }}</p>
          </div>
          <button mat-icon-button (click)="authService.logout()" matTooltip="Logout" class="logout-btn">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- AI Chatbot -->
      <app-chatbot></app-chatbot>
    </div>
  `,
  styles: [`
    /* ─── SIDEBAR GLASS ─── */
    .sidebar-glass {
      width: 260px;
      display: flex;
      flex-direction: column;
      background: rgba(255, 250, 252, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid rgba(232, 196, 216, 0.2);
      box-shadow: 4px 0 24px rgba(200, 141, 184, 0.06);
    }

    /* ─── LOGO ─── */
    .sidebar-logo {
      padding: 1.75rem 1.5rem 1.5rem;
      text-align: center;
      border-bottom: 1px solid rgba(232, 196, 216, 0.15);
    }
    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(135deg, #D4537E, #A85B8F);
      box-shadow: 0 6px 20px rgba(212, 83, 126, 0.25);
      margin-bottom: 0.5rem;
    }
    .logo-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: #72243E;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .logo-sub {
      font-size: 0.65rem;
      color: #C98DB8;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 500;
      margin: 0.15rem 0 0;
    }

    /* ─── NAVIGATION ─── */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.7rem 1rem;
      margin-bottom: 0.2rem;
      border-radius: 14px;
      color: #8B7B8E;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 500;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      border: 1px solid transparent;
    }
    .nav-item:hover {
      background: rgba(244, 192, 209, 0.12);
      color: #993556;
      transform: translateX(4px);
    }
    .nav-item.nav-active {
      background: linear-gradient(135deg, rgba(244, 192, 209, 0.25), rgba(232, 196, 216, 0.15));
      color: #993556;
      font-weight: 600;
      border-left: 3px solid #D4537E;
      box-shadow: 0 2px 12px rgba(212, 83, 126, 0.08);
    }

    .nav-icon {
      margin-right: 0.75rem;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      opacity: 0.8;
    }
    .nav-active .nav-icon {
      opacity: 1;
      color: #D4537E;
    }

    .nav-label {
      font-family: 'Poppins', sans-serif;
    }

    .nav-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(232, 196, 216, 0.15);
    }
    .nav-section-label {
      padding: 0 0.5rem;
      font-size: 0.65rem;
      font-weight: 700;
      color: #C98DB8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }

    /* ─── USER SECTION ─── */
    .sidebar-user {
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(232, 196, 216, 0.15);
      display: flex;
      align-items: center;
    }
    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #D4537E, #A85B8F);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(212, 83, 126, 0.2);
    }
    .user-avatar span {
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .user-info {
      margin-left: 0.75rem;
      flex: 1;
      min-width: 0;
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: #4a4a4a;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role {
      font-size: 0.65rem;
      color: #C98DB8;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .logout-btn {
      color: #C98DB8 !important;
      transition: color 0.2s ease !important;
    }
    .logout-btn:hover {
      color: #993556 !important;
    }

    /* ─── MAIN CONTENT ─── */
    .main-content {
      background: linear-gradient(145deg, #FFF5F7 0%, #fce4ec 40%, #F9EEF4 100%);
      padding: 2rem;
    }
  `]
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
    { route: 'education', icon: 'school', label: 'Education', hideForRoles: ['DOCTOR'] },
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
