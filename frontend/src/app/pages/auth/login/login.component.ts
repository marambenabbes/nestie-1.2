import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-mama-pink-light via-mama-cream to-mama-lavender-light">
      <div class="animate-fade-in w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-mama-pink to-mama-lavender shadow-soft mb-4">
            <mat-icon class="text-white !text-4xl !w-9 !h-9">favorite</mat-icon>
          </div>
          <h1 class="text-3xl font-poppins font-bold text-mama-rose">Nestie AI</h1>
          <p class="text-gray-500 font-poppins mt-1">Your smart pregnancy companion</p>
        </div>

        <!-- Login Card -->
        <mat-card class="!rounded-cute !shadow-card p-8">
          <h2 class="text-xl font-poppins font-semibold text-center mb-6 text-gray-700">Welcome Back 💕</h2>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix class="text-mama-pink mr-2">email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="your@email.com">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix class="text-mama-lavender mr-2">lock</mat-icon>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || loading"
                    class="w-full !rounded-full !py-3 !text-lg font-poppins !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark">
              {{ loading ? 'Signing in...' : 'Sign In ✨' }}
            </button>
          </form>

          <div class="text-center mt-6">
            <p class="text-gray-500 font-poppins text-sm">
              Don't have an account?
              <a routerLink="/register" class="text-mama-rose font-semibold hover:underline">Sign Up</a>
            </p>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        const role = res.user?.role;
        if (role === 'DOCTOR') {
          this.router.navigate(['/dashboard/doctor']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/dashboard/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = err.status === 0
          ? 'Cannot connect to server. Make sure the backend is running on port 8081.'
          : err.error?.message || 'Invalid email or password';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }
}
