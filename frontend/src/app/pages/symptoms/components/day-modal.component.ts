import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Symptom } from '../../../core/models/models';
import { SymptomFormComponent } from './symptom-form.component';

@Component({
  selector: 'app-day-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    SymptomFormComponent
  ],
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px) scale(0.98)' }))
      ])
    ]),
    trigger('listStagger', [
      transition(':enter', [
        query('.symptom-item', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(80, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div
      *ngIf="open"
      [@backdropFade]
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8 md:pt-12"
      aria-modal="true"
      role="dialog"
    >
      <button class="absolute inset-0 bg-black/30 backdrop-blur-[2px]" (click)="close.emit()" aria-label="Close"></button>

      <mat-card [@modalSlide] class="relative w-full max-w-3xl !rounded-3xl !shadow-2xl p-0 overflow-hidden">
        <div class="bg-gradient-to-r from-rose-100 via-pink-100 to-fuchsia-100 px-6 py-5 border-b border-rose-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                <mat-icon class="text-rose-400">calendar_today</mat-icon>
              </div>
              <div>
                <p class="text-xs uppercase tracking-widest text-rose-400 font-semibold">Symptoms on</p>
                <h3 class="text-xl font-poppins font-semibold text-rose-500">{{ selectedDate | date:'EEEE, MMM d, y' }}</h3>
              </div>
            </div>
            <button
              mat-icon-button
              (click)="close.emit()"
              class="!text-rose-400 hover:!bg-rose-100 transition-colors"
              aria-label="Close modal"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <div #modalBody class="modal-scroll-content p-6 max-h-[70vh] overflow-y-auto">
          <div *ngIf="!showForm" class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-rose-500 flex items-center gap-2">
              <mat-icon class="text-rose-300">list_alt</mat-icon>
              Day Entries
            </h4>
            <button
              mat-raised-button
              class="!rounded-full !bg-gradient-to-r !from-rose-400 !to-fuchsia-400 !text-white hover:scale-105 transition-transform"
              (click)="openCreate()"
            >
              <mat-icon class="mr-1">add</mat-icon>
              Add Symptom
            </button>
          </div>

          <div *ngIf="daySymptoms.length === 0 && !showForm" [@modalSlide] class="rounded-2xl border border-dashed border-rose-200 bg-gradient-to-b from-rose-50 to-white p-8 text-center">
            <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-fuchsia-100 flex items-center justify-center shadow-lg mb-4">
              <mat-icon class="!text-4xl text-rose-300">spa</mat-icon>
            </div>
            <p class="text-rose-400 font-semibold text-lg">No symptoms recorded</p>
            <p class="text-sm text-rose-300 mt-2">Tap "Add Symptom" to start tracking this day.</p>
          </div>

          <div [@listStagger] *ngIf="!showForm && daySymptoms.length > 0" class="space-y-3">
            <div
              *ngFor="let symptom of daySymptoms; trackBy: trackById"
              class="symptom-item rounded-2xl bg-white border border-rose-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" [ngClass]="severityDot(symptom.severity)"></span>
                    <p class="font-semibold text-gray-700">{{ symptom.symptomName }}</p>
                  </div>
                  <p class="text-xs text-rose-300 mt-1 ml-5">{{ symptom.occurredAt | date:'shortTime' }} · Week {{ symptom.pregnancyWeek || '-' }}</p>
                  <p *ngIf="symptom.description" class="text-sm text-gray-500 mt-2 ml-5">{{ symptom.description }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-xs font-medium px-2.5 py-1 rounded-full" [ngClass]="severityBadge(symptom.severity)">
                    {{ symptom.severity }}
                  </span>
                  <button mat-icon-button matTooltip="Edit" (click)="openEdit(symptom)" class="!text-rose-300 hover:!text-rose-500">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete" (click)="delete.emit(symptom.id)" class="!text-rose-300 hover:!text-red-500">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="showForm" #formContainer class="form-container-scroll rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/50 to-white p-5 mt-4 animate-fade-in">
            <h5 class="font-semibold text-rose-500 mb-4 flex items-center gap-2">
              <mat-icon class="text-rose-300">{{ editingSymptom ? 'edit' : 'add' }}</mat-icon>
              {{ editingSymptom ? 'Edit symptom' : 'Add symptom' }}
            </h5>
            <app-symptom-form
              [loading]="saving"
              [submitLabel]="editingSymptom ? 'Update Symptom' : 'Save Symptom'"
              [initialValue]="formSeed"
              (save)="submitForm($event)"
              (cancel)="cancelForm()"
            ></app-symptom-form>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class DayModalComponent implements OnChanges, AfterViewInit {
  @ViewChild('formContainer') formContainer!: ElementRef;
  @ViewChild('modalBody') modalBody!: ElementRef;
  @Input() open = false;
  @Input() selectedDate: Date = new Date();
  @Input() daySymptoms: Symptom[] = [];
  @Input() saving = false;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();
  @Output() update = new EventEmitter<{ id: number; payload: any }>();
  @Output() delete = new EventEmitter<number>();

  showForm = false;
  editingSymptom: Symptom | null = null;
  formSeed: Partial<Symptom> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.resetState();
    }
    if (changes['selectedDate'] && this.open && !this.showForm) {
      this.resetState();
    }
  }

  ngAfterViewInit(): void {}

  openCreate(): void {
    this.editingSymptom = null;
    this.showForm = true;

    const date = new Date(this.selectedDate);
    date.setHours(12, 0, 0, 0);

    this.formSeed = {
      severity: 'MILD',
      occurredAt: date.toISOString().substring(0, 16),
      description: ''
    };

    this.scrollModalToTop();
  }

  openEdit(symptom: Symptom): void {
    this.editingSymptom = symptom;
    this.showForm = true;
    this.formSeed = symptom;
    this.scrollModalToTop();
  }

  submitForm(payload: any): void {
    if (this.editingSymptom) {
      this.update.emit({ id: this.editingSymptom.id, payload });
      return;
    }
    this.create.emit(payload);
  }

  cancelForm(): void {
    this.resetState();
  }

  private resetState(): void {
    this.showForm = false;
    this.editingSymptom = null;
    this.formSeed = null;
  }

  private scrollModalToTop(): void {
    setTimeout(() => {
      if (this.modalBody?.nativeElement) {
        this.modalBody.nativeElement.scrollTop = 0;
      }
    }, 0);
  }

  trackById(_: number, symptom: Symptom): number {
    return symptom.id;
  }

  severityDot(severity: Symptom['severity']): string {
    const map: Record<Symptom['severity'], string> = {
      MILD: 'bg-emerald-400',
      MODERATE: 'bg-amber-400',
      SEVERE: 'bg-orange-500',
      CRITICAL: 'bg-rose-500'
    };
    return map[severity] || 'bg-gray-400';
  }

  severityBadge(severity: Symptom['severity']): string {
    const map: Record<Symptom['severity'], string> = {
      MILD: 'bg-emerald-100 text-emerald-700',
      MODERATE: 'bg-amber-100 text-amber-700',
      SEVERE: 'bg-orange-100 text-orange-700',
      CRITICAL: 'bg-rose-100 text-rose-700'
    };
    return map[severity] || 'bg-gray-100 text-gray-700';
  }
}