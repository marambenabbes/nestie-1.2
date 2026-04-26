import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AiService } from '../../core/services/ai.service';
import { BabyNameResponse, BabyNameSuggestion } from '../../core/models/models';

@Component({
  selector: 'app-baby-names',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="header-section">
        <div class="header-icon">
          <mat-icon>child_care</mat-icon>
        </div>
        <div>
          <h1 class="page-title">Baby Name Suggestions 👶✨</h1>
          <p class="page-subtitle">Discover the perfect name for your little one</p>
        </div>
      </div>

      <!-- Locked State (Before Week 12) -->
      <mat-card *ngIf="!isUnlocked" class="glass-card locked-card">
        <div class="locked-content">
          <div class="lock-icon">
            <mat-icon>lock</mat-icon>
          </div>
          <h3>Coming Soon!</h3>
          <p>Baby name suggestions will be available from <strong>Month 3 (Week 12)</strong> onwards.</p>
          <p class="current-week">You're currently at Week {{ currentWeek }}</p>
          <div class="weeks-remaining">
            <mat-icon>schedule</mat-icon>
            <span>{{ 12 - currentWeek }} weeks to go!</span>
          </div>
        </div>
      </mat-card>

      <!-- Unlocked State (Week 12+) -->
      <div *ngIf="isUnlocked && !nameResponse">
        <!-- Form Card -->
        <mat-card class="glass-card form-card">
          <h3 class="card-title">
            <mat-icon>edit</mat-icon>
            Tell us about yourselves
          </h3>
          
          <form [formGroup]="nameForm" (ngSubmit)="onSubmit()" class="name-form">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Mother's Name</mat-label>
                <input matInput formControlName="motherName" placeholder="e.g., Amira">
                <mat-icon matPrefix>person</mat-icon>
                <mat-error>Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Father's Name</mat-label>
                <input matInput formControlName="fatherName" placeholder="e.g., Youssef">
                <mat-icon matPrefix>person</mat-icon>
                <mat-error>Required</mat-error>
              </mat-form-field>
            </div>

            <!-- Gender Selection -->
            <div class="gender-section">
              <p class="section-label">Baby's Gender</p>
              <div class="gender-buttons">
                <button type="button" class="gender-btn" 
                        [class.active]="selectedGender === 'boy'"
                        (click)="selectGender('boy')">
                  <mat-icon>male</mat-icon>
                  <span>Boy</span>
                </button>
                <button type="button" class="gender-btn"
                        [class.active]="selectedGender === 'girl'"
                        (click)="selectGender('girl')">
                  <mat-icon>female</mat-icon>
                  <span>Girl</span>
                </button>
              </div>
            </div>

            <!-- Name Style Toggle -->
            <div class="style-section">
              <p class="section-label">Name Style Preference</p>
              <div class="style-toggle">
                <button type="button" class="style-btn"
                        [class.active]="selectedStyle === 'arabic'"
                        (click)="selectStyle('arabic')">
                  <span class="style-icon">🕌</span>
                  <span>Arabic Names</span>
                </button>
                <button type="button" class="style-btn"
                        [class.active]="selectedStyle === 'other'"
                        (click)="selectStyle('other')">
                  <span class="style-icon">🌍</span>
                  <span>International Names</span>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button mat-raised-button type="submit" class="submit-btn"
                    [disabled]="nameForm.invalid || !selectedGender || loading">
              <mat-spinner *ngIf="loading" diameter="20" class="inline-spinner"></mat-spinner>
              <mat-icon *ngIf="!loading">auto_awesome</mat-icon>
              <span>{{ loading ? 'Generating...' : 'Reveal Name Suggestions 🎉' }}</span>
            </button>
          </form>
        </mat-card>
      </div>

      <!-- Results Card -->
      <div *ngIf="nameResponse" class="results-section">
        <!-- Congratulations Banner -->
        <mat-card class="glass-card congrats-card">
          <div class="confetti">🎉</div>
          <div class="confetti">🎊</div>
          <div class="confetti">✨</div>
          <div class="confetti">💕</div>
          <h2 class="congrats-title">{{ nameResponse.congratulations }}</h2>
          <p class="congrats-subtitle">Here are our top 3 name suggestions for your baby {{ nameResponse.gender }}:</p>
        </mat-card>

        <!-- Name Suggestions -->
        <div class="suggestions-grid">
          <mat-card *ngFor="let suggestion of nameResponse.suggestions; let i = index"
                    class="glass-card suggestion-card"
                    [class.rank-1]="i === 0"
                    [class.rank-2]="i === 1"
                    [class.rank-3]="i === 2">
            <div class="rank-badge">{{ i + 1 }}</div>
            <div class="suggestion-content">
              <h3 class="name-title">{{ suggestion.name }}</h3>
              <p class="name-origin">
                <mat-icon>public</mat-icon>
                {{ suggestion.origin }}
              </p>
              <p class="name-meaning">
                <mat-icon>auto_stories</mat-icon>
                <span>{{ suggestion.meaning }}</span>
              </p>
              <div class="name-why">
                <mat-icon>favorite</mat-icon>
                <p>{{ suggestion.why }}</p>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Try Again Button -->
        <div class="actions-section">
          <button mat-raised-button class="try-again-btn" (click)="reset()">
            <mat-icon>refresh</mat-icon>
            Try Different Names
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Header */
    .header-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }
    .header-icon {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(212, 83, 126, 0.3);
    }
    .header-icon mat-icon {
      color: #fff;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .page-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      color: var(--mama-berry);
      margin: 0;
    }
    .page-subtitle {
      color: var(--mama-lavender-dark);
      font-size: 0.9rem;
      margin: 0.25rem 0 0;
    }

    /* Locked Card */
    .locked-card {
      padding: 3rem 2rem;
    }
    .locked-content {
      text-align: center;
      max-width: 400px;
      margin: 0 auto;
    }
    .lock-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .lock-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #757575;
    }
    .locked-content h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--mama-berry);
      margin: 0 0 1rem;
    }
    .locked-content p {
      color: #666;
      margin: 0.5rem 0;
    }
    .current-week {
      font-weight: 600;
      color: var(--mama-rose) !important;
      margin-top: 1rem !important;
    }
    .weeks-remaining {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.5rem 1.25rem;
      border-radius: 999px;
      background: rgba(212, 83, 126, 0.1);
      color: var(--mama-rose);
      font-weight: 600;
      font-size: 0.9rem;
    }

    /* Form Card */
    .form-card {
      padding: 2rem;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'Outfit', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--mama-berry);
      margin: 0 0 1.5rem;
    }
    .card-title mat-icon {
      color: var(--mama-rose);
    }

    .name-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    /* Gender Selection */
    .section-label {
      font-weight: 600;
      color: var(--mama-berry);
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
    }
    .gender-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .gender-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      border: 2px solid rgba(232, 196, 216, 0.3);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      color: #999;
    }
    .gender-btn mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .gender-btn.active {
      border-color: var(--mama-rose);
      background: rgba(244, 143, 177, 0.1);
      color: var(--mama-rose);
    }
    .gender-btn:hover:not(.active) {
      border-color: rgba(244, 143, 177, 0.5);
    }

    /* Style Toggle */
    .style-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .style-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 2px solid rgba(232, 196, 216, 0.3);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      color: #999;
    }
    .style-icon {
      font-size: 1.5rem;
    }
    .style-btn.active {
      border-color: var(--mama-purple);
      background: rgba(206, 147, 216, 0.1);
      color: var(--mama-purple);
    }
    .style-btn:hover:not(.active) {
      border-color: rgba(206, 147, 216, 0.5);
    }

    /* Submit Button */
    .submit-btn {
      width: 100%;
      padding: 1rem 2rem !important;
      border-radius: 999px !important;
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-purple)) !important;
      color: #fff !important;
      font-weight: 600 !important;
      font-size: 1rem !important;
      box-shadow: 0 8px 24px rgba(212, 83, 126, 0.3) !important;
      transition: all 0.3s ease !important;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 12px 32px rgba(212, 83, 126, 0.4) !important;
    }
    .inline-spinner {
      display: inline-block;
      margin-right: 0.5rem;
    }

    /* Congratulations Card */
    .congrats-card {
      position: relative;
      padding: 2.5rem 2rem;
      text-align: center;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(252, 228, 236, 0.8), rgba(243, 229, 245, 0.8));
    }
    .confetti {
      position: absolute;
      font-size: 2rem;
      animation: fall 3s linear infinite;
    }
    .confetti:nth-child(1) { left: 10%; animation-delay: 0s; }
    .confetti:nth-child(2) { left: 30%; animation-delay: 0.5s; }
    .confetti:nth-child(3) { left: 70%; animation-delay: 1s; }
    .confetti:nth-child(4) { left: 90%; animation-delay: 1.5s; }
    @keyframes fall {
      0% { top: -10%; opacity: 1; }
      100% { top: 110%; opacity: 0; }
    }
    .congrats-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--mama-berry);
      margin: 0 0 0.5rem;
    }
    .congrats-subtitle {
      color: var(--mama-lavender-dark);
      font-size: 0.95rem;
      margin: 0;
    }

    /* Suggestions Grid */
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .suggestion-card {
      position: relative;
      padding: 2rem 1.75rem;
      transition: transform 0.3s ease;
    }
    .suggestion-card:hover {
      transform: translateY(-4px);
    }
    .rank-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      color: #fff;
    }
    .rank-1 .rank-badge {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
    }
    .rank-2 .rank-badge {
      background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
    }
    .rank-3 .rank-badge {
      background: linear-gradient(135deg, #CD7F32, #B8860B);
    }
    .name-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--mama-berry);
      margin: 0 0 0.5rem;
    }
    .name-origin {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--mama-purple);
      font-weight: 600;
      font-size: 0.85rem;
      margin: 0 0 1rem;
    }
    .name-origin mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .name-meaning {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(244, 143, 177, 0.08);
      margin: 0 0 1rem;
      font-size: 0.9rem;
      color: #666;
    }
    .name-meaning mat-icon {
      color: var(--mama-rose);
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .name-why {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(206, 147, 216, 0.08);
      font-size: 0.85rem;
      color: #555;
    }
    .name-why mat-icon {
      color: var(--mama-purple);
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
    .name-why p {
      margin: 0;
    }

    /* Actions */
    .actions-section {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }
    .try-again-btn {
      padding: 0.75rem 2rem !important;
      border-radius: 999px !important;
      background: rgba(255, 255, 255, 0.8) !important;
      color: var(--mama-berry) !important;
      font-weight: 600 !important;
      border: 2px solid rgba(232, 196, 216, 0.3) !important;
    }
    .try-again-btn:hover {
      background: rgba(244, 143, 177, 0.1) !important;
      border-color: var(--mama-rose) !important;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .suggestions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BabyNamesComponent implements OnInit {
  nameForm!: FormGroup;
  selectedGender: 'boy' | 'girl' | null = null;
  selectedStyle: 'arabic' | 'other' = 'arabic';
  loading = false;
  nameResponse: BabyNameResponse | null = null;
  
  currentWeek = 0;
  isUnlocked = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.nameForm = this.fb.group({
      motherName: ['', Validators.required],
      fatherName: ['', Validators.required]
    });

    // Check pregnancy week to unlock feature
    const userId = this.authService.user()?.id;
    if (userId) {
      this.apiService.getPregnancyProfiles(userId).subscribe({
        next: (res) => {
          const profile = res.content.find(p => p.status === 'ACTIVE') || res.content[0];
          if (profile?.lastMenstrualPeriod) {
            const lmpDate = new Date(profile.lastMenstrualPeriod);
            const today = new Date();
            const totalDays = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
            this.currentWeek = Math.min(Math.floor(totalDays / 7), 42);
            this.isUnlocked = this.currentWeek >= 12;
          }
        }
      });
    }
  }

  selectGender(gender: 'boy' | 'girl'): void {
    this.selectedGender = gender;
  }

  selectStyle(style: 'arabic' | 'other'): void {
    this.selectedStyle = style;
  }

  onSubmit(): void {
    if (this.nameForm.invalid || !this.selectedGender) return;

    this.loading = true;
    const request = {
      baby_gender: this.selectedGender,
      mother_name: this.nameForm.value.motherName,
      father_name: this.nameForm.value.fatherName,
      name_style: this.selectedStyle,
      pregnancy_week: this.currentWeek
    };

    this.aiService.suggestBabyNames(request).subscribe({
      next: (response) => {
        this.nameResponse = response;
        this.loading = false;
        this.snackBar.open('Name suggestions generated! 🎉', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.detail || 'Failed to generate name suggestions', 'Close', { duration: 4000 });
      }
    });
  }

  reset(): void {
    this.nameResponse = null;
    this.nameForm.reset();
    this.selectedGender = null;
    this.selectedStyle = 'arabic';
  }
}
