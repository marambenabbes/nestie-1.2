import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EducationService } from '../../core/services/education.service';
import { EducationModule, EducationQuestionType, EducationQuizPayload, EducationQuizQuestion } from '../../core/models/models';

@Component({
  selector: 'app-education-quizzes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
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
        query('.question-card', [
          style({ opacity: 0, transform: 'translateY(20px) scale(0.97)' }),
          stagger(80, [
            animate('450ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto">
      <!-- Header -->
      <div class="rounded-[2.5rem] bg-white border border-pink-100 p-8 shadow-[0_8px_30px_rgb(228,161,208,0.1)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(228,161,208,0.2)]">
        <div class="flex flex-wrap items-center justify-between gap-6">
          <div class="transition-transform duration-500 hover:translate-x-2">
            <div class="mb-5">
               <a class="inline-flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-pink-500 hover:bg-pink-100 hover:text-pink-700 transition-all duration-300 hover:-translate-x-1"
                  [routerLink]="['/dashboard/doctor/education']">
                 <mat-icon class="!text-[14px]">arrow_back</mat-icon>
                 Back to Studio
               </a>
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-600 mb-1">Quiz Engine</p>
            <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">Quiz Manager</h1>
            <p class="mt-2 text-[15px] font-medium text-gray-500 leading-relaxed max-w-md">{{ module()?.title || 'Loading Module...' }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <div class="rounded-2xl border border-pink-100 bg-pink-50/50 px-6 py-4 text-center shadow-sm min-w-[110px] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-pink-50">
              <p class="text-3xl font-black text-pink-600">{{ questions().length }}</p>
              <p class="text-[10px] font-black uppercase tracking-widest text-pink-800/60 mt-1.5">Questions</p>
            </div>
            <div class="rounded-2xl border border-purple-100 bg-purple-50/50 px-6 py-4 text-center shadow-sm min-w-[110px] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-purple-50">
              <p class="text-3xl font-black text-purple-600">{{ mcqCount() }}</p>
              <p class="text-[10px] font-black uppercase tracking-widest text-purple-800/60 mt-1.5">MCQ</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr]">
        <!-- Question builder form -->
        <div [@fadeSlideIn] class="space-y-4 lg:sticky lg:top-8 z-10 w-full max-w-full">
          <div class="rounded-[2rem] border border-pink-100 bg-white shadow-[0_20px_40px_rgba(244,114,182,0.15)] overflow-hidden transition-all duration-500 hover:shadow-[0_25px_50px_rgba(244,114,182,0.25)]">
            <div class="flex items-center justify-between border-b border-pink-50 bg-gradient-to-r from-pink-50/50 to-rose-50/50 p-6">
              <h2 class="text-xl font-extrabold tracking-tight text-gray-900">
                {{ editingQuestionId() ? 'Edit Question' : 'New Question' }}
              </h2>
              <button class="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-pink-100 hover:text-pink-600 hover:scale-110 hover:rotate-90 transition-all duration-300 focus:outline-none"
                      (click)="resetForm()" matTooltip="Clear form">
                <mat-icon class="!text-[20px]">refresh</mat-icon>
              </button>
            </div>

            <form [formGroup]="quizForm" class="p-6 md:p-8 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto" (ngSubmit)="saveQuestion()">
                <mat-form-field appearance="outline" class="w-full transition-shadow duration-300 hover:shadow-md focus-within:shadow-md rounded-md">
                  <mat-label>Question type</mat-label>
                  <mat-select formControlName="questionType">
                    <mat-option value="MULTIPLE_CHOICE">
                      <span class="flex items-center gap-2">
                        <mat-icon class="!text-[16px] text-fuchsia-500">list</mat-icon>
                        Multiple choice
                      </span>
                    </mat-option>
                    <mat-option value="TRUE_FALSE">
                      <span class="flex items-center gap-2">
                        <mat-icon class="!text-[16px] text-pink-500">check_circle</mat-icon>
                        True / False
                      </span>
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full transition-shadow duration-300 hover:shadow-md focus-within:shadow-md rounded-md">
                  <mat-label>Question text</mat-label>
                  <textarea matInput rows="3" formControlName="questionText"
                    placeholder="e.g. What is the recommended daily folic acid intake during pregnancy?"></textarea>
                </mat-form-field>

                <mat-form-field *ngIf="quizForm.value.questionType === 'MULTIPLE_CHOICE'" appearance="outline" class="w-full transition-shadow duration-300 hover:shadow-md focus-within:shadow-md rounded-md">
                  <mat-label>Options (one per line)</mat-label>
                  <textarea matInput rows="4" formControlName="optionsText"
                    placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"></textarea>
                  <mat-hint>At least 2 options required</mat-hint>
                </mat-form-field>

                <div class="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/40 p-5 mt-2 space-y-4 group transition-all hover:shadow-inner">
                  <h3 class="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-2 transition-transform group-hover:translate-x-1">
                    <mat-icon class="!text-[16px]">check_circle_outline</mat-icon> Answer Key
                  </h3>
                  <mat-form-field appearance="outline" class="w-full !mb-0 transition-shadow duration-300 hover:shadow-sm">
                    <mat-label>Correct answer</mat-label>
                    <input matInput formControlName="correctAnswer" placeholder="e.g. Option A or true" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full !mb-0 transition-shadow duration-300 hover:shadow-sm">
                    <mat-label>Explanation</mat-label>
                    <textarea matInput rows="2" formControlName="explanation"
                      placeholder="Brief explanation shown after answering"></textarea>
                  </mat-form-field>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100">
                  <mat-form-field appearance="outline" class="w-full transition-shadow duration-300 hover:shadow-sm">
                    <mat-label>Display order</mat-label>
                    <input matInput type="number" formControlName="displayOrder" />
                  </mat-form-field>
                </div>

                <div class="flex flex-col gap-3 pt-2">
                  <button type="submit" [disabled]="quizForm.invalid || saving()"
                    class="w-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-4 text-sm font-bold tracking-wide text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                    <mat-icon class="!text-[18px]">{{ editingQuestionId() ? 'save' : 'add' }}</mat-icon>
                    {{ editingQuestionId() ? 'Update Question' : 'Create Question' }}
                  </button>
                  <button type="button" (click)="resetForm()"
                    class="w-full rounded-full border border-pink-200 bg-white px-6 py-4 text-sm font-bold tracking-wide text-pink-600 shadow-sm hover:bg-pink-50 transition-all duration-300 hover:-translate-y-1 focus:outline-none text-center">
                    Clear Form
                  </button>
                </div>
            </form>
          </div>
        </div>

        <!-- Questions list -->
        <div [@cardReveal] class="space-y-5 transition-all duration-500">
          <div *ngFor="let question of questions(); let i = index" class="group relative overflow-hidden rounded-[1.5rem] border border-pink-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.2)] hover:border-pink-300 hover:-translate-y-1">
            <!-- Decorative line -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 bg-fuchsia-300 group-hover:bg-fuchsia-400"></div>

            <div class="flex items-start justify-between gap-6 pl-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap mb-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-black tracking-widest uppercase border transition-colors duration-300"
                        [class]="question.questionType === 'MULTIPLE_CHOICE' ? 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700' : 'bg-pink-50 border-pink-100 text-pink-700'">
                    <mat-icon class="!text-[14px]">{{ question.questionType === 'MULTIPLE_CHOICE' ? 'list' : 'check_circle' }}</mat-icon>
                    {{ question.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'True / False' }}
                  </span>
                  <span class="rounded-md border border-pink-100 bg-pink-50/50 px-2.5 py-1.5 text-[10px] font-bold text-pink-600 tracking-wide uppercase transition-colors duration-300 group-hover:bg-pink-100">
                    Order {{ question.displayOrder }}
                  </span>
                </div>
                
                <h3 class="text-lg font-extrabold text-gray-900 leading-snug transition-colors duration-300 group-hover:text-pink-600">{{ question.questionText }}</h3>
                
                <div class="mt-4 flex flex-col gap-2">
                  <div *ngFor="let option of question.answerOptions"
                       class="relative flex items-center justify-between rounded-xl border p-3 text-sm transition-all duration-300 hover:translate-x-1"
                       [class]="option.toLowerCase() === question.correctAnswer.toLowerCase()
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-bold shadow-sm'
                          : 'border-pink-100 bg-pink-50/30 text-gray-600 font-medium hover:bg-pink-50/60 hover:border-pink-200'">
                    <span class="pr-6">{{ option }}</span>
                    <mat-icon *ngIf="option.toLowerCase() === question.correctAnswer.toLowerCase()" class="!text-[18px] text-emerald-500 shrink-0">check_circle</mat-icon>
                  </div>
                </div>
                
                <div *ngIf="question.explanation" class="mt-5 rounded-xl border border-pink-100 bg-pink-50/50 p-4 relative transition-all duration-300 hover:shadow-sm">
                  <div class="flex items-center gap-2 mb-1.5">
                    <mat-icon class="!text-[16px] text-amber-500">lightbulb</mat-icon>
                    <span class="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Explanation</span>
                  </div>
                  <p class="text-[13px] text-gray-700 leading-relaxed font-medium pl-6">
                    {{ question.explanation }}
                  </p>
                </div>
              </div>
              
              <div class="flex shrink-0 flex-col gap-2.5 relative z-10 transition-transform duration-300">
                <div class="flex flex-col gap-1 rounded-full border border-pink-100 bg-pink-50/50 p-1 mb-2">
                  <button class="inline-flex h-8 w-8 items-center justify-center rounded-full text-pink-400 hover:bg-white hover:text-pink-700 hover:shadow-sm hover:scale-110 transition-all duration-200 focus:outline-none disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:scale-100"
                          (click)="moveQuestion(i, -1)" [disabled]="i === 0 || persistingOrder()" matTooltip="Move up" matTooltipPosition="left">
                    <mat-icon class="!text-[16px]">arrow_upward</mat-icon>
                  </button>
                  <button class="inline-flex h-8 w-8 items-center justify-center rounded-full text-pink-400 hover:bg-white hover:text-pink-700 hover:shadow-sm hover:scale-110 transition-all duration-200 focus:outline-none disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:scale-100"
                          (click)="moveQuestion(i, 1)" [disabled]="i === questions().length - 1 || persistingOrder()" matTooltip="Move down" matTooltipPosition="left">
                    <mat-icon class="!text-[16px]">arrow_downward</mat-icon>
                  </button>
                </div>
                
                <button class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300 focus:outline-none"
                        (click)="editQuestion(question)" matTooltip="Edit Question" matTooltipPosition="left">
                  <mat-icon class="!text-[18px]">edit</mat-icon>
                </button>
                <button class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                        (click)="deleteQuestion(question.id)" matTooltip="Delete" matTooltipPosition="left">
                  <mat-icon class="!text-[18px]">delete_outline</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="questions().length === 0" class="rounded-[2.5rem] border-2 border-dashed border-pink-200 bg-white p-16 text-center shadow-sm animate-fade-in">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-pink-50 text-4xl shadow-sm border border-pink-100 animate-bounce">🤔</div>
            <h3 class="mt-5 text-xl font-extrabold text-gray-900">No questions yet</h3>
            <p class="mt-2 text-[15px] text-gray-500">Create your first quiz question using the form to start building this module's assessment.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EducationQuizzesComponent implements OnInit {
  protected readonly module = signal<EducationModule | null>(null);
  protected readonly questions = signal<EducationQuizQuestion[]>([]);
  protected readonly editingQuestionId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly persistingOrder = signal(false);
  protected readonly mcqCount = signal(0);

  protected readonly quizForm = this.fb.group({
    questionType: ['MULTIPLE_CHOICE', Validators.required],
    questionText: ['', Validators.required],
    optionsText: ['', Validators.required],
    correctAnswer: ['', Validators.required],
    explanation: [''],
    displayOrder: [1, Validators.required],
  });

  private moduleId = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private educationService: EducationService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    this.quizForm.get('questionType')?.valueChanges.subscribe(() => this.updateQuestionTypeValidators());
    this.updateQuestionTypeValidators();
    this.loadModule();
    this.loadQuestions();
  }

  protected saveQuestion(): void {
    if (this.quizForm.invalid || !this.moduleId) {
      this.quizForm.markAllAsTouched();
      return;
    }
    const payload = this.buildPayload();
    this.saving.set(true);
    const request$ = this.editingQuestionId()
      ? this.educationService.updateQuizQuestion(this.moduleId, this.editingQuestionId()!, payload)
      : this.educationService.createQuizQuestion(this.moduleId, payload);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.resetForm();
        this.loadQuestions();
        this.snackBar.open('Question saved!', 'Close', { duration: 2500 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Failed to save question', 'Close', { duration: 3000 });
      },
    });
  }

  protected editQuestion(question: EducationQuizQuestion): void {
    this.editingQuestionId.set(question.id);
    this.quizForm.patchValue({
      questionType: question.questionType,
      questionText: question.questionText,
      optionsText: question.questionType === 'MULTIPLE_CHOICE' ? question.answerOptions.join('\n') : 'true\nfalse',
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      displayOrder: question.displayOrder,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected deleteQuestion(questionId: number): void {
    if (!window.confirm('Delete this question?')) return;
    this.educationService.deleteQuizQuestion(this.moduleId, questionId).subscribe({
      next: () => { this.loadQuestions(); this.snackBar.open('Question deleted', 'Close', { duration: 2000 }); },
      error: () => this.snackBar.open('Failed to delete question', 'Close', { duration: 3000 }),
    });
  }

  protected resetForm(): void {
    this.editingQuestionId.set(null);
    this.quizForm.reset({
      questionType: 'MULTIPLE_CHOICE', questionText: '', optionsText: '',
      correctAnswer: '', explanation: '', displayOrder: this.questions().length + 1,
    });
    this.updateQuestionTypeValidators();
  }

  protected moveQuestion(index: number, direction: -1 | 1): void {
    const current = this.questions();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= current.length || this.persistingOrder()) return;

    const reordered = [...current];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    const normalized = reordered.map((question, idx) => ({ ...question, displayOrder: idx + 1 }));

    this.questions.set(normalized);
    this.persistingOrder.set(true);

    forkJoin(normalized.map((question) =>
      this.educationService.updateQuizQuestion(this.moduleId, question.id, this.payloadFromQuestion(question))
    )).subscribe({
      next: () => { this.persistingOrder.set(false); this.snackBar.open('Order updated', 'Close', { duration: 1800 }); },
      error: () => { this.persistingOrder.set(false); this.loadQuestions(); this.snackBar.open('Failed to save order', 'Close', { duration: 3000 }); },
    });
  }

  private loadModule(): void {
    this.educationService.getAdminModule(this.moduleId).subscribe({
      next: (module) => this.module.set(module),
      error: () => this.snackBar.open('Failed to load module', 'Close', { duration: 3000 }),
    });
  }

  private loadQuestions(): void {
    this.educationService.getQuizQuestions(this.moduleId).subscribe({
      next: (questions) => {
        const ordered = [...questions].sort((a, b) => a.displayOrder - b.displayOrder);
        this.questions.set(ordered);
        this.mcqCount.set(ordered.filter((q) => q.questionType === 'MULTIPLE_CHOICE').length);
        if (!this.editingQuestionId()) {
          this.quizForm.patchValue({ displayOrder: ordered.length + 1 });
        }
      },
      error: () => this.snackBar.open('Failed to load questions', 'Close', { duration: 3000 }),
    });
  }

  private buildPayload(): EducationQuizPayload {
    const value = this.quizForm.getRawValue();
    const answerOptions = value.questionType === 'TRUE_FALSE'
      ? ['true', 'false']
      : (value.optionsText ?? '').split('\n').map((item) => item.trim()).filter(Boolean);
    return {
      questionType: value.questionType as EducationQuestionType,
      questionText: value.questionText!.trim(),
      answerOptions,
      correctAnswer: value.correctAnswer!.trim(),
      explanation: value.explanation?.trim() ?? '',
      displayOrder: Number(value.displayOrder),
    };
  }

  private payloadFromQuestion(question: EducationQuizQuestion): EducationQuizPayload {
    return {
      questionType: question.questionType,
      questionText: question.questionText,
      answerOptions: question.answerOptions,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation ?? '',
      displayOrder: question.displayOrder,
    };
  }

  private updateQuestionTypeValidators(): void {
    const questionType = this.quizForm.get('questionType')?.value;
    const optionsControl = this.quizForm.get('optionsText');
    if (!optionsControl) return;
    if (questionType === 'TRUE_FALSE') {
      optionsControl.clearValidators();
      optionsControl.setValue('true\nfalse', { emitEvent: false });
    } else {
      optionsControl.setValidators([Validators.required]);
      if ((optionsControl.value ?? '').trim().toLowerCase() === 'true\nfalse') {
        optionsControl.setValue('', { emitEvent: false });
      }
    }
    optionsControl.updateValueAndValidity({ emitEvent: false });
  }
}