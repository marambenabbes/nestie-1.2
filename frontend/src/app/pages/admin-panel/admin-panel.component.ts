import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <h1 class="text-2xl font-poppins font-bold text-gray-800">Admin Panel ⚙️</h1>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <mat-card class="!rounded-cute !shadow-card p-6 text-center">
          <mat-icon class="!text-4xl text-mama-rose mb-2">people</mat-icon>
          <p class="text-2xl font-bold text-gray-700">156</p>
          <p class="text-sm text-gray-400">Total Users</p>
        </mat-card>
        <mat-card class="!rounded-cute !shadow-card p-6 text-center">
          <mat-icon class="!text-4xl text-mama-purple mb-2">medical_services</mat-icon>
          <p class="text-2xl font-bold text-gray-700">12</p>
          <p class="text-sm text-gray-400">Doctors</p>
        </mat-card>
        <mat-card class="!rounded-cute !shadow-card p-6 text-center">
          <mat-icon class="!text-4xl text-orange-500 mb-2">pregnant_woman</mat-icon>
          <p class="text-2xl font-bold text-gray-700">89</p>
          <p class="text-sm text-gray-400">Active Pregnancies</p>
        </mat-card>
        <mat-card class="!rounded-cute !shadow-card p-6 text-center">
          <mat-icon class="!text-4xl text-green-500 mb-2">smart_toy</mat-icon>
          <p class="text-2xl font-bold text-gray-700">1.2k</p>
          <p class="text-sm text-gray-400">AI Interactions</p>
        </mat-card>
      </div>
    </div>
  `
})
export class AdminPanelComponent {}
