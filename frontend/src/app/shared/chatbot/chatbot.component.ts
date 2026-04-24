import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AiService } from '../../core/services/ai.service';
import { ChatMessage } from '../../core/models/models';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <!-- Floating Trigger -->
    <button *ngIf="!isOpen" (click)="open()"
      class="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-mama-pink-dark to-mama-lavender-dark
             text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 animate-bounce-gentle">
      <mat-icon class="!text-3xl">smart_toy</mat-icon>
    </button>

    <!-- Chat Window -->
    <div *ngIf="isOpen"
      class="fixed bottom-6 right-6 w-96 h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-mama-pink/30">
      <!-- Header -->
      <div class="bg-gradient-to-r from-mama-pink-dark to-mama-lavender-dark p-4 flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <mat-icon class="text-white">smart_toy</mat-icon>
          </div>
          <div>
            <h4 class="text-white font-poppins font-semibold text-sm">Nestie AI</h4>
            <p class="text-white/70 text-xs">Your pregnancy assistant 🌸</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button mat-icon-button (click)="clearChat()" class="!w-8 !h-8" title="Clear chat">
            <mat-icon class="text-white/70 hover:text-white !text-lg">delete_sweep</mat-icon>
          </button>
          <button mat-icon-button (click)="isOpen = false"><mat-icon class="text-white">close</mat-icon></button>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3" #chatContainer>
        <div *ngFor="let msg of messages" [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
          <div [class]="msg.role === 'user'
            ? 'bg-gradient-to-br from-mama-pink to-mama-lavender text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]'
            : 'bg-mama-cream text-gray-700 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]'">
            <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>
        <div *ngIf="isLoading" class="flex justify-start">
          <div class="bg-mama-cream rounded-2xl rounded-bl-sm px-4 py-3">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-mama-pink rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-mama-lavender rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-mama-peach rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div *ngIf="messages.length <= 2" class="px-4 py-2 flex gap-2 overflow-x-auto">
        <button *ngFor="let q of quickQuestions" (click)="sendMessage(q)"
          class="whitespace-nowrap text-xs bg-mama-pink-light text-mama-rose px-3 py-1 rounded-full hover:bg-mama-pink transition-all">
          {{ q }}
        </button>
      </div>

      <!-- Connection status -->
      <div *ngIf="connectionError" class="px-4 py-1 bg-red-50 text-center">
        <span class="text-xs text-red-500">⚠️ AI service offline — make sure the AI server is running on port 8000</span>
      </div>

      <!-- Input -->
      <div class="p-3 border-t border-gray-100 flex items-center gap-2">
        <input [(ngModel)]="inputMessage" (keyup.enter)="sendMessage(inputMessage)"
          placeholder="Ask me anything... 💬"
          class="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-mama-pink/50 transition-all" />
        <button (click)="sendMessage(inputMessage)"
          class="w-10 h-10 rounded-full bg-gradient-to-br from-mama-pink-dark to-mama-lavender-dark text-white flex items-center justify-center hover:scale-105 transition-all"
          [disabled]="!inputMessage.trim() || isLoading">
          <mat-icon class="!text-xl">send</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes bounce-gentle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .animate-bounce-gentle { animation: bounce-gentle 2s infinite; }
  `]
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  connectionError = false;
  inputMessage = '';
  messages: ChatMessage[] = [
    { role: 'assistant', content: 'Hi there, mama! 🌸 I\'m your Nestie AI assistant. Ask me anything about your pregnancy journey!' }
  ];
  quickQuestions = ['Week tips', 'Nutrition advice', 'Safe exercises', 'Warning signs'];
  private shouldScroll = false;

  constructor(private aiService: AiService) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  open(): void {
    this.isOpen = true;
    this.shouldScroll = true;
  }

  clearChat(): void {
    this.messages = [
      { role: 'assistant', content: 'Chat cleared! 🌸 How can I help you?' }
    ];
    this.connectionError = false;
  }

  sendMessage(text: string): void {
    if (!text.trim() || this.isLoading) return;
    this.messages.push({ role: 'user', content: text.trim() });
    this.inputMessage = '';
    this.isLoading = true;
    this.connectionError = false;
    this.shouldScroll = true;

    // Build conversation context for the AI (last 6 messages)
    const context = this.messages.slice(-7, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    this.aiService.chat(text.trim(), undefined, context).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', content: res.response });
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        const isOffline = err.status === 0 || err.status === 504;
        this.connectionError = isOffline;
        this.messages.push({
          role: 'assistant',
          content: isOffline
            ? 'I can\'t reach the AI service right now. Please make sure the AI server is running! 🔌'
            : 'Sorry, I had trouble processing that. Please try again! 💕'
        });
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (_) {}
  }
}
