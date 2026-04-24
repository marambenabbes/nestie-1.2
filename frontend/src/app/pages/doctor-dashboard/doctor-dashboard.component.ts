import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User, PregnancyProfile, Appointment, Symptom, NutritionPlan, Medication, DoctorAdvice } from '../../core/models/models';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatProgressSpinnerModule, MatTabsModule,
    MatBadgeModule, MatDividerModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, RouterLink
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-poppins font-bold text-gray-800">Doctor Panel 🩺</h1>
          <p class="text-gray-500 font-poppins text-sm">Welcome, Dr. {{ (authService.user()?.fullName || '').split(' ').slice(1).join(' ') }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-400">{{ today | date:'EEE, MMM d, yyyy' }}</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <mat-card class="!rounded-cute !shadow-card p-5 !bg-gradient-to-br !from-mama-pink-light !to-white">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-mama-pink/20 flex items-center justify-center mr-3">
              <mat-icon class="text-mama-rose !text-2xl">people</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold text-mama-rose">{{ patients.length }}</p>
              <p class="text-xs text-gray-400">My Patients</p>
            </div>
          </div>
        </mat-card>
        <mat-card class="!rounded-cute !shadow-card p-5 !bg-gradient-to-br !from-mama-lavender-light !to-white">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-mama-lavender/20 flex items-center justify-center mr-3">
              <mat-icon class="text-mama-purple !text-2xl">event</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold text-mama-purple">{{ myAppointments.length }}</p>
              <p class="text-xs text-gray-400">Appointments</p>
            </div>
          </div>
        </mat-card>
        <mat-card class="!rounded-cute !shadow-card p-5 !bg-gradient-to-br !from-orange-50 !to-white">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-3">
              <mat-icon class="text-orange-500 !text-2xl">warning</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold text-orange-500">{{ flaggedSymptoms }}</p>
              <p class="text-xs text-gray-400">AI Flagged</p>
            </div>
          </div>
        </mat-card>
        <mat-card class="!rounded-cute !shadow-card p-5 !bg-gradient-to-br !from-green-50 !to-white">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <mat-icon class="text-green-600 !text-2xl">check_circle</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ completedAppointments }}</p>
              <p class="text-xs text-gray-400">Completed</p>
            </div>
          </div>
        </mat-card>
      </div>

      <mat-card class="!rounded-cute !shadow-card p-5 !bg-gradient-to-r !from-mama-lavender-light !to-white">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="font-semibold text-gray-700">Doctor Lesson Studio</h3>
            <p class="text-sm text-gray-500 mt-1">Create and publish pregnancy lessons, media, and quiz content for your patients.</p>
          </div>
          <a mat-flat-button color="primary" routerLink="/dashboard/doctor/education">
            <mat-icon>school</mat-icon>
            Manage lessons
          </a>
        </div>
      </mat-card>

      <!-- Main Content: Patient List + Detail -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Patient List -->
        <mat-card class="!rounded-cute !shadow-card lg:col-span-1">
          <div class="p-4 border-b border-gray-100">
            <h3 class="font-poppins font-semibold text-gray-700">My Patients</h3>
          </div>
          <div class="max-h-[500px] overflow-y-auto">
            <div *ngIf="loading" class="flex justify-center py-8">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
            <div *ngIf="!loading && patients.length === 0" class="text-center py-8 text-gray-400 text-sm">
              No patients assigned yet
            </div>
            <div *ngFor="let patient of patients"
                 (click)="selectPatient(patient)"
                 class="flex items-center p-4 cursor-pointer transition-all duration-200 border-b border-gray-50"
                 [class.bg-mama-pink-light]="selectedPatient?.id === patient.id"
                 [class.hover:bg-gray-50]="selectedPatient?.id !== patient.id">
              <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                   [style.background]="'linear-gradient(135deg, #f8bbd0, #e1bee7)'">
                <span class="text-white font-semibold text-sm">{{ getInitials(patient.fullName) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-700 text-sm truncate">{{ patient.fullName }}</p>
                <p class="text-xs text-gray-400 truncate">{{ patient.email }}</p>
              </div>
              <mat-icon *ngIf="getPatientFlagged(patient.id)" class="text-orange-400 !text-lg"
                        matTooltip="Has AI flagged symptoms">warning</mat-icon>
            </div>
          </div>
        </mat-card>

        <!-- Patient Detail -->
        <mat-card class="!rounded-cute !shadow-card lg:col-span-2" *ngIf="selectedPatient; else noSelection">
          <!-- Patient Header -->
          <div class="p-5 bg-gradient-to-r from-mama-pink-light to-mama-lavender-light rounded-t-cute">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-14 h-14 rounded-full flex items-center justify-center mr-4"
                     style="background: linear-gradient(135deg, #f48fb1, #ce93d8);">
                  <span class="text-white font-bold text-lg">{{ getInitials(selectedPatient.fullName) }}</span>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-800">{{ selectedPatient.fullName }}</h2>
                  <p class="text-sm text-gray-500">{{ selectedPatient.email }} · {{ selectedPatient.phone }}</p>
                </div>
              </div>
              <div *ngIf="patientPregnancy" class="text-right">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                      [class]="patientPregnancy.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                               patientPregnancy.status === 'COMPLICATED' ? 'bg-red-100 text-red-700' :
                               'bg-gray-100 text-gray-600'">
                  {{ patientPregnancy.status }}
                </span>
                <p class="text-sm text-gray-500 mt-1">Week {{ patientPregnancy.currentWeek }} · T{{ patientPregnancy.currentTrimester }}</p>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <mat-tab-group class="doctor-tabs" animationDuration="200ms">
            <!-- Pregnancy Profile Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-1 !text-lg">pregnant_woman</mat-icon>
                Profile
              </ng-template>
              <div class="p-5">
                <div *ngIf="patientPregnancy; else noPregnancy">
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400 mb-1">Due Date</p>
                      <p class="font-semibold text-gray-700">{{ patientPregnancy.expectedDueDate | date:'MMM d, yyyy' }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400 mb-1">Blood Type</p>
                      <p class="font-semibold text-gray-700">{{ patientPregnancy.bloodType || 'N/A' }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400 mb-1">Current Weight</p>
                      <p class="font-semibold text-gray-700">{{ patientPregnancy.currentWeight }} kg</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400 mb-1">Pre-Pregnancy Weight</p>
                      <p class="font-semibold text-gray-700">{{ patientPregnancy.prePregnancyWeight }} kg</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400 mb-1">Height</p>
                      <p class="font-semibold text-gray-700">{{ patientPregnancy.height }} cm</p>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-3">
                      <p class="text-xs text-gray-400 mb-1">Weight Gain</p>
                      <p class="font-semibold" [class]="getWeightGainClass()">
                        +{{ (patientPregnancy.currentWeight - patientPregnancy.prePregnancyWeight).toFixed(1) }} kg
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 space-y-3">
                    <div *ngIf="patientPregnancy.medicalConditions" class="bg-orange-50 rounded-xl p-3">
                      <p class="text-xs text-orange-500 font-semibold mb-1">Medical Conditions</p>
                      <p class="text-sm text-gray-700">{{ patientPregnancy.medicalConditions }}</p>
                    </div>
                    <div *ngIf="patientPregnancy.allergies" class="bg-red-50 rounded-xl p-3">
                      <p class="text-xs text-red-500 font-semibold mb-1">Allergies</p>
                      <p class="text-sm text-gray-700">{{ patientPregnancy.allergies }}</p>
                    </div>
                  </div>
                </div>
                <ng-template #noPregnancy>
                  <p class="text-gray-400 text-center py-6">No pregnancy profile found</p>
                </ng-template>
              </div>
            </mat-tab>

            <!-- Symptoms Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-1 !text-lg">monitor_heart</mat-icon>
                Symptoms
                <span *ngIf="patientFlaggedCount > 0"
                      class="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs">
                  {{ patientFlaggedCount }}
                </span>
              </ng-template>
              <div class="p-5">
                <div *ngIf="patientSymptoms.length > 0; else noSymptoms" class="space-y-3">
                  <div *ngFor="let s of patientSymptoms"
                       class="flex items-start p-3 rounded-xl border"
                       [class]="s.flaggedByAI ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5"
                         [class]="getSeverityDot(s.severity)">
                      <mat-icon class="!text-sm text-white">{{ s.flaggedByAI ? 'warning' : 'monitor_heart' }}</mat-icon>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <p class="font-medium text-gray-700 text-sm">{{ s.symptomName }}</p>
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getSeverityBadge(s.severity)">
                          {{ s.severity }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">{{ s.description }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ s.occurredAt | date:'short' }} · Week {{ s.pregnancyWeek }} · {{ s.durationMinutes }}min</p>
                      <div *ngIf="s.aiRecommendation" class="mt-2 p-2 bg-white rounded-lg border border-orange-200">
                        <p class="text-xs text-orange-600 font-semibold">AI Recommendation:</p>
                        <p class="text-xs text-gray-600 mt-0.5">{{ s.aiRecommendation }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ng-template #noSymptoms>
                  <p class="text-gray-400 text-center py-6">No symptoms recorded</p>
                </ng-template>
              </div>
            </mat-tab>

            <!-- Appointments Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-1 !text-lg">event</mat-icon>
                Appointments
              </ng-template>
              <div class="p-5">
                <div *ngIf="patientAppointments.length > 0; else noAppts" class="space-y-3">
                  <div *ngFor="let a of patientAppointments"
                       class="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
                         [class]="getApptTypeBg(a.type)">
                      <mat-icon class="!text-lg" [class]="getApptTypeColor(a.type)">{{ getApptIcon(a.type) }}</mat-icon>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-700 text-sm">{{ a.type | titlecase }}</p>
                      <p class="text-xs text-gray-500">{{ a.reason }}</p>
                      <p class="text-xs text-gray-400">{{ a.appointmentDate | date:'medium' }} · {{ a.location }}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getStatusBadge(a.status)">
                        {{ a.status }}
                      </span>
                      <button *ngIf="a.status === 'SCHEDULED'" mat-icon-button
                              (click)="confirmAppointment(a.id)" matTooltip="Confirm"
                              class="!w-8 !h-8">
                        <mat-icon class="!text-lg text-green-500">check_circle</mat-icon>
                      </button>
                      <button *ngIf="a.status === 'CONFIRMED'" mat-icon-button
                              (click)="completeAppointment(a.id)" matTooltip="Mark Complete"
                              class="!w-8 !h-8">
                        <mat-icon class="!text-lg text-blue-500">task_alt</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <ng-template #noAppts>
                  <p class="text-gray-400 text-center py-6">No appointments found</p>
                </ng-template>
              </div>
            </mat-tab>

            <!-- Medications Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-1 !text-lg">medication</mat-icon>
                Medications
              </ng-template>
              <div class="p-5">
                <div *ngIf="patientMedications.length > 0; else noMeds" class="space-y-3">
                  <div *ngFor="let m of patientMedications"
                       class="flex items-center p-3 rounded-xl border border-gray-100"
                       [class.bg-green-50]="m.active" [class.bg-gray-50]="!m.active">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                         [class]="m.active ? 'bg-green-100' : 'bg-gray-200'">
                      <mat-icon [class]="m.active ? 'text-green-600' : 'text-gray-400'" class="!text-lg">medication</mat-icon>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-700 text-sm">{{ m.medicationName }}</p>
                      <p class="text-xs text-gray-500">{{ m.dosage }} · {{ m.frequency.replace('_', ' ') | titlecase }}</p>
                      <p class="text-xs text-gray-400">{{ m.instructions }}</p>
                    </div>
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                          [class]="m.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'">
                      {{ m.active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
                <ng-template #noMeds>
                  <p class="text-gray-400 text-center py-6">No medications found</p>
                </ng-template>
              </div>
            </mat-tab>

            <!-- Nutrition Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-1 !text-lg">restaurant</mat-icon>
                Nutrition
              </ng-template>
              <div class="p-5">
                <div *ngIf="patientNutritionPlans.length > 0; else noNutrition" class="space-y-3">
                  <div *ngFor="let plan of patientNutritionPlans"
                       class="p-4 rounded-xl border border-green-100 bg-green-50/60">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <p class="font-medium text-gray-700 text-sm">{{ plan.mealName }}</p>
                          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-green-700 border border-green-200">
                            {{ plan.mealType | titlecase }}
                          </span>
                          <span *ngIf="plan.aiGenerated" class="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            AI Generated
                          </span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">{{ plan.scheduledDate | date:'mediumDate' }} · Week {{ plan.pregnancyWeek }}</p>
                      </div>
                      <div class="text-right shrink-0">
                        <p class="text-sm font-semibold text-green-700">{{ plan.calories }} kcal</p>
                        <p class="text-xs text-gray-500">P {{ plan.proteinGrams }}g · C {{ plan.carbsGrams }}g · F {{ plan.fatGrams }}g</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                      <div class="bg-white rounded-lg p-2 border border-green-100">
                        <p class="text-xs text-gray-400">Folic Acid</p>
                        <p class="text-sm font-medium text-gray-700">{{ plan.folicAcidMcg }} mcg</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 border border-green-100">
                        <p class="text-xs text-gray-400">Iron</p>
                        <p class="text-sm font-medium text-gray-700">{{ plan.ironMg }} mg</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 border border-green-100">
                        <p class="text-xs text-gray-400">Calcium</p>
                        <p class="text-sm font-medium text-gray-700">{{ plan.calciumMg }} mg</p>
                      </div>
                    </div>

                    <div class="mt-3">
                      <p class="text-xs text-green-700 font-semibold mb-1">Ingredients</p>
                      <p class="text-sm text-gray-600">{{ plan.ingredients }}</p>
                    </div>

                    <div *ngIf="plan.notes" class="mt-3 bg-white rounded-lg p-3 border border-green-100">
                      <p class="text-xs text-green-700 font-semibold mb-1">Notes</p>
                      <p class="text-sm text-gray-600">{{ plan.notes }}</p>
                    </div>
                  </div>
                </div>
                <ng-template #noNutrition>
                  <p class="text-gray-400 text-center py-6">No nutrition plans found</p>
                </ng-template>
              </div>
            </mat-tab>

            <!-- Doctor Advice Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="mr-1 !text-lg">rate_review</mat-icon>
                Advice
              </ng-template>
              <div class="p-5">
                <!-- New Advice Form -->
                <div class="mb-5 p-4 rounded-xl bg-gradient-to-r from-mama-lavender-light to-mama-pink-light border border-mama-lavender">
                  <h4 class="font-poppins font-semibold text-mama-purple text-sm mb-3 flex items-center">
                    <mat-icon class="mr-1 !text-lg">edit_note</mat-icon> Leave Advice for {{ selectedPatient.fullName }}
                  </h4>
                  <form [formGroup]="adviceForm" (ngSubmit)="submitAdvice()" class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Category</mat-label>
                        <mat-select formControlName="category">
                          <mat-option value="NUTRITION">🥗 Nutrition</mat-option>
                          <mat-option value="SYMPTOMS">🩺 Symptoms</mat-option>
                          <mat-option value="MEDICATION">💊 Medication</mat-option>
                          <mat-option value="BABY_GROWTH">👶 Baby Growth</mat-option>
                          <mat-option value="GENERAL">📋 General</mat-option>
                        </mat-select>
                        <mat-error>Required</mat-error>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Priority</mat-label>
                        <mat-select formControlName="priority">
                          <mat-option value="LOW">Low</mat-option>
                          <mat-option value="NORMAL">Normal</mat-option>
                          <mat-option value="HIGH">High</mat-option>
                          <mat-option value="URGENT">Urgent</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Title</mat-label>
                      <input matInput formControlName="title" placeholder="Brief summary of your advice">
                      <mat-error>Required</mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Message</mat-label>
                      <textarea matInput formControlName="message" rows="3" placeholder="Detailed advice or recommendations..."></textarea>
                      <mat-error>Required</mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Action Items (optional)</mat-label>
                      <textarea matInput formControlName="actionItems" rows="2" placeholder="Steps the patient should follow..."></textarea>
                    </mat-form-field>
                    <div class="flex justify-end">
                      <button mat-raised-button type="submit" [disabled]="adviceForm.invalid || savingAdvice"
                              class="!rounded-full !bg-gradient-to-r !from-mama-purple !to-mama-lavender-dark !text-white">
                        <mat-icon>send</mat-icon> {{ savingAdvice ? 'Sending...' : 'Send Advice' }}
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Previous Advice List -->
                <div *ngIf="patientAdvice.length > 0" class="space-y-3">
                  <h4 class="font-poppins font-semibold text-gray-600 text-sm">Previous Advice</h4>
                  <div *ngFor="let advice of patientAdvice"
                       class="p-4 rounded-xl border"
                       [class]="getPriorityBorder(advice.priority)">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-lg">{{ getCategoryIcon(advice.category) }}</span>
                        <span class="font-medium text-gray-700 text-sm">{{ advice.title }}</span>
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getCategoryBadge(advice.category)">
                          {{ advice.category.replace('_', ' ') }}
                        </span>
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getPriorityBadge(advice.priority)">
                          {{ advice.priority }}
                        </span>
                      </div>
                      <div class="flex items-center gap-1">
                        <mat-icon *ngIf="advice.readByPatient" class="!text-sm text-green-500" matTooltip="Read by patient">visibility</mat-icon>
                        <mat-icon *ngIf="!advice.readByPatient" class="!text-sm text-gray-300" matTooltip="Not yet read">visibility_off</mat-icon>
                        <button mat-icon-button class="!w-7 !h-7" (click)="deleteAdvice(advice.id)" matTooltip="Delete">
                          <mat-icon class="!text-sm text-gray-400 hover:text-red-500">delete</mat-icon>
                        </button>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">{{ advice.message }}</p>
                    <p *ngIf="advice.actionItems" class="text-xs text-mama-purple bg-mama-lavender-light rounded-lg p-2 mb-1">
                      <strong>Action items:</strong> {{ advice.actionItems }}
                    </p>
                    <p class="text-xs text-gray-400">{{ advice.createdAt | date:'medium' }}</p>
                  </div>
                </div>
                <p *ngIf="patientAdvice.length === 0 && !savingAdvice" class="text-gray-400 text-center py-4 text-sm">No previous advice for this patient</p>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>

        <!-- No patient selected -->
        <ng-template #noSelection>
          <mat-card class="!rounded-cute !shadow-card lg:col-span-2 flex items-center justify-center p-12">
            <div class="text-center">
              <div class="w-20 h-20 rounded-full bg-mama-pink-light flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-mama-rose !text-4xl !w-10 !h-10">person_search</mat-icon>
              </div>
              <h3 class="font-poppins font-semibold text-gray-600 text-lg">Select a Patient</h3>
              <p class="text-gray-400 text-sm mt-2">Choose a patient from the list to view their profile,<br>symptoms, appointments, and medications.</p>
            </div>
          </mat-card>
        </ng-template>
      </div>

      <!-- Today's Appointments -->
      <mat-card class="!rounded-cute !shadow-card">
        <div class="p-4 border-b border-gray-100">
          <h3 class="font-poppins font-semibold text-gray-700">My Upcoming Appointments</h3>
        </div>
        <div class="p-4">
          <div *ngIf="myAppointments.length > 0; else noMyAppts" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div *ngFor="let a of myAppointments"
                 class="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                 (click)="selectPatientById(a.patientId)">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
                   [class]="getApptTypeBg(a.type)">
                <mat-icon class="!text-lg" [class]="getApptTypeColor(a.type)">{{ getApptIcon(a.type) }}</mat-icon>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-700 text-sm">{{ a.patientName }}</p>
                <p class="text-xs text-gray-400">{{ a.type | titlecase }} · {{ a.appointmentDate | date:'short' }}</p>
              </div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="getStatusBadge(a.status)">
                {{ a.status }}
              </span>
            </div>
          </div>
          <ng-template #noMyAppts>
            <p class="text-gray-400 text-center py-4">No upcoming appointments</p>
          </ng-template>
        </div>
      </mat-card>
    </div>
  `
})
export class DoctorDashboardComponent implements OnInit {
  today = new Date();
  loading = true;
  patients: User[] = [];
  selectedPatient: User | null = null;
  myAppointments: Appointment[] = [];
  flaggedSymptoms = 0;
  completedAppointments = 0;

  // Selected patient details
  patientPregnancy: PregnancyProfile | null = null;
  patientSymptoms: Symptom[] = [];
  patientAppointments: Appointment[] = [];
  patientNutritionPlans: NutritionPlan[] = [];
  patientMedications: Medication[] = [];
  patientAdvice: DoctorAdvice[] = [];
  patientFlaggedCount = 0;

  // Advice form
  adviceForm!: FormGroup;
  savingAdvice = false;

  // Track flagged patients
  private flaggedPatientIds: Set<number> = new Set();

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.adviceForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      message: ['', Validators.required],
      actionItems: [''],
      priority: ['NORMAL']
    });
  }

  ngOnInit(): void {
    const doctorId = this.authService.user()?.id;
    if (!doctorId) return;

    // Load patients assigned to this doctor
    this.apiService.getPregnancyProfilesByDoctor(doctorId).pipe(
      map(res => {
        const patientIds = Array.from(new Set(res.content.map(profile => profile.userId).filter(id => !!id)));
        return patientIds;
      }),
      switchMap(patientIds => {
        if (!patientIds.length) {
          return of([] as User[]);
        }

        return forkJoin(
          patientIds.map(patientId =>
            this.apiService.getUser(patientId).pipe(
              catchError(() => of(null))
            )
          )
        ).pipe(
          map(users => users.filter((user): user is User => user !== null))
        );
      })
    ).subscribe({
      next: (patients) => {
        this.patients = patients;
        this.flaggedSymptoms = 0;
        this.flaggedPatientIds.clear();
        this.loading = false;

        patients.forEach(p => {
          this.apiService.getSymptoms(p.id, 0, 50).subscribe({
            next: (res) => {
              const flagged = res.content.filter(s => s.flaggedByAI).length;
              this.flaggedSymptoms += flagged;
              if (flagged > 0) this.flaggedPatientIds.add(p.id);
            }
          });
        });
      },
      error: () => this.loading = false
    });

    // Load doctor's upcoming appointments
    this.apiService.getDoctorAppointments(doctorId).subscribe({
      next: (res) => {
        this.myAppointments = res.content.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');
        this.completedAppointments = res.content.filter(a => a.status === 'COMPLETED').length;
      }
    });
  }

  selectPatient(patient: User): void {
    this.selectedPatient = patient;
    this.patientPregnancy = null;
    this.patientSymptoms = [];
    this.patientAppointments = [];
    this.patientNutritionPlans = [];
    this.patientMedications = [];
    this.patientAdvice = [];
    this.patientFlaggedCount = 0;

    // Load pregnancy profile
    this.apiService.getPregnancyProfiles(patient.id).subscribe({
      next: (res) => {
        this.patientPregnancy = res.content.find(p => p.status === 'ACTIVE') || res.content[0] || null;
      }
    });

    // Load symptoms
    this.apiService.getSymptoms(patient.id, 0, 50).subscribe({
      next: (res) => {
        this.patientSymptoms = res.content;
        this.patientFlaggedCount = res.content.filter(s => s.flaggedByAI).length;
      }
    });

    // Load appointments
    this.apiService.getPatientAppointments(patient.id).subscribe({
      next: (res) => this.patientAppointments = res.content
    });

    // Load nutrition plans
    this.apiService.getNutritionPlans(patient.id, 0, 50).subscribe({
      next: (res) => {
        this.patientNutritionPlans = [...res.content].sort(
          (left, right) => new Date(right.scheduledDate).getTime() - new Date(left.scheduledDate).getTime()
        );
      }
    });

    // Load medications
    this.apiService.getMedications(patient.id).subscribe({
      next: (res) => this.patientMedications = res.content
    });

    // Load advice given to this patient by this doctor
    const doctorId = this.authService.user()?.id;
    if (doctorId) {
      this.apiService.getDoctorAdviceForDoctorPatient(doctorId, patient.id, 0, 50).subscribe({
        next: (res) => this.patientAdvice = res.content
      });
    }
  }

  selectPatientById(patientId: number): void {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) this.selectPatient(patient);
  }

  getPatientFlagged(patientId: number): boolean {
    return this.flaggedPatientIds.has(patientId);
  }

  confirmAppointment(id: number): void {
    this.apiService.updateAppointmentStatus(id, 'CONFIRMED').subscribe({
      next: () => {
        if (this.selectedPatient) this.selectPatient(this.selectedPatient);
      }
    });
  }

  completeAppointment(id: number): void {
    this.apiService.updateAppointmentStatus(id, 'COMPLETED').subscribe({
      next: () => {
        if (this.selectedPatient) this.selectPatient(this.selectedPatient);
        this.completedAppointments++;
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getWeightGainClass(): string {
    if (!this.patientPregnancy) return 'text-gray-700';
    const gain = this.patientPregnancy.currentWeight - this.patientPregnancy.prePregnancyWeight;
    if (gain > 16) return 'text-orange-600';
    if (gain < 5 && this.patientPregnancy.currentWeek > 20) return 'text-orange-600';
    return 'text-green-600';
  }

  getSeverityDot(severity: string): string {
    const map: Record<string, string> = {
      'MILD': 'bg-green-400', 'MODERATE': 'bg-yellow-400', 'SEVERE': 'bg-orange-400', 'CRITICAL': 'bg-red-500'
    };
    return map[severity] || 'bg-gray-400';
  }

  getSeverityBadge(severity: string): string {
    const map: Record<string, string> = {
      'MILD': 'bg-green-100 text-green-700', 'MODERATE': 'bg-yellow-100 text-yellow-700',
      'SEVERE': 'bg-orange-100 text-orange-700', 'CRITICAL': 'bg-red-100 text-red-700'
    };
    return map[severity] || '';
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'SCHEDULED': 'bg-blue-100 text-blue-700', 'CONFIRMED': 'bg-purple-100 text-purple-700',
      'COMPLETED': 'bg-green-100 text-green-700', 'CANCELLED': 'bg-red-100 text-red-700',
      'NO_SHOW': 'bg-gray-200 text-gray-600'
    };
    return map[status] || '';
  }

  getApptTypeBg(type: string): string {
    const map: Record<string, string> = {
      'CHECKUP': 'bg-blue-100', 'ULTRASOUND': 'bg-purple-100', 'LAB_WORK': 'bg-amber-100',
      'EMERGENCY': 'bg-red-100', 'CONSULTATION': 'bg-teal-100'
    };
    return map[type] || 'bg-gray-100';
  }

  getApptTypeColor(type: string): string {
    const map: Record<string, string> = {
      'CHECKUP': 'text-blue-600', 'ULTRASOUND': 'text-purple-600', 'LAB_WORK': 'text-amber-600',
      'EMERGENCY': 'text-red-600', 'CONSULTATION': 'text-teal-600'
    };
    return map[type] || 'text-gray-600';
  }

  getApptIcon(type: string): string {
    const map: Record<string, string> = {
      'CHECKUP': 'stethoscope', 'ULTRASOUND': 'monitor', 'LAB_WORK': 'science',
      'EMERGENCY': 'emergency', 'CONSULTATION': 'chat'
    };
    return map[type] || 'event';
  }

  // Doctor Advice methods
  submitAdvice(): void {
    if (this.adviceForm.invalid || !this.selectedPatient) return;
    this.savingAdvice = true;
    const doctorId = this.authService.user()?.id;
    if (!doctorId) return;

    const data = {
      ...this.adviceForm.value,
      patientId: this.selectedPatient.id
    };

    this.apiService.createDoctorAdvice(doctorId, data).subscribe({
      next: (advice) => {
        this.patientAdvice.unshift(advice);
        this.adviceForm.reset({ priority: 'NORMAL', category: '', title: '', message: '', actionItems: '' });
        this.savingAdvice = false;
        this.snackBar.open('Advice sent successfully! ✅', 'Close', { duration: 3000 });
      },
      error: () => {
        this.savingAdvice = false;
        this.snackBar.open('Failed to send advice', 'Close', { duration: 3000 });
      }
    });
  }

  deleteAdvice(id: number): void {
    if (!confirm('Delete this advice?')) return;
    this.apiService.deleteDoctorAdvice(id).subscribe({
      next: () => {
        this.patientAdvice = this.patientAdvice.filter(a => a.id !== id);
        this.snackBar.open('Advice deleted 🗑️', 'Close', { duration: 2000 });
      }
    });
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

  getPriorityBorder(priority: string): string {
    const map: Record<string, string> = {
      'LOW': 'border-gray-100 bg-gray-50', 'NORMAL': 'border-blue-100 bg-blue-50',
      'HIGH': 'border-orange-200 bg-orange-50', 'URGENT': 'border-red-200 bg-red-50'
    };
    return map[priority] || 'border-gray-100 bg-gray-50';
  }
}
