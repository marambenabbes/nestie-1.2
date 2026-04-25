import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Appointment, User } from '../../core/models/models';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatTooltipModule, MatMenuModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold" style="font-family:'Outfit',sans-serif;color:var(--mama-berry)">Appointments 📅</h1>
        <button mat-raised-button (click)="toggleForm()"
                class="!rounded-full !text-white" style="background:linear-gradient(135deg,var(--mama-rose),var(--mama-rose-deep))!important;box-shadow:0 6px 20px rgba(212,83,126,0.25)">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon> {{ showForm ? 'Cancel' : 'Book Appointment' }}
        </button>
      </div>

      <!-- Booking Form -->
      <mat-card *ngIf="showForm" class="!rounded-cute !shadow-card p-6 appointments-form max-w-3xl mx-auto" style="background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);border:1px solid rgba(232,196,216,0.2)">
        <h3 class="text-lg font-poppins font-semibold text-mama-rose mb-4 flex items-center">
          <mat-icon class="mr-2">{{ editingId ? 'edit' : 'event_available' }}</mat-icon>
          {{ editingId ? 'Edit Appointment' : 'New Appointment' }}
        </h3>
        <form [formGroup]="aptForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Appointment Date & Time</mat-label>
              <input matInput type="datetime-local" formControlName="appointmentDate">
              <mat-error>Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="CHECKUP">Checkup</mat-option>
                <mat-option value="ULTRASOUND">Ultrasound</mat-option>
                <mat-option value="LAB_WORK">Lab Work</mat-option>
                <mat-option value="CONSULTATION">Consultation</mat-option>
                <mat-option value="EMERGENCY">Emergency</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Doctor</mat-label>
              <mat-select formControlName="doctorId">
                <mat-option [value]="null">-- No doctor --</mat-option>
                <mat-option *ngFor="let doc of doctors" [value]="doc.id">{{ doc.fullName }}</mat-option>
              </mat-select>
              <mat-hint>Optional — choose a doctor or leave empty</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" placeholder="Hospital / Clinic name">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Reason</mat-label>
            <textarea matInput formControlName="reason" rows="2" placeholder="Reason for appointment..."></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="2" placeholder="Additional notes..."></textarea>
          </mat-form-field>

          <div class="flex justify-end gap-3">
            <button mat-button type="button" (click)="resetForm()" class="!rounded-full">Cancel</button>
            <button mat-raised-button type="submit" [disabled]="aptForm.invalid || saving"
                    class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white">
              {{ saving ? 'Saving...' : (editingId ? 'Update Appointment ✏️' : 'Book Appointment 📅') }}
            </button>
          </div>
        </form>
      </mat-card>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <mat-card *ngFor="let apt of appointments" class="!rounded-cute !shadow-card p-5 hover:!shadow-hover transition-all">
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                   [class]="getTypeColor(apt.type)">
                <mat-icon class="text-white">{{ getTypeIcon(apt.type) }}</mat-icon>
              </div>
              <div>
                <p class="font-semibold text-gray-700">{{ apt.type | titlecase }}</p>
                <p class="text-sm text-gray-400">Dr. {{ apt.doctorName || 'TBD' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <mat-chip [class]="getStatusColor(apt.status)" class="!text-xs">{{ apt.status }}</mat-chip>
              <button mat-icon-button [matMenuTriggerFor]="statusMenu" matTooltip="Change Status" class="!w-8 !h-8">
                <mat-icon class="!text-sm text-gray-400">swap_horiz</mat-icon>
              </button>
              <mat-menu #statusMenu="matMenu">
                <button mat-menu-item *ngFor="let s of statuses" (click)="updateStatus(apt.id, s)"
                        [disabled]="apt.status === s">
                  <span [class]="getStatusTextColor(s)">{{ s }}</span>
                </button>
              </mat-menu>
              <button mat-icon-button matTooltip="Edit" (click)="editAppointment(apt)" class="!w-8 !h-8">
                <mat-icon class="!text-sm text-mama-lavender hover:text-mama-purple">edit</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Delete" (click)="deleteAppointment(apt.id)" class="!w-8 !h-8">
                <mat-icon class="!text-sm text-gray-300 hover:text-red-400">delete</mat-icon>
              </button>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-gray-500">
            <mat-icon class="!text-lg mr-1">event</mat-icon>
            {{ apt.appointmentDate | date:'EEE, MMM d, y · h:mm a' }}
          </div>
          <div *ngIf="apt.location" class="mt-2 flex items-center text-sm text-gray-400">
            <mat-icon class="!text-lg mr-1">location_on</mat-icon>
            {{ apt.location }}
          </div>
          <p *ngIf="apt.reason" class="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{{ apt.reason }}</p>
        </mat-card>
      </div>

      <div *ngIf="appointments.length === 0 && !showForm" class="text-center py-12">
        <mat-icon class="!text-6xl text-mama-lavender">calendar_today</mat-icon>
        <p class="text-gray-400 font-poppins mt-4">No appointments scheduled yet</p>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .appointments-form mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
      display: block;
    }

    ::ng-deep .appointments-form .mat-mdc-form-field-focus-overlay {
      background-color: rgba(244, 143, 177, 0.04) !important;
    }

    ::ng-deep .appointments-form .mdc-notched-outline__leading,
    ::ng-deep .appointments-form .mdc-notched-outline__notch,
    ::ng-deep .appointments-form .mdc-notched-outline__trailing {
      border-color: rgba(206, 147, 216, 0.3) !important;
      border-width: 1.5px !important;
    }

    ::ng-deep .appointments-form .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .appointments-form .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .appointments-form .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #f48fb1 !important;
      border-width: 2px !important;
    }

    ::ng-deep .appointments-form .mdc-text-field__input {
      padding: 14px 16px !important;
      font-size: 0.9rem !important;
      color: #3f3d56 !important;
      font-family: 'Poppins', sans-serif !important;
    }

    ::ng-deep .appointments-form textarea.mat-mdc-input-element {
      padding: 12px 16px !important;
      font-family: 'Poppins', sans-serif !important;
      resize: vertical !important;
    }

    ::ng-deep .appointments-form .mat-mdc-form-field-label {
      color: #9e9eb8 !important;
      font-size: 0.85rem !important;
    }

    ::ng-deep .appointments-form .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: #f48fb1 !important;
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  showForm = false;
  saving = false;
  editingId: number | null = null;
  aptForm!: FormGroup;
  statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  doctors: User[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.aptForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      type: ['CHECKUP'],
      doctorId: [null],
      location: [''],
      reason: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.apiService.getDoctors().subscribe({
      next: (docs) => this.doctors = docs,
      error: () => this.doctors = []
    });
  }

  loadAppointments(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.apiService.getPatientAppointments(userId).subscribe({
        next: (res) => this.appointments = res.content
      });
    }
  }

  toggleForm(): void {
    if (this.showForm) {
      this.resetForm();
    } else {
      this.showForm = true;
    }
  }

  editAppointment(apt: Appointment): void {
    this.editingId = apt.id;
    this.showForm = true;
    this.aptForm.patchValue({
      appointmentDate: apt.appointmentDate ? apt.appointmentDate.substring(0, 16) : '',
      type: apt.type,
      doctorId: apt.doctorId,
      location: apt.location,
      reason: apt.reason,
      notes: apt.notes
    });
  }

  resetForm(): void {
    this.aptForm.reset({ type: 'CHECKUP' });
    this.editingId = null;
    this.showForm = false;
    this.saving = false;
  }

  onSubmit(): void {
    if (this.aptForm.invalid) return;
    this.saving = true;
    const userId = this.authService.user()?.id;
    if (!userId) return;

    // Backend only supports create (POST) and status update (PATCH) — no full PUT
    // For edits: delete old + create new
    const createNew = () => {
      this.apiService.createAppointment(userId, this.aptForm.value).subscribe({
        next: () => {
          this.snackBar.open(this.editingId ? 'Appointment updated! ✏️' : 'Appointment booked successfully! 📅', 'Close', { duration: 3000 });
          this.resetForm();
          this.loadAppointments();
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err.error?.message || 'Failed to save appointment', 'Close', { duration: 3000 });
        }
      });
    };

    if (this.editingId) {
      this.apiService.deleteAppointment(this.editingId).subscribe({
        next: () => createNew(),
        error: () => {
          this.saving = false;
          this.snackBar.open('Failed to update appointment', 'Close', { duration: 3000 });
        }
      });
    } else {
      createNew();
    }
  }

  updateStatus(id: number, status: string): void {
    this.apiService.updateAppointmentStatus(id, status).subscribe({
      next: () => {
        this.snackBar.open(`Status changed to ${status} ✅`, 'Close', { duration: 3000 });
        this.loadAppointments();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  deleteAppointment(id: number): void {
    if (!id || !confirm('Delete this appointment?')) return;
    this.apiService.deleteAppointment(id).subscribe({
      next: () => {
        this.snackBar.open('Appointment deleted 🗑️', 'Close', { duration: 2000 });
        this.loadAppointments();
      },
      error: () => this.snackBar.open('Failed to delete appointment', 'Close', { duration: 3000 })
    });
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = { CHECKUP: 'check_circle', ULTRASOUND: 'monitor', LAB_WORK: 'science', EMERGENCY: 'emergency', CONSULTATION: 'forum' };
    return map[type] || 'event';
  }
  getTypeColor(type: string): string {
    const map: Record<string, string> = { CHECKUP: 'bg-mama-pink', ULTRASOUND: 'bg-mama-lavender', LAB_WORK: 'bg-mama-peach', EMERGENCY: 'bg-red-400', CONSULTATION: 'bg-blue-400' };
    return map[type] || 'bg-gray-400';
  }
  getStatusColor(status: string): string {
    const map: Record<string, string> = { SCHEDULED: '!bg-blue-100 !text-blue-700', CONFIRMED: '!bg-green-100 !text-green-700', COMPLETED: '!bg-gray-100', CANCELLED: '!bg-red-100 !text-red-700' };
    return map[status] || '';
  }
  getStatusTextColor(status: string): string {
    const map: Record<string, string> = { SCHEDULED: 'text-blue-600', CONFIRMED: 'text-green-600', COMPLETED: 'text-gray-600', CANCELLED: 'text-red-600' };
    return map[status] || '';
  }
}
