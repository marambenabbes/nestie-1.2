import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MedicationReminder } from '../../../core/models/models';

@Component({
  selector: 'app-medication-reminder-notification',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="reminder-overlay" *ngIf="reminder">
      <div class="reminder-card">
        <!-- Clock Animation -->
        <div class="clock-container">
          <div class="clock-face">
            <div class="clock-hand hour-hand"></div>
            <div class="clock-hand minute-hand"></div>
            <div class="clock-center"></div>
          </div>
          <div class="clock-pulse"></div>
        </div>

        <!-- Reminder Content -->
        <div class="reminder-content">
          <div class="reminder-header">
            <mat-icon class="medication-icon">medication</mat-icon>
            <h3>Time for your medication!</h3>
          </div>
          
          <div class="medication-details">
            <h4>{{ reminder.medicationName }}</h4>
            <p class="dosage">{{ reminder.dosage }}</p>
            <p class="instructions" *ngIf="reminder.instructions">{{ reminder.instructions }}</p>
            <p class="scheduled-time">
              <mat-icon>schedule</mat-icon>
              Scheduled for {{ formatTime(reminder.scheduledTime) }}
            </p>
          </div>

          <!-- Notes Form (shown when marking as taken) -->
          <form [formGroup]="notesForm" *ngIf="showNotesForm" class="notes-form">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Notes (optional)</mat-label>
              <textarea matInput formControlName="notes" rows="2" 
                        placeholder="Any side effects or notes..."></textarea>
            </mat-form-field>
          </form>

          <!-- Action Buttons -->
          <div class="reminder-actions">
            <button mat-button class="btn-dismiss" (click)="onDismiss()">
              <mat-icon>close</mat-icon>
              Dismiss
            </button>
            
            <button mat-button class="btn-snooze" (click)="onSnooze()">
              <mat-icon>snooze</mat-icon>
              Snooze 15min
            </button>
            
            <button mat-raised-button class="btn-taken" 
                    (click)="showNotesForm ? onMarkTaken() : (showNotesForm = true)">
              <mat-icon>check_circle</mat-icon>
              {{ showNotesForm ? 'Confirm Taken' : 'Mark as Taken' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reminder-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .reminder-card {
      background: linear-gradient(135deg, #fff 0%, #fef7ff 100%);
      border-radius: 24px;
      padding: 2rem;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(244, 143, 177, 0.2);
      animation: slideUp 0.4s ease;
      text-align: center;
    }

    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(30px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    /* Clock Animation */
    .clock-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .clock-face {
      position: relative;
      width: 80px;
      height: 80px;
      border: 4px solid #f48fb1;
      border-radius: 50%;
      background: linear-gradient(135deg, #f48fb1, #ce93d8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .clock-hand {
      position: absolute;
      background: #fff;
      border-radius: 2px;
      transform-origin: bottom center;
    }

    .hour-hand {
      width: 3px;
      height: 20px;
      animation: clockTick 2s ease-in-out infinite;
    }

    .minute-hand {
      width: 2px;
      height: 28px;
      animation: clockTick 1.5s ease-in-out infinite reverse;
    }

    .clock-center {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      z-index: 3;
    }

    .clock-pulse {
      position: absolute;
      width: 100px;
      height: 100px;
      border: 2px solid #f48fb1;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
      opacity: 0.6;
    }

    @keyframes clockTick {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(30deg); }
    }

    @keyframes pulse {
      0% { 
        transform: scale(1); 
        opacity: 0.6; 
      }
      50% { 
        transform: scale(1.2); 
        opacity: 0.3; 
      }
      100% { 
        transform: scale(1); 
        opacity: 0.6; 
      }
    }

    /* Content Styling */
    .reminder-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .medication-icon {
      color: #f48fb1;
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
    }

    .reminder-header h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 700;
      color: #6a1b9a;
      font-family: 'Poppins', sans-serif;
    }

    .medication-details {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .medication-details h4 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: #4a148c;
    }

    .dosage {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 500;
      color: #f48fb1;
      background: rgba(244, 143, 177, 0.1);
      padding: 0.3rem 1rem;
      border-radius: 999px;
      display: inline-block;
    }

    .instructions {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      color: #666;
      line-height: 1.4;
    }

    .scheduled-time {
      margin: 0;
      font-size: 0.85rem;
      color: #9c27b0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
    }

    .scheduled-time mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    /* Notes Form */
    .notes-form {
      margin-bottom: 1rem;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { 
        opacity: 0; 
        transform: translateY(-10px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }

    /* Action Buttons */
    .reminder-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .reminder-actions button {
      border-radius: 999px !important;
      font-weight: 600 !important;
      padding: 0 1.2rem !important;
      font-size: 0.85rem !important;
      transition: all 0.3s ease !important;
    }

    .btn-dismiss {
      color: #999 !important;
      border: 1px solid #ddd !important;
    }

    .btn-dismiss:hover {
      background: #f5f5f5 !important;
      color: #666 !important;
    }

    .btn-snooze {
      color: #ff9800 !important;
      border: 1px solid #ff9800 !important;
    }

    .btn-snooze:hover {
      background: rgba(255, 152, 0, 0.1) !important;
    }

    .btn-taken {
      background: linear-gradient(135deg, #4caf50, #66bb6a) !important;
      color: #fff !important;
      box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3) !important;
    }

    .btn-taken:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
    }

    /* Form Field Styling */
    ::ng-deep .reminder-card .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .reminder-card .mdc-text-field--outlined {
      border-radius: 12px !important;
    }

    ::ng-deep .reminder-card .mdc-notched-outline__leading,
    ::ng-deep .reminder-card .mdc-notched-outline__notch,
    ::ng-deep .reminder-card .mdc-notched-outline__trailing {
      border-color: rgba(244, 143, 177, 0.3) !important;
    }

    ::ng-deep .reminder-card .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .reminder-card .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .reminder-card .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #f48fb1 !important;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .reminder-card {
        padding: 1.5rem;
        margin: 1rem;
      }
      
      .reminder-actions {
        flex-direction: column;
      }
      
      .reminder-actions button {
        width: 100%;
      }
    }
  `]
})
export class MedicationReminderNotificationComponent {
  @Input() reminder: MedicationReminder | null = null;
  @Output() taken = new EventEmitter<{ reminderId: number; notes?: string }>();
  @Output() dismissed = new EventEmitter<number>();
  @Output() snoozed = new EventEmitter<number>();

  showNotesForm = false;
  notesForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.notesForm = this.fb.group({
      notes: ['']
    });
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  onMarkTaken(): void {
    if (this.reminder) {
      const notes = this.notesForm.get('notes')?.value || undefined;
      this.taken.emit({ reminderId: this.reminder.id, notes });
      this.resetForm();
    }
  }

  onDismiss(): void {
    if (this.reminder) {
      this.dismissed.emit(this.reminder.id);
      this.resetForm();
    }
  }

  onSnooze(): void {
    if (this.reminder) {
      this.snoozed.emit(this.reminder.id);
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.showNotesForm = false;
    this.notesForm.reset();
  }
}