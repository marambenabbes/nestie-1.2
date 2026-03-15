import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AiService } from '../../core/services/ai.service';
import { BabyGrowth, PregnancyProfile } from '../../core/models/models';

@Component({
  selector: 'app-baby-growth',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-poppins font-bold text-gray-800">Baby Growth Tracking 👶</h1>
        <button mat-raised-button (click)="toggleForm()" [disabled]="!activeProfile"
                class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon> {{ showForm ? 'Cancel' : 'Record Growth' }}
        </button>
      </div>

      <!-- No Pregnancy Profile Warning -->
      <mat-card *ngIf="!loading && !activeProfile" class="!rounded-cute !shadow-card p-6 !bg-mama-peach-light text-center">
        <mat-icon class="!text-4xl text-orange-400">warning</mat-icon>
        <p class="text-gray-600 font-poppins mt-2">Please create a pregnancy profile first to start tracking baby growth.</p>
      </mat-card>

      <!-- Record Growth Form -->
      <mat-card *ngIf="showForm && activeProfile" class="!rounded-cute !shadow-card p-6">
        <h3 class="text-lg font-poppins font-semibold text-mama-rose mb-4 flex items-center">
          <mat-icon class="mr-2">{{ editingId ? 'edit' : 'child_friendly' }}</mat-icon>
          {{ editingId ? 'Edit Growth Record' : 'Record Growth Data' }} (Week {{ activeProfile.currentWeek }})
        </h3>
        <form [formGroup]="growthForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Week Number</mat-label>
              <input matInput type="number" formControlName="weekNumber" min="4" max="42">
              <mat-error>Week number is required (4-42)</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Weight (grams)</mat-label>
              <input matInput type="number" formControlName="weightGrams">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Length (cm)</mat-label>
              <input matInput type="number" formControlName="lengthCm">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Head Circumference (cm)</mat-label>
              <input matInput type="number" formControlName="headCircumferenceCm">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Abdominal Circumference (cm)</mat-label>
              <input matInput type="number" formControlName="abdominalCircumferenceCm">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Heart Rate (BPM)</mat-label>
              <input matInput type="number" formControlName="heartRate">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Recorded Date</mat-label>
              <input matInput type="date" formControlName="recordedDate">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full md:col-span-2">
              <mat-label>Development Notes</mat-label>
              <textarea matInput formControlName="developmentNotes" rows="2" placeholder="Any observations..."></textarea>
            </mat-form-field>
          </div>

          <div class="flex gap-3 justify-end">
            <button mat-button type="button" (click)="resetForm()" class="!rounded-full">Cancel</button>
            <button mat-raised-button type="submit" [disabled]="growthForm.invalid || saving"
                    class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white">
              {{ saving ? 'Saving...' : (editingId ? 'Update Record ✏️' : 'Save Record 📏') }}
            </button>
          </div>
        </form>
      </mat-card>

      <!-- AI Growth Comparison -->
      <mat-card *ngIf="aiComparison" class="!rounded-cute !shadow-card p-6 !bg-gradient-to-br !from-mama-lavender-light !to-white">
        <h3 class="font-poppins font-semibold text-mama-purple mb-4 flex items-center">
          <mat-icon class="mr-2">smart_toy</mat-icon> AI Growth Analysis
          <span class="ml-auto text-xs text-gray-400 font-normal">Week {{ aiComparison.pregnancy_week }}</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <p class="text-3xl mb-1">{{ aiComparison.fruit_comparison }}</p>
          </div>
          <div class="text-center bg-white rounded-xl p-3">
            <p class="text-sm text-gray-500">Baby Weight</p>
            <p class="text-lg font-bold text-mama-rose">{{ aiComparison.baby_weight ?? '--' }}g</p>
            <p *ngIf="aiComparison.weight_percentile" class="text-xs text-gray-400">{{ aiComparison.weight_percentile }}</p>
          </div>
          <div class="text-center bg-white rounded-xl p-3">
            <p class="text-sm text-gray-500">Baby Length</p>
            <p class="text-lg font-bold text-mama-rose">{{ aiComparison.baby_length ?? '--' }}cm</p>
            <p *ngIf="aiComparison.length_percentile" class="text-xs text-gray-400">{{ aiComparison.length_percentile }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 bg-white rounded-xl p-3 mb-2">📊 {{ aiComparison.overall_assessment }}</p>
        <p class="text-sm text-mama-purple bg-mama-lavender-light rounded-xl p-3">🌱 {{ aiComparison.development_notes }}</p>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Growth Cards -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let record of growthRecords" class="!rounded-cute !shadow-card p-5 hover:!shadow-hover transition-all">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-mama-lavender-light flex items-center justify-center mr-3">
                <span class="font-bold text-mama-purple text-sm">W{{ record.weekNumber }}</span>
              </div>
              <div>
                <p class="font-semibold text-gray-700">Week {{ record.weekNumber }}</p>
                <p class="text-xs text-gray-400">{{ record.recordedDate | date:'mediumDate' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <span *ngIf="record.growthPercentile" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {{ record.growthPercentile }}
              </span>
              <button mat-icon-button (click)="compareWithAi(record)" class="!w-8 !h-8" matTooltip="AI Compare">
                <mat-icon class="!text-sm text-mama-lavender hover:text-mama-purple">smart_toy</mat-icon>
              </button>
              <button mat-icon-button (click)="editRecord(record)" class="!w-8 !h-8" matTooltip="Edit">
                <mat-icon class="!text-sm text-mama-lavender hover:text-mama-purple">edit</mat-icon>
              </button>
              <button mat-icon-button (click)="deleteRecord(record.id)" class="!w-8 !h-8" matTooltip="Delete">
                <mat-icon class="!text-sm text-gray-300 hover:text-red-400">delete</mat-icon>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-mama-pink-light rounded-xl p-3 text-center">
              <p class="text-lg font-bold text-mama-rose">{{ record.weightGrams }}g</p>
              <p class="text-xs text-gray-400">Weight</p>
            </div>
            <div class="bg-mama-lavender-light rounded-xl p-3 text-center">
              <p class="text-lg font-bold text-mama-purple">{{ record.lengthCm }}cm</p>
              <p class="text-xs text-gray-400">Length</p>
            </div>
            <div class="bg-mama-peach-light rounded-xl p-3 text-center" *ngIf="record.headCircumferenceCm">
              <p class="text-lg font-bold text-orange-600">{{ record.headCircumferenceCm }}cm</p>
              <p class="text-xs text-gray-400">Head</p>
            </div>
            <div class="bg-red-50 rounded-xl p-3 text-center" *ngIf="record.heartRate">
              <p class="text-lg font-bold text-red-500">{{ record.heartRate }}</p>
              <p class="text-xs text-gray-400">BPM</p>
            </div>
          </div>

          <p *ngIf="record.developmentNotes" class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
            🌱 {{ record.developmentNotes }}
          </p>
          <p *ngIf="record.aiComparison" class="mt-2 text-xs text-mama-purple bg-mama-lavender-light rounded-xl p-3">
            🤖 {{ record.aiComparison }}
          </p>
        </mat-card>
      </div>

      <div *ngIf="!loading && growthRecords.length === 0 && activeProfile" class="text-center py-12">
        <mat-icon class="!text-6xl text-mama-lavender">child_friendly</mat-icon>
        <p class="text-gray-400 font-poppins mt-4">No growth records yet</p>
        <p class="text-gray-300 text-sm mt-1">Click "Record Growth" to start tracking your baby's development!</p>
      </div>
    </div>
  `
})
export class BabyGrowthComponent implements OnInit {
  growthRecords: BabyGrowth[] = [];
  activeProfile: PregnancyProfile | null = null;
  loading = false;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  aiComparison: any = null;
  growthForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {
    this.growthForm = this.fb.group({
      weekNumber: [null, [Validators.required, Validators.min(4), Validators.max(42)]],
      weightGrams: [null],
      lengthCm: [null],
      headCircumferenceCm: [null],
      abdominalCircumferenceCm: [null],
      heartRate: [null],
      recordedDate: [''],
      developmentNotes: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;
    this.loading = true;

    this.apiService.getPregnancyProfiles(userId).subscribe({
      next: (res) => {
        this.activeProfile = res.content.find((p: PregnancyProfile) => p.status === 'ACTIVE') || res.content[0] || null;
        if (this.activeProfile) {
          this.growthForm.patchValue({ weekNumber: this.activeProfile.currentWeek });
          this.apiService.getGrowthRecords(this.activeProfile.id).subscribe({
            next: (records) => {
              this.growthRecords = records;
              this.loading = false;
              if (records.length > 0) {
                this.compareWithAi(records[records.length - 1]);
              }
            },
            error: () => {
              this.loading = false;
              this.snackBar.open('Failed to load growth records', 'Close', { duration: 3000 });
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load pregnancy profile', 'Close', { duration: 3000 });
      }
    });
  }

  toggleForm(): void {
    if (this.showForm) {
      this.resetForm();
    } else {
      this.showForm = true;
    }
  }

  editRecord(record: BabyGrowth): void {
    this.editingId = record.id;
    this.showForm = true;
    this.growthForm.patchValue({
      weekNumber: record.weekNumber,
      weightGrams: record.weightGrams,
      lengthCm: record.lengthCm,
      headCircumferenceCm: record.headCircumferenceCm,
      abdominalCircumferenceCm: record.abdominalCircumferenceCm,
      heartRate: record.heartRate,
      recordedDate: record.recordedDate,
      developmentNotes: record.developmentNotes
    });
  }

  resetForm(): void {
    this.growthForm.reset({ weekNumber: this.activeProfile?.currentWeek });
    this.editingId = null;
    this.showForm = false;
    this.saving = false;
  }

  onSubmit(): void {
    if (this.growthForm.invalid || !this.activeProfile) return;
    this.saving = true;

    const data = {
      ...this.growthForm.value,
      pregnancyId: this.activeProfile.id
    };

    const request$ = this.editingId
      ? this.apiService.updateGrowthRecord(this.editingId, data)
      : this.apiService.createGrowthRecord(data);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Record updated! ✏️' : 'Growth record saved! 📏', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save record', 'Close', { duration: 3000 });
      }
    });
  }

  compareWithAi(record: BabyGrowth): void {
    const payload = {
      pregnancy_week: record.weekNumber,
      weight_grams: record.weightGrams != null ? Number(record.weightGrams) : null,
      length_cm: record.lengthCm != null ? Number(record.lengthCm) : null,
      head_circumference_cm: record.headCircumferenceCm != null ? Number(record.headCircumferenceCm) : null
    };
    this.aiService.compareGrowth(payload).subscribe({
      next: (res) => this.aiComparison = res,
      error: () => this.snackBar.open('Could not fetch AI comparison', 'Close', { duration: 3000 })
    });
  }

  deleteRecord(id: number): void {
    if (!id || !confirm('Delete this growth record?')) return;
    this.apiService.deleteGrowthRecord(id).subscribe({
      next: () => {
        this.snackBar.open('Record removed 🗑️', 'Close', { duration: 2000 });
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to delete record', 'Close', { duration: 3000 })
    });
  }
}
