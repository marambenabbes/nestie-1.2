import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicationReminderService } from './core/services/medication-reminder.service';
import { AuthService } from './core/services/auth.service';
import { MedicationReminderNotificationComponent } from './shared/components/medication-reminder-notification/medication-reminder-notification.component';
import { MedicationReminder } from './core/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    MatSnackBarModule,
    MedicationReminderNotificationComponent
  ],
  template: `
    <router-outlet></router-outlet>
    
    <!-- Global Medication Reminder Notification -->
    <app-medication-reminder-notification
      [reminder]="currentReminder"
      (taken)="onReminderTaken($event)"
      (dismissed)="onReminderDismissed($event)"
      (snoozed)="onReminderSnoozed($event)">
    </app-medication-reminder-notification>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Nestie AI';
  currentReminder: MedicationReminder | null = null;
  private reminderSubscription?: Subscription;

  constructor(
    private reminderService: MedicationReminderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    // React to authentication state changes using effect
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.reminderService.startChecking();
      } else {
        this.reminderService.stopChecking();
        this.currentReminder = null;
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to current reminder changes
    this.reminderSubscription = this.reminderService.currentReminder$.subscribe(
      reminder => this.currentReminder = reminder
    );
  }

  ngOnDestroy(): void {
    if (this.reminderSubscription) {
      this.reminderSubscription.unsubscribe();
    }
    this.reminderService.stopChecking();
  }

  onReminderTaken(event: { reminderId: number; notes?: string }): void {
    this.reminderService.markAsTaken(event.reminderId, event.notes).subscribe({
      next: () => {
        this.snackBar.open('Medication marked as taken! 💊✅', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to mark medication as taken', 'Close', { duration: 3000 });
        console.error('Failed to mark reminder as taken:', err);
      }
    });
  }

  onReminderDismissed(reminderId: number): void {
    this.reminderService.dismiss(reminderId).subscribe({
      next: () => {
        this.snackBar.open('Reminder dismissed', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to dismiss reminder', 'Close', { duration: 3000 });
        console.error('Failed to dismiss reminder:', err);
      }
    });
  }

  onReminderSnoozed(reminderId: number): void {
    this.reminderService.snooze(reminderId, 15).subscribe({
      next: () => {
        this.snackBar.open('Reminder snoozed for 15 minutes ⏰', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to snooze reminder', 'Close', { duration: 3000 });
        console.error('Failed to snooze reminder:', err);
      }
    });
  }
}
