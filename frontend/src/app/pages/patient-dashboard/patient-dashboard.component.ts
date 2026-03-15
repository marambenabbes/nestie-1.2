import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AiService } from '../../core/services/ai.service';
import { PregnancyProfile, Appointment, Medication, Symptom } from '../../core/models/models';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Welcome Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-poppins font-bold text-gray-800">
            Hello, {{ (authService.user()?.fullName || '').split(' ')[0] }} 💕
          </h1>
          <p class="text-gray-500 font-poppins">Here's your pregnancy overview</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-400">{{ today | date:'EEE, MMM d, yyyy' }}</p>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Pregnancy Week Card -->
        <mat-card class="!rounded-cute !shadow-card !bg-gradient-to-br !from-mama-pink-light !to-white p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-poppins">Current Week</p>
              <p class="text-3xl font-bold text-mama-rose mt-1">{{ calculatedWeek }}<span class="text-lg font-normal text-mama-rose/60">+{{ calculatedDay }}d</span></p>
              <p class="text-xs text-gray-400 mt-1">Trimester {{ calculatedTrimester }}</p>
            </div>
            <div class="w-14 h-14 rounded-full bg-mama-pink/20 flex items-center justify-center">
              <mat-icon class="text-mama-rose !text-3xl !w-8 !h-8">pregnant_woman</mat-icon>
            </div>
          </div>
        </mat-card>

        <!-- Days to Due Date -->
        <mat-card class="!rounded-cute !shadow-card !bg-gradient-to-br !from-mama-lavender-light !to-white p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-poppins">Days Until Due</p>
              <p class="text-3xl font-bold text-mama-purple mt-1">{{ daysUntilDue }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ pregnancy?.expectedDueDate | date:'MMM d' }}</p>
            </div>
            <div class="w-14 h-14 rounded-full bg-mama-lavender/20 flex items-center justify-center">
              <mat-icon class="text-mama-purple !text-3xl !w-8 !h-8">event</mat-icon>
            </div>
          </div>
        </mat-card>

        <!-- Upcoming Appointments -->
        <mat-card class="!rounded-cute !shadow-card !bg-gradient-to-br !from-mama-peach-light !to-white p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-poppins">Next Appointment</p>
              <p class="text-lg font-bold text-orange-600 mt-1">{{ nextAppointment?.appointmentDate | date:'MMM d' }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ nextAppointment?.type || 'None scheduled' }}</p>
            </div>
            <div class="w-14 h-14 rounded-full bg-mama-peach/20 flex items-center justify-center">
              <mat-icon class="text-orange-500 !text-3xl !w-8 !h-8">calendar_today</mat-icon>
            </div>
          </div>
        </mat-card>

        <!-- Active Medications -->
        <mat-card class="!rounded-cute !shadow-card !bg-gradient-to-br !from-green-50 !to-white p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 font-poppins">Active Meds</p>
              <p class="text-3xl font-bold text-green-600 mt-1">{{ activeMeds.length }}</p>
              <p class="text-xs text-gray-400 mt-1">medications</p>
            </div>
            <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <mat-icon class="text-green-600 !text-3xl !w-8 !h-8">medication</mat-icon>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Pregnancy Progress Ring -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <mat-card class="!rounded-cute !shadow-card p-6 lg:col-span-1">
          <h3 class="font-poppins font-semibold text-gray-700 mb-4">Pregnancy Progress 🌸</h3>
          <div class="flex flex-col items-center">
            <svg class="progress-ring w-40 h-40" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#fce4ec" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#gradient)" stroke-width="10"
                      stroke-linecap="round"
                      [attr.stroke-dasharray]="circumference"
                      [attr.stroke-dashoffset]="progressOffset"
                      transform="rotate(-90 60 60)"
                      class="progress-ring__circle"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#f48fb1"/>
                  <stop offset="100%" stop-color="#ce93d8"/>
                </linearGradient>
              </defs>
              <text x="60" y="55" text-anchor="middle" class="text-2xl font-bold fill-mama-rose" font-family="Poppins">
                {{ progressPercent }}%
              </text>
              <text x="60" y="72" text-anchor="middle" class="text-xs fill-gray-400" font-family="Poppins">
                Week {{ calculatedWeek }}+{{ calculatedDay }}d / 40
              </text>
            </svg>
            <p class="mt-4 text-sm text-gray-500 text-center">
              {{ getProgressMessage() }}
            </p>
          </div>
        </mat-card>

        <!-- Recent Symptoms -->
        <mat-card class="!rounded-cute !shadow-card p-6 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-poppins font-semibold text-gray-700">Recent Symptoms 📋</h3>
            <a routerLink="/dashboard/symptoms" class="text-mama-rose text-sm hover:underline">View all</a>
          </div>
          <div class="space-y-3" *ngIf="recentSymptoms.length > 0; else noSymptoms">
            <div *ngFor="let symptom of recentSymptoms" class="flex items-center p-3 rounded-xl"
                 [class]="getSeverityBg(symptom.severity)">
              <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                   [class]="getSeverityDot(symptom.severity)">
                <mat-icon class="!text-lg text-white">{{ symptom.flaggedByAI ? 'warning' : 'monitor_heart' }}</mat-icon>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-700 text-sm">{{ symptom.symptomName }}</p>
                <p class="text-xs text-gray-400">{{ symptom.occurredAt | date:'short' }} · Week {{ symptom.pregnancyWeek }}</p>
              </div>
              <span class="text-xs font-medium px-2 py-1 rounded-full" [class]="getSeverityBadge(symptom.severity)">
                {{ symptom.severity }}
              </span>
            </div>
          </div>
          <ng-template #noSymptoms>
            <p class="text-gray-400 text-center py-8">No symptoms logged yet 😊</p>
          </ng-template>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a *ngFor="let action of quickActions" [routerLink]="action.route"
           class="mama-card flex flex-col items-center py-6 cursor-pointer text-center hover:shadow-hover">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3" [style.background]="action.bg">
            <mat-icon [style.color]="action.color">{{ action.icon }}</mat-icon>
          </div>
          <span class="text-sm font-medium text-gray-600">{{ action.label }}</span>
        </a>
      </div>

    </div>
  `
})
export class PatientDashboardComponent implements OnInit {
  today = new Date();
  pregnancy: PregnancyProfile | null = null;
  nextAppointment: Appointment | null = null;
  activeMeds: Medication[] = [];
  recentSymptoms: Symptom[] = [];

  circumference = 2 * Math.PI * 50;
  progressPercent = 0;
  progressOffset = this.circumference;
  daysUntilDue = '--';

  // Auto-calculated from LMP and today's date
  calculatedWeek = 0;
  calculatedDay = 0;
  calculatedTrimester = 1;

  quickActions = [
    { route: '/dashboard/symptoms', icon: 'add_circle', label: 'Log Symptom', bg: '#fce4ec', color: '#e91e63' },
    { route: '/dashboard/appointments', icon: 'schedule', label: 'Book Visit', bg: '#f3e5f5', color: '#9c27b0' },
    { route: '/dashboard/nutrition', icon: 'restaurant_menu', label: 'Meal Plan', bg: '#fbe9e7', color: '#ff5722' },
    { route: '/dashboard/growth', icon: 'trending_up', label: 'Growth Chart', bg: '#e8f5e9', color: '#4caf50' },
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private aiService: AiService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.user()?.id;
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
    this.progressOffset = this.circumference - (this.progressPercent / 100) * this.circumference;

    if (this.pregnancy.expectedDueDate) {
      const due = new Date(this.pregnancy.expectedDueDate);
      const diff = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      this.daysUntilDue = diff > 0 ? diff.toString() : '0';
    }
  }

  getProgressMessage(): string {
    if (!this.pregnancy || this.pregnancy.status !== 'ACTIVE') return 'Start tracking your pregnancy';
    const week = this.pregnancy.currentWeek || 0;
    if (week <= 12) return 'First trimester — your baby is forming! 🌱 (Week ' + this.calculatedWeek + '+' + this.calculatedDay + 'd)';
    if (week <= 27) return 'Second trimester — feeling those kicks! 💪 (Week ' + this.calculatedWeek + '+' + this.calculatedDay + 'd)';
    if (week <= 36) return 'Third trimester — almost there, mama! 🎀 (Week ' + this.calculatedWeek + '+' + this.calculatedDay + 'd)';
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
