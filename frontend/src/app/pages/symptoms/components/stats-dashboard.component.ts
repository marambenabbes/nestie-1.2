import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import { Chart } from 'chart.js';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Symptom } from '../../../core/models/models';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, NgChartsModule],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('chartReveal', [
      transition(':enter', [
        query('.chart-card', [
          style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
          stagger(120, [
            animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <mat-card class="!rounded-3xl !shadow-lg p-6 bg-gradient-to-br from-white via-rose-50 to-pink-50 border border-pink-100/50 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-fuchsia-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-pink-200/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
              <mat-icon class="text-white text-2xl">analytics</mat-icon>
            </div>
            <div class="flex-1">
              <p class="text-xs uppercase tracking-widest text-rose-400 font-bold">Total Entries</p>
              <h4 class="text-4xl font-bold text-gray-800 mt-1">{{ totalEntries }}</h4>
              <p class="text-xs text-rose-300 mt-1">symptoms logged</p>
            </div>
          </div>
        </mat-card>

        <mat-card class="!rounded-3xl !shadow-lg p-6 bg-gradient-to-br from-white via-fuchsia-50 to-purple-50 border border-fuchsia-100/50 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fuchsia-200/30 to-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-fuchsia-200/20 to-purple-200/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-purple-500 flex items-center justify-center shadow-lg">
              <mat-icon class="text-white text-2xl">speed</mat-icon>
            </div>
            <div class="flex-1">
              <p class="text-xs uppercase tracking-widest text-fuchsia-400 font-bold">Avg Intensity</p>
              <h4 class="text-4xl font-bold text-gray-800 mt-1">{{ averageIntensity | number:'1.1-2' }}</h4>
              <div class="flex items-center gap-1 mt-1">
                <div class="flex gap-0.5">
                  <span class="w-2 h-2 rounded-full" [ngClass]="averageIntensity >= 1 ? 'bg-emerald-400' : 'bg-gray-200'"></span>
                  <span class="w-2 h-2 rounded-full" [ngClass]="averageIntensity >= 2 ? 'bg-amber-400' : 'bg-gray-200'"></span>
                  <span class="w-2 h-2 rounded-full" [ngClass]="averageIntensity >= 3 ? 'bg-orange-400' : 'bg-gray-200'"></span>
                  <span class="w-2 h-2 rounded-full" [ngClass]="averageIntensity >= 4 ? 'bg-rose-400' : 'bg-gray-200'"></span>
                </div>
                <span class="text-xs text-fuchsia-300">/4</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="!rounded-3xl !shadow-lg p-6 bg-gradient-to-br from-white via-pink-50 to-rose-50 border border-pink-100/50 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/20 to-rose-200/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div class="relative flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
              <mat-icon class="text-white text-2xl">favorite</mat-icon>
            </div>
            <div class="flex-1">
              <p class="text-xs uppercase tracking-widest text-pink-400 font-bold">Most Frequent</p>
              <h4 class="text-2xl font-bold text-gray-800 mt-1 truncate">{{ topSymptom || '---' }}</h4>
              <p class="text-xs text-pink-300 mt-1">top symptom</p>
            </div>
          </div>
        </mat-card>
      </div>

      <div *ngIf="loading" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="rounded-3xl bg-gradient-to-br from-rose-50/50 to-white p-6 border border-rose-100/40 h-72 animate-pulse"></div>
        <div class="rounded-3xl bg-gradient-to-br from-fuchsia-50/50 to-white p-6 border border-fuchsia-100/40 h-72 animate-pulse"></div>
        <div class="rounded-3xl bg-gradient-to-br from-pink-50/50 to-white p-6 border border-pink-100/40 h-56 animate-pulse xl:col-span-2"></div>
      </div>

      <div *ngIf="!loading && symptoms.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <mat-card class="!rounded-3xl !shadow-xl p-6 bg-gradient-to-br from-white to-rose-50/30 border border-rose-100/40 hover:shadow-2xl transition-shadow duration-300">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center shadow-md">
                <mat-icon class="text-white">show_chart</mat-icon>
              </div>
              <div>
                <h5 class="font-bold text-gray-800">Symptom Frequency</h5>
                <p class="text-xs text-rose-400">Over time</p>
              </div>
            </div>
            <div class="px-3 py-1 rounded-full bg-rose-100 text-rose-500 text-xs font-semibold">
              {{ totalEntries }} entries
            </div>
          </div>
          <div class="h-56">
            <canvas baseChart [data]="frequencyChartData" [options]="lineOptions" [type]="lineType"></canvas>
          </div>
        </mat-card>

        <mat-card class="!rounded-3xl !shadow-xl p-6 bg-gradient-to-br from-white to-fuchsia-50/30 border border-fuchsia-100/40 hover:shadow-2xl transition-shadow duration-300">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-400 to-purple-400 flex items-center justify-center shadow-md">
                <mat-icon class="text-white">bar_chart</mat-icon>
              </div>
              <div>
                <h5 class="font-bold text-gray-800">Avg Intensity</h5>
                <p class="text-xs text-fuchsia-400">Per symptom</p>
              </div>
            </div>
            <div class="px-3 py-1 rounded-full bg-fuchsia-100 text-fuchsia-500 text-xs font-semibold">
              {{ averageIntensity | number:'1.1-2' }} avg
            </div>
          </div>
          <div class="h-56">
            <canvas baseChart [data]="intensityChartData" [options]="barOptions" [type]="barType"></canvas>
          </div>
        </mat-card>

        <mat-card class="!rounded-3xl !shadow-xl p-6 bg-gradient-to-br from-white to-pink-50/30 border border-pink-100/40 hover:shadow-2xl transition-shadow duration-300 xl:col-span-2">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center shadow-md">
                <mat-icon class="text-white">calendar_view_month</mat-icon>
              </div>
              <div>
                <h5 class="font-bold text-gray-800">Weekly Pattern</h5>
                <p class="text-xs text-pink-400">Symptom distribution</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-pink-400"></div>
              <span class="text-xs text-gray-500">This week</span>
            </div>
          </div>
          <div class="h-44">
            <canvas baseChart [data]="weeklyTrendData" [options]="weeklyBarOptions" [type]="barType"></canvas>
          </div>
        </mat-card>
      </div>

      <div *ngIf="!loading && symptoms.length === 0" class="rounded-3xl border-2 border-dashed border-rose-200 p-16 text-center bg-gradient-to-b from-rose-50/20 via-white to-pink-50/20 relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-rose-200/20 via-pink-200/20 to-fuchsia-200/20 rounded-full -translate-y-1/2"></div>
        <div class="relative">
          <div class="mx-auto w-36 h-36 rounded-full bg-gradient-to-br from-rose-100 via-pink-100 to-fuchsia-100 flex items-center justify-center shadow-xl mb-6">
            <span class="text-6xl">🌸</span>
          </div>
          <p class="text-rose-500 font-bold text-xl">No symptoms recorded yet</p>
          <p class="text-rose-400 mt-3 max-w-md mx-auto">Start tracking your symptoms to unlock beautiful insights and trends about your pregnancy journey.</p>
          <div class="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-rose-100 to-fuchsia-100 text-rose-500 font-medium shadow-md">
            <mat-icon class="text-sm">lightbulb_outline</mat-icon>
            <span>Tip: Log symptoms daily for best insights</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatsDashboardComponent implements OnChanges {
  @Input() symptoms: Symptom[] = [];
  @Input() loading = false;

  totalEntries = 0;
  averageIntensity = 0;
  topSymptom = '';

  lineType: 'line' = 'line';
  barType: 'bar' = 'bar';

  frequencyChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  intensityChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  weeklyTrendData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(244, 114, 182, 0.1)' } } }
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(192, 132, 252, 0.1)' } } }
  };

  weeklyBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(244, 143, 177, 0.1)' } } }
  };

  ngOnChanges(): void {
    this.rebuildStats();
  }

  private rebuildStats(): void {
    this.totalEntries = this.symptoms.length;
    if (this.symptoms.length === 0) {
      this.averageIntensity = 0;
      this.topSymptom = '';
      this.frequencyChartData = { labels: [], datasets: [] };
      this.intensityChartData = { labels: [], datasets: [] };
      this.weeklyTrendData = { labels: [], datasets: [] };
      return;
    }

    const intensityValues = this.symptoms.map(s => this.severityWeight(s.severity));
    this.averageIntensity = intensityValues.reduce((sum, n) => sum + n, 0) / intensityValues.length;

    const byNameCount = new Map<string, number>();
    const byNameIntensity = new Map<string, { total: number; count: number }>();
    const byDate = new Map<string, number>();
    const byWeekday = new Map<string, number>([['Sun', 0], ['Mon', 0], ['Tue', 0], ['Wed', 0], ['Thu', 0], ['Fri', 0], ['Sat', 0]]);

    for (const s of this.symptoms) {
      byNameCount.set(s.symptomName, (byNameCount.get(s.symptomName) || 0) + 1);
      const existing = byNameIntensity.get(s.symptomName) || { total: 0, count: 0 };
      existing.total += this.severityWeight(s.severity);
      existing.count += 1;
      byNameIntensity.set(s.symptomName, existing);
      const date = new Date(s.occurredAt);
      byDate.set(this.isoDate(date), (byDate.get(this.isoDate(date)) || 0) + 1);
      const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      byWeekday.set(wd, (byWeekday.get(wd) || 0) + 1);
    }

    const top = Array.from(byNameCount.entries()).sort((a, b) => b[1] - a[1])[0];
    this.topSymptom = top?.[0] || '';

    const sortedDates = Array.from(byDate.keys()).sort();
    this.frequencyChartData = {
      labels: sortedDates.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
      datasets: [{ data: sortedDates.map(d => byDate.get(d) || 0), borderColor: '#f472b6', backgroundColor: 'rgba(244, 114, 182, 0.15)', pointBackgroundColor: '#ec4899', fill: true, tension: 0.4, borderWidth: 3 }]
    };

    const symptomNames = Array.from(byNameIntensity.keys());
    this.intensityChartData = {
      labels: symptomNames,
      datasets: [{ data: symptomNames.map(name => { const item = byNameIntensity.get(name)!; return Number((item.total / item.count).toFixed(2)); }), backgroundColor: ['rgba(244, 114, 182, 0.8)', 'rgba(192, 132, 252, 0.8)', 'rgba(249, 168, 212, 0.8)', 'rgba(245, 208, 254, 0.8)'], borderRadius: 12 }]
    };

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.weeklyTrendData = {
      labels: weekdays,
      datasets: [{ data: weekdays.map(day => byWeekday.get(day) || 0), backgroundColor: 'rgba(244, 143, 177, 0.8)', borderRadius: 8 }]
    };
  }

  private severityWeight(severity: Symptom['severity']): number {
    const map: Record<Symptom['severity'], number> = { MILD: 1, MODERATE: 2, SEVERE: 3, CRITICAL: 4 };
    return map[severity] ?? 1;
  }

  private isoDate(date: Date): string {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
}