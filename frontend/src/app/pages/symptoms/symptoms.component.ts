import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Symptom } from '../../core/models/models';
import { SymptomCalendarComponent } from './components/symptom-calendar.component';
import { DayModalComponent } from './components/day-modal.component';
import { StatsDashboardComponent } from './components/stats-dashboard.component';

@Component({
  selector: 'app-symptoms',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    SymptomCalendarComponent,
    DayModalComponent,
    StatsDashboardComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="rounded-3xl p-6 bg-gradient-to-r from-rose-100 via-pink-100 to-fuchsia-100 border border-pink-100/60 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-poppins font-bold text-rose-500">Symptoms Calendar & Insights</h1>
            <p class="text-sm text-rose-300 mt-1">Track your day, discover trends, and manage symptoms from one view.</p>
          </div>
          <button
            mat-raised-button
            (click)="openToday()"
            class="!rounded-full !bg-gradient-to-r !from-rose-400 !to-fuchsia-400 !text-white hover:scale-[1.02] transition"
          >
            <mat-icon>add</mat-icon>
            Log Today
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div class="rounded-3xl bg-rose-50 p-6 border border-rose-100 animate-pulse min-h-[420px]"></div>
        <div class="rounded-3xl bg-rose-50 p-6 border border-rose-100 animate-pulse min-h-[420px]"></div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <app-symptom-calendar
          [entries]="symptomCalendarEntries"
          [selectedDate]="selectedDate"
          (dateSelected)="onDateSelected($event)"
        ></app-symptom-calendar>

        <mat-card class="!rounded-3xl p-5 !shadow-lg border border-rose-100/60 bg-white/95">
          <h3 class="font-semibold text-rose-500">Selected Day</h3>
          <p class="text-sm text-rose-300 mt-1">{{ selectedDate | date:'EEEE, MMM d, y' }}</p>

          <div class="mt-4 rounded-2xl bg-rose-50 border border-rose-100 p-4">
            <p class="text-xs uppercase tracking-wide text-rose-300">Entries</p>
            <p class="text-3xl font-bold text-rose-500 mt-1">{{ selectedDaySymptoms.length }}</p>
          </div>

          <button
            mat-raised-button
            class="w-full mt-4 !rounded-full !bg-gradient-to-r !from-rose-400 !to-fuchsia-400 !text-white"
            (click)="dayModalOpen = true"
          >
            <mat-icon>event_note</mat-icon>
            Open Day Details
          </button>

          <div class="mt-5 space-y-2 max-h-64 overflow-y-auto pr-1" *ngIf="selectedDaySymptoms.length > 0; else noDaySymptoms">
            <div *ngFor="let symptom of selectedDaySymptoms" class="rounded-xl border border-rose-100 p-3 bg-rose-50/50">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-gray-700">{{ symptom.symptomName }}</p>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getSeverityBadge(symptom.severity)">
                  {{ symptom.severity }}
                </span>
              </div>
              <p class="text-xs text-rose-300 mt-1">{{ symptom.occurredAt | date:'shortTime' }}</p>
            </div>
          </div>
          <ng-template #noDaySymptoms>
            <div class="mt-5 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-5 text-center">
              <div class="text-4xl">🫧</div>
              <p class="text-sm text-rose-400 mt-2">No symptoms recorded for this day</p>
            </div>
          </ng-template>
        </mat-card>
      </div>

      <mat-card class="!rounded-3xl p-5 !shadow-lg border border-rose-100/60 bg-white/95">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-rose-500">Statistics Dashboard</h3>
          <div class="flex items-center gap-2 text-sm text-rose-300">
            <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
            <span>{{ loading ? 'Calculating...' : 'Updated' }}</span>
          </div>
        </div>
        <app-stats-dashboard [symptoms]="symptoms" [loading]="loading"></app-stats-dashboard>
      </mat-card>

      <mat-card class="!rounded-3xl p-5 !shadow-md border border-rose-100/60 bg-white/95">
        <h3 class="text-lg font-semibold text-rose-500 mb-4">Recent Timeline</h3>

        <div class="relative" *ngIf="symptoms.length > 0; else noSymptomsEver">
          <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-rose-100"></div>
          <div *ngFor="let symptom of recentSymptoms" class="relative pl-16 pb-5">
            <div class="absolute left-4 w-5 h-5 rounded-full border-2 border-white shadow-sm" [class]="getSeverityDot(symptom.severity)"></div>
            <div class="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 hover:shadow-md transition">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h4 class="font-semibold text-gray-700">{{ symptom.symptomName }}</h4>
                  <p class="text-xs text-rose-300 mt-1">{{ symptom.occurredAt | date:'medium' }} · Week {{ symptom.pregnancyWeek || '-' }}</p>
                  <p *ngIf="symptom.description" class="text-sm text-gray-500 mt-2">{{ symptom.description }}</p>
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded-full" [class]="getSeverityBadge(symptom.severity)">
                  {{ symptom.severity }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noSymptomsEver>
          <div class="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-8 text-center">
            <div class="text-5xl">🌷</div>
            <p class="text-rose-400 font-semibold mt-2">No symptoms recorded</p>
            <p class="text-sm text-rose-300 mt-1">Start by logging today's symptoms from the calendar.</p>
          </div>
        </ng-template>
      </mat-card>

      <app-day-modal
        [open]="dayModalOpen"
        [selectedDate]="selectedDate"
        [daySymptoms]="selectedDaySymptoms"
        [saving]="saving"
        (close)="dayModalOpen = false"
        (create)="createFromDay($event)"
        (update)="updateFromDay($event.id, $event.payload)"
        (delete)="deleteSymptom($event)"
      ></app-day-modal>
    </div>
  `
})
export class SymptomsComponent implements OnInit {
  symptoms: Symptom[] = [];
  loading = false;
  saving = false;
  selectedDate = new Date();
  dayModalOpen = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSymptoms();
  }

  get selectedDaySymptoms(): Symptom[] {
    const selected = this.toIsoDate(this.selectedDate);
    return this.symptoms
      .filter(s => this.toIsoDate(new Date(s.occurredAt)) === selected)
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  }

  get recentSymptoms(): Symptom[] {
    return [...this.symptoms]
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 6);
  }

  get symptomCalendarEntries(): { id?: number; symptomName: string; severity: string; occurredAt: string }[] {
    return this.symptoms.map(s => ({
      id: s.id,
      symptomName: s.symptomName,
      severity: s.severity,
      occurredAt: s.occurredAt
    }));
  }

  loadSymptoms(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.loading = true;
      this.apiService.getSymptoms(userId, 0, 200).subscribe({
        next: (res) => {
          this.symptoms = res.content || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to load symptoms', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.dayModalOpen = true;
  }

  openToday(): void {
    this.selectedDate = new Date();
    this.dayModalOpen = true;
  }

  createFromDay(payload: any): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this.saving = true;
    const normalized = this.ensureDateInPayload(payload);

    this.apiService.createSymptom(userId, normalized).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Symptom logged successfully! 💊', 'Close', { duration: 3000 });
        this.loadSymptoms();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save symptom', 'Close', { duration: 3000 });
      }
    });
  }

  updateFromDay(id: number, payload: any): void {
    if (!id) return;
    this.saving = true;

    this.apiService.updateSymptom(id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Symptom updated! ✏️', 'Close', { duration: 3000 });
        this.loadSymptoms();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to update symptom', 'Close', { duration: 3000 });
      }
    });
  }

  deleteSymptom(id: number): void {
    if (!id || !confirm('Delete this symptom?')) return;
    this.apiService.deleteSymptom(id).subscribe({
      next: () => {
        this.snackBar.open('Symptom deleted 🗑️', 'Close', { duration: 2000 });
        this.loadSymptoms();
      },
      error: () => this.snackBar.open('Failed to delete symptom', 'Close', { duration: 3000 })
    });
  }

  // If the modal form starts empty, attach the currently selected day as default timestamp.
  private ensureDateInPayload(payload: any): any {
    if (payload?.occurredAt) return payload;

    const d = new Date(this.selectedDate);
    d.setHours(12, 0, 0, 0);
    return {
      ...payload,
      occurredAt: d.toISOString().slice(0, 16)
    };
  }

  private toIsoDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  getSeverityDot(severity: string): string {
    const map: Record<string, string> = { MILD: 'bg-emerald-400', MODERATE: 'bg-amber-400', SEVERE: 'bg-orange-500', CRITICAL: 'bg-rose-500' };
    return map[severity] || 'bg-gray-400';
  }
  getSeverityBadge(severity: string): string {
    const map: Record<string, string> = { MILD: 'bg-emerald-100 text-emerald-700', MODERATE: 'bg-amber-100 text-amber-700', SEVERE: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-rose-100 text-rose-700' };
    return map[severity] || '';
  }
}
