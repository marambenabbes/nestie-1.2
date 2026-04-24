import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Symptom } from '../../../core/models/models';

@Component({
  selector: 'app-symptom-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
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
        <button mat-button type="button" (click)="cancel.emit()" class="!rounded-full">{{ cancelLabel }}</button>
        <button
          mat-raised-button
          type="submit"
          [disabled]="symptomForm.invalid || loading"
          class="!rounded-full !bg-gradient-to-r !from-rose-400 !to-fuchsia-400 !text-white"
        >
          {{ loading ? 'Saving...' : submitLabel }}
        </button>
      </div>
    </form>
  `
})
export class SymptomFormComponent implements OnChanges {
  @Input() loading = false;
  @Input() submitLabel = 'Log Symptom';
  @Input() cancelLabel = 'Cancel';
  @Input() initialValue: Partial<Symptom> | null = null;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  symptomForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.symptomForm = this.fb.group({
      symptomName: ['', Validators.required],
      severity: ['MILD', Validators.required],
      occurredAt: ['', Validators.required],
      durationMinutes: [null],
      pregnancyWeek: [null],
      description: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      this.patchFromInput();
    }
  }

  private patchFromInput(): void {
    if (!this.initialValue) {
      this.symptomForm.reset({ severity: 'MILD' });
      return;
    }

    const occurredAt = this.initialValue.occurredAt
      ? String(this.initialValue.occurredAt).substring(0, 16)
      : '';

    this.symptomForm.reset({
      symptomName: this.initialValue.symptomName ?? '',
      severity: this.initialValue.severity ?? 'MILD',
      occurredAt,
      durationMinutes: this.initialValue.durationMinutes ?? null,
      pregnancyWeek: this.initialValue.pregnancyWeek ?? null,
      description: this.initialValue.description ?? ''
    });
  }

  onSubmit(): void {
    if (this.symptomForm.invalid) {
      this.symptomForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.symptomForm.value);
  }
}
