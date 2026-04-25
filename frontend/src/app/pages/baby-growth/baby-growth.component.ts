import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AiService } from '../../core/services/ai.service';
import { BabyGrowth, PregnancyProfile } from '../../core/models/models';

@Component({
  selector: 'app-baby-growth',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule
  ],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('cardReveal', [
      transition(':enter', [
        query('.metric-card', [
          style({ opacity: 0, transform: 'translateY(25px) scale(0.95)' }),
          stagger(80, [
            animate('450ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('pulseGlow', [
      transition(':enter', [
        style({ opacity: 0, boxShadow: '0 0 0px rgba(255, 143, 175, 0)' }),
        animate('600ms ease-out', style({ opacity: 1, boxShadow: '0 0 30px rgba(255, 143, 175, 0.4)' }))
      ])
    ])
  ],
  template: `
    <div class="space-y-6 animate-fade-in px-1">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold" style="font-family:'Outfit',sans-serif;color:var(--mama-berry)">Baby Growth 👶</h1>
          <p class="text-sm text-gray-400 mt-0.5">Track and cherish every moment</p>
        </div>
        <button mat-raised-button (click)="toggleForm()"
                class="!rounded-full !text-white !px-5" style="background:linear-gradient(135deg,var(--mama-rose),var(--mama-rose-deep))!important;box-shadow:0 6px 20px rgba(212,83,126,0.25)">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon> {{ showForm ? 'Cancel' : 'Record' }}
        </button>
      </div>

      <!-- No Profile Warning -->
      <div *ngIf="!loading && !activeProfile" class="rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50/50 p-10 text-center">
        <mat-icon class="!text-5xl text-pink-200">child_friendly</mat-icon>
        <p class="mt-3 font-semibold text-pink-400">No pregnancy profile found</p>
        <p class="mt-1 text-sm text-pink-300">Create your pregnancy profile first to start tracking.</p>
      </div>

      <!-- Hero Week Card -->
      <div *ngIf="activeProfile" class="rounded-3xl p-6" style="background:rgba(255,255,255,0.65);backdrop-filter:blur(20px);border:1px solid rgba(232,196,216,0.2);box-shadow:0 12px 40px rgba(200,141,184,0.12)">
        <div class="flex flex-wrap items-center gap-6">
          <div class="relative">
            <div class="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style="background:linear-gradient(135deg,var(--mama-rose),var(--mama-purple))">
              <span class="text-4xl font-bold text-white">{{ activeProfile.currentWeek }}</span>
            </div>
            <span class="absolute -bottom-1 -right-1 text-xs font-bold bg-white text-pink-500 px-2 py-0.5 rounded-full shadow">WEEK</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-pink-500">Current Week</p>
            <p class="text-lg font-bold text-gray-800 mt-0.5">
              {{ getTrimesterMessage() }}
            </p>
            <p class="text-sm text-gray-400 mt-1">{{ activeProfile.expectedDueDate | date:'MMMM d, y' }} due date</p>
          </div>
          <div class="text-right rounded-2xl bg-white/80 px-4 py-2 shadow-sm">
            <p class="text-xs text-gray-400 uppercase tracking-wider">Day</p>
            <p class="text-2xl font-bold text-purple-500">{{ getDayOfWeek() }}</p>
          </div>
        </div>
      </div>

      <!-- Record Form -->
      <div *ngIf="showForm && activeProfile" [@fadeSlideIn] class="space-y-4">
        <!-- Week Number -->
        <mat-card class="!rounded-3xl !shadow-md !bg-gradient-to-br from-white to-pink-50/30 border border-pink-100/40">
          <div class="p-5">
            <h3 class="font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <mat-icon class="text-pink-400">calendar_today</mat-icon> Recording Week {{ formData.weekNumber }}
            </h3>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <!-- Weight -->
              <div class="metric-card rounded-2xl border border-gray-100 bg-white p-4 hover:border-pink-200 hover:shadow-md transition-all">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center">
                    <mat-icon class="!text-sm text-pink-400">scale</mat-icon>
                  </div>
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <input type="number" [(ngModel)]="formData.weightGrams" placeholder="0"
                         class="w-full text-2xl font-bold text-gray-800 outline-none bg-transparent">
                  <span class="text-sm text-gray-400">g</span>
                </div>
              </div>

              <!-- Length -->
              <div class="metric-card rounded-2xl border border-gray-100 bg-white p-4 hover:border-purple-200 hover:shadow-md transition-all">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                    <mat-icon class="!text-sm text-purple-400">straighten</mat-icon>
                  </div>
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Length</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <input type="number" [(ngModel)]="formData.lengthCm" placeholder="0"
                         class="w-full text-2xl font-bold text-gray-800 outline-none bg-transparent">
                  <span class="text-sm text-gray-400">cm</span>
                </div>
              </div>

              <!-- Head Circumference -->
              <div class="metric-card rounded-2xl border border-gray-100 bg-white p-4 hover:border-fuchsia-200 hover:shadow-md transition-all">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-xl bg-fuchsia-50 flex items-center justify-center">
                    <mat-icon class="!text-sm text-fuchsia-400">circle</mat-icon>
                  </div>
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Head (HC)</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <input type="number" [(ngModel)]="formData.headCircumferenceCm" placeholder="0"
                         class="w-full text-2xl font-bold text-gray-800 outline-none bg-transparent">
                  <span class="text-sm text-gray-400">cm</span>
                </div>
              </div>

              <!-- Abdominal Circumference -->
              <div class="metric-card rounded-2xl border border-gray-100 bg-white p-4 hover:border-rose-200 hover:shadow-md transition-all">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                    <mat-icon class="!text-sm text-rose-400">circle_outline</mat-icon>
                  </div>
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Abdomen (AC)</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <input type="number" [(ngModel)]="formData.abdominalCircumferenceCm" placeholder="0"
                         class="w-full text-2xl font-bold text-gray-800 outline-none bg-transparent">
                  <span class="text-sm text-gray-400">cm</span>
                </div>
              </div>

              <!-- Heart Rate -->
              <div class="metric-card rounded-2xl border border-gray-100 bg-white p-4 hover:border-red-200 hover:shadow-md transition-all">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <mat-icon class="!text-sm text-red-400">favorite</mat-icon>
                  </div>
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Heart Rate</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <input type="number" [(ngModel)]="formData.heartRate" placeholder="0"
                         class="w-full text-2xl font-bold text-gray-800 outline-none bg-transparent">
                  <span class="text-sm text-gray-400">BPM</span>
                </div>
              </div>

              <!-- Recorded Date -->
              <div class="metric-card rounded-2xl border border-gray-100 bg-white p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <mat-icon class="!text-sm text-amber-400">event</mat-icon>
                  </div>
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</span>
                </div>
                <input type="date" [(ngModel)]="formData.recordedDate"
                       class="w-full text-lg font-semibold text-gray-700 outline-none bg-transparent">
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Ultrasound Section -->
        <mat-card class="!rounded-3xl !shadow-md !bg-white border border-gray-100">
          <div class="p-5">
            <h3 class="font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <mat-icon class="text-purple-400">photo_camera</mat-icon> Upload Ultrasound
            </h3>

            <!-- Upload Zone -->
            <div *ngIf="!ultrasoundPreview"
                 class="relative border-2 border-dashed border-pink-200 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/30 transition-all"
                 (click)="fileInput.click()"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)">
              <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                <mat-icon class="!text-3xl text-pink-300">cloud_upload</mat-icon>
              </div>
              <p class="font-semibold text-gray-600">Drag & drop or tap to upload</p>
              <p class="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
            </div>

            <!-- Preview -->
            <div *ngIf="ultrasoundPreview" class="relative">
              <div class="absolute inset-0 rounded-2xl border-2 border-pink-300 bg-gradient-to-br from-pink-100/50 to-purple-100/50 animate-pulse opacity-50"></div>
              <img [src]="ultrasoundPreview" alt="Ultrasound preview" class="relative w-full max-h-64 object-contain rounded-2xl shadow-md">
              <button mat-icon-button (click)="removeUltrasound()" class="absolute top-2 right-2 !bg-white/90 !shadow-md !text-gray-400 hover:!text-red-400">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- AI Analyzing -->
            <div *ngIf="analyzingUltrasound" class="mt-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-5 text-center">
              <mat-spinner diameter="32" class="mx-auto mb-3"></mat-spinner>
              <p class="font-semibold text-purple-600">Analyzing your little one's growth...</p>
              <p class="text-xs text-gray-400 mt-1">Hold on mama, our AI is taking a peek 👀</p>
            </div>
          </div>
        </mat-card>

        <!-- AI Ultrasound Insight -->
        <div *ngIf="ultrasoundInsight" [@pulseGlow] class="rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-lg">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-md">
              <mat-icon class="text-white !text-lg">auto_awesome</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-gray-800">AI Ultrasound Insight ✨</h3>
              <p class="text-xs text-gray-400">Week {{ ultrasoundInsight.pregnancy_week }}</p>
            </div>
          </div>

          <div class="rounded-2xl bg-white/80 p-4 mb-4">
            <p class="text-2xl text-center font-bold text-pink-500 mb-1">{{ ultrasoundInsight.fruit_comparison }}</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-start gap-3 p-3 rounded-xl bg-white/60">
              <span class="text-lg">👶</span>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</p>
                <p class="text-sm font-medium text-gray-700">{{ ultrasoundInsight.position_note }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 rounded-xl bg-white/60">
              <span class="text-lg">🌀</span>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Movement</p>
                <p class="text-sm font-medium text-gray-700">{{ ultrasoundInsight.movement_note }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 rounded-xl bg-white/60">
              <span class="text-lg">💗</span>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Heart Rate</p>
                <p class="text-sm font-medium text-gray-700">{{ ultrasoundInsight.heartbeat_range }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 rounded-xl bg-white/60">
              <span class="text-lg">🌱</span>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Development</p>
                <p class="text-sm font-medium text-gray-700">{{ ultrasoundInsight.development_note }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 p-4 text-center">
            <p class="text-sm italic text-purple-600">"{{ ultrasoundInsight.reassurance }}"</p>
          </div>
        </div>

        <!-- Development Notes -->
        <mat-card class="!rounded-3xl !shadow-md !bg-white border border-gray-100">
          <div class="p-5">
            <h3 class="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <mat-icon class="text-amber-400">edit_note</mat-icon> Development Notes
            </h3>
            <textarea [(ngModel)]="formData.developmentNotes" rows="4"
                      placeholder="Write observations or feelings about this week..."
                      class="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-700 resize-none focus:outline-none focus:border-pink-200 transition-colors"></textarea>
          </div>
        </mat-card>

        <!-- Save Button -->
        <button mat-raised-button (click)="onSubmit()" [disabled]="saving"
                class="!w-full !rounded-full !text-white !py-4 !text-base !font-bold shadow-lg hover:shadow-xl transition-all" style="background:linear-gradient(135deg,var(--mama-rose),var(--mama-rose-deep))!important;box-shadow:0 8px 28px rgba(212,83,126,0.3)">
          <mat-icon class="!text-xl">{{ saving ? 'hourglass_empty' : 'save' }}</mat-icon>
          {{ saving ? 'Saving...' : '💾 Save Growth Record' }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Growth Records Grid -->
      <div *ngIf="!loading && growthRecords.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let record of growthRecords; let i = index"
                  class="!rounded-3xl hover:-translate-y-1 transition-all duration-300" style="background:rgba(255,255,255,0.7);backdrop-filter:blur(16px);border:1px solid rgba(232,196,216,0.15);box-shadow:0 8px 32px rgba(200,141,184,0.12)">
          <!-- Week Header -->
          <div class="p-4 rounded-t-3xl" style="background:linear-gradient(135deg,var(--mama-blush),var(--mama-lavender-light));border-bottom:1px solid rgba(232,196,216,0.15)">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style="background:linear-gradient(135deg,var(--mama-rose),var(--mama-purple))">
                  <span class="text-white font-bold">{{ record.weekNumber }}</span>
                </div>
                <div>
                  <p class="font-bold text-gray-800">Week {{ record.weekNumber }}</p>
                  <p class="text-xs text-gray-400">{{ record.recordedDate | date:'MMM d, y' }}</p>
                </div>
              </div>
              <span *ngIf="record.growthPercentile" class="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                {{ record.growthPercentile }}
              </span>
            </div>
          </div>

          <!-- Metrics -->
          <div class="p-4">
            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-xl bg-pink-50 p-3 text-center">
                <p class="text-lg font-bold text-pink-500">{{ record.weightGrams || '--' }}</p>
                <p class="text-[10px] text-gray-400">grams</p>
              </div>
              <div class="rounded-xl bg-purple-50 p-3 text-center">
                <p class="text-lg font-bold text-purple-500">{{ record.lengthCm || '--' }}</p>
                <p class="text-[10px] text-gray-400">cm</p>
              </div>
              <div class="rounded-xl bg-fuchsia-50 p-3 text-center" *ngIf="record.headCircumferenceCm">
                <p class="text-lg font-bold text-fuchsia-500">{{ record.headCircumferenceCm }}</p>
                <p class="text-[10px] text-gray-400">head (cm)</p>
              </div>
              <div class="rounded-xl bg-red-50 p-3 text-center" *ngIf="record.heartRate">
                <p class="text-lg font-bold text-red-400">{{ record.heartRate }}</p>
                <p class="text-[10px] text-gray-400">BPM</p>
              </div>
            </div>

            <p *ngIf="record.developmentNotes" class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 italic">
              📝 {{ record.developmentNotes }}
            </p>
            <p *ngIf="record.aiComparison" class="mt-2 text-xs text-purple-500 bg-purple-50 rounded-xl p-3">
              🤖 {{ record.aiComparison }}
            </p>
            <div *ngIf="record.ultrasoundImageUrl" class="mt-3 rounded-xl overflow-hidden">
              <img [src]="record.ultrasoundImageUrl" alt="Ultrasound" class="w-full h-32 object-cover cursor-pointer" (click)="viewUltrasound(record.ultrasoundImageUrl)">
            </div>
          </div>

          <!-- Actions -->
          <div class="px-4 pb-4 flex items-center gap-1 justify-end">
            <button mat-icon-button (click)="editRecord(record)" class="!w-8 !h-8" matTooltip="Edit">
              <mat-icon class="!text-sm text-gray-300 hover:text-pink-400">edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteRecord(record.id)" class="!w-8 !h-8" matTooltip="Delete">
              <mat-icon class="!text-sm text-gray-300 hover:text-red-400">delete</mat-icon>
            </button>
          </div>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && growthRecords.length === 0 && activeProfile" class="text-center py-12">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <mat-icon class="!text-5xl text-pink-300">child_friendly</mat-icon>
        </div>
        <p class="font-semibold text-gray-500">No growth records yet</p>
        <p class="text-sm text-gray-400 mt-1">Tap "Record" to save your first entry!</p>
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
  ultrasoundPreview: string | null = null;
  analyzingUltrasound = false;
  ultrasoundInsight: any = null;

  formData = {
    weekNumber: 0,
    weightGrams: null as number | null,
    lengthCm: null as number | null,
    headCircumferenceCm: null as number | null,
    abdominalCircumferenceCm: null as number | null,
    heartRate: null as number | null,
    recordedDate: '',
    developmentNotes: '',
    ultrasoundImageUrl: ''
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {}

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
          this.formData.weekNumber = this.activeProfile.currentWeek;
          this.formData.recordedDate = new Date().toISOString().split('T')[0];
          this.apiService.getGrowthRecords(this.activeProfile.id).subscribe({
            next: (records) => {
              this.growthRecords = records;
              this.loading = false;
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
      this.formData.weekNumber = this.activeProfile?.currentWeek || 0;
      this.formData.recordedDate = new Date().toISOString().split('T')[0];
    }
  }

  editRecord(record: BabyGrowth): void {
    this.editingId = record.id;
    this.showForm = true;
    this.formData = {
      weekNumber: record.weekNumber,
      weightGrams: record.weightGrams,
      lengthCm: record.lengthCm,
      headCircumferenceCm: record.headCircumferenceCm,
      abdominalCircumferenceCm: record.abdominalCircumferenceCm,
      heartRate: record.heartRate,
      recordedDate: record.recordedDate,
      developmentNotes: record.developmentNotes || '',
      ultrasoundImageUrl: record.ultrasoundImageUrl || ''
    };
    if (record.ultrasoundImageUrl) {
      this.ultrasoundPreview = record.ultrasoundImageUrl;
    }
  }

  resetForm(): void {
    this.formData = {
      weekNumber: this.activeProfile?.currentWeek || 0,
      weightGrams: null,
      lengthCm: null,
      headCircumferenceCm: null,
      abdominalCircumferenceCm: null,
      heartRate: null,
      recordedDate: new Date().toISOString().split('T')[0],
      developmentNotes: '',
      ultrasoundImageUrl: ''
    };
    this.editingId = null;
    this.showForm = false;
    this.saving = false;
    this.ultrasoundPreview = null;
    this.ultrasoundInsight = null;
  }

  onSubmit(): void {
    if (!this.activeProfile) return;
    this.saving = true;

    // Store image URL in formData before saving so it's preserved after reset
    if (this.ultrasoundPreview) {
      this.formData.ultrasoundImageUrl = this.ultrasoundPreview;
    }

    const data = {
      ...this.formData,
      pregnancyId: this.activeProfile.id,
      ultrasoundImageUrl: this.ultrasoundPreview || this.formData.ultrasoundImageUrl
    };

    const request$ = this.editingId
      ? this.apiService.updateGrowthRecord(this.editingId, data)
      : this.apiService.createGrowthRecord(data);

    request$.subscribe({
      next: (savedRecord) => {
        // Ensure image appears immediately after save, even if backend response omits it.
        const recordWithImage = {
          ...savedRecord,
          ultrasoundImageUrl: savedRecord?.ultrasoundImageUrl || data.ultrasoundImageUrl || this.ultrasoundPreview || ''
        };

        this.upsertGrowthRecord(recordWithImage as BabyGrowth);
        this.snackBar.open(this.editingId ? 'Record updated!' : 'Growth record saved! 🌸', 'Close', { duration: 3000 });
        this.resetForm();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save record', 'Close', { duration: 3000 });
      }
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.processImage(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processImage(file);
    }
  }

  processImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.ultrasoundPreview = reader.result as string;
      this.triggerUltrasoundAnalysis();
    };
    reader.readAsDataURL(file);
  }

  removeUltrasound(): void {
    this.ultrasoundPreview = null;
    this.ultrasoundInsight = null;
  }

  triggerUltrasoundAnalysis(): void {
    if (!this.activeProfile) return;
    this.analyzingUltrasound = true;

    this.aiService.analyzeUltrasound(this.activeProfile.currentWeek, this.ultrasoundPreview).subscribe({
      next: (insight) => {
        this.ultrasoundInsight = insight;
        this.analyzingUltrasound = false;
      },
      error: () => {
        this.analyzingUltrasound = false;
        this.snackBar.open('AI insight unavailable — your photo is still saved!', 'Close', { duration: 3000 });
      }
    });
  }

  getTrimesterMessage(): string {
    const week = this.activeProfile?.currentWeek || 0;
    if (week <= 12) return 'First Trimester — forming beautifully 🌱';
    if (week <= 27) return 'Second Trimester — feeling wonderful 💪';
    if (week <= 36) return 'Third Trimester — almost there 🎀';
    return 'Final stretch — baby is coming soon 🌟';
  }

  getDayOfWeek(): string {
    if (!this.activeProfile?.lastMenstrualPeriod) return '--';
    const lmp = new Date(this.activeProfile.lastMenstrualPeriod);
    const today = new Date();
    const totalDays = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    return (totalDays % 7).toString();
  }

  viewUltrasound(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }

  private upsertGrowthRecord(record: BabyGrowth): void {
    const index = this.growthRecords.findIndex(r => r.id === record.id);
    if (index >= 0) {
      this.growthRecords[index] = record;
    } else {
      this.growthRecords.push(record);
    }

    this.growthRecords = [...this.growthRecords].sort((a, b) => {
      if (a.weekNumber !== b.weekNumber) {
        return a.weekNumber - b.weekNumber;
      }
      return new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime();
    });
  }
}