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
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-mama-lavender-light via-mama-cream to-mama-peach-light">
      <div class="animate-fade-in w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-mama-lavender to-mama-peach shadow-soft mb-4">
            <mat-icon class="text-white !text-4xl !w-9 !h-9">child_care</mat-icon>
          </div>
          <h1 class="text-3xl font-poppins font-bold text-mama-purple">Join Nestie</h1>
          <p class="text-gray-500 font-poppins mt-1">Start your pregnancy journey</p>
        </div>

        <mat-card class="!rounded-cute !shadow-card p-8">
          <h2 class="text-xl font-poppins font-semibold text-center mb-6 text-gray-700">Create Account 🌸</h2>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Full Name</mat-label>
              <mat-icon matPrefix class="text-mama-peach mr-2">person</mat-icon>
              <input matInput formControlName="fullName" placeholder="Your full name">
              <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix class="text-mama-pink mr-2">email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="your@email.com">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Phone</mat-label>
              <mat-icon matPrefix class="text-mama-lavender mr-2">phone</mat-icon>
              <input matInput formControlName="phone" placeholder="+1234567890">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix class="text-mama-lavender mr-2">lock</mat-icon>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Minimum 6 characters</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading"
                    class="w-full !rounded-full !py-3 !text-lg font-poppins !bg-gradient-to-r !from-mama-lavender-dark !to-mama-peach-dark">
              {{ loading ? 'Creating...' : 'Create Account 🎀' }}
            </button>
          </form>

          <div class="text-center mt-6">
            <p class="text-gray-500 font-poppins text-sm">
              Already have an account?
              <a routerLink="/login" class="text-mama-purple font-semibold hover:underline">Sign In</a>
            </p>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const { fullName, email, password, phone } = this.registerForm.value;

    this.authService.register(fullName, email, password, phone).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        const msg = err.status === 0
          ? 'Cannot connect to server. Make sure the backend is running on port 8081.'
          : err.error?.message || 'Registration failed';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }
}
