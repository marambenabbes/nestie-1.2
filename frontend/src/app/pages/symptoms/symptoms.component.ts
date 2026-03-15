import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Symptom } from '../../core/models/models';

@Component({
  selector: 'app-symptoms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-poppins font-bold text-gray-800">Symptoms Tracker 💊</h1>
        <button mat-raised-button (click)="toggleForm()"
                class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon> {{ showForm ? 'Cancel' : 'Log Symptom' }}
        </button>
      </div>

      <!-- Log Form -->
      <mat-card *ngIf="showForm" class="!rounded-cute !shadow-card p-6">
        <h3 class="text-lg font-poppins font-semibold text-mama-rose mb-4 flex items-center">
          <mat-icon class="mr-2">{{ editingId ? 'edit' : 'healing' }}</mat-icon>
          {{ editingId ? 'Edit Symptom' : 'Log a Symptom' }}
        </h3>
        <form [formGroup]="symptomForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Symptom Name</mat-label>
              <input matInput formControlName="symptomName" placeholder="e.g., Nausea, Back pain...">
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Severity</mat-label>
              <mat-select formControlName="severity">
                <mat-option value="MILD">Mild</mat-option>
                <mat-option value="MODERATE">Moderate</mat-option>
                <mat-option value="SEVERE">Severe</mat-option>
                <mat-option value="CRITICAL">Critical</mat-option>
              </mat-select>
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>When did it occur?</mat-label>
              <input matInput type="datetime-local" formControlName="occurredAt">
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Duration (minutes)</mat-label>
              <input matInput type="number" formControlName="durationMinutes" placeholder="e.g., 30">
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Pregnancy Week</mat-label>
              <input matInput type="number" formControlName="pregnancyWeek" placeholder="e.g., 16">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Describe your symptom..."></textarea>
          </mat-form-field>

          <div class="flex justify-end gap-3">
            <button mat-button type="button" (click)="resetForm()" class="!rounded-full">Cancel</button>
            <button mat-raised-button type="submit" [disabled]="symptomForm.invalid || saving"
                    class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white">
              {{ saving ? 'Saving...' : (editingId ? 'Update Symptom ✏️' : 'Log Symptom 💊') }}
            </button>
          </div>
        </form>
      </mat-card>

      <!-- Timeline -->
      <div class="relative">
        <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-mama-pink-light"></div>
        <div *ngFor="let symptom of symptoms; let i = index" class="relative pl-16 pb-6">
          <div class="absolute left-4 w-5 h-5 rounded-full border-2 border-white shadow-sm"
               [class]="getSeverityDot(symptom.severity)"></div>
          <mat-card class="!rounded-cute !shadow-card p-4 hover:!shadow-hover transition-all">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="font-semibold text-gray-700">{{ symptom.symptomName }}</h4>
                  <span *ngIf="symptom.flaggedByAI" class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center">
                    <mat-icon class="!text-sm mr-1">smart_toy</mat-icon> AI Flagged
                  </span>
                </div>
                <p class="text-sm text-gray-400 mt-1">{{ symptom.occurredAt | date:'medium' }} · Week {{ symptom.pregnancyWeek }}</p>
                <p *ngIf="symptom.description" class="text-sm text-gray-500 mt-2">{{ symptom.description }}</p>
                <div *ngIf="symptom.aiRecommendation" class="mt-3 p-3 bg-mama-pink-light rounded-xl text-sm text-mama-rose">
                  <mat-icon class="!text-sm mr-1 align-middle">psychology</mat-icon>
                  {{ symptom.aiRecommendation }}
                </div>
              </div>
              <div class="flex items-center gap-1 ml-3">
                <span class="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap" [class]="getSeverityBadge(symptom.severity)">
                  {{ symptom.severity }}
                </span>
                <button mat-icon-button matTooltip="Edit" (click)="editSymptom(symptom)" class="!w-8 !h-8">
                  <mat-icon class="!text-sm text-mama-lavender hover:text-mama-purple">edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Delete" (click)="deleteSymptom(symptom.id)" class="!w-8 !h-8">
                  <mat-icon class="!text-sm text-gray-300 hover:text-red-400">delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card>
        </div>
      </div>

      <div *ngIf="symptoms.length === 0 && !showForm" class="text-center py-12">
        <mat-icon class="!text-6xl text-mama-pink">monitor_heart</mat-icon>
        <p class="text-gray-400 font-poppins mt-4">No symptoms logged yet</p>
      </div>
    </div>
  `
})
export class SymptomsComponent implements OnInit {
  symptoms: Symptom[] = [];
  showForm = false;
  saving = false;
  editingId: number | null = null;
  symptomForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.symptomForm = this.fb.group({
      symptomName: ['', Validators.required],
      severity: ['MILD', Validators.required],
      occurredAt: ['', Validators.required],
      durationMinutes: [null],
      pregnancyWeek: [null],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadSymptoms();
  }

  loadSymptoms(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.apiService.getSymptoms(userId).subscribe({ next: (res) => this.symptoms = res.content });
    }
  }

  toggleForm(): void {
    if (this.showForm) {
      this.resetForm();
    } else {
      this.showForm = true;
    }
  }

  editSymptom(symptom: Symptom): void {
    this.editingId = symptom.id;
    this.showForm = true;
    this.symptomForm.patchValue({
      symptomName: symptom.symptomName,
      severity: symptom.severity,
      occurredAt: symptom.occurredAt ? symptom.occurredAt.substring(0, 16) : '',
      durationMinutes: symptom.durationMinutes,
      pregnancyWeek: symptom.pregnancyWeek,
      description: symptom.description
    });
  }

  resetForm(): void {
    this.symptomForm.reset({ severity: 'MILD' });
    this.editingId = null;
    this.showForm = false;
    this.saving = false;
  }

  onSubmit(): void {
    if (this.symptomForm.invalid) return;
    this.saving = true;
    const userId = this.authService.user()?.id;
    if (!userId) return;

    const request$ = this.editingId
      ? this.apiService.updateSymptom(this.editingId, this.symptomForm.value)
      : this.apiService.createSymptom(userId, this.symptomForm.value);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Symptom updated! ✏️' : 'Symptom logged successfully! 💊', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadSymptoms();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save symptom', 'Close', { duration: 3000 });
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

  getSeverityDot(severity: string): string {
    const map: Record<string, string> = { MILD: 'bg-green-400', MODERATE: 'bg-yellow-400', SEVERE: 'bg-orange-500', CRITICAL: 'bg-red-500' };
    return map[severity] || 'bg-gray-400';
  }
  getSeverityBadge(severity: string): string {
    const map: Record<string, string> = { MILD: 'bg-green-100 text-green-700', MODERATE: 'bg-yellow-100 text-yellow-700', SEVERE: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700' };
    return map[severity] || '';
  }
}
