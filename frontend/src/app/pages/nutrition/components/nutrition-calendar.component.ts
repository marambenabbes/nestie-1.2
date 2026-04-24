import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type NutritionEntry = {
  mealName: string;
  mealType: string;
  scheduledDate: string;
  calories?: number;
};

type CalendarCell = {
  date: Date;
  inCurrentMonth: boolean;
  isoDate: string;
  count: number;
  totalCalories: number;
};

@Component({
  selector: 'app-nutrition-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="rounded-3xl bg-gradient-to-br from-orange-50 via-pink-50 to-fuchsia-50 border border-pink-100/60 shadow-lg p-5">
      <div class="flex items-center justify-between mb-5">
        <button type="button" class="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-sm transition hover:shadow-md" (click)="changeMonth(-1)">
          <mat-icon class="!text-[18px] text-mama-rose">chevron_left</mat-icon>
        </button>
        <h3 class="text-base font-semibold text-gray-700">{{ viewDate | date:'MMMM y' }}</h3>
        <button type="button" class="w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-sm transition hover:shadow-md" (click)="changeMonth(1)">
          <mat-icon class="!text-[18px] text-mama-rose">chevron_right</mat-icon>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wide text-center text-gray-400">
        <div *ngFor="let day of weekDays">{{ day }}</div>
      </div>

      <div class="grid grid-cols-7 gap-1.5">
        <button
          type="button"
          *ngFor="let cell of calendarCells; trackBy: trackByDate"
          class="relative min-h-[70px] rounded-2xl border transition-all duration-200 p-1.5 text-left cursor-pointer"
          [ngClass]="getCellClasses(cell)"
          (click)="selectDate(cell.date)"
        >
          <span class="text-sm font-semibold" [ngClass]="cell.inCurrentMonth ? 'text-gray-700' : 'text-gray-300'">
            {{ cell.date.getDate() }}
          </span>
          <div class="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5" *ngIf="cell.count > 0">
            <div class="w-5 h-5 rounded-full bg-gradient-to-br from-mama-peach to-mama-pink flex items-center justify-center shadow-sm">
              <span class="text-[9px] font-bold text-white">{{ cell.count }}</span>
            </div>
            <span class="text-[9px] text-gray-400">{{ cell.totalCalories }} kcal</span>
          </div>
          <span *ngIf="isToday(cell.date)" class="absolute top-1 right-1 px-1 py-0.5 rounded-full bg-mama-rose text-white text-[8px] font-bold">Today</span>
        </button>
      </div>

      <div class="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-gradient-to-br from-mama-peach to-mama-pink"></div>
          <span>Meal logged</span>
        </div>
      </div>
    </div>
  `
})
export class NutritionCalendarComponent implements OnChanges {
  @Input() entries: NutritionEntry[] = [];
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
    const dayEntries = this.entries.filter(e => e.scheduledDate === isoDate);

    return {
      date,
      inCurrentMonth,
      isoDate,
      count: dayEntries.length,
      totalCalories: dayEntries.reduce((sum, e) => sum + (e.calories || 0), 0)
    };
  }

  getCellClasses(cell: CalendarCell): string {
    const isSelected = this.toIsoDate(this.selectedDate) === cell.isoDate;

    if (isSelected) {
      return 'border-mama-rose bg-white shadow-lg ring-2 ring-mama-pink/30';
    }
    if (!cell.inCurrentMonth) {
      return 'border-transparent bg-white/30';
    }
    if (cell.count > 0) {
      return 'border-mama-pink/30 bg-white/90 hover:border-mama-pink/50 hover:shadow-md';
    }
    return 'border-gray-100 bg-white/80 hover:border-gray-200 hover:shadow-sm';
  }

  isToday(date: Date): boolean {
    return this.toIsoDate(date) === this.toIsoDate(new Date());
  }

  private toIsoDate(date: Date): string {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
}
