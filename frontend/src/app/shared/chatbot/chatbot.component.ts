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
      class="chat-trigger">
      <mat-icon class="!text-3xl">smart_toy</mat-icon>
      <span class="chat-pulse"></span>
    </button>

    <!-- Chat Window -->
    <div *ngIf="isOpen" class="chat-window">
      <!-- Header -->
      <div class="chat-header">
        <div class="flex items-center">
          <div class="chat-avatar">
            <mat-icon class="text-white !text-lg">smart_toy</mat-icon>
          </div>
          <div>
            <h4 class="text-white font-outfit font-semibold text-sm">Nestie AI</h4>
            <p class="text-white/60 text-xs">Your pregnancy assistant 🌸</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button mat-icon-button (click)="clearChat()" class="!w-8 !h-8" title="Clear chat">
            <mat-icon class="text-white/60 hover:text-white !text-lg">delete_sweep</mat-icon>
          </button>
          <button mat-icon-button (click)="isOpen = false">
            <mat-icon class="text-white">close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="chat-messages" #chatContainer>
        <div *ngFor="let msg of messages" [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
          <div [class]="msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'">
            <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>
        <div *ngIf="isLoading" class="flex justify-start">
          <div class="chat-bubble-ai">
            <div class="flex space-x-1.5">
              <div class="typing-dot" style="animation-delay: 0ms"></div>
              <div class="typing-dot" style="animation-delay: 150ms"></div>
              <div class="typing-dot" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div *ngIf="messages.length <= 2" class="px-4 py-2 flex gap-2 overflow-x-auto">
        <button *ngFor="let q of quickQuestions" (click)="sendMessage(q)"
          class="quick-pill">
          {{ q }}
        </button>
      </div>

      <!-- Connection status -->
      <div *ngIf="connectionError" class="px-4 py-1.5 bg-red-50/80 text-center border-t border-red-100">
        <span class="text-xs text-red-500">⚠️ AI service offline — make sure the AI server is running on port 8000</span>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <input [(ngModel)]="inputMessage" (keyup.enter)="sendMessage(inputMessage)"
          placeholder="Ask me anything... 💬"
          class="chat-input" />
        <button (click)="sendMessage(inputMessage)"
          class="chat-send"
          [disabled]="!inputMessage.trim() || isLoading">
          <mat-icon class="!text-xl">send</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ─── TRIGGER ─── */
    .chat-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-lavender-dark));
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(212, 83, 126, 0.35);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 50;
    }
    .chat-trigger:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 12px 40px rgba(212, 83, 126, 0.5);
    }
    .chat-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid var(--mama-rose);
      opacity: 0;
      animation: chatPulse 2.5s ease-in-out infinite;
    }
    @keyframes chatPulse {
      0%, 100% { opacity: 0; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.15); }
    }

    /* ─── WINDOW ─── */
    .chat-window {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 380px;
      height: 520px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(232, 196, 216, 0.3);
      box-shadow: 0 20px 60px rgba(200, 141, 184, 0.2);
      display: flex;
      flex-direction: column;
      z-index: 50;
      overflow: hidden;
      animation: chatSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes chatSlideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ─── HEADER ─── */
    .chat-header {
      background: linear-gradient(135deg, var(--mama-rose-deep), var(--mama-purple));
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
    }
    .font-outfit { font-family: 'Outfit', sans-serif; }

    /* ─── MESSAGES ─── */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .chat-bubble-user {
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-purple));
      color: white;
      border-radius: 18px 18px 4px 18px;
      padding: 0.6rem 1rem;
      max-width: 80%;
    }
    .chat-bubble-ai {
      background: var(--mama-blush);
      color: #4a4a4a;
      border-radius: 18px 18px 18px 4px;
      padding: 0.6rem 1rem;
      max-width: 80%;
      border: 1px solid rgba(232, 196, 216, 0.15);
    }

    /* ─── TYPING DOTS ─── */
    .typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--mama-pink);
      animation: typingBounce 1.2s ease-in-out infinite;
    }
    .typing-dot:nth-child(2) { background: var(--mama-lavender); }
    .typing-dot:nth-child(3) { background: var(--mama-peach); }
    @keyframes typingBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    /* ─── QUICK PILLS ─── */
    .quick-pill {
      white-space: nowrap;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      border: 1px solid var(--mama-pink);
      background: var(--mama-blush);
      color: var(--mama-rose);
      cursor: pointer;
      transition: all 0.2s;
    }
    .quick-pill:hover {
      background: var(--mama-pink);
      color: var(--mama-berry);
    }

    /* ─── INPUT ─── */
    .chat-input-area {
      padding: 0.75rem;
      border-top: 1px solid rgba(232, 196, 216, 0.15);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .chat-input {
      flex: 1;
      background: var(--mama-blush);
      border: 1px solid rgba(232, 196, 216, 0.2);
      border-radius: 999px;
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
      font-family: 'Poppins', sans-serif;
      outline: none;
      transition: all 0.2s;
    }
    .chat-input:focus {
      border-color: var(--mama-pink-dark);
      box-shadow: 0 0 0 3px rgba(212, 83, 126, 0.1);
    }
    .chat-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--mama-rose), var(--mama-purple));
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .chat-send:hover {
      transform: scale(1.08);
      box-shadow: 0 4px 16px rgba(212, 83, 126, 0.3);
    }
    .chat-send:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }
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
