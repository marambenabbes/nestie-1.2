import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AiService } from '../../core/services/ai.service';
import { PregnancyProfile, User, DoctorAdvice, BabyNameResponse } from '../../core/models/models';

@Component({
  selector: 'app-pregnancy-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatTooltipModule, MatBadgeModule,
            MatProgressSpinnerModule],
  template: `
    <div class="pregnancy-profile-page" *ngIf="profile && !showForm">

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- HERO SECTION — pregnancy image + welcome                  -->
      <!-- ═══════════════════════════════════════════════════════════ -->
    <section class="hero-section">

  <!-- Soft background gradient — no image as bg -->
  <div class="hero-bg-gradient"></div>

  <!-- Decorative blobs -->
  <div class="hero-blob hero-blob-1"></div>
  <div class="hero-blob hero-blob-2"></div>

  <!-- LEFT: text content -->
  <div class="hero-content">
    <div class="hero-text">
      <span class="hero-badge">
        <span class="badge-dot"></span>
        Month {{ currentMonth + 1 }} · Week {{ calculatedWeek }}
      </span>
      <h1 class="hero-title">
        Hello, Beautiful Mama <span class="wave">💕</span>
      </h1>
      <p class="hero-subtitle">
        {{ getHeroMessage() }}
      </p>
      <div class="hero-stats">
        <div class="stat-pill">
          <span class="stat-icon">📅</span>
          <div>
            <span class="stat-value">{{ calculatedDaysUntilDue > 0 ? calculatedDaysUntilDue : '🎉' }}</span>
            <span class="stat-label">{{ calculatedDaysUntilDue > 0 ? 'Days Left' : 'Due!' }}</span>
          </div>
        </div>
        <div class="stat-pill">
          <span class="stat-icon">🤰</span>
          <div>
            <span class="stat-value">{{ calculatedWeek }}<small>+{{ calculatedDay }}d</small></span>
            <span class="stat-label">Current Week</span>
          </div>
        </div>
        <div class="stat-pill">
          <span class="stat-icon">🌙</span>
          <div>
            <span class="stat-value">{{ calculatedTrimester }}</span>
            <span class="stat-label">Trimester</span>
          </div>
        </div>
      </div>
      <!-- Action buttons sit under the stats on the left -->
      <div class="hero-actions">
        <button class="btn-edit" (click)="editProfile()">
          <mat-icon>edit</mat-icon>
          <span>Edit Profile</span>
        </button>
        <button class="btn-delete" (click)="deleteProfile()">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </div>
    </div>
  </div>

  <!-- RIGHT: pregnancy illustration -->
  <div class="hero-image-panel">
    <div class="hero-image-glow"></div>
    <div class="image-circle-frame">
      <img
        [src]="pregnancyMonths[currentMonth]"
        [alt]="'Pregnancy Month ' + (currentMonth + 1)"
        class="hero-pregnancy-img"
      />
    </div>
  </div>

</section>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- INFO CARDS                                                 -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section class="info-grid">
        <!-- Basic Information Card -->
        <div class="info-card glass-card">
          <div class="card-header">
            <div class="card-icon pink-icon">
              <mat-icon>favorite</mat-icon>
            </div>
            <h3>Basic Information</h3>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="info-label">Blood Type</span>
              <span class="info-value badge-value">{{ profile.bloodType || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Height</span>
              <span class="info-value">{{ profile.height ? profile.height + ' cm' : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pre-pregnancy Weight</span>
              <span class="info-value">{{ profile.prePregnancyWeight ? profile.prePregnancyWeight + ' kg' : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Current Weight</span>
              <span class="info-value highlight">{{ profile.currentWeight ? profile.currentWeight + ' kg' : '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Medical Conditions</span>
              <span class="info-value">{{ profile.medicalConditions || 'None' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Allergies</span>
              <span class="info-value">{{ profile.allergies || 'None' }}</span>
            </div>
          </div>
        </div>

        <!-- Timeline Card -->
        <div class="info-card glass-card">
          <div class="card-header">
            <div class="card-icon purple-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <h3>Timeline</h3>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="info-label">Last Menstrual Period</span>
              <span class="info-value">{{ profile.lastMenstrualPeriod | date:'mediumDate' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Expected Due Date</span>
              <span class="info-value highlight-rose">{{ profile.expectedDueDate | date:'mediumDate' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Current Week</span>
              <span class="info-value highlight-purple">Week {{ calculatedWeek }} + {{ calculatedDay }} day{{ calculatedDay !== 1 ? 's' : '' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Trimester</span>
              <span class="info-value">{{ calculatedTrimester }}{{ calculatedTrimester === 1 ? 'st' : calculatedTrimester === 2 ? 'nd' : 'rd' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="info-value">
                <span class="status-badge" [class.active]="profile.status === 'ACTIVE'">{{ profile.status }}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Doctor</span>
              <span class="info-value">{{ profile.doctorName || 'Not assigned' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- DOCTOR ADVICE                                              -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section *ngIf="doctorAdviceList.length > 0" class="advice-section">
        <div class="section-header">
          <div class="section-icon advice-icon">
            <mat-icon>rate_review</mat-icon>
          </div>
          <h2>Doctor's Advice & Recommendations</h2>
          <span *ngIf="unreadAdviceCount > 0" class="unread-badge">{{ unreadAdviceCount }} new</span>
        </div>
        <div class="advice-grid">
          <div *ngFor="let advice of doctorAdviceList"
               class="advice-card"
               [class.unread]="!advice.readByPatient"
               (click)="markAdviceRead(advice)">
            <div class="advice-top">
              <span class="advice-cat-icon">{{ getCategoryIcon(advice.category) }}</span>
              <div class="advice-meta">
                <h4>{{ advice.title }}</h4>
                <div class="advice-badges">
                  <span class="advice-badge" [class]="getCategoryBadge(advice.category)">
                    {{ advice.category.replace('_', ' ') }}
                  </span>
                  <span class="advice-badge" [class]="getPriorityBadge(advice.priority)">
                    {{ advice.priority }}
                  </span>
                  <span *ngIf="!advice.readByPatient" class="advice-badge new-badge">NEW</span>
                </div>
              </div>
              <mat-icon *ngIf="advice.readByPatient" class="read-check">check_circle</mat-icon>
            </div>
            <p class="advice-message">{{ advice.message }}</p>
            <div *ngIf="advice.actionItems" class="advice-actions-box">
              <p class="actions-label">📋 Action Items</p>
              <p class="actions-text">{{ advice.actionItems }}</p>
            </div>
            <p class="advice-footer">
              From <strong>Dr. {{ advice.doctorName }}</strong> · {{ advice.createdAt | date:'medium' }}
            </p>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- BABY NAME SUGGESTIONS (Week 12+)                           -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section *ngIf="calculatedWeek >= 12" class="baby-names-section">
        <div class="section-header">
          <div class="section-icon baby-icon">
            <mat-icon>child_care</mat-icon>
          </div>
          <h2>Baby Name Suggestions 👶✨</h2>
        </div>

        <!-- Name Form (if not generated yet) -->
        <div *ngIf="!babyNameResponse" class="glass-card name-form-card">
          <p class="name-intro">Discover the perfect name for your little one! Tell us about yourselves:</p>
          
          <form [formGroup]="babyNameForm" (ngSubmit)="generateBabyNames()" class="baby-name-form">
            <div class="name-inputs">
              <mat-form-field appearance="outline">
                <mat-label>Mother's Name</mat-label>
                <input matInput formControlName="motherName" placeholder="e.g., Amira">
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Father's Name</mat-label>
                <input matInput formControlName="fatherName" placeholder="e.g., Youssef">
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
            </div>

            <div class="gender-style-row">
              <div class="gender-selection">
                <p class="input-label">Baby's Gender</p>
                <div class="gender-btns">
                  <button type="button" class="gender-btn" 
                          [class.active]="selectedGender === 'boy'"
                          (click)="selectGender('boy')">
                    <mat-icon>male</mat-icon>
                    Boy
                  </button>
                  <button type="button" class="gender-btn"
                          [class.active]="selectedGender === 'girl'"
                          (click)="selectGender('girl')">
                    <mat-icon>female</mat-icon>
                    Girl
                  </button>
                </div>
              </div>

              <div class="style-selection">
                <p class="input-label">Name Style</p>
                <div class="style-btns">
                  <button type="button" class="style-btn"
                          [class.active]="selectedStyle === 'arabic'"
                          (click)="selectStyle('arabic')">
                    🕌 Arabic
                  </button>
                  <button type="button" class="style-btn"
                          [class.active]="selectedStyle === 'other'"
                          (click)="selectStyle('other')">
                    🌍 International
                  </button>
                </div>
              </div>
            </div>

            <button mat-raised-button type="submit" class="generate-btn"
                    [disabled]="babyNameForm.invalid || !selectedGender || loadingNames">
              <mat-spinner *ngIf="loadingNames" diameter="20" class="btn-spinner"></mat-spinner>
              <mat-icon *ngIf="!loadingNames">auto_awesome</mat-icon>
              {{ loadingNames ? 'Generating...' : 'Reveal Name Suggestions 🎉' }}
            </button>
          </form>
        </div>

        <!-- Name Results -->
        <div *ngIf="babyNameResponse" class="name-results">
          <div class="glass-card congrats-banner">
            <div class="confetti-icon">🎉</div>
            <h3>{{ babyNameResponse.congratulations }}</h3>
            <p>Here are our top 3 name suggestions:</p>
          </div>

          <div class="name-suggestions">
            <div *ngFor="let suggestion of babyNameResponse.suggestions; let i = index"
                 class="glass-card name-card"
                 [class.rank-1]="i === 0">
              <div class="rank-badge">{{ i + 1 }}</div>
              <h4 class="name-title">{{ suggestion.name }}</h4>
              <p class="name-origin">
                <mat-icon>public</mat-icon>
                {{ suggestion.origin }}
              </p>
              <p class="name-meaning">
                <mat-icon>auto_stories</mat-icon>
                {{ suggestion.meaning }}
              </p>
              <div class="name-why">
                <mat-icon>favorite</mat-icon>
                <p>{{ suggestion.why }}</p>
              </div>
            </div>
          </div>

          <button mat-button class="try-again-btn" (click)="resetBabyNames()">
            <mat-icon>refresh</mat-icon>
            Try Different Names
          </button>
        </div>
      </section>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- CREATE / EDIT FORM                                         -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div *ngIf="showForm || !profile" class="form-wrapper animate-fade-in">
      <div class="form-card glass-card">
        <div class="form-header">
          <div class="form-icon">
            <mat-icon>pregnant_woman</mat-icon>
          </div>
          <div>
            <h2>{{ editingId ? 'Edit' : 'Create' }} Pregnancy Profile</h2>
            <p>Fill in your details to start tracking your journey 🌸</p>
          </div>
        </div>
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
          <div class="form-grid">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Last Menstrual Period</mat-label>
              <input matInput type="date" formControlName="lastMenstrualPeriod">
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Expected Due Date (auto-calculated)</mat-label>
              <input matInput type="date" formControlName="expectedDueDate" readonly>
              <mat-hint *ngIf="profileForm.get('expectedDueDate')?.value">Calculated from LMP + 280 days</mat-hint>
            </mat-form-field>

            <div *ngIf="formCalculatedWeek !== null" class="form-week-display">
              <div class="week-display-inner">
                <mat-icon class="text-mama-purple">pregnant_woman</mat-icon>
                <div>
                  <p class="week-label">Current Pregnancy Week (auto-calculated)</p>
                  <p class="week-value">Week {{ formCalculatedWeek }} + {{ formCalculatedDay }} day{{ formCalculatedDay !== 1 ? 's' : '' }}</p>
                  <p class="week-detail">Trimester {{ formCalculatedTrimester }} · Based on today's date and LMP</p>
                </div>
              </div>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Blood Type</mat-label>
              <mat-select formControlName="bloodType">
                <mat-option *ngFor="let t of bloodTypes" [value]="t">{{ t }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Height (cm)</mat-label>
              <input matInput type="number" formControlName="height">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Pre-pregnancy Weight (kg)</mat-label>
              <input matInput type="number" formControlName="prePregnancyWeight">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Current Weight (kg)</mat-label>
              <input matInput type="number" formControlName="currentWeight">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Medical Conditions</mat-label>
            <textarea matInput formControlName="medicalConditions" rows="2" placeholder="e.g., gestational diabetes, anemia..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Allergies</mat-label>
            <textarea matInput formControlName="allergies" rows="2" placeholder="e.g., penicillin, shellfish..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Doctor</mat-label>
            <mat-select formControlName="doctorId">
              <mat-option [value]="null">-- No doctor --</mat-option>
              <mat-option *ngFor="let doc of doctors" [value]="doc.id">{{ doc.fullName }}</mat-option>
            </mat-select>
            <mat-hint>Optional — choose your doctor or leave empty</mat-hint>
          </mat-form-field>

          <div class="form-actions">
            <button *ngIf="profile || editingId" mat-button type="button" (click)="resetForm()" class="btn-cancel">Cancel</button>
            <button mat-raised-button type="submit" [disabled]="profileForm.invalid || saving" class="btn-submit">
              {{ saving ? 'Saving...' : (editingId ? 'Update Profile ✏️' : 'Save Profile 🌸') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* =========================================================
       PREGNANCY PROFILE — PREMIUM REDESIGN
       ========================================================= */

    :host {
      display: block;
    }

    /* ─── HERO SECTION ─── */
    .hero-section {
      position: relative;
      border-radius: 28px;
      overflow: hidden;
      min-height: 360px;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      margin-bottom: 1.75rem;
      background: linear-gradient(135deg,
        #fff5f7 0%,
        #fce4ec 35%,
        #f3e5f5 65%,
        #ede7f6 100%
      );
    }

    /* Soft ambient blobs for depth */
    .hero-bg-gradient {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 60% 80% at 20% 50%, rgba(255,255,255,0.7) 0%, transparent 70%);
      z-index: 0;
    }
    .hero-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      z-index: 0;
      pointer-events: none;
    }
    .hero-blob-1 {
      width: 320px; height: 320px;
      background: rgba(244, 143, 177, 0.18);
      top: -60px; left: -60px;
    }
    .hero-blob-2 {
      width: 260px; height: 260px;
      background: rgba(206, 147, 216, 0.15);
      bottom: -40px; left: 30%;
    }

    /* LEFT text panel */
    .hero-content {
      position: relative;
      z-index: 2;
      flex: 1;
      display: flex;
      align-items: center;
      padding: 2.5rem 2rem 2.5rem 2.5rem;
      min-width: 0;
    }

    /* RIGHT image panel */
    .hero-image-panel {
      position: relative;
      z-index: 2;
      flex-shrink: 0;
      width: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
    }

    /* Radial glow behind the illustration */
    .hero-image-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at center,
        rgba(244, 143, 177, 0.08) 0%,
        rgba(206, 147, 216, 0.05) 40%,
        transparent 70%
      );
      z-index: 0;
    }

    /* Beautiful circular frame for the image */
    .image-circle-frame {
      position: relative;
      z-index: 1;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.9) 0%,
        rgba(252, 228, 236, 0.6) 50%,
        rgba(243, 229, 245, 0.6) 100%
      );
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(244, 143, 177, 0.15);
      transition: all 0.5s ease;
      animation: float 6s ease-in-out infinite;
    }

    .image-circle-frame::before {
      content: '';
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      background: linear-gradient(135deg, 
        rgba(244, 143, 177, 0.12) 0%,
        rgba(206, 147, 216, 0.12) 100%
      );
      filter: blur(16px);
      opacity: 0.5;
      z-index: -1;
      animation: pulse-glow 4s ease-in-out infinite;
    }

    .image-circle-frame:hover {
      transform: scale(1.03);
      border-color: rgba(244, 143, 177, 0.3);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.7; }
    }

    /* The illustration itself — sits inside the circle */
    .hero-pregnancy-img {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      object-position: center;
      display: block;
      transition: transform 0.5s ease;
    }
    .hero-pregnancy-img:hover {
      transform: scale(1.05);
    }

    /* Actions now live inside hero-text */
    .hero-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .hero-text {
      flex: 1;
      min-width: 0;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 1rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      background: rgba(212, 83, 126, 0.12);
      color: var(--mama-rose-deep);
      backdrop-filter: blur(8px);
    }
    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--mama-rose);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }

    .hero-title {
      margin: 0.75rem 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--mama-berry);
      font-family: 'Outfit', sans-serif;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    .wave {
      display: inline-block;
      animation: wave 2.5s ease-in-out infinite;
    }
    @keyframes wave {
      0%, 100% { transform: rotate(0); }
      25% { transform: rotate(15deg); }
      75% { transform: rotate(-10deg); }
    }

    .hero-subtitle {
      font-size: 0.9rem;
      color: var(--mama-lavender-dark);
      line-height: 1.6;
      margin: 0 0 1.25rem;
      max-width: 400px;
    }

    .hero-stats {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .stat-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.6);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-pill:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(244, 143, 177, 0.15);
    }
    .stat-icon { font-size: 1.3rem; }
    .stat-value {
      display: block;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--mama-berry);
      line-height: 1.2;
    }
    .stat-value small {
      font-size: 0.65rem;
      font-weight: 500;
      color: var(--mama-lavender-dark);
    }
    .stat-label {
      display: block;
      font-size: 0.65rem;
      color: var(--mama-lavender-dark);
      letter-spacing: 0.02em;
    }

    /* ─── HERO BUTTONS ─── */
    .btn-edit {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1.4rem;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-purple));
      color: #fff;
      font-size: 0.82rem;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 20px rgba(212, 83, 126, 0.3);
    }
    .btn-edit:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(212, 83, 126, 0.4);
    }
    .btn-edit mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .btn-delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px; height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      color: #bbb;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-delete:hover {
      background: var(--mama-pink-light);
      color: #e53935;
    }
    .btn-delete mat-icon { font-size: 20px; width: 20px; height: 20px; }

    /* ─── GLASS CARDS ─── */
    .glass-card {
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(232, 196, 216, 0.2);
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(200, 141, 184, 0.12);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .glass-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 50px rgba(212, 83, 126, 0.18);
    }

    /* ─── INFO GRID ─── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }

    .info-card {
      padding: 1.75rem;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .card-icon {
      width: 42px; height: 42px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-icon mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; }
    .pink-icon { background: linear-gradient(135deg, var(--mama-pink-dark), var(--mama-rose)); }
    .purple-icon { background: linear-gradient(135deg, var(--mama-lavender-dark), var(--mama-purple)); }
    .card-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--mama-berry);
      font-family: 'Poppins', sans-serif;
    }

    .card-body { display: flex; flex-direction: column; gap: 0.85rem; }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.45rem 0;
      border-bottom: 1px solid rgba(232, 196, 216, 0.12);
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 0.82rem; color: var(--mama-lavender-dark); }
    .info-value {
      font-size: 0.85rem;
      font-weight: 500;
      color: #3f3d56;
    }
    .info-value.badge-value {
      padding: 0.2rem 0.7rem;
      border-radius: 999px;
      background: rgba(212, 83, 126, 0.1);
      color: var(--mama-rose-deep);
      font-weight: 600;
      font-size: 0.8rem;
    }
    .info-value.highlight { color: var(--mama-rose); font-weight: 600; }
    .info-value.highlight-rose { color: var(--mama-rose); font-weight: 600; }
    .info-value.highlight-purple { color: var(--mama-purple); font-weight: 600; }

    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.75rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      background: #f5f5f5;
      color: #999;
    }
    .status-badge.active {
      background: rgba(76, 175, 80, 0.12);
      color: #2e7d32;
    }

    /* ─── DOCTOR ADVICE ─── */
    .advice-section { margin-bottom: 1.5rem; }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .section-icon {
      width: 42px; height: 42px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .section-icon mat-icon { color: #fff; font-size: 22px; width: 22px; height: 22px; }
    .advice-icon { background: linear-gradient(135deg, var(--mama-lavender-dark), var(--mama-purple)); }
    .section-header h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--mama-berry);
      font-family: 'Poppins', sans-serif;
    }
    .unread-badge {
      padding: 0.2rem 0.7rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      background: #e53935;
      color: #fff;
      animation: pulse 2s ease-in-out infinite;
    }

    .advice-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .advice-card {
      padding: 1.25rem 1.5rem;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(232, 196, 216, 0.15);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .advice-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(200, 141, 184, 0.2);
    }
    .advice-card.unread {
      border-left: 3px solid var(--mama-rose);
      background: linear-gradient(135deg, rgba(252, 228, 236, 0.6) 0%, rgba(249, 238, 244, 0.4) 100%);
    }
    .advice-top {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .advice-cat-icon { font-size: 1.5rem; }
    .advice-meta { flex: 1; }
    .advice-meta h4 { margin: 0 0 0.35rem; font-size: 0.9rem; font-weight: 600; color: var(--mama-berry); }
    .advice-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .advice-badge {
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .new-badge {
      background: rgba(229, 57, 53, 0.1) !important;
      color: #e53935 !important;
      animation: pulse 2s ease-in-out infinite;
    }
    .read-check { color: #4caf50 !important; font-size: 20px !important; }
    .advice-message {
      font-size: 0.82rem;
      color: #666;
      line-height: 1.6;
      margin: 0 0 0.75rem;
    }
    .advice-actions-box {
      padding: 0.75rem 1rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(201, 141, 184, 0.2);
      margin-bottom: 0.75rem;
    }
    .actions-label {
      margin: 0 0 0.25rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--mama-purple);
    }
    .actions-text { margin: 0; font-size: 0.8rem; color: #555; }
    .advice-footer {
      margin: 0;
      font-size: 0.72rem;
      color: #aaa;
    }
    .advice-footer strong { color: var(--mama-purple); }

    /* Badge colors */
    .bg-green-100 { background: rgba(76, 175, 80, 0.12); }
    .text-green-700 { color: #2e7d32; }
    .bg-orange-100 { background: rgba(255, 152, 0, 0.12); }
    .text-orange-700 { color: #e65100; }
    .bg-blue-100 { background: rgba(33, 150, 243, 0.12); }
    .text-blue-700 { color: #1565c0; }
    .bg-purple-100 { background: rgba(156, 39, 176, 0.1); }
    .text-purple-700 { color: #7b1fa2; }
    .bg-gray-100 { background: rgba(0, 0, 0, 0.05); }
    .text-gray-700 { color: #555; }
    .bg-gray-100.text-gray-600 { color: #666; }
    .bg-red-100 { background: rgba(229, 57, 53, 0.1); }
    .text-red-700 { color: #c62828; }

    /* ─── FORM CARD ─── */
    .form-wrapper {
      max-width: 720px;
      margin: 0 auto;
    }
    .form-card {
      padding: 2rem;
    }
    .form-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .form-icon {
      width: 50px; height: 50px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-purple));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .form-icon mat-icon { color: #fff; font-size: 26px; width: 26px; height: 26px; }
    .form-header h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--mama-berry);
      font-family: 'Outfit', sans-serif;
    }
    .form-header p { margin: 0.2rem 0 0; font-size: 0.82rem; color: var(--mama-lavender-dark); }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 1.5rem;
      align-items: flex-start;
    }
    .form-week-display {
      grid-column: span 2;
      padding: 1rem 1.25rem;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(252, 228, 236, 0.5), rgba(243, 229, 245, 0.5));
    }
    .week-display-inner { display: flex; align-items: center; gap: 0.75rem; }
    .week-label { font-size: 0.78rem; color: #9e9eb8; margin: 0; }
    .week-value { font-size: 1.15rem; font-weight: 700; color: #9c27b0; margin: 0.15rem 0 0; }
    .week-detail { font-size: 0.7rem; color: #bbb; margin: 0.15rem 0 0; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .btn-cancel {
      border-radius: 999px !important;
      color: #999 !important;
    }
    .btn-submit {
      border-radius: 999px !important;
      background: linear-gradient(135deg, #f48fb1, #ce93d8) !important;
      color: #fff !important;
      font-weight: 600 !important;
      padding: 0 1.8rem !important;
      box-shadow: 0 6px 20px rgba(244, 143, 177, 0.3) !important;
      transition: all 0.3s ease !important;
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 10px 30px rgba(244, 143, 177, 0.45) !important;
    }

    /* ─── FORM FIELD STYLING ─── */
    ::ng-deep .pregnancy-profile-page mat-form-field {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-form-field-focus-overlay {
      background-color: rgba(244, 143, 177, 0.04) !important;
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-text-field-wrapper {
      padding-bottom: 0 !important;
    }

    ::ng-deep .pregnancy-profile-page .mdc-text-field--outlined {
      --mdc-theme-primary: #f48fb1;
      border-radius: 16px !important;
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 16px rgba(225, 190, 231, 0.15);
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-form-field-error {
      font-size: 0.7rem !important;
      color: #e53935 !important;
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-outlined-text-field {
      padding: 0 !important;
    }

    ::ng-deep .pregnancy-profile-page .mdc-notched-outline__leading,
    ::ng-deep .pregnancy-profile-page .mdc-notched-outline__notch,
    ::ng-deep .pregnancy-profile-page .mdc-notched-outline__trailing {
      border-color: rgba(206, 147, 216, 0.3) !important;
      border-width: 1.5px !important;
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .pregnancy-profile-page .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .pregnancy-profile-page .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #f48fb1 !important;
      border-width: 2px !important;
    }

    ::ng-deep .pregnancy-profile-page .mdc-text-field__input {
      padding: 14px 16px !important;
      font-size: 0.9rem !important;
      color: #3f3d56 !important;
      font-family: 'Poppins', sans-serif !important;
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-form-field-label {
      color: #9e9eb8 !important;
      font-size: 0.85rem !important;
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: #f48fb1 !important;
    }

    ::ng-deep .pregnancy-profile-page mat-form-field {
      display: block !important;
      margin-bottom: 1.2rem !important;
    }

    ::ng-deep .pregnancy-profile-page textarea.mat-mdc-input-element {
      padding: 12px 16px !important;
      resize: vertical !important;
      font-family: 'Poppins', sans-serif !important;
    }

    ::ng-deep .pregnancy-profile-page .mat-mdc-select-trigger {
      padding: 8px 0 !important;
    }

    /* ─── PAGE ANIMATION ─── */
    .pregnancy-profile-page {
      animation: fadeInUp 0.5s ease forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── BABY NAME SUGGESTIONS ─── */
    .baby-names-section {
      margin-bottom: 1.5rem;
    }
    .baby-icon {
      background: linear-gradient(135deg, #FFB6C1, #FF69B4);
    }
    .name-form-card {
      padding: 2rem;
    }
    .name-intro {
      text-align: center;
      color: var(--mama-lavender-dark);
      font-size: 0.95rem;
      margin: 0 0 1.5rem;
    }
    .baby-name-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .name-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .gender-style-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .input-label {
      font-weight: 600;
      color: var(--mama-berry);
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
    }
    .gender-btns, .style-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .gender-btn, .style-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1rem;
      border: 2px solid rgba(232, 196, 216, 0.3);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      color: #999;
      font-size: 0.85rem;
    }
    .gender-btn mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .gender-btn.active {
      border-color: var(--mama-rose);
      background: rgba(244, 143, 177, 0.1);
      color: var(--mama-rose);
    }
    .style-btn.active {
      border-color: var(--mama-purple);
      background: rgba(206, 147, 216, 0.1);
      color: var(--mama-purple);
    }
    .gender-btn:hover:not(.active), .style-btn:hover:not(.active) {
      border-color: rgba(244, 143, 177, 0.5);
    }
    .generate-btn {
      width: 100%;
      padding: 1rem 2rem !important;
      border-radius: 999px !important;
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-purple)) !important;
      color: #fff !important;
      font-weight: 600 !important;
      font-size: 0.95rem !important;
      box-shadow: 0 8px 24px rgba(212, 83, 126, 0.3) !important;
      transition: all 0.3s ease !important;
    }
    .generate-btn:hover:not(:disabled) {
      transform: translateY(-2px) !important;
      box-shadow: 0 12px 32px rgba(212, 83, 126, 0.4) !important;
    }
    .btn-spinner {
      display: inline-block;
      margin-right: 0.5rem;
    }
    .name-results {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .congrats-banner {
      padding: 2rem;
      text-align: center;
      background: linear-gradient(135deg, rgba(252, 228, 236, 0.8), rgba(243, 229, 245, 0.8));
    }
    .confetti-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    .congrats-banner h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--mama-berry);
      margin: 0 0 0.5rem;
    }
    .congrats-banner p {
      color: var(--mama-lavender-dark);
      font-size: 0.9rem;
      margin: 0;
    }
    .name-suggestions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .name-card {
      position: relative;
      padding: 1.75rem 1.5rem;
      transition: transform 0.3s ease;
    }
    .name-card:hover {
      transform: translateY(-4px);
    }
    .rank-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: #fff;
      background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
    }
    .name-card.rank-1 .rank-badge {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);
    }
    .name-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.6rem;
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
      font-size: 0.8rem;
      margin: 0 0 0.85rem;
    }
    .name-origin mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .name-meaning {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.85rem;
      border-radius: 12px;
      background: rgba(244, 143, 177, 0.08);
      margin: 0 0 0.85rem;
      font-size: 0.82rem;
      color: #666;
    }
    .name-meaning mat-icon {
      color: var(--mama-rose);
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
    .name-why {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.85rem;
      border-radius: 12px;
      background: rgba(206, 147, 216, 0.08);
      font-size: 0.8rem;
      color: #555;
    }
    .name-why mat-icon {
      color: var(--mama-purple);
      font-size: 16px;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
    .name-why p {
      margin: 0;
    }
    .try-again-btn {
      display: block;
      margin: 0 auto;
      padding: 0.7rem 1.8rem !important;
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

    /* ─── RESPONSIVE ─── */
    @media (max-width: 768px) {
      .hero-section {
        flex-direction: column-reverse;
        min-height: unset;
      }
      .hero-content {
        padding: 1.75rem 1.5rem;
        justify-content: center;
      }
      .hero-text {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .hero-subtitle { max-width: 100%; }
      .hero-stats { justify-content: center; }
      .hero-actions { justify-content: center; }
      .hero-image-panel {
        width: 100%;
        height: 340px;
        align-items: center;
        justify-content: center;
      }
      .image-circle-frame {
        width: 260px;
        height: 260px;
      }
      .info-grid {
        grid-template-columns: 1fr;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
      .form-week-display {
        grid-column: span 1;
      }
      .name-inputs {
        grid-template-columns: 1fr;
      }
      .gender-style-row {
        grid-template-columns: 1fr;
      }
      .name-suggestions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PregnancyProfileComponent implements OnInit {
  profile: PregnancyProfile | null = null;
  showForm = false;
  saving = false;
  editingId: number | null = null;
  profileForm!: FormGroup;
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  doctors: User[] = [];
  doctorAdviceList: DoctorAdvice[] = [];
  unreadAdviceCount = 0;
  showBabyMsg = false;

  // Pregnancy month images
  pregnancyMonths: string[] = [
    'app/assets/pregnancy/month1.png',
    'app/assets/pregnancy/month2.png',
    'app/assets/pregnancy/month3.png',
    'app/assets/pregnancy/month4.png',
    'app/assets/pregnancy/month5.png',
    'app/assets/pregnancy/month6.png',
    'app/assets/pregnancy/month7.png',
    'app/assets/pregnancy/month8.png',
    'app/assets/pregnancy/month9.png'
  ];
  currentMonth = 0;

  // Auto-calculated from profile's LMP
  calculatedWeek = 0;
  calculatedDay = 0;
  calculatedTrimester = 1;
  calculatedDaysUntilDue = 0;

  // Auto-calculated from form's LMP input
  formCalculatedWeek: number | null = null;
  formCalculatedDay = 0;
  formCalculatedTrimester = 1;

  // Baby Name Suggestion properties
  babyNameForm!: FormGroup;
  selectedGender: 'boy' | 'girl' | null = null;
  selectedStyle: 'arabic' | 'other' = 'arabic';
  loadingNames = false;
  babyNameResponse: BabyNameResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      lastMenstrualPeriod: ['', Validators.required],
      expectedDueDate: [''],
      bloodType: [''],
      height: [null],
      prePregnancyWeight: [null],
      currentWeight: [null],
      medicalConditions: [''],
      allergies: [''],
      doctorId: [null]
    });

    // Initialize baby name form
    this.babyNameForm = this.fb.group({
      motherName: ['', Validators.required],
      fatherName: ['', Validators.required]
    });

    // Auto-calculate due date and current week when LMP changes (Naegele's Rule: LMP + 280 days)
    this.profileForm.get('lastMenstrualPeriod')?.valueChanges.subscribe(lmp => {
      if (lmp) {
        const lmpDate = new Date(lmp);
        lmpDate.setDate(lmpDate.getDate() + 280);
        const dueDate = lmpDate.toISOString().substring(0, 10);
        this.profileForm.patchValue({ expectedDueDate: dueDate }, { emitEvent: false });

        // Auto-calculate current week + day from LMP and today's date
        const { weeks, days, trimester } = this.computeWeekFromLmp(lmp);
        this.formCalculatedWeek = weeks;
        this.formCalculatedDay = days;
        this.formCalculatedTrimester = trimester;
      } else {
        this.profileForm.patchValue({ expectedDueDate: '' }, { emitEvent: false });
        this.formCalculatedWeek = null;
      }
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadDoctorAdvice();
    this.apiService.getDoctors().subscribe({
      next: (docs) => this.doctors = docs,
      error: () => this.doctors = []
    });
  }

  loadProfile(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.apiService.getPregnancyProfiles(userId).subscribe({
        next: (res) => {
          this.profile = res.content.find((p: PregnancyProfile) => p.status === 'ACTIVE') || res.content[0] || null;
          if (this.profile?.lastMenstrualPeriod) {
            const { weeks, days, trimester } = this.computeWeekFromLmp(this.profile.lastMenstrualPeriod);
            this.calculatedWeek = weeks;
            this.calculatedDay = days;
            this.calculatedTrimester = trimester;

            // Calculate current pregnancy month (0-based index, max 8)
            const month = Math.floor((weeks - 1) / 4);
            this.currentMonth = Math.max(0, Math.min(month, 8));

            if (this.profile.expectedDueDate) {
              const due = new Date(this.profile.expectedDueDate);
              this.calculatedDaysUntilDue = Math.max(0, Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            }
          }
        }
      });
    }
  }

  private computeWeekFromLmp(lmpStr: string): { weeks: number; days: number; trimester: number } {
    const lmpDate = new Date(lmpStr);
    const today = new Date();
    const totalDays = Math.max(0, Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.min(Math.floor(totalDays / 7), 42);
    const days = totalDays % 7;
    let trimester = 1;
    if (weeks > 12 && weeks <= 27) trimester = 2;
    else if (weeks > 27) trimester = 3;
    return { weeks, days, trimester };
  }

  getHeroMessage(): string {
    if (this.calculatedWeek <= 12) return 'Your little miracle is forming! Every heartbeat is a beautiful milestone. Take care of yourself, mama. 🌱';
    if (this.calculatedWeek <= 27) return 'Your baby is growing strong! Those tiny kicks are saying hello. This is such a magical time. 💫';
    if (this.calculatedWeek <= 36) return 'Almost there, beautiful! Your baby is getting ready to meet you. Stay strong and keep glowing! 🎀';
    return 'The big day is so close! Your journey is about to get even more wonderful. You\'ve got this! 🌟';
  }

  editProfile(): void {
    if (!this.profile) return;
    this.editingId = this.profile.id;
    this.showForm = true;
    this.profileForm.patchValue({
      lastMenstrualPeriod: this.profile.lastMenstrualPeriod ? this.profile.lastMenstrualPeriod.substring(0, 10) : '',
      expectedDueDate: this.profile.expectedDueDate ? this.profile.expectedDueDate.substring(0, 10) : '',
      bloodType: this.profile.bloodType,
      height: this.profile.height,
      prePregnancyWeight: this.profile.prePregnancyWeight,
      currentWeight: this.profile.currentWeight,
      medicalConditions: this.profile.medicalConditions,
      allergies: this.profile.allergies,
      doctorId: this.profile.doctorId || null
    });
  }

  resetForm(): void {
    this.profileForm.reset();
    this.editingId = null;
    this.showForm = false;
    this.saving = false;
  }

  deleteProfile(): void {
    if (!this.profile || !confirm('Delete this pregnancy profile? This cannot be undone.')) return;
    this.apiService.deletePregnancyProfile(this.profile.id).subscribe({
      next: () => {
        this.profile = null;
        this.snackBar.open('Profile deleted 🗑️', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to delete profile', 'Close', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    const userId = this.authService.user()?.id;
    if (!userId) return;

    const formData = { ...this.profileForm.value };
    // Ensure due date is always calculated from LMP
    if (formData.lastMenstrualPeriod && !formData.expectedDueDate) {
      const lmpDate = new Date(formData.lastMenstrualPeriod);
      lmpDate.setDate(lmpDate.getDate() + 280);
      formData.expectedDueDate = lmpDate.toISOString().substring(0, 10);
    }

    const request$ = this.editingId
      ? this.apiService.updatePregnancyProfile(this.editingId, formData)
      : this.apiService.createPregnancyProfile(userId, formData);

    request$.subscribe({
      next: (res) => {
        this.profile = res;
        this.snackBar.open(this.editingId ? 'Profile updated! ✏️' : 'Profile created! 🌸', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadProfile();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save profile', 'Close', { duration: 3000 });
      }
    });
  }

  // Doctor Advice methods
  loadDoctorAdvice(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.apiService.getDoctorAdviceForPatient(userId, 0, 50).subscribe({
        next: (res) => {
          this.doctorAdviceList = res.content;
          this.unreadAdviceCount = res.content.filter(a => !a.readByPatient).length;
        },
        error: () => this.doctorAdviceList = []
      });
    }
  }

  markAdviceRead(advice: DoctorAdvice): void {
    if (!advice.readByPatient) {
      this.apiService.markAdviceAsRead(advice.id).subscribe({
        next: () => {
          advice.readByPatient = true;
          this.unreadAdviceCount = Math.max(0, this.unreadAdviceCount - 1);
        }
      });
    }
  }

  getCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      'NUTRITION': '🥗', 'SYMPTOMS': '🩺', 'MEDICATION': '💊', 'BABY_GROWTH': '👶', 'GENERAL': '📋'
    };
    return map[category] || '📋';
  }

  getCategoryBadge(category: string): string {
    const map: Record<string, string> = {
      'NUTRITION': 'bg-green-100 text-green-700', 'SYMPTOMS': 'bg-orange-100 text-orange-700',
      'MEDICATION': 'bg-blue-100 text-blue-700', 'BABY_GROWTH': 'bg-purple-100 text-purple-700',
      'GENERAL': 'bg-gray-100 text-gray-700'
    };
    return map[category] || 'bg-gray-100 text-gray-700';
  }

  getPriorityBadge(priority: string): string {
    const map: Record<string, string> = {
      'LOW': 'bg-gray-100 text-gray-600', 'NORMAL': 'bg-blue-100 text-blue-700',
      'HIGH': 'bg-orange-100 text-orange-700', 'URGENT': 'bg-red-100 text-red-700'
    };
    return map[priority] || 'bg-gray-100 text-gray-600';
  }

  // Baby Name Suggestion methods
  selectGender(gender: 'boy' | 'girl'): void {
    this.selectedGender = gender;
  }

  selectStyle(style: 'arabic' | 'other'): void {
    this.selectedStyle = style;
  }

  generateBabyNames(): void {
    if (this.babyNameForm.invalid || !this.selectedGender) return;

    this.loadingNames = true;
    const request = {
      baby_gender: this.selectedGender,
      mother_name: this.babyNameForm.value.motherName,
      father_name: this.babyNameForm.value.fatherName,
      name_style: this.selectedStyle,
      pregnancy_week: this.calculatedWeek
    };

    this.aiService.suggestBabyNames(request).subscribe({
      next: (response) => {
        this.babyNameResponse = response;
        this.loadingNames = false;
        this.snackBar.open('Name suggestions generated! 🎉', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.loadingNames = false;
        this.snackBar.open(err.error?.detail || 'Failed to generate name suggestions', 'Close', { duration: 4000 });
      }
    });
  }

  resetBabyNames(): void {
    this.babyNameResponse = null;
    this.babyNameForm.reset();
    this.selectedGender = null;
    this.selectedStyle = 'arabic';
  }
}
