import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { EducationService } from '../../core/services/education.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { EducationModule, PregnancyProfile } from '../../core/models/models';

@Component({
  selector: 'app-education-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('cardReveal', [
      transition(':enter', [
        query('a.group, .group', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('450ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="space-y-8 pb-10">
      <!-- Header -->
      <div class="relative overflow-hidden rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(228,161,208,0.1)] border border-pink-100/50 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(228,161,208,0.2)] hover:border-pink-200">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-50/50 blur-3xl pointer-events-none transition-transform duration-1000 animate-pulse"></div>
        <div class="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-pink-50/50 blur-3xl pointer-events-none"></div>
        
        <div class="relative flex flex-wrap items-center justify-between gap-6">
          <div class="space-y-2 transition-transform duration-500 hover:translate-x-2">
            <span class="inline-flex items-center rounded-full bg-fuchsia-50 px-2.5 py-1 text-xs font-semibold tracking-wide text-fuchsia-600 uppercase border border-fuchsia-100/50 transition-colors duration-300">
              Learning Center
            </span>
            <h1 class="text-3xl font-extrabold tracking-tight" style="font-family:'Outfit',sans-serif;color:var(--mama-berry)">Good {{ timeOfDay }}, {{ firstName }}</h1>
            <p class="text-sm font-medium text-gray-500">
              <span *ngIf="currentWeek() > 0">Week {{ currentWeek() }} • {{ trimesterLabel }}</span>
              <span *ngIf="currentWeek() === 0">Your learning journey begins</span>
            </p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Streak -->
            <div class="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 border border-pink-100 shadow-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:border-pink-200">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-sm transition-transform duration-300">
                <mat-icon class="!text-xl">local_fire_department</mat-icon>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 leading-none group-hover:text-rose-600 transition-colors">{{ streak() }}</p>
                <p class="text-[11px] font-semibold tracking-wider text-rose-400 uppercase mt-1">Day Streak</p>
              </div>
            </div>
            <!-- Glow Points -->
            <div class="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 border border-pink-100 shadow-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:border-pink-200">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white shadow-sm transition-transform duration-300">
                <mat-icon class="!text-xl">auto_awesome</mat-icon>
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900 leading-none group-hover:text-fuchsia-600 transition-colors">{{ glowPoints() }}</p>
                <p class="text-[11px] font-semibold tracking-wider text-fuchsia-400 uppercase mt-1">Glow Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Companion Section -->
      <div class="rounded-3xl border border-pink-100/50 bg-white p-6 shadow-[0_8px_30px_rgb(228,161,208,0.05)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(228,161,208,0.15)]">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3 group transition-transform duration-300 hover:translate-x-1">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-600 border border-pink-100 transition-colors duration-300 group-hover:bg-pink-100">
              <mat-icon>psychology</mat-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-pink-700">Your AI Companion</h2>
              <p class="text-xs text-gray-500">Personalized insights for you</p>
            </div>
          </div>
          <button mat-stroked-button class="!rounded-full !border-pink-200 !text-pink-600 hover:!bg-pink-50 hover:!border-pink-300 hover:!-translate-y-0.5 hover:!shadow-sm transition-all duration-300">
             Insights History
          </button>
        </div>

        <div class="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-pink-50/50 p-2 max-w-max border border-pink-50">
          <span class="pl-3 text-xs font-black tracking-widest text-pink-400 uppercase">Feeling?</span>
          <div class="flex w-px h-6 bg-pink-200 mx-1"></div>
          <button *ngFor="let mood of moodOptions"
                  class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 border border-transparent hover:-translate-y-0.5"
                  (click)="setMood(mood)"
                  [class]="selectedMood() === mood
                    ? '!bg-white !text-pink-600 !shadow-sm !border-pink-100'
                    : 'text-gray-500 hover:text-pink-600 hover:bg-white/50'">
            <span class="transition-transform duration-300" [class.scale-125]="selectedMood() === mood">{{ moodEmoji(mood) }}</span>
            <span class="capitalize">{{ mood }}</span>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <!-- Daily Insight Card -->
          <div class="group relative overflow-hidden rounded-2xl border border-pink-100 bg-white p-6 transition-all duration-300 hover:shadow-md hover:border-pink-300 hover:-translate-y-1">
            <div class="absolute inset-0 bg-gradient-to-br from-fuchsia-50/40 to-white opacity-50 pointer-events-none group-hover:from-fuchsia-100/40 transition-colors duration-300"></div>
            <div class="relative">
              <div class="mb-4 flex items-center gap-2">
                <span class="rounded-full bg-fuchsia-50 px-3 py-1 text-[10px] font-black tracking-wider text-fuchsia-600 uppercase border border-fuchsia-100/50 transition-colors duration-300 group-hover:bg-fuchsia-100">Daily Insight</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-fuchsia-700">{{ dailyInsightTitle }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ dailyInsightSummary }}</p>
              
              <div class="mt-5 space-y-3">
                <p class="text-[11px] font-black tracking-widest text-pink-400 uppercase transition-colors duration-300 group-hover:text-fuchsia-400">Baby's World</p>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-lg border border-pink-100 bg-pink-50/50 px-3 py-1.5 text-xs font-semibold text-pink-700 transition-transform duration-300 group-hover:translate-x-1">
                     <span class="text-sm">🫁</span> {{ babyInsight1 }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-lg border border-pink-100 bg-pink-50/50 px-3 py-1.5 text-xs font-semibold text-pink-700 transition-transform duration-300 group-hover:translate-x-1 delay-75">
                    <span class="text-sm">👂</span> {{ babyInsight2 }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Body Talk Card -->
          <div class="group relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-6 transition-all duration-300 hover:shadow-md hover:border-rose-300 hover:-translate-y-1">
            <div class="absolute inset-0 bg-gradient-to-br from-rose-50/40 to-white opacity-50 pointer-events-none group-hover:from-rose-100/40 transition-colors duration-300"></div>
            <div class="relative">
              <div class="mb-4 flex items-center gap-2">
                <span class="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black tracking-wider text-rose-600 uppercase border border-rose-100/50 transition-colors duration-300 group-hover:bg-rose-100">Body Talk</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 transition-colors duration-300 group-hover:text-rose-700">{{ bodyTalkTitle }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ bodyTalkSummary }}</p>
              
              <div class="mt-5 space-y-3">
                <p class="text-[11px] font-black tracking-widest text-rose-400 uppercase transition-colors duration-300 group-hover:text-rose-500">Gentle Reminders</p>
                <ul class="space-y-2">
                  <li *ngFor="let suggestion of gentleSuggestions; let idx = index" class="flex text-sm text-gray-600 transition-transform duration-300 group-hover:translate-x-1" [style.transition-delay]="idx * 50 + 'ms'">
                    <mat-icon class="!text-[18px] mr-2 text-rose-400">check</mat-icon>
                    <span class="leading-relaxed font-medium">{{ suggestion }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Learn from Experts Section -->
      <div>
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div class="transition-transform duration-300 hover:translate-x-1">
            <h2 class="text-2xl font-bold tracking-tight" style="font-family:'Outfit',sans-serif;color:var(--mama-berry)">Learn from Experts</h2>
            <p class="text-sm font-medium text-pink-500 mt-1">Curated lessons for your current stage</p>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-pink-100 bg-white p-1 shadow-sm overflow-x-auto transition-shadow duration-300 hover:shadow-md hover:border-pink-200">
            <button *ngFor="let feed of feedOptions"
                    class="rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 whitespace-nowrap hover:-translate-y-0.5"
                    (click)="selectedFeed.set(feed)"
                    [class]="selectedFeed() === feed
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                      : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'">
              {{ feed }}
            </button>
          </div>
        </div>

        <!-- Weekly Progress Bar -->
        <div class="mb-8 overflow-hidden rounded-2xl border border-pink-100 bg-white p-5 shadow-[0_4px_20px_rgb(228,161,208,0.1)] flex flex-wrap items-center justify-between gap-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
           <div class="flex items-center gap-4 transition-transform duration-300 hover:scale-105">
             <div class="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 border border-pink-100 text-pink-600">
               <mat-icon>trending_up</mat-icon>
             </div>
             <div>
               <p class="font-extrabold text-gray-900">Weekly Goal: {{ completedCount() }}/{{ modules().length || 5 }}</p>
               <p class="text-xs font-semibold text-pink-500">Lessons completed</p>
             </div>
           </div>
           
           <div class="flex-1 min-w-[200px]">
             <div class="h-3 w-full overflow-hidden rounded-full bg-pink-50 border border-pink-100/50">
                <div class="h-full rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(236,72,153,0.4)]" [style.width.%]="weeklyProgress()"></div>
             </div>
           </div>
           
           <button mat-stroked-button class="!rounded-full !border-pink-200 !text-pink-600 hover:!bg-pink-50 hover:!border-pink-300 transition-all duration-300 hover:-translate-y-0.5">
             View All Stats
           </button>
        </div>

        <!-- Recommended Highlights (if showing recommended) -->
        <div *ngIf="selectedFeed() === 'Recommended' && recommendedModules().length > 0" class="mb-8" [@cardReveal]>
           <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a *ngFor="let mod of recommendedModules()"
                 [routerLink]="['/dashboard/education', mod.id]"
                 class="group flex flex-col overflow-hidden rounded-2xl bg-white border border-pink-100 shadow-[0_10px_40px_-10px_rgba(236,72,153,0.1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(236,72,153,0.25)] hover:border-pink-300">
                <!-- Thumbnail -->
                <div class="relative aspect-video w-full overflow-hidden bg-pink-50">
                  <div class="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent z-10 pointer-events-none"></div>
                  <img *ngIf="mod.thumbnailUrl" [src]="mod.thumbnailUrl" [alt]="mod.title" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div *ngIf="!mod.thumbnailUrl" class="flex h-full w-full items-center justify-center bg-pink-50 text-pink-300">
                    <mat-icon class="!text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:text-pink-400">smart_display</mat-icon>
                  </div>
                  
                  <!-- Overlays -->
                  <div class="absolute top-3 left-3 z-20">
                    <span class="rounded-md bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-black tracking-widest text-pink-600 uppercase shadow-sm border border-white/20">
                      {{ getCategoryTag(mod.title) }}
                    </span>
                  </div>
                  <div class="absolute bottom-3 left-3 z-20 flex items-center gap-3">
                    <span class="flex items-center gap-1.5 text-xs font-bold text-white shadow-sm">
                      <mat-icon class="!text-[16px]">schedule</mat-icon>
                      {{ mod.estimatedMinutes }}m
                    </span>
                  </div>
                  <div *ngIf="mod.progress?.completed" class="absolute inset-0 z-30 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg animate-bounce duration-1000">
                       <mat-icon>check</mat-icon>
                    </div>
                  </div>
                </div>
                
                <!-- Content -->
                <div class="flex flex-1 flex-col p-5">
                  <h3 class="font-extrabold text-gray-900 group-hover:text-pink-600 transition-colors duration-300 line-clamp-2 leading-snug">{{ mod.title }}</h3>
                  
                  <div class="mt-auto pt-5 flex items-center justify-between gap-4">
                    <div class="flex-1">
                      <div class="h-1.5 w-full overflow-hidden rounded-full bg-pink-50 border border-pink-100/30">
                        <div class="h-full rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 transition-all duration-500" [style.width.%]="mod.progress?.completionPercentage ?? 0"></div>
                      </div>
                    </div>
                    <button mat-icon-button (click)="toggleBookmark(mod.id, $event)" class="!w-8 !h-8 !border !border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:rotate-6 shrink-0 flex items-center justify-center">
                      <mat-icon class="!text-[18px]" [class.text-rose-500]="isBookmarked(mod.id)">{{ isBookmarked(mod.id) ? 'favorite' : 'favorite_border' }}</mat-icon>
                    </button>
                  </div>
                </div>
              </a>
           </div>
        </div>

        <!-- All Modules Grid -->
        <div *ngIf="!isLoading()" [@cardReveal] class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <a *ngFor="let mod of displayedModules()"
             [routerLink]="['/dashboard/education', mod.id]"
             class="group flex items-center gap-5 rounded-[1.5rem] border border-pink-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-[0_10px_30px_-5px_rgba(236,72,153,0.15)] hover:border-pink-300 hover:-translate-y-1">
            <div class="relative h-20 w-24 shrink-0 overflow-hidden rounded-[1rem] bg-pink-50 border border-pink-100/50">
              <img *ngIf="mod.thumbnailUrl" [src]="mod.thumbnailUrl" [alt]="mod.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1" />
              <mat-icon *ngIf="!mod.thumbnailUrl" class="!text-3xl absolute inset-0 m-auto text-pink-300 transition-transform duration-500 group-hover:scale-110">menu_book</mat-icon>
              
              <div *ngIf="mod.progress?.completed" class="absolute inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-[2px]">
                <mat-icon class="text-white drop-shadow-md">check_circle</mat-icon>
              </div>
            </div>
            
            <div class="flex flex-1 flex-col justify-center min-w-0 py-1">
               <div class="flex items-start justify-between gap-2">
                 <h3 class="font-extrabold text-gray-900 truncate group-hover:text-pink-600 transition-colors duration-300">{{ mod.title }}</h3>
                 <span class="shrink-0 rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-pink-600 border border-pink-100 transition-colors duration-300 group-hover:bg-pink-100">{{ mod.estimatedMinutes }}m</span>
               </div>
               <p class="mt-1.5 text-[13px] text-gray-500 line-clamp-1 font-medium transition-colors duration-300 group-hover:text-gray-600">{{ mod.description }}</p>
               
               <div class="mt-4 flex items-center gap-4">
                 <div class="flex max-w-[120px] flex-1 items-center gap-2">
                   <div class="h-1.5 w-full overflow-hidden rounded-full bg-pink-50 border border-pink-100/30">
                     <div class="h-full rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-400 opacity-90 transition-all duration-300 group-hover:opacity-100" [style.width.%]="mod.progress?.completionPercentage ?? 0"></div>
                   </div>
                 </div>
                 <span class="text-[10px] font-black text-pink-400 tracking-wider uppercase transition-colors duration-300 group-hover:text-pink-500">{{ mod.quizCount }} Qs</span>
                 
                 <button mat-icon-button (click)="toggleBookmark(mod.id, $event)" class="!w-7 !h-7 !leading-none ml-auto text-gray-400 hover:text-rose-500 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 hover:rotate-12 flex items-center justify-center">
                    <mat-icon class="!text-[18px]" [class.text-rose-500]="isBookmarked(mod.id)">{{ isBookmarked(mod.id) ? 'favorite' : 'favorite_border' }}</mat-icon>
                 </button>
               </div>
            </div>
          </a>
        </div>

        <!-- Loading Skeletons -->
        <div *ngIf="isLoading()" class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div *ngFor="let _ of placeholders" class="flex gap-5 rounded-[1.5rem] border border-pink-100 bg-white p-4 shadow-sm">
            <div class="h-20 w-24 rounded-[1rem] animate-pulse bg-pink-50"></div>
            <div class="flex flex-1 flex-col justify-center space-y-3">
              <div class="h-4 w-3/4 rounded-full bg-pink-50 animate-pulse"></div>
              <div class="h-3 w-1/2 rounded-full bg-gray-50 animate-pulse"></div>
              <div class="pt-2">
                <div class="h-1.5 w-1/3 rounded-full bg-pink-50 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && displayedModules().length === 0" class="mt-8 rounded-[2rem] border-2 border-dashed border-pink-200 bg-white p-16 text-center shadow-sm animate-fade-in">
           <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 shadow-sm border border-pink-100 animate-bounce cursor-default">
             <mat-icon class="!text-3xl text-pink-400">search_off</mat-icon>
           </div>
           <h3 class="text-xl font-extrabold text-gray-900">No modules found</h3>
           <p class="mt-2 text-[15px] font-medium text-gray-500">Try changing your feed filter or check back later.</p>
        </div>
      </div>
    </div>
  `
})
export class EducationListComponent implements OnInit {
  protected readonly modules = signal<EducationModule[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly completedCount = signal(0);
  protected readonly streak = signal(1);
  protected readonly glowPoints = signal(0);
  protected readonly currentWeek = signal(0);
  protected readonly selectedMood = signal<'calm' | 'anxious' | 'tired' | 'happy'>('calm');
  protected readonly selectedFeed = signal<'Recommended' | 'Most Viewed' | 'Saved' | 'Continue'>('Recommended');
  protected readonly placeholders = Array.from({ length: 4 });

  protected firstName = '';
  protected timeOfDay = 'morning';
  protected trimesterLabel = '';
  protected moodOptions: Array<'calm' | 'anxious' | 'tired' | 'happy'> = ['calm', 'anxious', 'tired', 'happy'];
  protected feedOptions: Array<'Recommended' | 'Most Viewed' | 'Saved' | 'Continue'> = ['Recommended', 'Most Viewed', 'Saved', 'Continue'];
  protected bookmarks = new Set<number>();

  protected dailyInsightTitle = "Your baby's lungs are developing rapidly";
  protected dailyInsightSummary = "At this stage, your little one is practicing breathing movements and can hear your voice clearly.";
  protected bodyTalkTitle = "Feeling tired? Your body is doing extraordinary work";
  protected bodyTalkSummary = "Fatigue is your body's signal that it's working hard to support baby's rapid growth. Honor rest when you can.";
  protected babyInsight1 = 'Lungs developing';
  protected babyInsight2 = 'Can hear sounds';
  protected reassuranceMessage = 'You are doing beautifully. Small steps count every day.';
  protected gentleSuggestions: string[] = [
    'Drink water in small, frequent sips.',
    'Take a 10-minute mindful rest break.',
    'Choose one short lesson if energy is low.'
  ];

  constructor(
    private educationService: EducationService,
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    this.firstName = user?.fullName?.split(' ')[0] || 'there';
    this.timeOfDay = this.getTimeOfDay();
    this.loadBookmarks();

    this.loadModules();
    this.loadPregnancyProfile();
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private loadModules(): void {
    this.educationService.getModules().subscribe({
      next: (modules) => {
        this.modules.set(modules);
        this.completedCount.set(modules.filter(m => m.progress?.completed).length);
        this.calculateGlowPoints();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Unable to load education modules.', 'Dismiss', { duration: 3500 });
      }
    });
  }

  private loadPregnancyProfile(): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this.apiService.getPregnancyProfiles(userId).subscribe({
      next: (res) => {
        const active = res.content.find((p: PregnancyProfile) => p.status === 'ACTIVE') || res.content[0];
        if (active?.currentWeek) {
          this.currentWeek.set(active.currentWeek);
          this.deriveTrimesterLabel(active.currentWeek);
          this.adaptAIInsights(active.currentWeek);
        }
      }
    });
  }

  private deriveTrimesterLabel(week: number): void {
    if (week <= 12) this.trimesterLabel = 'First Trimester';
    else if (week <= 27) this.trimesterLabel = 'Second Trimester';
    else this.trimesterLabel = 'Third Trimester';
  }

  private adaptAIInsights(week: number): void {
    if (week <= 12) {
      this.dailyInsightTitle = "Your baby's heart is beating faster";
      this.dailyInsightSummary = "At 8-12 weeks, your baby's heart is forming and beating at a remarkable pace. You might be feeling lots of changes — that's completely normal.";
      this.bodyTalkTitle = "Nausea is your body's way of protecting baby";
      this.bodyTalkSummary = "Morning sickness, though uncomfortable, is a sign your pregnancy hormones are working. Small, frequent meals can help you feel more steady.";
    } else if (week <= 27) {
      this.dailyInsightTitle = "Your baby's lungs are developing rapidly";
      this.dailyInsightSummary = "At this stage, your little one is practicing breathing movements and can hear your voice clearly.";
      this.bodyTalkTitle = "Feeling tired? Your body is doing extraordinary work";
      this.bodyTalkSummary = "Fatigue is your body's signal that it's working hard to support baby's rapid growth. Honor rest when you can.";
    } else {
      this.dailyInsightTitle = "Baby is getting into birth position";
      this.dailyInsightSummary = "In these final weeks, your baby is moving into the right position for birth. You might feel more pressure low — that's a good sign.";
      this.bodyTalkTitle = "Your body is preparing for labor";
      this.bodyTalkSummary = "Braxton Hicks contractions, nesting urges, and disrupted sleep are all signs your body is getting ready. Trust what you feel.";
    }

    this.applyMoodPersonalization();
  }

  protected setMood(mood: 'calm' | 'anxious' | 'tired' | 'happy'): void {
    this.selectedMood.set(mood);
    this.applyMoodPersonalization();
  }

  protected moodEmoji(mood: 'calm' | 'anxious' | 'tired' | 'happy'): string {
    const map = { calm: '🫧', anxious: '🌿', tired: '🌙', happy: '☀️' };
    return map[mood];
  }

  protected displayedModules(): EducationModule[] {
    const all = this.modules();
    const feed = this.selectedFeed();
    if (feed === 'Saved') {
      return all.filter(m => this.bookmarks.has(m.id));
    }
    if (feed === 'Continue') {
      return all.filter(m => {
        const p = m.progress?.completionPercentage ?? 0;
        return p > 0 && p < 100;
      });
    }
    if (feed === 'Most Viewed') {
      return [...all].sort((a, b) => (b.progress?.completionPercentage ?? 0) - (a.progress?.completionPercentage ?? 0));
    }
    return all;
  }

  protected mostViewedModules(): EducationModule[] {
    return [...this.modules()]
      .sort((a, b) => (b.progress?.completionPercentage ?? 0) - (a.progress?.completionPercentage ?? 0))
      .slice(0, 4);
  }

  protected isBookmarked(moduleId: number): boolean {
    return this.bookmarks.has(moduleId);
  }

  protected toggleBookmark(moduleId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.bookmarks.has(moduleId)) {
      this.bookmarks.delete(moduleId);
      this.snackBar.open('Removed from bookmarks', 'Dismiss', { duration: 1800 });
    } else {
      this.bookmarks.add(moduleId);
      this.snackBar.open('Saved to bookmarks', 'Dismiss', { duration: 1800 });
    }
    this.persistBookmarks();
  }

  private applyMoodPersonalization(): void {
    const mood = this.selectedMood();

    if (mood === 'anxious') {
      this.gentleSuggestions = [
        'Try one minute of slow breathing: in for 4, out for 6.',
        'Choose one calming short lesson now.',
        'Place a hand on your belly and repeat one reassuring thought.'
      ];
      this.reassuranceMessage = 'You are safe, supported, and never alone in this moment.';
      this.bodyTalkTitle = 'Anxiety can be your body asking for gentle pause';
    } else if (mood === 'tired') {
      this.gentleSuggestions = [
        'Watch a 3-minute lesson instead of a long one.',
        'Hydrate and rest your eyes for two minutes.',
        'Pick one tiny self-care action only.'
      ];
      this.reassuranceMessage = 'Rest is productive. Your body is doing meaningful work.';
      this.bodyTalkTitle = 'Low energy is common in pregnancy and deserves compassion';
    } else if (mood === 'happy') {
      this.gentleSuggestions = [
        'Capture one joyful moment in your journal today.',
        'Share a bonding moment by talking to your baby.',
        'Explore one new expert lesson while energy is high.'
      ];
      this.reassuranceMessage = 'Your calm joy is a beautiful gift for both you and baby.';
    } else {
      this.gentleSuggestions = [
        'Keep meals steady and hydration consistent.',
        'Move gently for 10 minutes if comfortable.',
        'Continue with one recommended lesson today.'
      ];
      this.reassuranceMessage = 'You are doing beautifully. Small steps count every day.';
    }
  }

  private loadBookmarks(): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;
    const raw = localStorage.getItem(`education_bookmarks_${userId}`);
    if (!raw) return;
    try {
      const ids: number[] = JSON.parse(raw);
      this.bookmarks = new Set(ids);
    } catch {
      this.bookmarks = new Set<number>();
    }
  }

  private persistBookmarks(): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;
    localStorage.setItem(`education_bookmarks_${userId}`, JSON.stringify(Array.from(this.bookmarks)));
  }

  protected recommendedModules(): EducationModule[] {
    return this.modules().slice(0, 3);
  }

  protected weeklyProgress(): number {
    const total = this.modules().length || 5;
    return Math.min(100, (this.completedCount() / total) * 100);
  }

  protected getCategoryTag(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('nutrition') || t.includes('food') || t.includes('eat')) return 'Nutrition';
    if (t.includes('sleep') || t.includes('rest')) return 'Rest';
    if (t.includes('baby') || t.includes('growth')) return 'Growth';
    if (t.includes('labor') || t.includes('birth')) return 'Birth Prep';
    if (t.includes('exercise') || t.includes('movement')) return 'Movement';
    return 'Wellness';
  }

  private calculateGlowPoints(): void {
    const completed = this.completedCount();
    const points = completed * 30 + this.streak() * 10;
    this.glowPoints.set(points);
  }
}