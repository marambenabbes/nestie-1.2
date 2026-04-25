import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AiService } from '../../core/services/ai.service';
import { PregnancyProfile, Appointment, Medication, Symptom } from '../../core/models/models';
import { PregnancyTimelineComponent } from '../../shared/pregnancy-timeline/pregnancy-timeline.component';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink, PregnancyTimelineComponent],
  template: `
    <div class="space-y-8 animate-fade-in">

    <!-- ══════ HERO BANNER ══════ -->
<div class="hero-banner">

  <!-- Full Background Video -->
  <video class="hero-bg-video" autoplay muted loop playsinline
         src="app/assets/pregnancy/Whisk_czmwmjnhrtmxctnj1soygdotytzjrtl5ymn10yn.mp4">
  </video>

  <!-- Overlay so text is readable -->
  <div class="hero-overlay"></div>

  <!-- Text on top -->
  <div class="hero-content">
    <div class="hero-text">
      <p class="hero-greeting">Good {{ timeOfDay }},</p>
      <h1 class="hero-name">{{ firstName }} 💕</h1>
      <p class="hero-subtitle">{{ getProgressMessage() }}</p>
      <div class="hero-date">
        <mat-icon class="!text-sm">calendar_today</mat-icon>
        {{ today | date:'EEEE, MMMM d, yyyy' }}
      </div>
    </div>
  </div>

</div>
      <!-- ══════ STATS CARDS ══════ -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Pregnancy Week Card -->
        <div class="glass-card stat-card p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="stat-label">Current Week</p>
              <p class="stat-value text-[var(--mama-rose)]">{{ calculatedWeek }}<span class="stat-sub">+{{ calculatedDay }}d</span></p>
              <p class="stat-hint">Trimester {{ calculatedTrimester }}</p>
            </div>
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,var(--mama-pink),var(--mama-rose));">
              <mat-icon class="text-white !text-2xl">pregnant_woman</mat-icon>
            </div>
          </div>
        </div>

        <!-- Days to Due Date -->
        <div class="glass-card stat-card p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="stat-label">Days Until Due</p>
              <p class="stat-value text-[var(--mama-purple)]">{{ daysUntilDue }}</p>
              <p class="stat-hint">{{ pregnancy?.expectedDueDate | date:'MMM d' }}</p>
            </div>
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,var(--mama-lavender),var(--mama-purple));">
              <mat-icon class="text-white !text-2xl">event</mat-icon>
            </div>
          </div>
        </div>

        <!-- Upcoming Appointments -->
        <div class="glass-card stat-card p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="stat-label">Next Appointment</p>
              <p class="stat-value text-[var(--mama-rose-deep)]">{{ nextAppointment?.appointmentDate | date:'MMM d' }}</p>
              <p class="stat-hint">{{ nextAppointment?.type || 'None scheduled' }}</p>
            </div>
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,var(--mama-peach),var(--mama-pink-dark));">
              <mat-icon class="text-white !text-2xl">calendar_today</mat-icon>
            </div>
          </div>
        </div>

        <!-- Active Medications -->
        <div class="glass-card stat-card p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="stat-label">Active Meds</p>
              <p class="stat-value text-[var(--mama-lavender-dark)]">{{ activeMeds.length }}</p>
              <p class="stat-hint">medications</p>
            </div>
            <div class="stat-icon-wrap" style="background:linear-gradient(135deg,var(--mama-lavender-dark),var(--mama-purple));">
              <mat-icon class="text-white !text-2xl">medication</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════ 3D PROGRESS SPHERE + TIMELINE ══════ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="glass-card p-6 lg:col-span-1">
          <h3 class="section-title mb-5">Your Baby's Growth 🌸</h3>

          <!-- 3D Progress Sphere -->
          <div class="progress-sphere-container mb-6">
            <div class="progress-sphere">
              <div class="sphere-ring"></div>
              <div class="sphere-ring"></div>
              <div class="sphere-ring"></div>
              <div class="sphere-fill" [style.--progress]="progressPercent + '%'"></div>
              <div class="sphere-inner">
                <span class="text-2xl font-bold" style="color:var(--mama-rose);font-family:'Outfit',sans-serif;">{{ calculatedWeek }}</span>
                <span class="text-[10px] font-semibold uppercase tracking-wider" style="color:var(--mama-lavender-dark);">weeks</span>
              </div>
            </div>
          </div>

          <app-pregnancy-timeline [currentWeek]="calculatedWeek"></app-pregnancy-timeline>
        </div>

        <!-- Recent Symptoms -->
        <div class="glass-card p-6 lg:col-span-2">
          <div class="flex items-center justify-between mb-5">
            <h3 class="section-title">Recent Symptoms 📋</h3>
            <a routerLink="/dashboard/symptoms" class="view-all-link">View all →</a>
          </div>
          <div class="space-y-3" *ngIf="recentSymptoms.length > 0; else noSymptoms">
            <div *ngFor="let symptom of recentSymptoms" class="symptom-row"
                 [class]="getSeverityBg(symptom.severity)">
              <div class="symptom-dot" [class]="getSeverityDot(symptom.severity)">
                <mat-icon class="!text-lg text-white">{{ symptom.flaggedByAI ? 'warning' : 'monitor_heart' }}</mat-icon>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-700 text-sm">{{ symptom.symptomName }}</p>
                <p class="text-xs text-gray-400">{{ symptom.occurredAt | date:'short' }} · Week {{ symptom.pregnancyWeek }}</p>
              </div>
              <span class="severity-badge" [class]="getSeverityBadge(symptom.severity)">
                {{ symptom.severity }}
              </span>
            </div>
          </div>
          <ng-template #noSymptoms>
            <div class="empty-state">
              <mat-icon class="!text-5xl" style="color:var(--mama-pink);">sentiment_satisfied</mat-icon>
              <p>No symptoms logged yet 😊</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- ══════ QUICK ACTIONS ══════ -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
        <a *ngFor="let action of quickActions" [routerLink]="action.route"
           class="glass-card action-card">
          <div class="action-icon" [style.background]="action.gradient">
            <mat-icon class="text-white">{{ action.icon }}</mat-icon>
          </div>
          <span class="action-label">{{ action.label }}</span>
        </a>
      </div>

    </div>
  `,
  styles: [`
    /* ─── HERO BANNER ─── */
    .hero-banner {
      position: relative;
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(255,245,247,0.9) 0%, rgba(252,228,236,0.7) 50%, rgba(249,238,244,0.8) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(232, 196, 216, 0.2);
      padding: 2.5rem;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(200, 141, 184, 0.12);
    }
    .hero-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }
    .hero-text { flex: 1; }
    .hero-greeting {
      font-family: 'Poppins', sans-serif;
      font-size: 0.85rem;
      color: var(--mama-lavender-dark);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .hero-name {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--mama-berry);
      letter-spacing: -0.02em;
      margin: 0.25rem 0 0.5rem;
    }
    .hero-subtitle {
      font-size: 0.9rem;
      color: #72243E;
      opacity: 0.7;
      font-weight: 500;
      max-width: 360px;
    }
    .hero-date {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 1rem;
      padding: 0.4rem 1rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.6);
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--mama-lavender-dark);
      border: 1px solid rgba(232, 196, 216, 0.2);
    }
    .hero-character {
      position: relative;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .hero-content { flex-direction: column; text-align: center; }
      .hero-character { order: -1; }
      .hero-name { font-size: 1.6rem; }
      .hero-subtitle { margin: 0 auto; }
      .hero-video-container { width: 150px !important; height: 150px !important; }
    }

    /* ─── STAT CARDS ─── */
    .stat-card { cursor: default; }
    .stat-label {
      font-size: 0.78rem;
      color: #8B7B8E;
      font-weight: 500;
      font-family: 'Poppins', sans-serif;
    }
    .stat-value {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-top: 0.25rem;
    }
    .stat-sub {
      font-size: 1rem;
      font-weight: 400;
      opacity: 0.5;
    }
    .stat-hint {
      font-size: 0.7rem;
      color: #C98DB8;
      margin-top: 0.15rem;
    }
    .stat-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 20px rgba(212, 83, 126, 0.2);
      flex-shrink: 0;
    }

    /* ─── SECTION TITLE ─── */
    .section-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      color: var(--mama-berry);
      font-size: 1.05rem;
    }

    /* ─── VIEW ALL LINK ─── */
    .view-all-link {
      color: var(--mama-rose);
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }
    .view-all-link:hover {
      color: var(--mama-rose-deep);
    }

    /* ─── SYMPTOM ROW ─── */
    .symptom-row {
      display: flex;
      align-items: center;
      padding: 0.85rem 1rem;
      border-radius: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .symptom-row:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(200, 141, 184, 0.1);
    }
    .symptom-dot {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.85rem;
      flex-shrink: 0;
    }
    .severity-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
    }

    /* ─── EMPTY STATE ─── */
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #C98DB8;
      font-size: 0.9rem;
    }

    /* ─── ACTION CARDS ─── */
    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.75rem 1rem;
      text-decoration: none;
      cursor: pointer;
      text-align: center;
    }
    .action-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.85rem;
      box-shadow: 0 6px 20px rgba(212, 83, 126, 0.15);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .action-card:hover .action-icon {
      transform: scale(1.12) translateY(-3px);
    }
    .action-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--mama-berry);
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  today = new Date();
  pregnancy: PregnancyProfile | null = null;
  nextAppointment: Appointment | null = null;
  activeMeds: Medication[] = [];
  recentSymptoms: Symptom[] = [];

  progressPercent = 0;
  daysUntilDue = '--';

  // Auto-calculated from LMP and today's date
  calculatedWeek = 0;
  calculatedDay = 0;
  calculatedTrimester = 1;

  firstName = '';
  timeOfDay = 'morning';

  quickActions = [
    { route: '/dashboard/symptoms', icon: 'add_circle', label: 'Log Symptom', gradient: 'linear-gradient(135deg, #D4537E, #993556)' },
    { route: '/dashboard/appointments', icon: 'schedule', label: 'Book Visit', gradient: 'linear-gradient(135deg, #C98DB8, #A85B8F)' },
    { route: '/dashboard/nutrition', icon: 'restaurant_menu', label: 'Meal Plan', gradient: 'linear-gradient(135deg, #F9D4C8, #ED93B1)' },
    { route: '/dashboard/growth', icon: 'trending_up', label: 'Growth Chart', gradient: 'linear-gradient(135deg, #E8C4D8, #C98DB8)' },
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private aiService: AiService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    this.firstName = user?.fullName?.split(' ')[0] || 'there';
    const hour = new Date().getHours();
    if (hour < 12) this.timeOfDay = 'morning';
    else if (hour < 17) this.timeOfDay = 'afternoon';
    else this.timeOfDay = 'evening';

    const userId = user?.id;
    if (!userId) return;

    this.apiService.getPregnancyProfiles(userId).subscribe({
      next: (res) => {
        this.pregnancy = res.content.find(p => p.status === 'ACTIVE') || res.content[0] || null;
        if (this.pregnancy) {
          this.calculateProgress();
        }
      }
    });

    this.apiService.getPatientAppointments(userId).subscribe({
      next: (res) => {
        this.nextAppointment = res.content.find(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED') || null;
      }
    });

    this.apiService.getActiveMedications(userId).subscribe({
      next: (meds) => this.activeMeds = meds
    });

    this.apiService.getSymptoms(userId, 0, 5).subscribe({
      next: (res) => this.recentSymptoms = res.content
    });
  }

  calculateProgress(): void {
    if (!this.pregnancy) return;

    // Auto-calculate week + day from LMP and today's date
    if (this.pregnancy.lastMenstrualPeriod) {
      const lmpDate = new Date(this.pregnancy.lastMenstrualPeriod);
      const today = new Date();
      const totalDays = Math.max(0, Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)));
      this.calculatedWeek = Math.min(Math.floor(totalDays / 7), 42);
      this.calculatedDay = totalDays % 7;
      if (this.calculatedWeek <= 12) this.calculatedTrimester = 1;
      else if (this.calculatedWeek <= 27) this.calculatedTrimester = 2;
      else this.calculatedTrimester = 3;
    }

    const week = this.calculatedWeek;
    this.progressPercent = Math.min(Math.round((week / 40) * 100), 100);

    if (this.pregnancy.expectedDueDate) {
      const due = new Date(this.pregnancy.expectedDueDate);
      const diff = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      this.daysUntilDue = diff > 0 ? diff.toString() : '0';
    }
  }

  getProgressMessage(): string {
    if (!this.pregnancy || this.pregnancy.status !== 'ACTIVE') return 'Start tracking your pregnancy';
    const week = this.calculatedWeek;
    if (week <= 12) return 'First trimester — your baby is forming! 🌱';
    if (week <= 27) return 'Second trimester — feeling those kicks! 💪';
    if (week <= 36) return 'Third trimester — almost there, mama! 🎀';
    return 'Final stretch — baby is coming soon! 🌟';
  }

  getSeverityBg(severity: string): string {
    const map: Record<string, string> = {
      'MILD': 'bg-green-50', 'MODERATE': 'bg-yellow-50', 'SEVERE': 'bg-orange-50', 'CRITICAL': 'bg-red-50'
    };
    return map[severity] || 'bg-gray-50';
  }

  getSeverityDot(severity: string): string {
    const map: Record<string, string> = {
      'MILD': 'bg-green-400', 'MODERATE': 'bg-yellow-400', 'SEVERE': 'bg-orange-400', 'CRITICAL': 'bg-red-500'
    };
    return map[severity] || 'bg-gray-400';
  }

  getSeverityBadge(severity: string): string {
    const map: Record<string, string> = {
      'MILD': 'bg-green-100 text-green-700', 'MODERATE': 'bg-yellow-100 text-yellow-700',
      'SEVERE': 'bg-orange-100 text-orange-700', 'CRITICAL': 'bg-red-100 text-red-700'
    };
    return map[severity] || '';
  }

}
