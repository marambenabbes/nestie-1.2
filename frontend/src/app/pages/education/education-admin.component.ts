import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { EducationService } from '../../core/services/education.service';
import { EducationMediaItem, EducationModule, EducationModulePayload } from '../../core/models/models';

@Component({
  selector: 'app-education-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule, MatTooltipModule],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(16px)' }))
      ])
    ]),
    trigger('cardReveal', [
      transition(':enter', [
        style({ opacity: 0, scale: 0.95 }),
        animate('300ms ease-out', style({ opacity: 1, scale: 1 }))
      ])
    ])
  ],
  template: `
    <div class="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto">
      <!-- Header -->
      <div class="rounded-[2.5rem] bg-white border border-pink-100 p-8 shadow-[0_8px_30px_rgb(228,161,208,0.1)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(228,161,208,0.2)]">
        <div class="flex flex-wrap items-center justify-between gap-6">
          <div class="transition-transform duration-500 hover:translate-x-2">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 mb-1">Doctor Studio</p>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">Lesson Studio</h1>
            <p class="mt-2 text-[15px] text-gray-500 leading-relaxed max-w-md">Design and publish interactive education modules to guide patients through their journey.</p>
          </div>
          <div class="flex flex-wrap items-center gap-6">
            <div class="flex gap-4">
              <div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-6 py-4 text-center shadow-sm min-w-[110px] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-emerald-50">
                <p class="text-3xl font-black text-emerald-600">{{ publishedCount() }}</p>
                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-800/60 mt-1.5">Published</p>
              </div>
              <div class="rounded-2xl border border-purple-100 bg-purple-50/50 px-6 py-4 text-center shadow-sm min-w-[110px] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-purple-50">
                <p class="text-3xl font-black text-purple-600">{{ draftCount() }}</p>
                <p class="text-[10px] font-black uppercase tracking-widest text-purple-500 mt-1.5">Drafts</p>
              </div>
            </div>
            <button class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_4px_14px_0_rgb(244,63,94,0.39)] hover:shadow-[0_6px_20px_rgb(244,63,94,0.23)] hover:-translate-y-1 transition-all duration-300 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    (click)="resetForm(); showForm = true">
              <mat-icon class="!text-[18px]">add</mat-icon>
              New Module
            </button>
          </div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="rounded-full border border-pink-100 bg-white p-2.5 flex flex-wrap items-center justify-between shadow-sm transition-all hover:shadow-md">
        <div class="flex gap-1.5">
          <button class="rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5"
                  (click)="selectedFilter.set('all')"
                  [class]="selectedFilter() === 'all' ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'">All</button>
          <button class="rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5"
                  (click)="selectedFilter.set('published')"
                  [class]="selectedFilter() === 'published' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'">Published</button>
          <button class="rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5"
                  (click)="selectedFilter.set('draft')"
                  [class]="selectedFilter() === 'draft' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'">Drafts</button>
        </div>
        <div class="relative w-full max-w-md px-2 py-1 md:w-auto mt-2 md:mt-0">
          <mat-icon class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 !text-[20px]">search</mat-icon>
          <input (input)="onSearchChange($any($event.target).value)"
                 placeholder="Search your library..."
                 class="w-full rounded-full border-none bg-gray-50/80 py-2.5 pl-12 pr-5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-400 focus:shadow-sm" />
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="grid grid-cols-1 gap-8" [class.lg:grid-cols-[1fr_420px]]="showForm" [class.lg:grid-cols-[1fr]]="!showForm">
        
        <!-- Module list -->
        <div [@cardReveal] class="space-y-5 transition-[grid-template-columns] duration-500">
          <div *ngFor="let module of filteredModules()" class="group relative overflow-hidden rounded-[1.5rem] border border-pink-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.2)] hover:border-pink-300 hover:-translate-y-1">
            <!-- decorative accent line -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300" 
                 [class]="module.published ? 'bg-emerald-400' : 'bg-purple-300'"></div>
                 
            <div class="flex items-start justify-between gap-6 pl-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap mb-2.5">
                  <h3 class="text-xl font-extrabold text-gray-900 truncate leading-tight group-hover:text-pink-600 transition-colors duration-300">{{ module.title }}</h3>
                  <span class="rounded-md px-2 py-0.5 text-[10px] font-black tracking-widest uppercase border"
                        [class]="module.published ? 'bg-emerald-50 border-emerald-100/50 text-emerald-700' : 'bg-purple-50 border-purple-200 text-purple-600'">
                    {{ module.published ? 'Published' : 'Draft' }}
                  </span>
                  <span class="rounded-md border border-pink-100 bg-pink-50/50 px-2.5 py-0.5 text-[10px] font-bold text-pink-600 tracking-wide">
                    <mat-icon class="!text-[12px] align-text-bottom mr-0.5">schedule</mat-icon>
                    {{ module.estimatedMinutes }} min
                  </span>
                </div>
                <p class="text-[15px] leading-relaxed text-gray-500 line-clamp-2 pr-4 transition-colors group-hover:text-gray-600">{{ module.description }}</p>
                
                <div class="mt-5 flex flex-wrap items-center gap-6">
                  <div class="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                     <div class="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                         <mat-icon class="!text-[14px]">collections</mat-icon>
                     </div>
                     <span class="text-xs font-bold tracking-wide text-gray-600">{{ module.mediaItems.length }} Assets</span>
                  </div>
                  <div class="h-4 w-px bg-pink-100"></div>
                  <div class="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                     <div class="flex h-6 w-6 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-500">
                         <mat-icon class="!text-[14px]">psychology</mat-icon>
                     </div>
                     <span class="text-xs font-bold tracking-wide text-gray-600">{{ module.quizCount }} Questions</span>
                  </div>
                </div>
              </div>
              
              <div class="flex shrink-0 flex-col gap-2.5 relative z-10 transition-transform duration-300">
                <button class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300 focus:outline-none"
                        (click)="editModule(module)" matTooltip="Edit Module">
                  <mat-icon class="!text-[18px]">edit</mat-icon>
                </button>
                <button class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300 focus:outline-none"
                        (click)="openQuizManager(module.id)" matTooltip="Manage Quizzes">
                  <mat-icon class="!text-[18px]">quiz</mat-icon>
                </button>
                <div class="h-px w-6 mx-auto bg-gray-100 my-0.5"></div>
                <button class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                        (click)="deleteModule(module.id)" matTooltip="Delete Module">
                  <mat-icon class="!text-[18px]">delete_outline</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredModules().length === 0" class="rounded-[2.5rem] border-2 border-dashed border-pink-200 bg-white p-16 text-center shadow-sm animate-fade-in">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-pink-50 text-4xl shadow-sm border border-pink-100 animate-bounce">📚</div>
            <h3 class="mt-5 text-xl font-extrabold text-gray-900">No modules found</h3>
            <p class="mt-2 text-[15px] text-gray-500">Adjust your search or create a new module to begin building your library.</p>
            <button class="mt-6 inline-flex items-center gap-2 rounded-full border border-pink-200 px-6 py-2.5 text-sm font-bold text-pink-700 shadow-sm hover:bg-pink-50 transition-all hover:-translate-y-0.5"
                    (click)="selectedFilter.set('all'); onSearchChange('')" *ngIf="selectedFilter() !== 'all' || searchTerm()">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Create/Edit form panel -->
        <div [@fadeSlideIn] class="lg:sticky lg:top-8 z-10" *ngIf="showForm">
          <div class="rounded-[2rem] border border-pink-100 bg-white shadow-[0_20px_40px_rgba(244,114,182,0.15)] overflow-hidden transition-all duration-500 hover:shadow-[0_25px_50px_rgba(244,114,182,0.25)]">
            <div class="flex items-center justify-between border-b border-pink-50 bg-gradient-to-r from-pink-50/50 to-rose-50/50 p-6">
              <h2 class="text-xl font-extrabold tracking-tight text-gray-900">
                {{ editingModuleId() ? 'Edit Module' : 'Create Module' }}
              </h2>
              <button class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-pink-100 hover:text-pink-600 hover:scale-110 hover:rotate-90 transition-all duration-300 focus:outline-none"
                      (click)="showForm = false; resetForm()">
                <mat-icon class="!text-[20px]">close</mat-icon>
              </button>
            </div>

            <form [formGroup]="moduleForm" class="p-6 md:p-8 space-y-8 max-h-[85vh] overflow-y-auto" (ngSubmit)="saveModule()">
              <!-- Basics Section -->
              <div class="space-y-4 group">
                <h3 class="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-pink-500 transition-transform group-hover:translate-x-1">
                  <mat-icon class="!text-[16px]">info</mat-icon> Basics
                </h3>
                <mat-form-field appearance="outline" class="w-full transition-shadow duration-300 hover:shadow-md focus-within:shadow-md rounded-md">
                  <mat-label>Module Title</mat-label>
                  <input matInput formControlName="title" placeholder="e.g. Healthy Eating at Week 20" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full transition-shadow duration-300 hover:shadow-md focus-within:shadow-md rounded-md">
                  <mat-label>Short Description</mat-label>
                  <textarea matInput rows="2" formControlName="description" placeholder="A brief hook or summary"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full transition-shadow duration-300 hover:shadow-md focus-within:shadow-md rounded-md">
                  <mat-label>Full Lesson Content</mat-label>
                  <textarea matInput rows="6" formControlName="instructions" placeholder="Detailed educational content..."></textarea>
                </mat-form-field>
              </div>

              <!-- Media Assets Section -->
              <div class="space-y-4 rounded-[1.5rem] bg-gradient-to-br from-pink-50/40 to-fuchsia-50/40 p-5 md:p-6 border border-pink-100 transition-all hover:shadow-inner">
                <div class="flex items-center justify-between border-b border-pink-100 pb-4 mb-4">
                  <h3 class="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-pink-600">
                    <mat-icon class="!text-[16px]">collections</mat-icon> Media Assets
                  </h3>
                  <button type="button" class="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wide text-fuchsia-600 shadow-sm border border-fuchsia-100 hover:border-fuchsia-300 hover:bg-fuchsia-50 hover:scale-105 transition-all duration-300 focus:outline-none hover:-translate-y-0.5"
                          (click)="addMedia()">
                    <mat-icon class="!text-[16px]">add</mat-icon> Add Media
                  </button>
                </div>
                
                <div formArrayName="mediaItems" class="space-y-4 pr-1">
                  <div *ngFor="let media of mediaItems.controls; let i = index" [formGroupName]="i"
                       class="relative rounded-2xl border border-pink-100 bg-white p-5 shadow-sm group hover:border-fuchsia-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div class="grid grid-cols-1 gap-4">
                      <mat-form-field appearance="outline" class="w-full !text-sm">
                        <mat-label>Asset Type</mat-label>
                        <mat-select formControlName="type">
                          <mat-option value="VIDEO">Video</mat-option>
                          <mat-option value="IMAGE">Image</mat-option>
                          <mat-option value="GIF">GIF</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full hidden">
                        <mat-label>Order</mat-label>
                        <input matInput type="number" formControlName="displayOrder" />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full !text-sm">
                        <mat-label>Asset URL</mat-label>
                        <input matInput formControlName="url" placeholder="https://..." />
                      </mat-form-field>
                      <div class="flex flex-wrap items-center gap-2">
                        <button type="button"
                                class="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-50 px-4 py-2 text-xs font-bold tracking-wide text-fuchsia-700 border border-fuchsia-100 transition-all duration-300 hover:bg-fuchsia-100 hover:-translate-y-0.5 disabled:opacity-60"
                                (click)="mediaFileInput.click()"
                                [disabled]="isMediaUploading(i)">
                          <mat-icon class="!text-[16px]">upload</mat-icon>
                          {{ isMediaUploading(i) ? 'Uploading file...' : 'Upload image/video' }}
                        </button>
                        <span class="text-xs font-medium text-gray-500" *ngIf="isMediaUploading(i)">Please wait while the file is uploaded.</span>
                        <input #mediaFileInput
                               type="file"
                               accept="image/*,video/*"
                               class="hidden"
                               (change)="onMediaFileSelected($event, i)" />
                      </div>
                      <mat-form-field appearance="outline" class="w-full !text-sm">
                        <mat-label>Caption</mat-label>
                        <input matInput formControlName="caption" />
                      </mat-form-field>
                    </div>
                    
                    <div class="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
                      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-fuchsia-400">Asset #{{i+1}}</div>
                      <div class="flex gap-2">
                        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-pink-100 hover:text-pink-600 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:-translate-y-0" (click)="moveMedia(i, -1)" [disabled]="i === 0"><mat-icon class="!text-[16px]">arrow_upward</mat-icon></button>
                        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-pink-100 hover:text-pink-600 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:-translate-y-0" (click)="moveMedia(i, 1)" [disabled]="i === mediaItems.length - 1"><mat-icon class="!text-[16px]">arrow_downward</mat-icon></button>
                        <div class="w-px h-8 bg-gray-200 mx-1"></div>
                        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-all duration-200 hover:-translate-y-0.5 hover:rotate-12 disabled:opacity-30 disabled:hover:rotate-0" (click)="removeMedia(i)" [disabled]="mediaItems.length === 1"><mat-icon class="!text-[16px]">delete</mat-icon></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Publishing Section -->
              <div class="space-y-5 border-t border-gray-100 pt-8 group">
                <h3 class="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-500 transition-transform group-hover:translate-x-1">
                  <mat-icon class="!text-[16px]">publish</mat-icon> Publishing Settings
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <mat-form-field appearance="outline" class="transition-shadow duration-300 hover:shadow-sm">
                    <mat-label>Est. Minutes</mat-label>
                    <input matInput type="number" formControlName="estimatedMinutes" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="transition-shadow duration-300 hover:shadow-sm">
                    <mat-label>Thumbnail URL</mat-label>
                    <input matInput formControlName="thumbnailUrl" placeholder="Optional cover image" />
                  </mat-form-field>
                  <div class="col-span-2 flex flex-wrap items-center gap-2">
                    <button type="button"
                            class="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold tracking-wide text-emerald-700 transition-all duration-300 hover:bg-emerald-100 hover:-translate-y-0.5 disabled:opacity-60"
                            (click)="thumbnailFileInput.click()"
                            [disabled]="uploadingThumbnail()">
                      <mat-icon class="!text-[16px]">image</mat-icon>
                      {{ uploadingThumbnail() ? 'Uploading thumbnail...' : 'Upload thumbnail image' }}
                    </button>
                    <span class="text-xs font-medium text-gray-500" *ngIf="uploadingThumbnail()">Uploading thumbnail to education media storage.</span>
                    <input #thumbnailFileInput
                           type="file"
                           accept="image/*"
                           class="hidden"
                           (change)="onThumbnailFileSelected($event)" />
                  </div>
                </div>
                
                <div class="flex items-center justify-between rounded-xl border-2 border-gray-100 bg-white px-5 py-4 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5" [class.!border-emerald-200]="moduleForm.value.published" [class.!bg-emerald-50]="moduleForm.value.published">
                  <div>
                    <h4 class="text-sm font-bold text-gray-900 transition-colors" [class.!text-emerald-900]="moduleForm.value.published">Module Status</h4>
                    <p class="text-xs text-gray-500 mt-1 font-medium">{{ moduleForm.value.published ? 'Visible to patients across platform' : 'Hidden as draft' }}</p>
                  </div>
                  <mat-slide-toggle formControlName="published" color="primary"></mat-slide-toggle>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button type="submit" [disabled]="moduleForm.invalid || saving() || uploadingThumbnail() || anyMediaUploading()"
                        class="flex-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-4 text-sm font-bold tracking-wide text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                  {{ editingModuleId() ? 'Update Module' : 'Create Module' }}
                </button>
                <button type="button" class="rounded-full border border-pink-200 bg-white px-8 py-4 text-sm font-bold tracking-wide text-pink-600 shadow-sm hover:bg-pink-50 hover:-translate-y-1 transition-all duration-300 focus:outline-none"
                        (click)="resetForm()">
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EducationAdminComponent implements OnInit {
  protected readonly modules = signal<EducationModule[]>([]);
  protected readonly editingModuleId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly selectedFilter = signal<'all' | 'published' | 'draft'>('all');
  protected readonly searchTerm = signal('');
  protected readonly uploadingThumbnail = signal(false);
  protected readonly uploadingMediaRows = signal<Record<number, boolean>>({});
  protected showForm = false;
  protected readonly publishedCount = computed(() => this.modules().filter((m) => m.published).length);
  protected readonly draftCount = computed(() => this.modules().filter((m) => !m.published).length);
  protected readonly filteredModules = computed(() => {
    const filter = this.selectedFilter();
    const search = this.searchTerm().trim().toLowerCase();
    return this.modules().filter((module) => {
      const matchesFilter = filter === 'all' || (filter === 'published' ? module.published : !module.published);
      const haystack = `${module.title} ${module.description}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesFilter && matchesSearch;
    });
  });

  protected readonly moduleForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    instructions: ['', Validators.required],
    thumbnailUrl: [''],
    estimatedMinutes: [10, [Validators.required, Validators.min(1)]],
    published: [true, Validators.required],
    mediaItems: this.fb.array([this.createMediaGroup({ displayOrder: 1 })]),
  });

  constructor(
    private fb: FormBuilder,
    private educationService: EducationService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  get mediaItems(): FormArray {
    return this.moduleForm.get('mediaItems') as FormArray;
  }

  protected addMedia(): void {
    this.mediaItems.push(this.createMediaGroup({ displayOrder: this.mediaItems.length + 1 }));
    this.syncMediaDisplayOrder();
    this.uploadingMediaRows.set({});
  }

  protected removeMedia(index: number): void {
    if (this.mediaItems.length > 1) {
      this.mediaItems.removeAt(index);
      this.syncMediaDisplayOrder();
      this.uploadingMediaRows.set({});
    }
  }

  protected moveMedia(index: number, direction: -1 | 1): void {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.mediaItems.length) return;
    const control = this.mediaItems.at(index);
    this.mediaItems.removeAt(index);
    this.mediaItems.insert(targetIndex, control);
    this.syncMediaDisplayOrder();
    this.uploadingMediaRows.set({});
  }

  protected anyMediaUploading(): boolean {
    return Object.values(this.uploadingMediaRows()).some((value) => value);
  }

  protected isMediaUploading(index: number): boolean {
    return !!this.uploadingMediaRows()[index];
  }

  protected onMediaFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!this.isSupportedMediaFile(file)) {
      this.snackBar.open('Please upload an image or video file', 'Close', { duration: 3000 });
      input.value = '';
      return;
    }

    this.setMediaUploading(index, true);
    this.educationService.uploadMedia(file).subscribe({
      next: (response) => {
        const mediaGroup = this.mediaItems.at(index);
        mediaGroup?.get('url')?.setValue(response.url);
        mediaGroup?.get('type')?.setValue(this.inferMediaType(response.contentType));
        this.snackBar.open('Media uploaded successfully', 'Close', { duration: 2200 });
      },
      error: () => {
        this.snackBar.open('Failed to upload media file', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.setMediaUploading(index, false);
        input.value = '';
      },
    });
  }

  protected onThumbnailFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Thumbnail must be an image file', 'Close', { duration: 3000 });
      input.value = '';
      return;
    }

    this.uploadingThumbnail.set(true);
    this.educationService.uploadMedia(file).subscribe({
      next: (response) => {
        this.moduleForm.get('thumbnailUrl')?.setValue(response.url);
        this.snackBar.open('Thumbnail uploaded successfully', 'Close', { duration: 2200 });
      },
      error: () => {
        this.snackBar.open('Failed to upload thumbnail', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.uploadingThumbnail.set(false);
        input.value = '';
      },
    });
  }

  protected saveModule(): void {
    if (this.moduleForm.invalid) {
      this.moduleForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.buildPayload();
    const request$ = this.editingModuleId()
      ? this.educationService.updateModule(this.editingModuleId()!, payload)
      : this.educationService.createModule(payload);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.showForm = false;
        this.loadModules();
        this.snackBar.open('Module saved successfully!', 'Close', { duration: 2500 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Failed to save module', 'Close', { duration: 3000 });
      },
    });
  }

  protected editModule(module: EducationModule): void {
    this.editingModuleId.set(module.id);
    this.mediaItems.clear();
    this.uploadingMediaRows.set({});
    this.uploadingThumbnail.set(false);
    [...module.mediaItems].sort((a, b) => a.displayOrder - b.displayOrder).forEach((item) => this.mediaItems.push(this.createMediaGroup(item)));
    this.syncMediaDisplayOrder();
    this.moduleForm.patchValue({
      title: module.title,
      description: module.description,
      instructions: module.instructions,
      thumbnailUrl: module.thumbnailUrl,
      estimatedMinutes: module.estimatedMinutes,
      published: module.published,
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected deleteModule(moduleId: number): void {
    if (!window.confirm('Delete this module?')) return;
    this.educationService.deleteModule(moduleId).subscribe({
      next: () => { this.loadModules(); this.snackBar.open('Module deleted', 'Close', { duration: 2000 }); },
      error: () => this.snackBar.open('Failed to delete module', 'Close', { duration: 3000 }),
    });
  }

  protected openQuizManager(moduleId: number): void {
    this.router.navigate(['/dashboard/doctor/education', moduleId, 'quizzes']);
  }

  protected resetForm(): void {
    this.editingModuleId.set(null);
    this.uploadingMediaRows.set({});
    this.uploadingThumbnail.set(false);
    this.moduleForm.reset({ title: '', description: '', instructions: '', thumbnailUrl: '', estimatedMinutes: 10, published: true });
    this.mediaItems.clear();
    this.mediaItems.push(this.createMediaGroup({ displayOrder: 1 }));
    this.syncMediaDisplayOrder();
  }

  protected onSearchChange(value: string): void {
    this.searchTerm.set((value ?? '').trim());
  }

  private loadModules(): void {
    this.educationService.getAdminModules().subscribe({
      next: (modules) => this.modules.set(modules),
      error: () => this.snackBar.open('Failed to load modules', 'Close', { duration: 3000 }),
    });
  }

  private createMediaGroup(media?: Partial<EducationMediaItem>) {
    return this.fb.group({
      type: [media?.type ?? 'VIDEO', Validators.required],
      url: [media?.url ?? '', Validators.required],
      caption: [media?.caption ?? ''],
      displayOrder: [media?.displayOrder ?? 1, Validators.required],
    });
  }

  private syncMediaDisplayOrder(): void {
    this.mediaItems.controls.forEach((control, index) => {
      control.get('displayOrder')?.setValue(index + 1, { emitEvent: false });
    });
  }

  private setMediaUploading(index: number, uploading: boolean): void {
    const current = { ...this.uploadingMediaRows() };
    if (uploading) {
      current[index] = true;
    } else {
      delete current[index];
    }
    this.uploadingMediaRows.set(current);
  }

  private isSupportedMediaFile(file: File): boolean {
    const type = file.type.toLowerCase();
    return type.startsWith('image/') || type.startsWith('video/');
  }

  private inferMediaType(contentType: string): EducationMediaItem['type'] {
    const normalized = (contentType ?? '').toLowerCase();
    if (normalized.startsWith('video/')) {
      return 'VIDEO';
    }
    if (normalized === 'image/gif') {
      return 'GIF';
    }
    return 'IMAGE';
  }

  private buildPayload(): EducationModulePayload {
    this.syncMediaDisplayOrder();
    const value = this.moduleForm.getRawValue() as EducationModulePayload;
    return { ...value, mediaItems: [...value.mediaItems].sort((a, b) => a.displayOrder - b.displayOrder) };
  }
}