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
    <div class="auth-page">
      <!-- Decorative circles -->
      <div class="deco-circle" style="width:280px;height:280px;background:var(--mama-lavender);top:-60px;left:-50px;"></div>
      <div class="deco-circle" style="width:180px;height:180px;background:var(--mama-pink);bottom:-40px;right:-30px;animation-delay:2s;"></div>
      <div class="deco-circle" style="width:100px;height:100px;background:var(--mama-peach);top:30%;right:8%;animation-delay:4s;"></div>

      <div class="animate-fade-in w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="auth-logo-ring">
            <div class="auth-logo">
              <mat-icon class="text-white !text-4xl !w-9 !h-9">child_care</mat-icon>
            </div>
          </div>
          <h1 class="auth-brand">Join Nestie</h1>
          <p class="auth-tagline">Start your pregnancy journey</p>
        </div>

        <div class="auth-card">
          <h2 class="auth-title">Create Account 🌸</h2>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Full Name</mat-label>
              <mat-icon matPrefix class="mr-2" style="color:var(--mama-peach)">person</mat-icon>
              <input matInput formControlName="fullName" placeholder="Your full name">
              <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix class="mr-2" style="color:var(--mama-pink-dark)">email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="your@email.com">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Phone</mat-label>
              <mat-icon matPrefix class="mr-2" style="color:var(--mama-lavender-dark)">phone</mat-icon>
              <input matInput formControlName="phone" placeholder="+1234567890">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix class="mr-2" style="color:var(--mama-lavender-dark)">lock</mat-icon>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Minimum 6 characters</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading"
                    class="auth-btn">
              {{ loading ? 'Creating...' : 'Create Account 🎀' }}
            </button>
          </form>

          <div class="text-center mt-6">
            <p class="auth-switch">
              Already have an account?
              <a routerLink="/login" class="auth-link">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: linear-gradient(145deg, var(--mama-lavender-light) 0%, var(--mama-cream) 40%, var(--mama-blush) 100%);
      position: relative;
      overflow: hidden;
    }
    .auth-logo-ring {
      display: inline-block;
      padding: 4px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--mama-lavender-dark), var(--mama-purple));
      margin-bottom: 1rem;
      box-shadow: 0 12px 40px rgba(168, 91, 143, 0.25);
    }
    .auth-logo {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--mama-lavender-dark), var(--mama-purple));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-brand {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--mama-berry);
      letter-spacing: -0.03em;
    }
    .auth-tagline {
      color: var(--mama-lavender-dark);
      font-size: 0.9rem;
      font-weight: 500;
      margin-top: 0.25rem;
    }
    .auth-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 28px;
      padding: 2.5rem;
      box-shadow: 0 16px 48px rgba(200, 141, 184, 0.15);
    }
    .auth-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 1.75rem;
      color: var(--mama-berry);
    }
    .auth-btn {
      width: 100%;
      border-radius: 999px !important;
      padding: 0.8rem !important;
      font-size: 1rem !important;
      font-family: 'Poppins', sans-serif !important;
      font-weight: 600 !important;
      background: linear-gradient(135deg, var(--mama-lavender-dark), var(--mama-purple)) !important;
      color: white !important;
      border: none !important;
      box-shadow: 0 8px 24px rgba(168, 91, 143, 0.3) !important;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    .auth-btn:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 12px 32px rgba(168, 91, 143, 0.4) !important;
    }
    .auth-switch {
      color: var(--mama-lavender-dark);
      font-size: 0.85rem;
    }
    .auth-link {
      color: var(--mama-purple);
      font-weight: 700;
      text-decoration: none;
      transition: color 0.2s;
    }
    .auth-link:hover {
      color: var(--mama-rose-deep);
      text-decoration: underline;
    }
  `]
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
