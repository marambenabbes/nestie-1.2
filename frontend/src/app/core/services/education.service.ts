import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  EducationModule,
  EducationModulePayload,
  EducationQuizPayload,
  EducationQuizQuestion,
  EducationQuizSubmission,
  EducationQuizSubmissionResult,
  EducationUserProgress,
} from '../models/models';

export interface EducationMediaUploadResponse {
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class EducationService {
  private readonly api = `${environment.apiUrl}/education`;

  constructor(private http: HttpClient) {}

  getModules(): Observable<EducationModule[]> {
    return this.http.get<EducationModule[]>(`${this.api}/modules`);
  }

  getAdminModules(): Observable<EducationModule[]> {
    return this.http.get<EducationModule[]>(`${this.api}/modules/admin`);
  }

  getModule(moduleId: number): Observable<EducationModule> {
    return this.http.get<EducationModule>(`${this.api}/modules/${moduleId}`);
  }

  getAdminModule(moduleId: number): Observable<EducationModule> {
    return this.http.get<EducationModule>(`${this.api}/modules/admin/${moduleId}`);
  }

  createModule(payload: EducationModulePayload): Observable<EducationModule> {
    return this.http.post<EducationModule>(`${this.api}/modules`, payload);
  }

  updateModule(moduleId: number, payload: EducationModulePayload): Observable<EducationModule> {
    return this.http.put<EducationModule>(`${this.api}/modules/${moduleId}`, payload);
  }

  deleteModule(moduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/modules/${moduleId}`);
  }

  uploadMedia(file: File): Observable<EducationMediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EducationMediaUploadResponse>(`${this.api}/media/upload`, formData);
  }

  getQuizQuestions(moduleId: number): Observable<EducationQuizQuestion[]> {
    return this.http.get<EducationQuizQuestion[]>(`${this.api}/modules/${moduleId}/quizzes`);
  }

  createQuizQuestion(moduleId: number, payload: EducationQuizPayload): Observable<EducationQuizQuestion> {
    return this.http.post<EducationQuizQuestion>(`${this.api}/modules/${moduleId}/quizzes`, payload);
  }

  updateQuizQuestion(moduleId: number, questionId: number, payload: EducationQuizPayload): Observable<EducationQuizQuestion> {
    return this.http.put<EducationQuizQuestion>(`${this.api}/modules/${moduleId}/quizzes/${questionId}`, payload);
  }

  deleteQuizQuestion(moduleId: number, questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/modules/${moduleId}/quizzes/${questionId}`);
  }

  submitQuiz(moduleId: number, payload: EducationQuizSubmission): Observable<EducationQuizSubmissionResult> {
    return this.http.post<EducationQuizSubmissionResult>(`${this.api}/modules/${moduleId}/quizzes/submit`, payload);
  }

  getPatientProgress(patientId: number): Observable<EducationUserProgress[]> {
    return this.http.get<EducationUserProgress[]>(`${this.api}/progress/patients/${patientId}`);
  }

  markViewed(patientId: number, moduleId: number): Observable<EducationUserProgress> {
    return this.http.post<EducationUserProgress>(`${this.api}/progress/patients/${patientId}/modules/${moduleId}/viewed`, {});
  }

  markCompleted(patientId: number, moduleId: number): Observable<EducationUserProgress> {
    return this.http.post<EducationUserProgress>(`${this.api}/progress/patients/${patientId}/modules/${moduleId}/complete`, {});
  }
}