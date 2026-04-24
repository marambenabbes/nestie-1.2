import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Medication } from '../../core/models/models';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatSlideToggleModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatChipsModule, MatTooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-poppins font-bold text-gray-800">Medication Manager 💊</h1>
        <button mat-raised-button class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white"
                (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Add Medication' }}
        </button>
      </div>

      <!-- Add Medication Form -->
      <mat-card *ngIf="showForm" class="!rounded-cute !shadow-card p-6 animate-fade-in">
        <h3 class="text-lg font-poppins font-semibold text-mama-rose mb-4 flex items-center gap-2">
          <mat-icon class="text-mama-rose">{{ editingId ? 'edit' : 'medication' }}</mat-icon>
          {{ editingId ? 'Edit Medication' : 'New Medication' }}
        </h3>
        <form [formGroup]="medForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Medication Name</mat-label>
            <input matInput formControlName="medicationName" placeholder="e.g. Folic Acid">
            <mat-icon matPrefix class="mr-2 text-mama-pink">medication</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Dosage</mat-label>
            <input matInput formControlName="dosage" placeholder="e.g. 400mcg">
            <mat-icon matPrefix class="mr-2 text-mama-lavender">science</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Frequency</mat-label>
            <mat-select formControlName="frequency">
              <mat-option value="ONCE_DAILY">Once Daily</mat-option>
              <mat-option value="TWICE_DAILY">Twice Daily</mat-option>
              <mat-option value="THREE_TIMES_DAILY">Three Times Daily</mat-option>
              <mat-option value="WEEKLY">Weekly</mat-option>
              <mat-option value="AS_NEEDED">As Needed</mat-option>
            </mat-select>
            <mat-icon matPrefix class="mr-2 text-mama-peach">schedule</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Reminder Time</mat-label>
            <input matInput formControlName="reminderTime" type="time">
            <mat-icon matPrefix class="mr-2 text-mama-lavender">alarm</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Prescribed By</mat-label>
            <input matInput formControlName="prescribedBy" placeholder="Doctor's name">
            <mat-icon matPrefix class="mr-2 text-mama-peach">person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Side Effects</mat-label>
            <input matInput formControlName="sideEffects" placeholder="Known side effects">
            <mat-icon matPrefix class="mr-2 text-red-300">warning</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full md:col-span-2">
            <mat-label>Instructions</mat-label>
            <textarea matInput formControlName="instructions" rows="2" placeholder="e.g. Take with food"></textarea>
            <mat-icon matPrefix class="mr-2 text-mama-lavender">notes</mat-icon>
          </mat-form-field>
          </div>

          <div class="flex justify-end gap-3">
            <button mat-button type="button" class="!rounded-full" (click)="resetForm()">Cancel</button>
            <button mat-raised-button type="submit"
                    class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white"
                    [disabled]="medForm.invalid || saving">
              {{ saving ? 'Saving...' : (editingId ? 'Update Medication ✏️' : 'Add Medication 💊') }}
            </button>
          </div>
        </form>
      </mat-card>

      <!-- Filter Chips -->
      <div class="flex gap-2 flex-wrap">
        <button mat-stroked-button class="!rounded-full !text-sm"
                [class.!bg-mama-pink-light]="filter === 'all'" [class.!border-mama-pink]="filter === 'all'"
                (click)="setFilter('all')">
          All ({{ medications.length }})
        </button>
        <button mat-stroked-button class="!rounded-full !text-sm"
                [class.!bg-green-50]="filter === 'active'" [class.!border-green-400]="filter === 'active'"
                (click)="setFilter('active')">
          <mat-icon class="!text-sm mr-1 text-green-500">check_circle</mat-icon>
          Active ({{ activeCount }})
        </button>
        <button mat-stroked-button class="!rounded-full !text-sm"
                [class.!bg-gray-100]="filter === 'inactive'" [class.!border-gray-400]="filter === 'inactive'"
                (click)="setFilter('inactive')">
          <mat-icon class="!text-sm mr-1 text-gray-400">pause_circle</mat-icon>
          Inactive ({{ medications.length - activeCount }})
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="40" class="text-mama-pink"></mat-spinner>
      </div>

      <!-- Empty State -->
      <mat-card *ngIf="!loading && filteredMedications.length === 0" class="!rounded-cute !shadow-card p-8 text-center">
        <mat-icon class="!text-6xl text-mama-lavender-light mb-3">medication</mat-icon>
        <p class="text-gray-500 font-medium">{{ filter === 'all' ? 'No medications added yet' : 'No ' + filter + ' medications' }}</p>
        <p class="text-sm text-gray-400 mt-1" *ngIf="filter === 'all'">Click "Add Medication" to track your prescriptions and supplements</p>
      </mat-card>

      <!-- Medication Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="!loading">
        <mat-card *ngFor="let med of filteredMedications" class="!rounded-cute !shadow-card p-5 hover:!shadow-hover transition-all"
                  [class.!border-l-4]="true" [class.!border-mama-pink]="med.active" [class.!border-gray-300]="!med.active"
                  [class.opacity-60]="!med.active">
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                   [class]="med.active ? 'bg-mama-pink-light' : 'bg-gray-100'">
                <mat-icon [class]="med.active ? 'text-mama-rose' : 'text-gray-400'">medication</mat-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-700">{{ med.medicationName }}</h3>
                <p class="text-sm text-gray-400">{{ med.dosage || 'No dosage' }} · {{ formatFrequency(med.frequency) }}</p>
              </div>
            </div>
            <mat-slide-toggle [checked]="med.active" color="primary" class="!scale-75"
                              (change)="toggleActive(med)"
                              [matTooltip]="med.active ? 'Deactivate' : 'Reactivate'">
            </mat-slide-toggle>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center text-gray-500">
              <mat-icon class="!text-lg mr-1 text-mama-lavender">alarm</mat-icon>
              {{ med.reminderTime || 'No reminder' }}
            </div>
            <div class="flex items-center text-gray-500">
              <mat-icon class="!text-lg mr-1 text-mama-peach">person</mat-icon>
              {{ med.prescribedBy || 'Self' }}
            </div>
          </div>

          <p *ngIf="med.sideEffects" class="mt-3 text-xs text-red-400 bg-red-50 rounded-xl p-3 flex items-start gap-1">
            <mat-icon class="!text-sm mt-0.5">warning</mat-icon>
            {{ med.sideEffects }}
          </p>

          <p *ngIf="med.instructions" class="mt-2 text-xs text-gray-400 bg-mama-cream rounded-xl p-3">
            📝 {{ med.instructions }}
          </p>

          <div class="mt-3 flex items-center justify-between">
            <span *ngIf="med.startDate" class="text-xs text-gray-400">
              {{ med.startDate | date:'mediumDate' }} → {{ med.endDate ? (med.endDate | date:'mediumDate') : 'Ongoing' }}
            </span>
            <div class="flex gap-1">
              <button mat-icon-button matTooltip="Edit" (click)="editMedication(med)" class="!scale-75">
                <mat-icon class="text-mama-lavender">edit</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Delete" (click)="deleteMedication(med.id)" class="!scale-75">
                <mat-icon class="text-red-300 hover:text-red-500">delete</mat-icon>
              </button>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `
})
export class MedicationsComponent implements OnInit {
  medications: Medication[] = [];
  filteredMedications: Medication[] = [];
  medForm!: FormGroup;
  showForm = false;
  editingId: number | null = null;
  saving = false;
  loading = true;
  filter: 'all' | 'active' | 'inactive' = 'all';
  activeCount = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.medForm = this.fb.group({
      medicationName: ['', Validators.required],
      dosage: [''],
      frequency: ['ONCE_DAILY'],
      reminderTime: [''],
      startDate: [null],
      endDate: [null],
      prescribedBy: [''],
      instructions: [''],
      sideEffects: ['']
    });
    this.loadMedications();
  }

  loadMedications(): void {
    const userId = this.authService.user()?.id;
    if (!userId) { this.loading = false; return; }
    this.loading = true;
    this.apiService.getMedications(userId, 0, 100).subscribe({
      next: (res) => {
        this.medications = res.content;
        this.activeCount = this.medications.filter(m => m.active).length;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load medications', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  setFilter(f: 'all' | 'active' | 'inactive'): void {
    this.filter = f;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filter === 'active') this.filteredMedications = this.medications.filter(m => m.active);
    else if (this.filter === 'inactive') this.filteredMedications = this.medications.filter(m => !m.active);
    else this.filteredMedications = [...this.medications];
  }

  formatFrequency(freq: string): string {
    if (!freq) return '';
    return freq.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\bDaily\b/, 'Daily').toLowerCase().replace(/^\w/, l => l.toUpperCase());
  }

  onSubmit(): void {
    if (this.medForm.invalid) return;
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this.saving = true;
    const formVal = { ...this.medForm.value };

    // Format dates to ISO strings if they are Date objects
    if (formVal.startDate instanceof Date) {
      formVal.startDate = formVal.startDate.toISOString().split('T')[0];
    }
    if (formVal.endDate instanceof Date) {
      formVal.endDate = formVal.endDate.toISOString().split('T')[0];
    }

    const request$ = this.editingId
      ? this.apiService.updateMedication(this.editingId, formVal)
      : this.apiService.createMedication(userId, formVal);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Medication updated! ✅' : 'Medication added! 💊', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadMedications();
      },
      error: () => {
        this.snackBar.open('Failed to save medication', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  editMedication(med: Medication): void {
    this.editingId = med.id;
    this.showForm = true;
    this.medForm.patchValue({
      medicationName: med.medicationName,
      dosage: med.dosage,
      frequency: med.frequency,
      reminderTime: med.reminderTime,
      startDate: med.startDate ? new Date(med.startDate) : null,
      endDate: med.endDate ? new Date(med.endDate) : null,
      prescribedBy: med.prescribedBy,
      instructions: med.instructions,
      sideEffects: med.sideEffects
    });
  }

  toggleActive(med: Medication): void {
    if (med.active) {
      this.apiService.deactivateMedication(med.id).subscribe({
        next: () => {
          this.snackBar.open('Medication deactivated', 'Close', { duration: 3000 });
          this.loadMedications();
        },
        error: () => this.snackBar.open('Failed to deactivate', 'Close', { duration: 3000 })
      });
    } else {
      this.apiService.activateMedication(med.id).subscribe({
        next: () => {
          this.snackBar.open('Medication reactivated ✅', 'Close', { duration: 3000 });
          this.loadMedications();
        },
        error: () => this.snackBar.open('Failed to reactivate', 'Close', { duration: 3000 })
      });
    }
  }

  deleteMedication(id: number): void {
    if (!confirm('Delete this medication?')) return;
    this.apiService.deleteMedication(id).subscribe({
      next: () => {
        this.snackBar.open('Medication deleted 🗑️', 'Close', { duration: 3000 });
        this.loadMedications();
      },
      error: () => this.snackBar.open('Failed to delete medication', 'Close', { duration: 3000 })
    });
  }

  resetForm(): void {
    this.medForm.reset({ frequency: 'ONCE_DAILY' });
    this.editingId = null;
    this.showForm = false;
    this.saving = false;
  }
}
