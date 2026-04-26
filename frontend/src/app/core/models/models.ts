export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  avatarUrl: string;
  enabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface PregnancyProfile {
  id: number;
  userId: number;
  userName: string;
  lastMenstrualPeriod: string;
  expectedDueDate: string;
  currentWeek: number;
  currentTrimester: number;
  bloodType: string;
  prePregnancyWeight: number;
  currentWeight: number;
  height: number;
  medicalConditions: string;
  allergies: string;
  status: 'ACTIVE' | 'DELIVERED' | 'COMPLICATED' | 'INACTIVE';
  doctorId: number;
  doctorName: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  reason: string;
  notes: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  location: string;
  type: 'CHECKUP' | 'ULTRASOUND' | 'LAB_WORK' | 'EMERGENCY' | 'CONSULTATION';
  createdAt: string;
}

export interface Symptom {
  id: number;
  userId: number;
  symptomName: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  description: string;
  occurredAt: string;
  durationMinutes: number;
  pregnancyWeek: number;
  flaggedByAI: boolean;
  aiRecommendation: string;
  createdAt: string;
}

export interface NutritionPlan {
  id: number;
  userId: number;
  mealName: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'SUPPLEMENT';
  ingredients: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  folicAcidMcg: number;
  ironMg: number;
  calciumMg: number;
  scheduledDate: string;
  pregnancyWeek: number;
  aiGenerated: boolean;
  notes: string;
  createdAt: string;
}

export interface Medication {
  id: number;
  userId: number;
  medicationName: string;
  dosage: string;
  frequency: 'ONCE_DAILY' | 'TWICE_DAILY' | 'THREE_TIMES_DAILY' | 'WEEKLY' | 'AS_NEEDED';
  reminderTime: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  instructions: string;
  sideEffects: string;
  active: boolean;
  createdAt: string;
}

export interface BabyGrowth {
  id: number;
  pregnancyId: number;
  weekNumber: number;
  weightGrams: number;
  lengthCm: number;
  headCircumferenceCm: number;
  abdominalCircumferenceCm: number;
  femurLengthCm: number;
  heartRate: number;
  developmentNotes: string;
  recordedDate: string;
  aiComparison: string;
  growthPercentile: string;
  ultrasoundImageUrl: string;
  createdAt: string;
}

export type EducationMediaType = 'VIDEO' | 'GIF' | 'IMAGE';
export type EducationQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface EducationUserProgress {
  moduleId: number;
  moduleTitle: string;
  thumbnailUrl: string;
  patientId: number;
  completionPercentage: number;
  completed: boolean;
  quizScore: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  lastViewedAt: string | null;
  completedAt: string | null;
}

export interface EducationMediaItem {
  id?: number;
  type: EducationMediaType;
  url: string;
  caption: string;
  displayOrder: number;
}

export interface EducationModule {
  id: number;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  estimatedMinutes: number;
  published: boolean;
  quizCount: number;
  mediaItems: EducationMediaItem[];
  progress: EducationUserProgress | null;
  createdAt: string;
  updatedAt: string;
}

export interface EducationModulePayload {
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  estimatedMinutes: number;
  published: boolean;
  mediaItems: EducationMediaItem[];
}

export interface EducationQuizQuestion {
  id: number;
  moduleId: number;
  questionType: EducationQuestionType;
  questionText: string;
  answerOptions: string[];
  correctAnswer: string;
  explanation: string;
  displayOrder: number;
}

export interface EducationQuizPayload {
  questionType: EducationQuestionType;
  questionText: string;
  answerOptions: string[];
  correctAnswer: string;
  explanation: string;
  displayOrder: number;
}

export interface EducationQuizSubmission {
  answers: Record<number, string>;
}

export interface EducationQuizSubmissionResult {
  moduleId: number;
  patientId: number;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  correctQuestionIds: number[];
  progress: EducationUserProgress;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DoctorAdvice {
  id: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  category: 'NUTRITION' | 'SYMPTOMS' | 'MEDICATION' | 'BABY_GROWTH' | 'GENERAL';
  title: string;
  message: string;
  actionItems: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  readByPatient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface MedicationReminder {
  id: number;
  medicationId: number;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: 'PENDING' | 'TAKEN' | 'DISMISSED' | 'SNOOZED';
  takenAt: string | null;
  dismissedAt: string | null;
  notes: string | null;
  instructions: string;
  createdAt: string;
}

export interface UpcomingRemindersResponse {
  totalUpcoming: number;
  dueNow: number;
  dueSoon: number;
  reminders: MedicationReminder[];
}

export interface BabyNameSuggestion {
  name: string;
  meaning: string;
  origin: string;
  style: 'arabic' | 'other';
  why: string;
}

export interface BabyNameRequest {
  baby_gender: 'boy' | 'girl';
  mother_name: string;
  father_name: string;
  name_style: 'arabic' | 'other';
  pregnancy_week: number;
}

export interface BabyNameResponse {
  congratulations: string;
  gender: 'boy' | 'girl';
  suggestions: BabyNameSuggestion[];
}
