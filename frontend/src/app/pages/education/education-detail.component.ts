import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { EducationService } from '../../core/services/education.service';
import { AuthService } from '../../core/services/auth.service';
import { EducationModule, EducationQuizQuestion, EducationQuizSubmissionResult } from '../../core/models/models';

type QuizQuestion = EducationQuizQuestion & { selectedAnswer?: string; isCorrect?: boolean; revealed?: boolean };

@Component({
  selector: 'app-education-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('softReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div *ngIf="currentModule() as mod" class="mx-auto max-w-6xl space-y-8 pb-12 animate-fade-in">
      <!-- Back + Actions -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <a [routerLink]="['/dashboard/education']" class="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-[0_4px_10px_rgb(228,161,208,0.1)] border border-pink-100 hover:bg-pink-50 hover:text-pink-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <mat-icon class="!text-[18px]">arrow_back</mat-icon> Back to Learning
        </a>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm border border-pink-100 text-base transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <span *ngFor="let s of [1,2,3]" class="transition-transform duration-300 transform" [class.scale-110]="s <= (3 - strikes())">
              {{ s <= (3 - strikes()) ? '💖' : '🤍' }}
            </span>
          </div>
          <button class="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
                  (click)="markComplete()" [disabled]="markingComplete() || mod.progress?.completed">
            <mat-icon class="!text-[18px] transition-transform duration-300 group-hover:scale-110">{{ mod.progress?.completed ? 'check_circle' : 'task_alt' }}</mat-icon>
            {{ mod.progress?.completed ? 'Completed' : 'Mark as Complete' }}
          </button>
        </div>
      </div>

      <!-- Hero Header -->
      <div class="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_8px_30px_rgb(228,161,208,0.1)] border border-pink-100 transition-shadow duration-500 hover:shadow-[0_10px_40px_rgb(228,161,208,0.2)]">
        <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          <!-- Thumbnail/Image Side -->
          <div class="relative min-h-[300px] w-full bg-pink-50 lg:min-h-full group overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-gray-900/10 to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-80"></div>
             <img *ngIf="mod.thumbnailUrl" [src]="mod.thumbnailUrl" [alt]="mod.title" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div *ngIf="!mod.thumbnailUrl" class="flex h-full w-full items-center justify-center bg-pink-50/80 transition-transform duration-700 group-hover:scale-105">
                <mat-icon class="!text-[80px] text-pink-200 group-hover:text-pink-300 transition-colors">menu_book</mat-icon>
             </div>
             
             <!-- Badge Overlays -->
             <div class="absolute bottom-8 left-8 z-20 flex flex-wrap gap-3">
               <span class="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3.5 py-1.5 text-xs font-bold tracking-wide text-gray-900 shadow-sm transition-transform duration-300 hover:scale-105 cursor-default">
                 <mat-icon class="!text-[16px] text-pink-500">schedule</mat-icon>
                 {{ mod.estimatedMinutes }} min
               </span>
               <span *ngIf="mod.progress?.completed" class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 backdrop-blur-sm px-3.5 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm transition-transform duration-300 hover:scale-105 cursor-default">
                 <mat-icon class="!text-[16px]">check_circle</mat-icon>
                 Completed
               </span>
             </div>
          </div>

          <!-- Content Side -->
          <div class="flex flex-col justify-center p-8 lg:p-12 relative overflow-hidden">
            <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-50/50 blur-3xl pointer-events-none"></div>
            <div class="mb-4 inline-flex items-center rounded-full bg-pink-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-pink-600 border border-pink-100/50 self-start transition-colors duration-300 hover:bg-pink-100">
              Education Module
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight lg:text-4xl transition-colors duration-300 hover:text-fuchsia-700">{{ mod.title }}</h1>
            <p class="mt-4 text-base leading-relaxed text-gray-600">{{ mod.description }}</p>

            <!-- Progress Block -->
            <div class="mt-8 rounded-2xl bg-white border border-pink-100 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-pink-200">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-xs font-black uppercase tracking-widest text-pink-400">Your Progress</span>
                <span class="text-sm font-black text-fuchsia-600">{{ mod.progress?.completionPercentage ?? 0 }}%</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-pink-50 border border-pink-100/50">
                <div class="h-full rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(236,72,153,0.3)]" [style.width.%]="mod.progress?.completionPercentage ?? 0"></div>
              </div>
              <div class="mt-5 flex flex-wrap gap-6">
                <div class="flex items-center gap-2.5 group cursor-default">
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 shadow-sm border border-pink-100 transition-transform duration-300 group-hover:scale-110">
                    <mat-icon class="!text-[14px] text-pink-400">help_outline</mat-icon>
                  </div>
                  <span class="text-xs font-bold tracking-wide text-gray-600 group-hover:text-pink-600 transition-colors">{{ mod.quizCount }} Quiz Questions</span>
                </div>
                <div class="flex items-center gap-2.5 group cursor-default">
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 shadow-sm border border-pink-100 transition-transform duration-300 group-hover:scale-110">
                    <mat-icon class="!text-[14px] text-pink-400">collections</mat-icon>
                  </div>
                  <span class="text-xs font-bold tracking-wide text-gray-600 group-hover:text-pink-600 transition-colors">{{ mod.mediaItems.length }} Media Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
        <!-- Lesson Guide Section -->
        <div class="space-y-8">
          <div class="rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(228,161,208,0.05)] border border-pink-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(228,161,208,0.1)] hover:border-pink-200">
             <h3 class="mb-6 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-gray-900 group">
               <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-500 border border-pink-100 transition-transform duration-300 group-hover:scale-110 group-hover:bg-pink-100">
                 <mat-icon>menu_book</mat-icon>
               </div>
               Lesson Guide
             </h3>
             <div class="prose prose-lg max-w-none text-gray-600 leading-loose prose-headings:font-bold prose-headings:text-gray-900 whitespace-pre-line text-[15px]">
               {{ mod.instructions || 'Follow this lesson at your own pace. Take notes, revisit sections, and remember — there is no rush. Every step you take is building a stronger connection with your growing baby.' }}
             </div>
          </div>

          <!-- Quiz Section -->
          <div class="rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(228,161,208,0.05)] border border-pink-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(228,161,208,0.1)]" 
               [class.!border-rose-300]="quizFailed()" [class.!shadow-[0_8px_30px_rgb(251,113,133,0.2)]]="quizFailed()">
             <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
               <h3 class="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-gray-900 group">
                 <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-500 border border-fuchsia-100 transition-transform duration-300 group-hover:scale-110 group-hover:bg-fuchsia-100">
                   <mat-icon>psychology</mat-icon>
                 </div>
                 Knowledge Check
               </h3>
               <span *ngIf="quizState() === 'active'" class="inline-flex items-center rounded-full bg-pink-50 px-4 py-1.5 text-xs font-black tracking-widest text-pink-500 uppercase border border-pink-100">
                 Q{{ currentQuestionIndex() + 1 }} of {{ quizQuestions().length }}
               </span>
             </div>

             <!-- Idle/Failed State -->
             <div *ngIf="quizState() === 'idle' || quizState() === 'failed'" class="py-12 text-center" [@softReveal]>
               <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-50 border border-pink-100 shadow-sm text-4xl mt-4 transition-transform duration-500 hover:scale-110" [class.animate-pulse]="quizState() === 'failed'">
                 {{ quizState() === 'failed' ? '🤔' : '📝' }}
               </div>
               <h4 class="text-2xl font-bold tracking-tight text-gray-900">{{ quizState() === 'failed' ? 'Let\\'s try that again.' : 'Ready to test your knowledge?' }}</h4>
               <p class="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-gray-500">
                 {{ quizState() === 'failed' ? 'You reached the max number of incorrect answers. Don\\'t worry, review the material and give it another shot!' : 'Answer all questions correctly to solidify what you\\'ve learned.' }}
               </p>
               <button class="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-400 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 group"
                       (click)="startQuiz()" [disabled]="!quizQuestions().length">
                 <mat-icon class="!text-[18px] transition-transform duration-300 group-hover:rotate-180">{{ quizState() === 'failed' ? 'refresh' : 'play_arrow' }}</mat-icon>
                 {{ quizState() === 'failed' ? 'Retry Quiz' : 'Start Quiz' }}
               </button>
             </div>

             <!-- Active Quiz -->
             <div *ngIf="quizState() === 'active'" class="space-y-8">
                <!-- Progress Line -->
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-pink-50 border border-pink-100/50">
                  <div class="h-full rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]" 
                       [style.width.%]="((currentQuestionIndex() + 1) / quizQuestions().length) * 100"></div>
                </div>

                <div *ngIf="currentQuestion() as q" class="animate-fade-in space-y-6">
                  <h4 class="text-xl md:text-2xl font-bold text-gray-900 leading-snug">{{ q.questionText }}</h4>
                  
                  <div class="grid gap-3.5 mt-6">
                    <button *ngFor="let option of q.answerOptions"
                            (click)="selectAnswer(option)"
                            class="group relative flex w-full items-center justify-between rounded-2xl border-2 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 focus:outline-none"
                            [class]="q.revealed && option === q.correctAnswer
                                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm'
                                      : q.revealed && option === q.selectedAnswer && option !== q.correctAnswer
                                      ? 'border-rose-400 bg-rose-50/80 text-rose-900'
                                      : !q.revealed
                                      ? 'border-pink-100 bg-white text-gray-700 hover:border-pink-300 hover:shadow-sm hover:bg-pink-50/30'
                                      : 'border-gray-100 bg-gray-50/50 text-gray-400 opacity-60'">
                      <span class="font-bold text-[15px] pr-4">{{ option }}</span>
                      
                      <!-- Selected / Correct Icons -->
                      <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300"
                           [class]="q.revealed && option === q.correctAnswer
                                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm scale-110'
                                      : q.revealed && option === q.selectedAnswer && option !== q.correctAnswer
                                      ? 'border-rose-400 bg-rose-400 text-white shadow-sm scale-110'
                                      : 'border-pink-200 bg-transparent group-hover:border-pink-400'">
                         <mat-icon *ngIf="q.revealed && option === q.correctAnswer" class="!text-[16px]">check</mat-icon>
                         <mat-icon *ngIf="q.revealed && option === q.selectedAnswer && option !== q.correctAnswer" class="!text-[16px]">close</mat-icon>
                      </div>
                    </button>
                  </div>

                  <!-- Explanation Card -->
                  <div *ngIf="q.revealed && q.explanation" class="mt-8 rounded-2xl border border-fuchsia-200 bg-fuchsia-50/50 p-6 animate-fade-in shadow-sm">
                    <h5 class="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-fuchsia-600">
                      <mat-icon class="!text-[16px]">lightbulb</mat-icon>
                      Explanation
                    </h5>
                    <p class="text-[15px] leading-relaxed text-fuchsia-900 font-medium">{{ q.explanation }}</p>
                  </div>

                  <!-- Actions -->
                  <div class="mt-8 flex justify-end pt-4 border-t border-pink-100/50">
                    <button *ngIf="!q.revealed" class="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-pink-50 px-8 py-3 text-sm font-bold tracking-wide text-pink-300 border border-pink-100" disabled>
                      Select an Answer
                    </button>
                    <button *ngIf="q.revealed && currentQuestionIndex() < quizQuestions().length - 1"
                            class="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-bold tracking-wide text-white shadow-md hover:bg-gradient-to-r hover:from-pink-500 hover:to-fuchsia-500 transition-all duration-300 hover:-translate-y-0.5 group"
                            (click)="nextQuestion()">
                      Next Question <mat-icon class="!text-[18px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</mat-icon>
                    </button>
                    <button *ngIf="q.revealed && currentQuestionIndex() === quizQuestions().length - 1"
                            class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 py-3 text-sm font-bold tracking-wide text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
                            (click)="finishQuiz()">
                      Finish Quiz <mat-icon class="!text-[18px] transition-transform duration-300 group-hover:scale-110">done_all</mat-icon>
                    </button>
                  </div>
                </div>
             </div>

             <!-- Passed State -->
             <div *ngIf="quizState() === 'passed'" class="py-12 text-center" [@softReveal]>
               <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 shadow-sm text-[40px] mt-4 animate-bounce duration-1000">
                 🏆
               </div>
               <h4 class="text-3xl font-extrabold tracking-tight text-gray-900">Quiz Passed!</h4>
               <p class="mt-3 text-base text-gray-500 font-medium">Brilliant work! You scored {{ correctCount() }} out of {{ quizQuestions().length }}.</p>
               
               <div *ngIf="quizResult() as result" class="mt-8 mb-10 inline-flex items-center gap-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 px-6 py-4 shadow-sm transition-transform duration-300 hover:scale-105">
                 <div class="flex flex-col items-start pr-4 border-r border-emerald-300/50">
                    <span class="text-[10px] font-black tracking-widest text-emerald-600 uppercase">Final Score</span>
                    <span class="text-3xl font-black text-emerald-800 leading-none mt-1">{{ result.scorePercentage | number:'1.0-0' }}%</span>
                 </div>
                 <div class="flex shrink-0 items-center justify-center text-emerald-500">
                    <mat-icon class="!text-3xl">verified</mat-icon>
                 </div>
               </div>
               
               <div>
                 <button class="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-8 py-3 text-sm font-bold tracking-wide text-pink-600 shadow-sm hover:bg-pink-50 transition-all duration-300 hover:-translate-y-0.5 group"
                         (click)="resetQuiz()">
                   <mat-icon class="!text-[18px] transition-transform duration-500 group-hover:rotate-180">refresh</mat-icon> Retake Quiz
                 </button>
               </div>
             </div>
          </div>

          <!-- Reflection Card -->
          <div *ngIf="quizState() === 'passed' || mod.progress?.completed" class="rounded-[2.5rem] bg-gradient-to-br from-pink-600 via-rose-500 to-fuchsia-600 p-8 md:p-10 shadow-[0_20px_40px_rgba(236,72,153,0.3)] text-white relative overflow-hidden transition-all duration-500 hover:shadow-[0_25px_50px_rgba(236,72,153,0.4)] hover:-translate-y-1" [@softReveal]>
             <!-- Decorative elements -->
             <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl mix-blend-overlay pointer-events-none animate-pulse duration-1000"></div>
             <div class="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl mix-blend-overlay pointer-events-none"></div>
             
             <div class="relative z-10 flex flex-wrap items-center justify-between gap-6">
                <div class="max-w-[280px]">
                  <h3 class="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                    Session Check-in
                  </h3>
                  <p class="mt-3 text-sm font-medium leading-relaxed text-pink-100">How did this material feel to you? Reflecting helps us tailor future insights precisely for you.</p>
                </div>
                <div class="rounded-3xl bg-white/20 p-5 backdrop-blur-md border border-white/30 text-center min-w-[130px] shadow-sm transition-transform duration-300 hover:scale-105">
                  <p class="text-[10px] font-black tracking-widest text-pink-100 uppercase">Points Earned</p>
                  <p class="mt-2 text-3xl font-black text-white leading-none">+{{ earnedPoints() }} <span class="text-xl align-top">✨</span></p>
                </div>
             </div>

             <div class="relative z-10 mt-10 grid grid-cols-2 gap-3 sm:flex">
               <button *ngFor="let mood of reflectionOptions"
                       class="rounded-2xl border px-5 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                       (click)="selectReflectionMood(mood)"
                       [class]="reflectionMood() === mood
                          ? 'bg-white text-pink-600 border-white shadow-xl scale-[1.05]'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'">
                 {{ reflectionMoodLabel(mood) }}
               </button>
             </div>

             <div class="relative z-10 mt-8 flex flex-wrap items-center gap-4 border-t border-white/20 pt-8">
               <button class="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-black tracking-wide text-pink-600 shadow-lg hover:bg-pink-50 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 focus:ring-offset-pink-600 disabled:opacity-50 disabled:cursor-not-allowed group"
                       [disabled]="!reflectionMood() || reflectionSaved()"
                       (click)="saveReflection()">
                 <mat-icon class="!text-[18px] transition-transform duration-300 group-hover:scale-110">{{ reflectionSaved() ? 'check' : 'save' }}</mat-icon>
                 {{ reflectionSaved() ? 'Reflection Saved' : 'Save Reflection' }}
               </button>
               <p class="text-sm font-bold text-pink-100 transition-opacity duration-500" [class.opacity-0]="!reflectionSaved()" [class.opacity-100]="reflectionSaved()">
                  Stored safely in your journey. 💖
               </p>
             </div>
          </div>
        </div>

        <!-- Media Playlist Sidebar -->
        <div class="space-y-6">
          <div class="rounded-[2rem] bg-white border border-pink-100 p-6 md:p-8 sticky top-6 shadow-[0_8px_30px_rgb(228,161,208,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(228,161,208,0.1)]">
            <h3 class="mb-6 flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-900">
              <mat-icon class="text-pink-400">video_library</mat-icon>
              Media Assets
            </h3>
            
            <div class="space-y-4">
              <div *ngFor="let asset of mod.mediaItems" class="group overflow-hidden rounded-[1.5rem] bg-white border border-pink-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-pink-300 hover:-translate-y-1">
                 <div class="aspect-video w-full bg-pink-50 relative overflow-hidden">
                   <div class="absolute inset-0 bg-gray-900/10 pointer-events-none z-10 group-hover:bg-transparent transition-colors duration-300"></div>
                   <video *ngIf="asset.type === 'VIDEO'" [src]="asset.url" controls class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-20"></video>
                   <img *ngIf="asset.type !== 'VIDEO'" [src]="asset.url" [alt]="asset.caption" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-0" />
                 </div>
                 <div class="p-5 relative">
                   <div class="absolute top-0 right-5 -mt-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1">
                     <span class="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-white shadow-md">
                       <mat-icon class="!text-[14px]">play_arrow</mat-icon>
                     </span>
                   </div>
                   <span class="inline-flex items-center rounded-md bg-pink-50 px-2 py-0.5 text-[10px] font-black tracking-widest text-pink-500 uppercase border border-pink-100">
                     {{ asset.type }}
                   </span>
                   <p class="mt-2.5 text-[15px] font-bold text-gray-900 leading-snug group-hover:text-pink-600 transition-colors duration-300">{{ asset.caption || 'Supporting Media' }}</p>
                 </div>
              </div>
              
              <div *ngIf="mod.mediaItems.length === 0" class="rounded-[1.5rem] border-2 border-dashed border-pink-200 py-12 text-center bg-pink-50/50">
                <mat-icon class="!text-4xl text-pink-300">image_not_supported</mat-icon>
                <p class="mt-3 text-sm font-bold text-pink-400/80 uppercase tracking-wider">No media attached</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EducationDetailComponent implements OnInit {
  protected readonly currentModule = signal<EducationModule | null>(null);
  protected readonly quizQuestions = signal<QuizQuestion[]>([]);
  protected readonly quizResult = signal<EducationQuizSubmissionResult | null>(null);
  protected readonly submittingQuiz = signal(false);
  protected readonly markingComplete = signal(false);
  protected readonly quizState = signal<'idle' | 'active' | 'passed' | 'failed'>('idle');
  protected readonly strikes = signal(0);
  protected readonly correctCount = signal(0);
  protected readonly currentQuestionIndex = signal(0);
  protected readonly reflectionMood = signal<'calm' | 'supported' | 'motivated' | 'overwhelmed' | null>(null);
  protected readonly reflectionSaved = signal(false);
  protected readonly earnedPoints = signal(0);
  protected readonly reflectionOptions: Array<'calm' | 'supported' | 'motivated' | 'overwhelmed'> = ['calm', 'supported', 'motivated', 'overwhelmed'];

  protected get currentQuestion(): () => QuizQuestion | null {
    return () => {
      const qs = this.quizQuestions();
      const idx = this.currentQuestionIndex();
      return qs[idx] || null;
    };
  }

  protected get quizFailed(): () => boolean {
    return () => this.quizState() === 'failed';
  }

  constructor(
    private route: ActivatedRoute,
    private educationService: EducationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    const patientId = this.authService.user()?.id;
    if (!moduleId || !patientId) {
      this.snackBar.open('Unable to open this module.', 'Dismiss', { duration: 3000 });
      return;
    }

    forkJoin({
      module: this.educationService.getModule(moduleId),
      quiz: this.educationService.getQuizQuestions(moduleId),
      progress: this.educationService.markViewed(patientId, moduleId)
    }).subscribe({
      next: ({ module, quiz, progress }) => {
        this.currentModule.set({ ...module, progress });
        this.quizQuestions.set(quiz.map(q => ({ ...q })));
      },
      error: () => this.snackBar.open('Unable to load this education module.', 'Dismiss', { duration: 3500 })
    });
  }

  protected startQuiz(): void {
    this.strikes.set(0);
    this.correctCount.set(0);
    this.currentQuestionIndex.set(0);
    this.quizState.set('active');
    this.quizResult.set(null);
    this.quizQuestions.set(this.quizQuestions().map(q => ({ ...q, selectedAnswer: undefined, isCorrect: undefined, revealed: false })));
  }

  protected selectAnswer(option: string): void {
    const qs = this.quizQuestions();
    const idx = this.currentQuestionIndex();
    const q = qs[idx];
    if (!q || q.revealed) return;

    const isCorrect = option === q.correctAnswer;
    const updated = [...qs];
    updated[idx] = { ...q, selectedAnswer: option, isCorrect, revealed: true };
    this.quizQuestions.set(updated);

    if (isCorrect) {
      this.correctCount.update(c => c + 1);
    } else {
      const newStrikes = this.strikes() + 1;
      this.strikes.set(newStrikes);
      if (newStrikes >= 3) {
        setTimeout(() => this.quizState.set('failed'), 1200);
      }
    }
  }

  protected nextQuestion(): void {
    const next = this.currentQuestionIndex() + 1;
    if (next < this.quizQuestions().length) {
      this.currentQuestionIndex.set(next);
    }
  }

  protected finishQuiz(): void {
    const mod = this.currentModule();
    const patientId = this.authService.user()?.id;
    if (!mod || !patientId) return;

    const answers: Record<number, string> = {};
    this.quizQuestions().forEach(q => {
      if (q.selectedAnswer) answers[q.id] = q.selectedAnswer;
    });

    this.submittingQuiz.set(true);
    this.educationService.submitQuiz(mod.id, { answers }).subscribe({
      next: (result) => {
        this.quizResult.set(result);
        this.currentModule.set({ ...mod, progress: result.progress });
        this.submittingQuiz.set(false);
        this.quizState.set('passed');
        this.earnedPoints.set(Math.round(result.scorePercentage) + 20);
        this.snackBar.open('Quiz completed!', 'Dismiss', { duration: 2500 });
      },
      error: () => {
        this.submittingQuiz.set(false);
        this.quizState.set('passed');
        this.earnedPoints.set(this.correctCount() * 15 + 20);
      }
    });
  }

  protected resetQuiz(): void {
    this.quizState.set('idle');
    this.quizQuestions.set(this.quizQuestions().map(q => ({ ...q, selectedAnswer: undefined, isCorrect: undefined, revealed: false })));
    this.strikes.set(0);
    this.correctCount.set(0);
    this.currentQuestionIndex.set(0);
  }

  protected markComplete(): void {
    const mod = this.currentModule();
    const patientId = this.authService.user()?.id;
    if (!mod || !patientId) return;

    this.markingComplete.set(true);
    this.educationService.markCompleted(patientId, mod.id).subscribe({
      next: (progress) => {
        this.currentModule.set({ ...mod, progress });
        this.markingComplete.set(false);
        this.earnedPoints.set(Math.max(this.earnedPoints(), 40));
        this.snackBar.open('Module marked as completed!', 'Dismiss', { duration: 2500 });
      },
      error: () => {
        this.markingComplete.set(false);
        this.snackBar.open('Unable to update progress.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  protected reflectionMoodLabel(mood: 'calm' | 'supported' | 'motivated' | 'overwhelmed'): string {
    const map = {
      calm: '🫧 Calm',
      supported: '💜 Supported',
      motivated: '✨ Motivated',
      overwhelmed: '🌿 Overwhelmed'
    };
    return map[mood];
  }

  protected selectReflectionMood(mood: 'calm' | 'supported' | 'motivated' | 'overwhelmed'): void {
    this.reflectionMood.set(mood);
    this.reflectionSaved.set(false);
  }

  protected saveReflection(): void {
    if (!this.reflectionMood()) return;
    this.reflectionSaved.set(true);
    this.snackBar.open('Reflection saved gently 💜', 'Dismiss', { duration: 2000 });
  }
}