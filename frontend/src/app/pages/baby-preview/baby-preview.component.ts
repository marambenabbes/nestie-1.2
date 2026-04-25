import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface BabyPreviewResponse {
  id: number;
  userId: number;
  gender: string;
  age: string;
  style: string;
  generatedImageBase64: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  expiresAt: string;
  remainingGenerations: number;
}

interface RateLimitInfo {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
}

@Component({
  selector: 'app-baby-preview',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressBarModule, MatChipsModule, MatSnackBarModule,
    MatTooltipModule, MatBadgeModule
  ],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-mama-pink to-mama-lavender mb-3 shadow-lg">
          <mat-icon class="!text-3xl text-white">child_care</mat-icon>
        </div>
        <h1 class="text-3xl font-bold mb-2" style="font-family:'Outfit',sans-serif;color:var(--mama-berry)">AI Baby Preview</h1>
        <p class="text-gray-500 max-w-lg mx-auto">Upload parent photos and let AI imagine what your little one might look like! 🍼</p>

        <!-- Rate Limit Badge -->
        <div *ngIf="rateLimit()" class="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
             [class]="rateLimit()!.remaining > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
          <mat-icon class="!text-sm">{{ rateLimit()!.remaining > 0 ? 'check_circle' : 'block' }}</mat-icon>
          {{ rateLimit()!.remaining }} of {{ rateLimit()!.limit }} generations remaining today
        </div>
      </div>

      <!-- Upload Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Mother Photo -->
        <mat-card class="!rounded-2xl !shadow-card hover:!shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6 text-center">
            <div class="mb-4">
              <mat-icon class="!text-5xl text-mama-pink">face_3</mat-icon>
              <h3 class="font-semibold text-gray-700 mt-2">Mother's Photo</h3>
            </div>
            <div *ngIf="!motherPreview()"
                 (click)="motherInput.click()"
                 (dragover)="onDragOver($event)"
                 (drop)="onDrop($event, 'mother')"
                 class="border-2 border-dashed border-mama-pink-light rounded-2xl p-8 cursor-pointer hover:border-mama-pink hover:bg-mama-pink-light/30 transition-all duration-200">
              <mat-icon class="!text-4xl text-mama-pink/50 mb-2">cloud_upload</mat-icon>
              <p class="text-sm text-gray-400">Click or drag & drop a photo</p>
              <p class="text-xs text-gray-300 mt-1">JPG, PNG — max 5 MB</p>
            </div>
            <div *ngIf="motherPreview()" class="relative group">
              <img [src]="motherPreview()" alt="Mother photo" class="w-48 h-48 object-cover rounded-2xl mx-auto shadow-md" />
              <button (click)="clearImage('mother')"
                      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow">
                <mat-icon class="!text-sm">close</mat-icon>
              </button>
            </div>
            <input #motherInput type="file" accept="image/jpeg,image/png" (change)="onFileSelected($event, 'mother')" class="hidden" />
          </div>
        </mat-card>

        <!-- Father Photo -->
        <mat-card class="!rounded-2xl !shadow-card hover:!shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6 text-center">
            <div class="mb-4">
              <mat-icon class="!text-5xl" style="color:var(--mama-lavender-dark)">face_6</mat-icon>
              <h3 class="font-semibold text-gray-700 mt-2">Father's Photo</h3>
            </div>
            <div *ngIf="!fatherPreview()"
                 (click)="fatherInput.click()"
                 (dragover)="onDragOver($event)"
                 (drop)="onDrop($event, 'father')"
                 class="border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200" style="border-color:var(--mama-lavender);" onmouseenter="this.style.borderColor='var(--mama-lavender-dark)';this.style.background='var(--mama-lavender-light)'" onmouseleave="this.style.borderColor='var(--mama-lavender)';this.style.background=''">
              <mat-icon class="!text-4xl mb-2" style="color:var(--mama-lavender)">cloud_upload</mat-icon>
              <p class="text-sm text-gray-400">Click or drag & drop a photo</p>
              <p class="text-xs text-gray-300 mt-1">JPG, PNG — max 5 MB</p>
            </div>
            <div *ngIf="fatherPreview()" class="relative group">
              <img [src]="fatherPreview()" alt="Father photo" class="w-48 h-48 object-cover rounded-2xl mx-auto shadow-md" />
              <button (click)="clearImage('father')"
                      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow">
                <mat-icon class="!text-sm">close</mat-icon>
              </button>
            </div>
            <input #fatherInput type="file" accept="image/jpeg,image/png" (change)="onFileSelected($event, 'father')" class="hidden" />
          </div>
        </mat-card>
      </div>

      <!-- Options -->
      <mat-card class="!rounded-2xl !shadow-card">
        <div class="p-6">
          <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <mat-icon class="text-mama-lavender">tune</mat-icon>
            Customize Your Preview
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Gender -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Gender</mat-label>
              <mat-select [(value)]="selectedGender">
                <mat-option value="BOY">
                  <span class="flex items-center gap-2">👦 Boy</span>
                </mat-option>
                <mat-option value="GIRL">
                  <span class="flex items-center gap-2">👧 Girl</span>
                </mat-option>
                <mat-option value="NEUTRAL">
                  <span class="flex items-center gap-2">👶 Surprise Me</span>
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Age -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Baby Age</mat-label>
              <mat-select [(value)]="selectedAge">
                <mat-option value="NEWBORN">
                  <span class="flex items-center gap-2">🍼 Newborn</span>
                </mat-option>
                <mat-option value="SIX_MONTHS">
                  <span class="flex items-center gap-2">🧸 6 Months</span>
                </mat-option>
                <mat-option value="ONE_YEAR">
                  <span class="flex items-center gap-2">🎂 1 Year</span>
                </mat-option>
                <mat-option value="THREE_YEARS">
                  <span class="flex items-center gap-2">🧒 3 Years</span>
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Style -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Style</mat-label>
              <mat-select [(value)]="selectedStyle">
                <mat-option value="REALISTIC">
                  <span class="flex items-center gap-2">📷 Realistic Photo</span>
                </mat-option>
                <mat-option value="CARTOON">
                  <span class="flex items-center gap-2">🎨 Cartoon</span>
                </mat-option>
                <mat-option value="THREE_D">
                  <span class="flex items-center gap-2">🧊 3D / Pixar Style</span>
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </mat-card>

      <!-- Generate Button -->
      <div class="text-center">
        <button (click)="generatePreview()"
                [disabled]="!canGenerate()"
                class="px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-lg
                       transition-all duration-300 transform hover:scale-105 disabled:opacity-50
                       disabled:cursor-not-allowed disabled:transform-none"
                [class]="canGenerate()
                  ? 'bg-gradient-to-r from-mama-pink to-mama-lavender hover:shadow-xl'
                  : 'bg-gray-300'">
          <span class="flex items-center gap-2">
            <mat-icon>auto_awesome</mat-icon>
            Generate Baby Preview ✨
          </span>
        </button>
        <p *ngIf="!canGenerate() && rateLimit()?.remaining === 0" class="text-sm text-red-400 mt-2">
          Daily limit reached. Come back tomorrow! 💤
        </p>
      </div>

      <!-- ═══ Waiting / Loading State ═══ -->
      <div *ngIf="isGenerating()" class="text-center py-12">
        <mat-card class="!rounded-3xl !shadow-xl max-w-md mx-auto overflow-hidden">
          <div class="p-8 bg-gradient-to-br from-mama-cream via-white to-mama-pink-light">
            <!-- Animated Baby Icon -->
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="absolute inset-0 rounded-full bg-gradient-to-br from-mama-pink to-mama-lavender opacity-20 animate-ping"></div>
              <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-mama-pink to-mama-lavender flex items-center justify-center shadow-lg animate-bounce-slow">
                <span class="text-4xl">{{ currentEmoji }}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <mat-progress-bar mode="indeterminate" class="!rounded-full mb-4" color="accent"></mat-progress-bar>

            <!-- Cute Rotating Messages -->
            <p class="text-lg font-semibold text-mama-rose mb-2 transition-all duration-500">
              {{ currentMessage }}
            </p>

            <!-- Baby Facts -->
            <div class="mt-4 p-3 bg-white/60 rounded-xl">
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Did you know? 💡</p>
              <p class="text-sm text-gray-600">{{ currentFact }}</p>
            </div>

            <!-- Animated Dots -->
            <div class="flex justify-center gap-2 mt-4">
              <div class="w-3 h-3 rounded-full bg-mama-pink animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-3 h-3 rounded-full bg-mama-lavender animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-3 h-3 rounded-full bg-mama-peach animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- ═══ Result Display ═══ -->
      <div *ngIf="generatedResult() && generatedResult()!.status === 'COMPLETED'" class="text-center">
        <mat-card class="!rounded-3xl !shadow-xl max-w-lg mx-auto overflow-hidden">
          <div class="p-6 bg-gradient-to-br from-mama-cream to-white">
            <div class="mb-4">
              <span class="text-3xl">🎉</span>
              <h3 class="text-xl font-bold text-mama-rose mt-2">Meet Your Little One!</h3>
            </div>
            <div class="relative group">
              <img [src]="'data:image/jpeg;base64,' + generatedResult()!.generatedImageBase64"
                   alt="AI Baby Preview"
                   class="w-full max-w-sm mx-auto rounded-2xl shadow-lg" />
            </div>

            <!-- Meta Info -->
            <div class="flex justify-center gap-3 mt-4 text-sm text-gray-500">
              <span class="px-3 py-1 bg-mama-pink-light rounded-full">{{ formatAge(generatedResult()!.age) }}</span>
              <span class="px-3 py-1 bg-mama-lavender-light rounded-full">{{ formatGender(generatedResult()!.gender) }}</span>
              <span class="px-3 py-1 bg-mama-peach-light rounded-full">{{ formatStyle(generatedResult()!.style) }}</span>
            </div>

            <!-- Expiry Notice -->
            <p class="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <mat-icon class="!text-xs">schedule</mat-icon>
              Image auto-expires at {{ generatedResult()!.expiresAt | date:'short' }} for your privacy
            </p>

            <!-- Actions -->
            <div class="flex justify-center gap-3 mt-4">
              <button mat-stroked-button color="primary" (click)="downloadImage()">
                <mat-icon>download</mat-icon> Save Image
              </button>
              <button mat-stroked-button color="warn" (click)="deletePreview(generatedResult()!.id)">
                <mat-icon>delete</mat-icon> Delete Now
              </button>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Error State -->
      <div *ngIf="generatedResult() && generatedResult()!.status === 'FAILED'" class="text-center">
        <mat-card class="!rounded-2xl !shadow-card max-w-md mx-auto border-l-4 border-red-400">
          <div class="p-6">
            <mat-icon class="!text-4xl text-red-400 mb-2">error_outline</mat-icon>
            <h3 class="font-semibold text-red-600 mb-2">Generation Failed</h3>
            <p class="text-sm text-gray-500">{{ generatedResult()!.errorMessage || 'Something went wrong. Please try again.' }}</p>
            <button mat-flat-button color="primary" (click)="resetForm()" class="mt-4">Try Again</button>
          </div>
        </mat-card>
      </div>

      <!-- History -->
      <div *ngIf="history().length > 0" class="mt-8">
        <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <mat-icon class="text-mama-lavender">history</mat-icon>
          Previous Previews
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div *ngFor="let item of history()"
               class="relative rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-shadow cursor-pointer group">
            <img *ngIf="item.generatedImageBase64"
                 [src]="'data:image/jpeg;base64,' + item.generatedImageBase64"
                 alt="Baby Preview"
                 class="w-full h-40 object-cover" />
            <div *ngIf="!item.generatedImageBase64"
                 class="w-full h-40 bg-gray-100 flex items-center justify-center">
              <span class="text-gray-400 text-sm">{{ item.status === 'EXPIRED' ? 'Expired' : item.status }}</span>
            </div>
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p class="text-white text-xs">{{ item.createdAt | date:'short' }}</p>
            </div>
            <button (click)="deletePreview(item.id); $event.stopPropagation()"
                    class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 text-white rounded-full w-7 h-7 flex items-center justify-center">
              <mat-icon class="!text-sm">close</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Privacy Notice -->
      <div class="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
        <div class="flex items-start gap-3">
          <mat-icon class="text-blue-500 mt-0.5">privacy_tip</mat-icon>
          <div>
            <h4 class="font-semibold text-blue-700 text-sm">Privacy & Safety</h4>
            <ul class="text-xs text-blue-600 mt-1 space-y-1">
              <li>• Uploaded photos are processed in memory and <strong>never stored permanently</strong></li>
              <li>• Generated images auto-expire after 24 hours</li>
              <li>• AI creates an <strong>imaginary, unique baby face</strong> — no real identity is replicated</li>
              <li>• Maximum {{ rateLimit()?.limit || 3 }} generations per day per account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce-slow {
      animation: bounce-slow 2s infinite ease-in-out;
    }
  `]
})
export class BabyPreviewComponent implements OnInit, OnDestroy {

  // ─── State ──────────────────────────────────────────────
  motherPreview = signal<string | null>(null);
  fatherPreview = signal<string | null>(null);
  motherBase64 = signal<string | null>(null);
  fatherBase64 = signal<string | null>(null);
  selectedGender = 'NEUTRAL';
  selectedAge = 'NEWBORN';
  selectedStyle = 'REALISTIC';
  isGenerating = signal(false);
  generatedResult = signal<BabyPreviewResponse | null>(null);
  rateLimit = signal<RateLimitInfo | null>(null);
  history = signal<BabyPreviewResponse[]>([]);

  // UX: waiting messages
  currentMessage = '';
  currentEmoji = '👶';
  currentFact = '';
  private messageIndex = 0;
  private messageInterval: any;

  private readonly waitMessages = [
    { text: 'Your little one is forming… 🍼', emoji: '🍼' },
    { text: 'Mixing magic traits… ✨', emoji: '✨' },
    { text: 'Adding a sprinkle of cuteness… 💖', emoji: '💖' },
    { text: 'Choosing the cutest features… 👃', emoji: '👃' },
    { text: 'Almost there… 👶', emoji: '👶' },
    { text: 'Just a few more tiny details… 🎀', emoji: '🎀' },
    { text: 'Working on that adorable smile… 😊', emoji: '😊' },
    { text: 'Blending the best of both worlds… 🌍', emoji: '🌍' },
  ];

  private readonly babyFacts = [
    'Babies are born with about 300 bones, but adults only have 206!',
    'Newborns can recognize their mother\'s voice from birth.',
    'A baby\'s brain doubles in size during the first year.',
    'Babies smile an average of 200 times a day!',
    'Newborn babies can only see about 8-12 inches in front of them.',
    'A baby\'s heart beats about 130-160 times per minute.',
    'Babies start dreaming even before they are born!',
    'A newborn\'s stomach is only the size of a hazelnut.',
  ];

  canGenerate = computed(() =>
    !!this.motherBase64() &&
    !!this.fatherBase64() &&
    !this.isGenerating() &&
    (this.rateLimit()?.remaining ?? 1) > 0
  );

  private pollTimer: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRateLimit();
    this.loadHistory();
  }

  ngOnDestroy() {
    this.stopWaitingAnimation();
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  // ─── File Handling ────────────────────────────────────

  onFileSelected(event: Event, parent: 'mother' | 'father') {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.processFile(input.files[0], parent);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent, parent: 'mother' | 'father') {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file, parent);
  }

  private processFile(file: File, parent: 'mother' | 'father') {
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('Image must be under 5 MB', 'OK', { duration: 3000 });
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.snackBar.open('Only JPG and PNG files are allowed', 'OK', { duration: 3000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (parent === 'mother') {
        this.motherPreview.set(result);
        this.motherBase64.set(result);
      } else {
        this.fatherPreview.set(result);
        this.fatherBase64.set(result);
      }
    };
    reader.readAsDataURL(file);
  }

  clearImage(parent: 'mother' | 'father') {
    if (parent === 'mother') {
      this.motherPreview.set(null);
      this.motherBase64.set(null);
    } else {
      this.fatherPreview.set(null);
      this.fatherBase64.set(null);
    }
  }

  // ─── Generate ─────────────────────────────────────────

  generatePreview() {
    const userId = this.authService.user()?.id;
    if (!userId) return;

    this.isGenerating.set(true);
    this.generatedResult.set(null);
    this.startWaitingAnimation();

    const payload = {
      gender: this.selectedGender,
      age: this.selectedAge,
      style: this.selectedStyle,
      motherPhoto: this.motherBase64(),
      fatherPhoto: this.fatherBase64(),
    };

    this.apiService.generateBabyPreview(payload).subscribe({
      next: (res) => {
        // Start polling for completion
        this.pollForResult(res.id);
      },
      error: (err) => {
        this.isGenerating.set(false);
        this.stopWaitingAnimation();
        const msg = err.error?.message || 'Generation failed. Please try again.';
        this.snackBar.open(msg, 'OK', { duration: 5000 });
      }
    });
  }

  private pollForResult(previewId: number) {
    this.pollTimer = setInterval(() => {
      this.apiService.getBabyPreviewStatus(previewId).subscribe({
        next: (res) => {
          if (res.status === 'COMPLETED' || res.status === 'FAILED') {
            clearInterval(this.pollTimer);
            this.isGenerating.set(false);
            this.stopWaitingAnimation();
            this.generatedResult.set(res);
            this.loadRateLimit();
            this.loadHistory();

            if (res.status === 'COMPLETED') {
              this.snackBar.open('Your baby preview is ready! 🎉', 'View', { duration: 4000 });
              // Clear parent images from memory (privacy)
              this.motherBase64.set(null);
              this.fatherBase64.set(null);
            }
          }
        },
        error: () => {
          clearInterval(this.pollTimer);
          this.isGenerating.set(false);
          this.stopWaitingAnimation();
        }
      });
    }, 3000); // poll every 3 seconds
  }

  // ─── Waiting Animation ────────────────────────────────

  private startWaitingAnimation() {
    this.messageIndex = 0;
    this.updateWaitingMessage();
    this.messageInterval = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.waitMessages.length;
      this.updateWaitingMessage();
    }, 3500);
  }

  private updateWaitingMessage() {
    const msg = this.waitMessages[this.messageIndex];
    this.currentMessage = msg.text;
    this.currentEmoji = msg.emoji;
    this.currentFact = this.babyFacts[Math.floor(Math.random() * this.babyFacts.length)];
  }

  private stopWaitingAnimation() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
  }

  // ─── Actions ──────────────────────────────────────────

  downloadImage() {
    const result = this.generatedResult();
    if (!result?.generatedImageBase64) return;

    const link = document.createElement('a');
    link.href = 'data:image/jpeg;base64,' + result.generatedImageBase64;
    link.download = `nestie-baby-preview-${result.id}.png`;
    link.click();
  }

  deletePreview(id: number) {
    this.apiService.deleteBabyPreview(id).subscribe({
      next: () => {
        this.snackBar.open('Preview deleted', 'OK', { duration: 2000 });
        if (this.generatedResult()?.id === id) this.generatedResult.set(null);
        this.loadHistory();
        this.loadRateLimit();
      },
      error: () => this.snackBar.open('Failed to delete', 'OK', { duration: 3000 })
    });
  }

  resetForm() {
    this.generatedResult.set(null);
    this.motherPreview.set(null);
    this.fatherPreview.set(null);
    this.motherBase64.set(null);
    this.fatherBase64.set(null);
  }

  // ─── Data Loading ─────────────────────────────────────

  private loadRateLimit() {
    const userId = this.authService.user()?.id;
    if (!userId) return;
    this.apiService.getBabyPreviewRateLimit(userId).subscribe({
      next: (info) => this.rateLimit.set(info),
    });
  }

  private loadHistory() {
    const userId = this.authService.user()?.id;
    if (!userId) return;
    this.apiService.getBabyPreviewsByUser(userId).subscribe({
      next: (list) => this.history.set(list),
    });
  }

  // ─── Formatters ───────────────────────────────────────

  formatGender(g: string): string {
    return { BOY: '👦 Boy', GIRL: '👧 Girl', NEUTRAL: '👶 Neutral' }[g] || g;
  }
  formatAge(a: string): string {
    return { NEWBORN: '🍼 Newborn', SIX_MONTHS: '🧸 6 Months', ONE_YEAR: '🎂 1 Year', THREE_YEARS: '🧒 3 Years' }[a] || a;
  }
  formatStyle(s: string): string {
    return { REALISTIC: '📷 Realistic', CARTOON: '🎨 Cartoon', THREE_D: '🧊 3D' }[s] || s;
  }
}
