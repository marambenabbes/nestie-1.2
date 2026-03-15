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
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PregnancyProfile, User, DoctorAdvice } from '../../core/models/models';

@Component({
  selector: 'app-pregnancy-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
            MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatTooltipModule, MatBadgeModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-poppins font-bold text-gray-800">Pregnancy Profile 🤰</h1>
        <div *ngIf="profile && !showForm" class="flex gap-2">
          <button mat-raised-button (click)="editProfile()"
                  class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white">
            <mat-icon>edit</mat-icon> Edit Profile
          </button>
          <button mat-icon-button matTooltip="Delete Profile" (click)="deleteProfile()" class="!text-gray-400 hover:!text-red-500">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>

      <div *ngIf="profile && !showForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-card class="!rounded-cute !shadow-card p-6">
            <h3 class="font-poppins font-semibold text-mama-rose mb-4 flex items-center">
              <mat-icon class="mr-2">info</mat-icon> Basic Information
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between"><span class="text-gray-500">Blood Type</span><span class="font-medium">{{ profile.bloodType }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Height</span><span class="font-medium">{{ profile.height }} cm</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Pre-pregnancy Weight</span><span class="font-medium">{{ profile.prePregnancyWeight }} kg</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Current Weight</span><span class="font-medium">{{ profile.currentWeight }} kg</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Medical Conditions</span><span class="font-medium">{{ profile.medicalConditions || 'None' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Allergies</span><span class="font-medium">{{ profile.allergies || 'None' }}</span></div>
            </div>
          </mat-card>

          <mat-card class="!rounded-cute !shadow-card p-6">
            <h3 class="font-poppins font-semibold text-mama-purple mb-4 flex items-center">
              <mat-icon class="mr-2">calendar_today</mat-icon> Timeline
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between"><span class="text-gray-500">Last Menstrual Period</span><span class="font-medium">{{ profile.lastMenstrualPeriod | date:'mediumDate' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Expected Due Date</span><span class="font-medium text-mama-rose">{{ profile.expectedDueDate | date:'mediumDate' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Current Week</span><span class="font-medium text-mama-purple text-lg">Week {{ calculatedWeek }} + {{ calculatedDay }} day{{ calculatedDay !== 1 ? 's' : '' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Trimester</span><span class="font-medium">{{ calculatedTrimester }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Days Until Due</span><span class="font-medium text-mama-rose">{{ calculatedDaysUntilDue > 0 ? calculatedDaysUntilDue + ' days' : 'Due!' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Status</span>
                <mat-chip [class]="profile.status === 'ACTIVE' ? '!bg-green-100 !text-green-700' : '!bg-gray-100'">{{ profile.status }}</mat-chip>
              </div>
              <div class="flex justify-between"><span class="text-gray-500">Doctor</span><span class="font-medium">{{ profile.doctorName || 'Not assigned' }}</span></div>
            </div>
          </mat-card>
        </div>
      </div>

      <!-- Doctor's Advice Section -->
      <div *ngIf="profile && !showForm && doctorAdviceList.length > 0">
        <mat-card class="!rounded-cute !shadow-card p-6">
          <h3 class="font-poppins font-semibold text-mama-purple mb-4 flex items-center">
            <mat-icon class="mr-2">rate_review</mat-icon> Doctor's Advice & Recommendations
            <span *ngIf="unreadAdviceCount > 0"
                  class="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              {{ unreadAdviceCount }}
            </span>
          </h3>
          <div class="space-y-4">
            <div *ngFor="let advice of doctorAdviceList"
                 class="p-4 rounded-xl border transition-all duration-200"
                 [class]="advice.readByPatient ? 'border-gray-100 bg-gray-50' : 'border-mama-lavender bg-gradient-to-r from-mama-lavender-light to-mama-pink-light shadow-sm'"
                 (click)="markAdviceRead(advice)">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-lg">{{ getCategoryIcon(advice.category) }}</span>
                  <span class="font-semibold text-gray-700">{{ advice.title }}</span>
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getCategoryBadge(advice.category)">
                    {{ advice.category.replace('_', ' ') }}
                  </span>
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getPriorityBadge(advice.priority)">
                    {{ advice.priority }}
                  </span>
                  <span *ngIf="!advice.readByPatient"
                        class="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">
                    NEW
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ advice.message }}</p>
              <div *ngIf="advice.actionItems" class="p-3 bg-white rounded-lg border border-mama-lavender mb-2">
                <p class="text-xs font-semibold text-mama-purple mb-1">📋 Action Items:</p>
                <p class="text-sm text-gray-600">{{ advice.actionItems }}</p>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-400">
                  From <span class="font-medium text-mama-purple">Dr. {{ advice.doctorName }}</span> · {{ advice.createdAt | date:'medium' }}
                </p>
                <mat-icon *ngIf="advice.readByPatient" class="!text-sm text-green-500" matTooltip="Read">check_circle</mat-icon>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Create/Edit Form -->
      <div *ngIf="showForm || !profile">
        <mat-card class="!rounded-cute !shadow-card p-8">
          <h3 class="text-lg font-poppins font-semibold text-mama-rose mb-4 flex items-center">
            <mat-icon class="mr-2">pregnant_woman</mat-icon> {{ editingId ? 'Edit' : 'Create' }} Pregnancy Profile
          </h3>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Last Menstrual Period</mat-label>
                <input matInput type="date" formControlName="lastMenstrualPeriod">
                <mat-error>Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Expected Due Date (auto-calculated)</mat-label>
                <input matInput type="date" formControlName="expectedDueDate" readonly>
                <mat-hint *ngIf="profileForm.get('expectedDueDate')?.value">Calculated from LMP + 280 days</mat-hint>
              </mat-form-field>

              <div *ngIf="formCalculatedWeek !== null" class="col-span-2 p-4 rounded-xl bg-gradient-to-r from-mama-pink-light to-mama-lavender-light">
                <div class="flex items-center gap-3">
                  <mat-icon class="text-mama-purple">pregnant_woman</mat-icon>
                  <div>
                    <p class="text-sm text-gray-500 font-poppins">Current Pregnancy Week (auto-calculated)</p>
                    <p class="text-xl font-bold text-mama-purple">Week {{ formCalculatedWeek }} + {{ formCalculatedDay }} day{{ formCalculatedDay !== 1 ? 's' : '' }}</p>
                    <p class="text-xs text-gray-400">Trimester {{ formCalculatedTrimester }} · Based on today's date and LMP</p>
                  </div>
                </div>
              </div>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Blood Type</mat-label>
                <mat-select formControlName="bloodType">
                  <mat-option *ngFor="let t of bloodTypes" [value]="t">{{ t }}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Height (cm)</mat-label>
                <input matInput type="number" formControlName="height">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Pre-pregnancy Weight (kg)</mat-label>
                <input matInput type="number" formControlName="prePregnancyWeight">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Current Weight (kg)</mat-label>
                <input matInput type="number" formControlName="currentWeight">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Medical Conditions</mat-label>
              <textarea matInput formControlName="medicalConditions" rows="2" placeholder="e.g., gestational diabetes, anemia..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Allergies</mat-label>
              <textarea matInput formControlName="allergies" rows="2" placeholder="e.g., penicillin, shellfish..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Doctor</mat-label>
              <mat-select formControlName="doctorId">
                <mat-option [value]="null">-- No doctor --</mat-option>
                <mat-option *ngFor="let doc of doctors" [value]="doc.id">{{ doc.fullName }}</mat-option>
              </mat-select>
              <mat-hint>Optional — choose your doctor or leave empty</mat-hint>
            </mat-form-field>

            <div class="flex gap-3 justify-end">
              <button *ngIf="profile || editingId" mat-button type="button" (click)="resetForm()" class="!rounded-full">Cancel</button>
              <button mat-raised-button type="submit" [disabled]="profileForm.invalid || saving"
                      class="!rounded-full !bg-gradient-to-r !from-mama-pink-dark !to-mama-lavender-dark !text-white">
                {{ saving ? 'Saving...' : (editingId ? 'Update Profile ✏️' : 'Save Profile 🌸') }}
              </button>
            </div>
          </form>
        </mat-card>
      </div>
    </div>
  `
})
export class PregnancyProfileComponent implements OnInit {
  profile: PregnancyProfile | null = null;
  showForm = false;
  saving = false;
  editingId: number | null = null;
  profileForm!: FormGroup;
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  doctors: User[] = [];
  doctorAdviceList: DoctorAdvice[] = [];
  unreadAdviceCount = 0;

  // Auto-calculated from profile's LMP
  calculatedWeek = 0;
  calculatedDay = 0;
  calculatedTrimester = 1;
  calculatedDaysUntilDue = 0;

  // Auto-calculated from form's LMP input
  formCalculatedWeek: number | null = null;
  formCalculatedDay = 0;
  formCalculatedTrimester = 1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      lastMenstrualPeriod: ['', Validators.required],
      expectedDueDate: [''],
      bloodType: [''],
      height: [null],
      prePregnancyWeight: [null],
      currentWeight: [null],
      medicalConditions: [''],
      allergies: [''],
      doctorId: [null]
    });

    // Auto-calculate due date and current week when LMP changes (Naegele's Rule: LMP + 280 days)
    this.profileForm.get('lastMenstrualPeriod')?.valueChanges.subscribe(lmp => {
      if (lmp) {
        const lmpDate = new Date(lmp);
        lmpDate.setDate(lmpDate.getDate() + 280);
        const dueDate = lmpDate.toISOString().substring(0, 10);
        this.profileForm.patchValue({ expectedDueDate: dueDate }, { emitEvent: false });

        // Auto-calculate current week + day from LMP and today's date
        const { weeks, days, trimester } = this.computeWeekFromLmp(lmp);
        this.formCalculatedWeek = weeks;
        this.formCalculatedDay = days;
        this.formCalculatedTrimester = trimester;
      } else {
        this.profileForm.patchValue({ expectedDueDate: '' }, { emitEvent: false });
        this.formCalculatedWeek = null;
      }
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadDoctorAdvice();
    this.apiService.getDoctors().subscribe({
      next: (docs) => this.doctors = docs,
      error: () => this.doctors = []
    });
  }

  loadProfile(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.apiService.getPregnancyProfiles(userId).subscribe({
        next: (res) => {
          this.profile = res.content.find((p: PregnancyProfile) => p.status === 'ACTIVE') || res.content[0] || null;
          if (this.profile?.lastMenstrualPeriod) {
            const { weeks, days, trimester } = this.computeWeekFromLmp(this.profile.lastMenstrualPeriod);
            this.calculatedWeek = weeks;
            this.calculatedDay = days;
            this.calculatedTrimester = trimester;
            if (this.profile.expectedDueDate) {
              const due = new Date(this.profile.expectedDueDate);
              this.calculatedDaysUntilDue = Math.max(0, Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            }
          }
        }
      });
    }
  }

  private computeWeekFromLmp(lmpStr: string): { weeks: number; days: number; trimester: number } {
    const lmpDate = new Date(lmpStr);
    const today = new Date();
    const totalDays = Math.max(0, Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.min(Math.floor(totalDays / 7), 42);
    const days = totalDays % 7;
    let trimester = 1;
    if (weeks > 12 && weeks <= 27) trimester = 2;
    else if (weeks > 27) trimester = 3;
    return { weeks, days, trimester };
  }

  editProfile(): void {
    if (!this.profile) return;
    this.editingId = this.profile.id;
    this.showForm = true;
    this.profileForm.patchValue({
      lastMenstrualPeriod: this.profile.lastMenstrualPeriod ? this.profile.lastMenstrualPeriod.substring(0, 10) : '',
      expectedDueDate: this.profile.expectedDueDate ? this.profile.expectedDueDate.substring(0, 10) : '',
      bloodType: this.profile.bloodType,
      height: this.profile.height,
      prePregnancyWeight: this.profile.prePregnancyWeight,
      currentWeight: this.profile.currentWeight,
      medicalConditions: this.profile.medicalConditions,
      allergies: this.profile.allergies,
      doctorId: this.profile.doctorId || null
    });
  }

  resetForm(): void {
    this.profileForm.reset();
    this.editingId = null;
    this.showForm = false;
    this.saving = false;
  }

  deleteProfile(): void {
    if (!this.profile || !confirm('Delete this pregnancy profile? This cannot be undone.')) return;
    this.apiService.deletePregnancyProfile(this.profile.id).subscribe({
      next: () => {
        this.profile = null;
        this.snackBar.open('Profile deleted 🗑️', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to delete profile', 'Close', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    const userId = this.authService.user()?.id;
    if (!userId) return;

    const formData = { ...this.profileForm.value };
    // Ensure due date is always calculated from LMP
    if (formData.lastMenstrualPeriod && !formData.expectedDueDate) {
      const lmpDate = new Date(formData.lastMenstrualPeriod);
      lmpDate.setDate(lmpDate.getDate() + 280);
      formData.expectedDueDate = lmpDate.toISOString().substring(0, 10);
    }

    const request$ = this.editingId
      ? this.apiService.updatePregnancyProfile(this.editingId, formData)
      : this.apiService.createPregnancyProfile(userId, formData);

    request$.subscribe({
      next: (res) => {
        this.profile = res;
        this.snackBar.open(this.editingId ? 'Profile updated! ✏️' : 'Profile created! 🌸', 'Close', { duration: 3000 });
        this.resetForm();
        this.loadProfile();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save profile', 'Close', { duration: 3000 });
      }
    });
  }

  // Doctor Advice methods
  loadDoctorAdvice(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.apiService.getDoctorAdviceForPatient(userId, 0, 50).subscribe({
        next: (res) => {
          this.doctorAdviceList = res.content;
          this.unreadAdviceCount = res.content.filter(a => !a.readByPatient).length;
        },
        error: () => this.doctorAdviceList = []
      });
    }
  }

  markAdviceRead(advice: DoctorAdvice): void {
    if (!advice.readByPatient) {
      this.apiService.markAdviceAsRead(advice.id).subscribe({
        next: () => {
          advice.readByPatient = true;
          this.unreadAdviceCount = Math.max(0, this.unreadAdviceCount - 1);
        }
      });
    }
  }

  getCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      'NUTRITION': '🥗', 'SYMPTOMS': '🩺', 'MEDICATION': '💊', 'BABY_GROWTH': '👶', 'GENERAL': '📋'
    };
    return map[category] || '📋';
  }

  getCategoryBadge(category: string): string {
    const map: Record<string, string> = {
      'NUTRITION': 'bg-green-100 text-green-700', 'SYMPTOMS': 'bg-orange-100 text-orange-700',
      'MEDICATION': 'bg-blue-100 text-blue-700', 'BABY_GROWTH': 'bg-purple-100 text-purple-700',
      'GENERAL': 'bg-gray-100 text-gray-700'
    };
    return map[category] || 'bg-gray-100 text-gray-700';
  }

  getPriorityBadge(priority: string): string {
    const map: Record<string, string> = {
      'LOW': 'bg-gray-100 text-gray-600', 'NORMAL': 'bg-blue-100 text-blue-700',
      'HIGH': 'bg-orange-100 text-orange-700', 'URGENT': 'bg-red-100 text-red-700'
    };
    return map[priority] || 'bg-gray-100 text-gray-600';
  }
}
