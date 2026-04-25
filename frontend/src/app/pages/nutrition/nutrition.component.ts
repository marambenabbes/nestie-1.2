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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AiService } from '../../core/services/ai.service';
import { NutritionPlan, PregnancyProfile } from '../../core/models/models';
import { NutritionCalendarComponent } from './components/nutrition-calendar.component';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatTooltipModule, NutritionCalendarComponent
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="space-y-5 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold" style="font-family:'Outfit',sans-serif;color:var(--mama-berry)">Nutrition Planner 🥗</h1>
        <div class="flex gap-2">
          <button mat-raised-button (click)="openCountryModal()" [disabled]="loadingAi"
                  class="!rounded-full !text-white" style="background:linear-gradient(135deg,var(--mama-lavender-dark),var(--mama-purple))!important;box-shadow:0 6px 20px rgba(168,91,143,0.25)">
            <mat-icon>smart_toy</mat-icon> {{ loadingAi ? 'Generating...' : 'AI Generate' }}
          </button>
          <button mat-raised-button (click)="openForm()"
                  class="!rounded-full !text-white" style="background:linear-gradient(135deg,var(--mama-rose),var(--mama-rose-deep))!important;box-shadow:0 6px 20px rgba(212,83,126,0.25)">
            <mat-icon>add</mat-icon> Add Meal
          </button>
        </div>
      </div>

      <!-- Calendar + Day Detail -->
      <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <app-nutrition-calendar
          [entries]="mealCalendarEntries"
          [selectedDate]="selectedDate"
          (dateSelected)="onDateSelected($event)"
        ></app-nutrition-calendar>

        <mat-card class="!rounded-2xl !shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-700">{{ selectedDate | date:'EEEE, MMM d' }}</h3>
            <button mat-icon-button (click)="openFormForDate()" matTooltip="Add meal for this day">
              <mat-icon class="text-mama-rose">add_circle</mat-icon>
            </button>
          </div>

          <div class="space-y-3" *ngIf="selectedDayMeals.length > 0; else noMeals">
            <div *ngFor="let meal of selectedDayMeals" class="p-4 rounded-xl border border-gray-100 hover:shadow-md transition">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <mat-icon class="!text-lg" [style.color]="getMealTypeColor(meal.mealType)">{{ getMealTypeIcon(meal.mealType) }}</mat-icon>
                  <span class="text-xs font-medium text-gray-400 uppercase">{{ meal.mealType }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span *ngIf="meal.aiGenerated" class="text-[10px] bg-mama-lavender-light text-mama-purple px-1.5 py-0.5 rounded-full">AI</span>
                  <button mat-icon-button (click)="editMeal(meal)" class="!w-6 !h-6">
                    <mat-icon class="!text-xs text-gray-300 hover:text-mama-rose">edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteMeal(meal.id)" class="!w-6 !h-6">
                    <mat-icon class="!text-xs text-gray-300 hover:text-red-400">delete</mat-icon>
                  </button>
                </div>
              </div>
              <h4 class="font-semibold text-gray-700 text-sm">{{ meal.mealName }}</h4>
              <p class="text-xs text-gray-400 mt-1">{{ meal.ingredients }}</p>
              <div class="flex gap-2 mt-2 text-xs">
                <span class="bg-mama-peach-light rounded-lg px-2 py-0.5 text-orange-600 font-medium">{{ meal.calories }} kcal</span>
                <span class="bg-mama-pink-light rounded-lg px-2 py-0.5 text-mama-rose font-medium">{{ meal.proteinGrams }}g protein</span>
              </div>
            </div>
          </div>

          <ng-template #noMeals>
            <div class="text-center py-8">
              <mat-icon class="!text-4xl text-gray-200">restaurant</mat-icon>
              <p class="text-sm text-gray-400 mt-2">No meals for this day</p>
              <button mat-stroked-button (click)="openFormForDate()" class="!rounded-full !text-mama-rose !border-mama-rose mt-3 !text-xs">
                <mat-icon class="!text-sm">add</mat-icon> Add Meal
              </button>
            </div>
          </ng-template>
        </mat-card>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <mat-card class="!rounded-2xl !shadow-sm p-4 text-center !bg-mama-peach-light">
          <p class="text-2xl font-bold text-orange-600">{{ totalCalories }}</p>
          <p class="text-xs text-gray-500">Total Calories</p>
        </mat-card>
        <mat-card class="!rounded-2xl !shadow-sm p-4 text-center !bg-mama-pink-light">
          <p class="text-2xl font-bold text-mama-rose">{{ totalProtein }}g</p>
          <p class="text-xs text-gray-500">Protein</p>
        </mat-card>
        <mat-card class="!rounded-2xl !shadow-sm p-4 text-center !bg-mama-lavender-light">
          <p class="text-2xl font-bold text-mama-purple">{{ totalIron }}mg</p>
          <p class="text-xs text-gray-500">Iron</p>
        </mat-card>
        <mat-card class="!rounded-2xl !shadow-sm p-4 text-center !bg-green-50">
          <p class="text-2xl font-bold text-green-600">{{ totalCalcium }}mg</p>
          <p class="text-xs text-gray-500">Calcium</p>
        </mat-card>
      </div>

      <!-- AI Suggestions -->
      <div *ngIf="aiSuggestions.length > 0" class="space-y-3">
        <h2 class="text-lg font-semibold text-mama-purple flex items-center">
          <mat-icon class="mr-2">auto_awesome</mat-icon> AI Meal Suggestions
          <span *ngIf="aiCountry" class="ml-2 text-xs font-normal bg-mama-lavender-light text-mama-purple px-2 py-0.5 rounded-full">
            {{ getCountryFlag(aiCountry) }} {{ aiCountry }}
          </span>
        </h2>
        <p *ngIf="aiTip" class="text-sm text-mama-purple bg-mama-lavender-light rounded-xl p-3">💡 {{ aiTip }}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <mat-card *ngFor="let s of aiSuggestions" class="!rounded-2xl !shadow-sm p-4 border-2 border-dashed border-mama-lavender">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-mama-purple uppercase">{{ s.meal_type }}</span>
              <span class="text-xs bg-mama-lavender-light text-mama-purple px-2 py-0.5 rounded-full">🤖 AI</span>
            </div>
            <h4 class="font-semibold text-gray-700 text-sm mb-1">{{ s.meal_name }}</h4>
            <p class="text-xs text-gray-400 mb-2">{{ s.ingredients }}</p>
            <div class="flex gap-2 text-xs mb-3">
              <span class="bg-mama-peach-light rounded-lg px-2 py-1 text-orange-600 font-medium">{{ s.calories }} kcal</span>
              <span class="bg-mama-pink-light rounded-lg px-2 py-1 text-mama-rose font-medium">{{ s.protein_g }}g protein</span>
            </div>
            <button mat-stroked-button (click)="addAiSuggestion(s)" class="!rounded-full !text-mama-purple !border-mama-purple w-full !text-xs">
              <mat-icon class="!text-sm">add</mat-icon> Add to Plan
            </button>
          </mat-card>
        </div>
      </div>

      <!-- Add/Edit Meal Form Modal -->
      <div *ngIf="showForm" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" (click)="closeForm()">
        <div (click)="$event.stopPropagation()" class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-fade-in">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-800 flex items-center">
                <mat-icon class="mr-2 text-mama-rose">{{ editingId ? 'edit' : 'restaurant' }}</mat-icon>
                {{ editingId ? 'Edit Meal' : 'Add New Meal' }}
              </h2>
              <button mat-icon-button (click)="closeForm()">
                <mat-icon class="text-gray-400">close</mat-icon>
              </button>
            </div>
            <form [formGroup]="mealForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Meal Name</mat-label>
                  <input matInput formControlName="mealName" placeholder="e.g., Spinach Omelette">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Meal Type</mat-label>
                  <mat-select formControlName="mealType">
                    <mat-option *ngFor="let t of mealTypes" [value]="t">{{ t }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full md:col-span-2">
                  <mat-label>Ingredients</mat-label>
                  <textarea matInput formControlName="ingredients" rows="2"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Calories</mat-label>
                  <input matInput type="number" formControlName="calories">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Protein (g)</mat-label>
                  <input matInput type="number" formControlName="proteinGrams">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Carbs (g)</mat-label>
                  <input matInput type="number" formControlName="carbsGrams">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Fat (g)</mat-label>
                  <input matInput type="number" formControlName="fatGrams">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Iron (mg)</mat-label>
                  <input matInput type="number" formControlName="ironMg">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Calcium (mg)</mat-label>
                  <input matInput type="number" formControlName="calciumMg">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Folic Acid (mcg)</mat-label>
                  <input matInput type="number" formControlName="folicAcidMcg">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Scheduled Date</mat-label>
                  <input matInput type="date" formControlName="scheduledDate">
                </mat-form-field>
                <mat-form-field appearance="outline" class="w-full md:col-span-2">
                  <mat-label>Notes</mat-label>
                  <textarea matInput formControlName="notes" rows="2"></textarea>
                </mat-form-field>
              </div>
              <div class="flex gap-3 justify-end">
                <button mat-button type="button" (click)="closeForm()" class="!rounded-full">Cancel</button>
                <button mat-raised-button type="submit" [disabled]="mealForm.invalid || saving"
                        class="!rounded-full !text-white" style="background:linear-gradient(135deg,var(--mama-rose),var(--mama-rose-deep))!important;box-shadow:0 6px 20px rgba(212,83,126,0.25)">
                  {{ saving ? 'Saving...' : (editingId ? 'Update Meal' : 'Save Meal') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Country Selection Modal -->
      <div *ngIf="showCountryModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="closeCountryModal()">
        <div (click)="$event.stopPropagation()" class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-fade-in">
          <div class="p-6">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-bold text-gray-800 flex items-center">
                <mat-icon class="mr-2 text-mama-purple">public</mat-icon> Choose a Cuisine
              </h2>
              <button mat-icon-button (click)="closeCountryModal()">
                <mat-icon class="text-gray-400">close</mat-icon>
              </button>
            </div>
            <p class="text-sm text-gray-400 mb-5">Select a country to generate pregnancy-safe meals</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button *ngFor="let c of countries" (click)="selectCountry(c)"
                      class="flex flex-col items-center p-4 rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer"
                      [class.border-mama-purple]="selectedCountry === c.name"
                      [class.bg-mama-lavender-light]="selectedCountry === c.name"
                      [class.border-gray-100]="selectedCountry !== c.name"
                      [class.bg-gray-50]="selectedCountry !== c.name">
                <span class="text-3xl mb-2">{{ c.flag }}</span>
                <span class="font-semibold text-sm" [class.text-mama-purple]="selectedCountry === c.name"
                      [class.text-gray-700]="selectedCountry !== c.name">{{ c.name }}</span>
                <span class="text-xs text-gray-400 mt-0.5">{{ c.desc }}</span>
              </button>
            </div>
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button mat-button (click)="closeCountryModal()" class="!rounded-full !text-gray-500">Cancel</button>
              <button mat-raised-button [disabled]="!selectedCountry" (click)="confirmCountryAndGenerate()"
                      class="!rounded-full !bg-gradient-to-r !from-mama-lavender-dark !to-mama-purple !text-white !px-6">
                <mat-icon>auto_awesome</mat-icon> Generate {{ selectedCountry }} Meals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NutritionComponent implements OnInit {
  meals: NutritionPlan[] = [];
  totalCalories = 0; totalProtein = 0; totalIron = 0; totalCalcium = 0;
  loading = false;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  loadingAi = false;
  aiSuggestions: any[] = [];
  aiTrimester = 0;
  aiTip = '';
  aiCountry = '';
  mealForm!: FormGroup;
  mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'SUPPLEMENT'];
  private pregnancy: PregnancyProfile | null = null;

  selectedDate = new Date();
  showCountryModal = false;
  selectedCountry = '';
  countries = [
    { name: 'Italy', flag: '🇮🇹', desc: 'Mediterranean flavors' },
    { name: 'Japan', flag: '🇯🇵', desc: 'Balanced & nutrient-rich' },
    { name: 'Mexico', flag: '🇲🇽', desc: 'Bold & colorful' },
    { name: 'India', flag: '🇮🇳', desc: 'Spiced & iron-rich' },
    { name: 'Morocco', flag: '🇲🇦', desc: 'Aromatic tagines' },
    { name: 'South Korea', flag: '🇰🇷', desc: 'Fermented & fresh' },
    { name: 'France', flag: '🇫🇷', desc: 'Elegant & wholesome' },
    { name: 'Tunisia', flag: '🇹🇳', desc: 'Harissa & olive oil' },
    { name: 'Brazil', flag: '🇧🇷', desc: 'Tropical superfoods' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {
    this.mealForm = this.fb.group({
      mealName: ['', Validators.required],
      mealType: ['BREAKFAST'],
      ingredients: [''],
      calories: [null],
      proteinGrams: [null],
      carbsGrams: [null],
      fatGrams: [null],
      ironMg: [null],
      calciumMg: [null],
      folicAcidMcg: [null],
      scheduledDate: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  get mealCalendarEntries(): { mealName: string; mealType: string; scheduledDate: string; calories?: number; }[] {
    return this.meals.map(m => ({
      mealName: m.mealName,
      mealType: m.mealType,
      scheduledDate: m.scheduledDate || '',
      calories: m.calories
    }));
  }

  get selectedDayMeals(): NutritionPlan[] {
    const dateStr = this.toIsoDate(this.selectedDate);
    return this.meals.filter(m => m.scheduledDate === dateStr);
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
  }

  openForm(): void {
    this.editingId = null;
    this.mealForm.reset({ mealType: 'BREAKFAST' });
    this.showForm = true;
  }

  openFormForDate(): void {
    this.editingId = null;
    this.mealForm.reset({
      mealType: 'BREAKFAST',
      scheduledDate: this.toIsoDate(this.selectedDate)
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.saving = false;
  }

  loadData(): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;
    this.loading = true;

    this.apiService.getPregnancyProfiles(userId).subscribe({
      next: (res) => {
        this.pregnancy = res.content.find((p: PregnancyProfile) => p.status === 'ACTIVE') || res.content[0] || null;
      }
    });

    this.apiService.getNutritionPlans(userId).subscribe({
      next: (res) => {
        this.meals = res.content;
        this.calculateTotals();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load nutrition plans', 'Close', { duration: 3000 });
      }
    });
  }

  calculateTotals(): void {
    this.totalCalories = this.meals.reduce((s, m) => s + (m.calories || 0), 0);
    this.totalProtein = Math.round(this.meals.reduce((s, m) => s + (m.proteinGrams || 0), 0));
    this.totalIron = Math.round(this.meals.reduce((s, m) => s + (m.ironMg || 0), 0) * 10) / 10;
    this.totalCalcium = Math.round(this.meals.reduce((s, m) => s + (m.calciumMg || 0), 0));
  }

  editMeal(meal: NutritionPlan): void {
    this.editingId = meal.id;
    this.mealForm.patchValue({
      mealName: meal.mealName,
      mealType: meal.mealType,
      ingredients: meal.ingredients,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      carbsGrams: meal.carbsGrams,
      fatGrams: meal.fatGrams,
      ironMg: meal.ironMg,
      calciumMg: meal.calciumMg,
      folicAcidMcg: meal.folicAcidMcg,
      scheduledDate: meal.scheduledDate,
      notes: meal.notes
    });
    this.showForm = true;
  }

  onSubmit(): void {
    if (this.mealForm.invalid) return;
    this.saving = true;
    const userId = this.authService.user()?.id;
    if (!userId) return;

    const data = {
      ...this.mealForm.value,
      pregnancyId: this.pregnancy?.id,
      pregnancyWeek: this.pregnancy?.currentWeek
    };

    const request$ = this.editingId
      ? this.apiService.updateNutritionPlan(this.editingId, data)
      : this.apiService.createNutritionPlan(userId, data);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Meal updated!' : 'Meal added!', 'Close', { duration: 3000 });
        this.closeForm();
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save meal', 'Close', { duration: 3000 });
      }
    });
  }

  openCountryModal(): void {
    this.selectedCountry = '';
    this.showCountryModal = true;
  }

  closeCountryModal(): void {
    this.showCountryModal = false;
    this.selectedCountry = '';
  }

  selectCountry(country: { name: string; flag: string; desc: string }): void {
    this.selectedCountry = country.name;
  }

  confirmCountryAndGenerate(): void {
    if (!this.selectedCountry) return;
    this.showCountryModal = false;
    this.getAiSuggestions(this.selectedCountry);
  }

  getCountryFlag(name: string): string {
    return this.countries.find(c => c.name === name)?.flag || '🌍';
  }

  getAiSuggestions(country?: string): void {
    const week = this.pregnancy?.currentWeek || 20;
    this.loadingAi = true;
    this.aiService.getNutritionSuggestions(week, [], country).subscribe({
      next: (res) => {
        this.aiSuggestions = res.suggestions || [];
        this.aiTrimester = res.trimester;
        this.aiTip = res.tip_of_the_day || '';
        this.aiCountry = res.country || '';
        this.loadingAi = false;
      },
      error: () => {
        this.loadingAi = false;
        this.snackBar.open('Could not fetch AI suggestions', 'Close', { duration: 3000 });
      }
    });
  }

  addAiSuggestion(s: any): void {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    const data = {
      mealName: s.meal_name,
      mealType: s.meal_type || 'SNACK',
      ingredients: s.ingredients || '',
      calories: s.calories ?? 0,
      proteinGrams: s.protein_g ?? 0,
      carbsGrams: s.carbs_g ?? 0,
      fatGrams: s.fat_g ?? 0,
      folicAcidMcg: s.folic_acid_mcg ?? 0,
      ironMg: s.iron_mg ?? 0,
      calciumMg: s.calcium_mg ?? 0,
      scheduledDate: new Date().toISOString().slice(0, 10),
      pregnancyId: this.pregnancy?.id,
      pregnancyWeek: this.pregnancy?.currentWeek,
      notes: this.sanitizeAiNote(s.tip),
      aiGenerated: true
    };

    this.apiService.createNutritionPlan(userId, data).subscribe({
      next: () => {
        this.snackBar.open(`"${s.meal_name}" added!`, 'Close', { duration: 3000 });
        this.aiSuggestions = this.aiSuggestions.filter(item => item !== s);
        this.loadData();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed to add suggestion', 'Close', { duration: 3000 })
    });
  }

  private sanitizeAiNote(note?: string): string {
    if (!note) return '';
    return note.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
  }

  deleteMeal(id: number): void {
    if (!id || !confirm('Delete this meal?')) return;
    this.apiService.deleteNutritionPlan(id).subscribe({
      next: () => {
        this.snackBar.open('Meal removed', 'Close', { duration: 2000 });
        this.loadData();
      },
      error: () => this.snackBar.open('Failed to delete meal', 'Close', { duration: 3000 })
    });
  }

  getMealTypeIcon(type: string): string {
    const map: Record<string, string> = { BREAKFAST: 'wb_sunny', LUNCH: 'restaurant', DINNER: 'nightlight', SNACK: 'cookie', SUPPLEMENT: 'medication' };
    return map[type] || 'restaurant';
  }

  getMealTypeColor(type: string): string {
    const map: Record<string, string> = { BREAKFAST: '#ffab91', LUNCH: '#f48fb1', DINNER: '#ce93d8', SNACK: '#a5d6a7', SUPPLEMENT: '#90caf9' };
    return map[type] || '#bdbdbd';
  }

  private toIsoDate(date: Date): string {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
}
