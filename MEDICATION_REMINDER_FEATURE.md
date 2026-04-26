# 💊 Medication Reminder & Alarm System

## Overview

A comprehensive **medication reminder and alarm system** that automatically generates reminders based on medication schedules, tracks adherence, and provides real-time notifications for pregnant patients.

## Features

### 1. **Automatic Reminder Generation** ⏰
- Generates reminders automatically when medications are created
- Supports multiple frequencies: Once daily, Twice daily, Three times daily, Weekly, As needed
- Creates reminders for the next 30 days
- Regenerates when medication schedule changes

### 2. **Smart Reminder Statuses** 📊
- **PENDING**: Scheduled but not yet due
- **DUE**: Reminder is due now (within 5 minutes)
- **TAKEN**: Medication was taken
- **MISSED**: Reminder was not taken (>1 hour overdue)
- **DISMISSED**: User dismissed without taking
- **SNOOZED**: User snoozed for later

### 3. **Reminder Actions** ✅
- **Mark as Taken**: Record when medication was taken (with optional notes)
- **Dismiss**: Skip this reminder
- **Snooze**: Postpone for 15 minutes (or custom duration)

### 4. **Scheduled Status Updates** 🔄
- Automatic status updates every minute
- Marks reminders as DUE when time arrives
- Marks reminders as MISSED if >1 hour overdue

### 5. **Comprehensive Tracking** 📈
- View upcoming reminders (next 24 hours)
- View today's reminders
- View reminder history per medication
- Track adherence patterns

## Database Schema

### `medication_reminders` Table
```sql
CREATE TABLE medication_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    medication_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    scheduled_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    taken_at DATETIME,
    dismissed_at DATETIME,
    notes VARCHAR(500),
    created_at DATETIME,
    FOREIGN KEY (medication_id) REFERENCES medications(id)
);
```

## API Endpoints

### Get Upcoming Reminders
```http
GET /api/pregnancy/medication-reminders/user/{userId}/upcoming?hoursAhead=24

Response:
{
  "totalUpcoming": 5,
  "dueNow": 1,
  "dueSoon": 2,
  "reminders": [
    {
      "id": 1,
      "medicationId": 10,
      "medicationName": "Prenatal Vitamin",
      "dosage": "1 tablet",
      "scheduledTime": "2026-04-26T09:00:00",
      "status": "DUE",
      "instructions": "Take with food",
      "createdAt": "2026-04-25T10:00:00"
    }
  ]
}
```

### Get Today's Reminders
```http
GET /api/pregnancy/medication-reminders/user/{userId}/today

Response: [
  {
    "id": 1,
    "medicationId": 10,
    "medicationName": "Prenatal Vitamin",
    "dosage": "1 tablet",
    "scheduledTime": "2026-04-26T09:00:00",
    "status": "PENDING",
    "instructions": "Take with food"
  }
]
```

### Mark Reminder as Taken
```http
POST /api/pregnancy/medication-reminders/{reminderId}/take
Content-Type: application/json

{
  "notes": "Taken with breakfast"
}

Response:
{
  "id": 1,
  "medicationId": 10,
  "medicationName": "Prenatal Vitamin",
  "status": "TAKEN",
  "takenAt": "2026-04-26T09:05:00",
  "notes": "Taken with breakfast"
}
```

### Dismiss Reminder
```http
POST /api/pregnancy/medication-reminders/{reminderId}/dismiss

Response:
{
  "id": 1,
  "status": "DISMISSED",
  "dismissedAt": "2026-04-26T09:05:00"
}
```

### Snooze Reminder
```http
POST /api/pregnancy/medication-reminders/{reminderId}/snooze
Content-Type: application/json

{
  "snoozeMinutes": 15
}

Response:
{
  "id": 2,
  "medicationId": 10,
  "medicationName": "Prenatal Vitamin",
  "scheduledTime": "2026-04-26T09:20:00",
  "status": "SNOOZED"
}
```

### Get Reminder History
```http
GET /api/pregnancy/medication-reminders/medication/{medicationId}/history

Response: [
  {
    "id": 1,
    "scheduledTime": "2026-04-26T09:00:00",
    "status": "TAKEN",
    "takenAt": "2026-04-26T09:05:00"
  },
  {
    "id": 2,
    "scheduledTime": "2026-04-25T09:00:00",
    "status": "MISSED"
  }
]
```

## How It Works

### 1. **Medication Creation**
```
User creates medication with:
- medicationName: "Prenatal Vitamin"
- dosage: "1 tablet"
- frequency: ONCE_DAILY
- reminderTime: 09:00
- startDate: 2026-04-26
- endDate: 2026-05-26

↓

System automatically generates 30 reminders:
- 2026-04-26 09:00 (PENDING)
- 2026-04-27 09:00 (PENDING)
- 2026-04-28 09:00 (PENDING)
... (30 days)
```

### 2. **Scheduled Status Updates** (Every Minute)
```
Current Time: 2026-04-26 09:00

Scheduled Task runs:
1. Find PENDING reminders where scheduledTime <= now
2. Update status to DUE
3. Find DUE reminders where scheduledTime < (now - 1 hour)
4. Update status to MISSED
```

### 3. **User Actions**
```
User sees DUE reminder → Takes action:

Option 1: Mark as Taken
- Status: DUE → TAKEN
- takenAt: current timestamp
- Optional notes saved

Option 2: Snooze
- Original reminder: DUE → DISMISSED
- New reminder created: SNOOZED (scheduled +15 min)

Option 3: Dismiss
- Status: DUE → DISMISSED
- dismissedAt: current timestamp
```

## Frequency Handling

### ONCE_DAILY
- 1 reminder per day at specified time
- Example: 09:00

### TWICE_DAILY
- 2 reminders per day, 12 hours apart
- Example: 09:00, 21:00

### THREE_TIMES_DAILY
- 3 reminders per day, 8 hours apart
- Example: 09:00, 17:00, 01:00

### WEEKLY
- 1 reminder per week on the same day
- Example: Every Monday at 09:00

### AS_NEEDED
- No automatic reminders generated
- User takes manually

## Frontend Integration Example

### Display Upcoming Reminders
```typescript
// Get upcoming reminders
this.apiService.getUpcomingReminders(userId, 24).subscribe({
  next: (response) => {
    this.dueNow = response.dueNow;
    this.dueSoon = response.dueSoon;
    this.reminders = response.reminders;
    
    // Show notification if reminders are due
    if (response.dueNow > 0) {
      this.showReminderNotification();
    }
  }
});
```

### Mark as Taken
```typescript
markAsTaken(reminderId: number, notes?: string) {
  this.apiService.markReminderAsTaken(reminderId, { notes }).subscribe({
    next: () => {
      this.snackBar.open('Medication marked as taken! ✅', 'Close', { duration: 3000 });
      this.refreshReminders();
    }
  });
}
```

### Snooze Reminder
```typescript
snoozeReminder(reminderId: number, minutes: number = 15) {
  this.apiService.snoozeReminder(reminderId, { snoozeMinutes: minutes }).subscribe({
    next: () => {
      this.snackBar.open(`Reminder snoozed for ${minutes} minutes ⏰`, 'Close', { duration: 3000 });
      this.refreshReminders();
    }
  });
}
```

## Notification Strategy

### Browser Notifications (Recommended)
```typescript
// Request permission
Notification.requestPermission();

// Show notification when reminder is due
if (Notification.permission === 'granted') {
  new Notification('Medication Reminder', {
    body: `Time to take ${medicationName} (${dosage})`,
    icon: '/assets/pill-icon.png',
    badge: '/assets/badge.png',
    tag: `reminder-${reminderId}`,
    requireInteraction: true,
    actions: [
      { action: 'take', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Snooze 15 min' }
    ]
  });
}
```

### In-App Notifications
- Badge on medication icon showing count of due reminders
- Toast/snackbar when reminder becomes due
- Dedicated reminders page/modal

### Push Notifications (Future)
- Mobile app push notifications
- SMS reminders
- Email reminders

## Adherence Tracking

### Calculate Adherence Rate
```typescript
calculateAdherence(history: ReminderHistory[]): number {
  const total = history.length;
  const taken = history.filter(r => r.status === 'TAKEN').length;
  return (taken / total) * 100;
}
```

### Adherence Insights
- Daily adherence rate
- Weekly adherence trends
- Missed medication patterns
- Best/worst times for adherence

## Configuration

### Scheduled Task Timing
```java
// In MedicationReminderService.java
@Scheduled(cron = "0 * * * * *") // Every minute
public void updateReminderStatuses() {
    // Update DUE and MISSED statuses
}
```

### Reminder Generation Window
```java
// Generate reminders for next 30 days
reminderService.generateRemindersForMedication(medication, 30);
```

### Missed Threshold
```java
// Mark as missed if >1 hour overdue
LocalDateTime missedThreshold = now.minusHours(1);
```

## Benefits

### For Patients 🤰
- Never miss a medication
- Easy tracking of adherence
- Flexible snooze options
- Visual adherence history

### For Healthcare Providers 👨‍⚕️
- Monitor patient adherence
- Identify non-compliance patterns
- Data-driven interventions
- Improved health outcomes

## Testing

### Create Medication with Reminder
```bash
curl -X POST "http://localhost:9090/api/pregnancy/medications/user/1" \
  -H "Content-Type: application/json" \
  -d '{
    "medicationName": "Prenatal Vitamin",
    "dosage": "1 tablet",
    "frequency": "ONCE_DAILY",
    "reminderTime": "09:00:00",
    "startDate": "2026-04-26",
    "endDate": "2026-05-26",
    "instructions": "Take with food"
  }'
```

### Check Upcoming Reminders
```bash
curl "http://localhost:9090/api/pregnancy/medication-reminders/user/1/upcoming?hoursAhead=24"
```

### Mark as Taken
```bash
curl -X POST "http://localhost:9090/api/pregnancy/medication-reminders/1/take" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Taken with breakfast"}'
```

## Files Created

1. **`MedicationReminder.java`** - Entity for reminder records
2. **`MedicationReminderRepository.java`** - Data access layer
3. **`MedicationReminderDTO.java`** - Request/Response DTOs
4. **`MedicationReminderService.java`** - Business logic & scheduled tasks
5. **`MedicationReminderController.java`** - REST API endpoints
6. **Updated `MedicationService.java`** - Auto-generate reminders
7. **Updated `PregnancyServiceApplication.java`** - Enable scheduling

## Next Steps

1. ✅ Rebuild pregnancy service
2. ✅ Restart service
3. 🎨 Update frontend to display reminders
4. 🔔 Implement browser notifications
5. 📱 Add mobile push notifications
6. 📊 Create adherence dashboard
7. 📧 Add email/SMS reminders

---

**Status**: ✅ **COMPLETE AND READY TO USE**

The medication reminder system is fully implemented with automatic reminder generation, scheduled status updates, and comprehensive tracking!
