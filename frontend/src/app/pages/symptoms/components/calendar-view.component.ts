import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Symptom } from '../../../core/models/models';

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
  isoDate: string;
  count: number;
  maxSeverityWeight: number;
};

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('cellReveal', [
      transition('* => *', [
        query('.calendar-cell', [
          style({ opacity: 0, transform: 'scale(0.85)' }),
          stagger(15, [
            animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 border border-pink-100/60 shadow-lg p-5 overflow-hidden">
      <div class="flex items-center justify-between mb-5">
        <button
          type="button"
          class="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
          (click)="changeMonth(-1)"
          aria-label="Previous month"
        >
          <mat-icon class="!text-[20px] text-rose-400">chevron_left</mat-icon>
        </button>

        <h3 class="text-lg font-poppins font-semibold text-rose-500 tracking-wide">
          {{ viewDate | date:'MMMM y' }}
        </h3>

        <button
          type="button"
          class="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
          (click)="changeMonth(1)"
          aria-label="Next month"
        >
          <mat-icon class="!text-[20px] text-rose-400">chevron_right</mat-icon>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        <div *ngFor="let day of weekDays" class="text-center py-2">{{ day }}</div>
      </div>

      <div [@cellReveal] class="grid grid-cols-7 gap-2" (click)="$event.stopPropagation()">
        <button
          type="button"
          *ngFor="let cell of calendarCells; trackBy: trackByDate"
          class="calendar-cell relative min-h-[80px] rounded-2xl border transition-all duration-200 p-2 text-left cursor-pointer"
          [ngClass]="getCellClasses(cell)"
          [style.animation-delay]="getCellDelay(cell) + 'ms'"
          [@fadeSlideIn]
          (click)="selectDate(cell.date)"
        >
          <span
            class="text-sm font-semibold transition-colors duration-200"
            [ngClass]="cell.inCurrentMonth ? 'text-gray-700' : 'text-gray-300'"
          >
            {{ cell.date.getDate() }}
          </span>

          <div class="absolute bottom-2 left-2 right-2 flex flex-col items-center gap-1" *ngIf="cell.count > 0">
            <div class="flex items-center gap-1">
              <span
                class="w-2.5 h-2.5 rounded-full shadow-sm transition-transform duration-200 hover:scale-125"
                [ngClass]="severityDotClass(cell.maxSeverityWeight)"
              ></span>
              <span class="text-[11px] font-semibold text-gray-500">{{ cell.count }}</span>
            </div>
          </div>

          <span
            *ngIf="isToday(cell.date)"
            class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white text-[9px] font-bold shadow-sm"
          >
            Today
          </span>
        </button>
      </div>

      <div class="mt-5 flex items-center justify-center gap-5 text-xs text-gray-500">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm"></span>
          <span>Mild</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></span>
          <span>Moderate</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></span>
          <span>Severe</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  `
})
export class CalendarViewComponent implements OnChanges {
  @Input() symptoms: Symptom[] = [];
  @Input() selectedDate: Date = new Date();

  @Output() dateSelected = new EventEmitter<Date>();

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  viewDate = new Date();
  calendarCells: CalendarCell[] = [];

  ngOnChanges(): void {
    if (this.selectedDate) {
      this.viewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    }
    this.rebuildCalendar();
  }

  trackByDate(_: number, cell: CalendarCell): string {
    return cell.isoDate;
  }

  getCellDelay(cell: CalendarCell): number {
    const day = cell.date.getDate();
    return (day % 10) * 25;
  }

  changeMonth(offset: number): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + offset, 1);
    this.rebuildCalendar();
  }

  selectDate(date: Date): void {
    this.dateSelected.emit(new Date(date));
  }

  private rebuildCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells: CalendarCell[] = [];

    for (let i = 0; i < startWeekday; i++) {
      const d = new Date(year, month, i - startWeekday + 1);
      cells.push(this.buildCell(d, false));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push(this.buildCell(d, true));
    }

    while (cells.length % 7 !== 0) {
      const d = new Date(year, month, daysInMonth + (cells.length % 7) + 1);
      cells.push(this.buildCell(d, false));
    }

    this.calendarCells = cells;
  }

  private buildCell(date: Date, inCurrentMonth: boolean): CalendarCell {
    const isoDate = this.toIsoDate(date);
    const symptoms = this.symptoms.filter(s => this.toIsoDate(new Date(s.occurredAt)) === isoDate);

    return {
      date,
      inCurrentMonth,
      isoDate,
      count: symptoms.length,
      maxSeverityWeight: symptoms.reduce((max, s) => Math.max(max, this.severityWeight(s.severity)), 0)
    };
  }

  // Severity weight powers the day indicator color intensity.
  private severityWeight(severity: Symptom['severity']): number {
    const map: Record<Symptom['severity'], number> = {
      MILD: 1,
      MODERATE: 2,
      SEVERE: 3,
      CRITICAL: 4
    };
    return map[severity] ?? 1;
  }

  severityDotClass(weight: number): string {
    if (weight >= 4) return 'bg-rose-500';
    if (weight === 3) return 'bg-orange-500';
    if (weight === 2) return 'bg-amber-400';
    return 'bg-emerald-400';
  }

  getCellClasses(cell: CalendarCell): string {
    const isSelected = this.toIsoDate(this.selectedDate) === cell.isoDate;
    const hasSymptoms = cell.count > 0;

    if (isSelected) {
      return 'border-rose-400 bg-white shadow-lg ring-2 ring-rose-200 scale-[1.02]';
    }

    if (!cell.inCurrentMonth) {
      return 'border-transparent bg-white/30';
    }

    if (hasSymptoms) {
      return 'border-pink-200 bg-white/90 hover:border-pink-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer';
    }

    return 'border-white/60 bg-white/80 hover:border-pink-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer';
  }

  isToday(date: Date): boolean {
    return this.toIsoDate(date) === this.toIsoDate(new Date());
  }

  private toIsoDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }
}
