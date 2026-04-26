import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { MedicationReminder, UpcomingRemindersResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MedicationReminderService implements OnDestroy {
  private currentReminderSubject = new BehaviorSubject<MedicationReminder | null>(null);
  private upcomingRemindersSubject = new BehaviorSubject<UpcomingRemindersResponse | null>(null);
  private checkingSubscription?: Subscription;
  private isChecking = false;

  currentReminder$ = this.currentReminderSubject.asObservable();
  upcomingReminders$ = this.upcomingRemindersSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  startChecking(): void {
    if (this.isChecking) return;
    
    this.isChecking = true;
    
    // Check immediately
    this.checkReminders();
    
    // Then check every 30 seconds
    this.checkingSubscription = interval(30000)
      .pipe(
        switchMap(() => this.checkReminders()),
        catchError(err => {
          console.error('Reminder checking error:', err);
          return of(null);
        })
      )
      .subscribe();
  }

  stopChecking(): void {
    this.isChecking = false;
    if (this.checkingSubscription) {
      this.checkingSubscription.unsubscribe();
      this.checkingSubscription = undefined;
    }
  }

  private checkReminders(): Observable<UpcomingRemindersResponse | null> {
    const userId = this.authService.user()?.id;
    if (!userId) {
      return of(null);
    }

    return this.apiService.getUpcomingReminders(userId, 1).pipe(
      switchMap(response => {
        this.upcomingRemindersSubject.next(response);
        
        // Show notification if there are reminders due now and no current reminder is showing
        if (response.dueNow > 0 && !this.currentReminderSubject.value) {
          const dueReminder = response.reminders.find(r => 
            r.status === 'PENDING' && this.isReminderDueNow(r.scheduledTime)
          );
          
          if (dueReminder) {
            this.currentReminderSubject.next(dueReminder);
          }
        }
        
        return of(response);
      }),
      catchError(err => {
        console.error('Failed to check reminders:', err);
        return of(null);
      })
    );
  }

  private isReminderDueNow(scheduledTime: string): boolean {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    const diffMinutes = (now.getTime() - scheduled.getTime()) / (1000 * 60);
    
    // Consider "due now" if within 5 minutes of scheduled time (past or future)
    return Math.abs(diffMinutes) <= 5;
  }

  markAsTaken(reminderId: number, notes?: string): Observable<MedicationReminder> {
    return this.apiService.markReminderAsTaken(reminderId, notes).pipe(
      switchMap(result => {
        this.currentReminderSubject.next(null);
        this.checkReminders(); // Refresh reminders
        return of(result);
      })
    );
  }

  dismiss(reminderId: number): Observable<MedicationReminder> {
    return this.apiService.dismissReminder(reminderId).pipe(
      switchMap(result => {
        this.currentReminderSubject.next(null);
        this.checkReminders(); // Refresh reminders
        return of(result);
      })
    );
  }

  snooze(reminderId: number, minutes = 15): Observable<MedicationReminder> {
    return this.apiService.snoozeReminder(reminderId, minutes).pipe(
      switchMap(result => {
        this.currentReminderSubject.next(null);
        this.checkReminders(); // Refresh reminders
        return of(result);
      })
    );
  }

  clearCurrentReminder(): void {
    this.currentReminderSubject.next(null);
  }

  ngOnDestroy(): void {
    this.stopChecking();
  }
}