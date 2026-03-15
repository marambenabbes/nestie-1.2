import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  User, PregnancyProfile, Appointment, Symptom,
  NutritionPlan, Medication, BabyGrowth, DoctorAdvice, PageResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Users
  getUsers(page = 0, size = 20): Observable<PageResponse<User>> {
    return this.http.get<PageResponse<User>>(`${this.api}/users`, { params: { page, size } });
  }
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${id}`);
  }
  getDoctors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users/doctors`);
  }
  getPatientsByDoctor(doctorId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users/doctors/${doctorId}/patients`);
  }
  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.api}/users/${id}`, data);
  }
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${id}`);
  }

  // Pregnancy Profiles
  createPregnancyProfile(userId: number, data: any): Observable<PregnancyProfile> {
    return this.http.post<PregnancyProfile>(`${this.api}/pregnancy-profiles/user/${userId}`, data);
  }
  getPregnancyProfiles(userId: number, page = 0, size = 10): Observable<PageResponse<PregnancyProfile>> {
    return this.http.get<PageResponse<PregnancyProfile>>(`${this.api}/pregnancy-profiles/user/${userId}`, { params: { page, size } });
  }
  getPregnancyProfile(id: number): Observable<PregnancyProfile> {
    return this.http.get<PregnancyProfile>(`${this.api}/pregnancy-profiles/${id}`);
  }
  updatePregnancyProfile(id: number, data: any): Observable<PregnancyProfile> {
    return this.http.put<PregnancyProfile>(`${this.api}/pregnancy-profiles/${id}`, data);
  }
  deletePregnancyProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/pregnancy-profiles/${id}`);
  }

  // Appointments
  createAppointment(patientId: number, data: any): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.api}/appointments/patient/${patientId}`, data);
  }
  getPatientAppointments(patientId: number, page = 0, size = 10): Observable<PageResponse<Appointment>> {
    return this.http.get<PageResponse<Appointment>>(`${this.api}/appointments/patient/${patientId}`, { params: { page, size } });
  }
  getDoctorAppointments(doctorId: number, page = 0, size = 10): Observable<PageResponse<Appointment>> {
    return this.http.get<PageResponse<Appointment>>(`${this.api}/appointments/doctor/${doctorId}`, { params: { page, size } });
  }
  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.api}/appointments/${id}/status`, null, { params: { status } });
  }
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/appointments/${id}`);
  }

  // Symptoms
  createSymptom(userId: number, data: any): Observable<Symptom> {
    return this.http.post<Symptom>(`${this.api}/symptoms/user/${userId}`, data);
  }
  getSymptoms(userId: number, page = 0, size = 20): Observable<PageResponse<Symptom>> {
    return this.http.get<PageResponse<Symptom>>(`${this.api}/symptoms/user/${userId}`, { params: { page, size } });
  }
  updateSymptom(id: number, data: any): Observable<Symptom> {
    return this.http.put<Symptom>(`${this.api}/symptoms/${id}`, data);
  }
  deleteSymptom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/symptoms/${id}`);
  }

  // Nutrition
  createNutritionPlan(userId: number, data: any): Observable<NutritionPlan> {
    return this.http.post<NutritionPlan>(`${this.api}/nutrition/user/${userId}`, data);
  }
  getNutritionPlans(userId: number, page = 0, size = 10): Observable<PageResponse<NutritionPlan>> {
    return this.http.get<PageResponse<NutritionPlan>>(`${this.api}/nutrition/user/${userId}`, { params: { page, size } });
  }
  updateNutritionPlan(id: number, data: any): Observable<NutritionPlan> {
    return this.http.put<NutritionPlan>(`${this.api}/nutrition/${id}`, data);
  }
  deleteNutritionPlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/nutrition/${id}`);
  }

  // Medications
  createMedication(userId: number, data: any): Observable<Medication> {
    return this.http.post<Medication>(`${this.api}/medications/user/${userId}`, data);
  }
  getMedications(userId: number, page = 0, size = 10): Observable<PageResponse<Medication>> {
    return this.http.get<PageResponse<Medication>>(`${this.api}/medications/user/${userId}`, { params: { page, size } });
  }
  getActiveMedications(userId: number): Observable<Medication[]> {
    return this.http.get<Medication[]>(`${this.api}/medications/user/${userId}/active`);
  }
  updateMedication(id: number, data: any): Observable<Medication> {
    return this.http.put<Medication>(`${this.api}/medications/${id}`, data);
  }
  deactivateMedication(id: number): Observable<Medication> {
    return this.http.patch<Medication>(`${this.api}/medications/${id}/deactivate`, {});
  }
  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/medications/${id}`);
  }

  // Baby Growth
  createGrowthRecord(data: any): Observable<BabyGrowth> {
    return this.http.post<BabyGrowth>(`${this.api}/baby-growth`, data);
  }
  getGrowthRecords(pregnancyId: number): Observable<BabyGrowth[]> {
    return this.http.get<BabyGrowth[]>(`${this.api}/baby-growth/pregnancy/${pregnancyId}`);
  }
  updateGrowthRecord(id: number, data: any): Observable<BabyGrowth> {
    return this.http.put<BabyGrowth>(`${this.api}/baby-growth/${id}`, data);
  }
  deleteGrowthRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/baby-growth/${id}`);
  }

  // Doctor Advice
  createDoctorAdvice(doctorId: number, data: any): Observable<DoctorAdvice> {
    return this.http.post<DoctorAdvice>(`${this.api}/doctor-advice/doctor/${doctorId}`, data);
  }
  getDoctorAdviceForPatient(patientId: number, page = 0, size = 20): Observable<PageResponse<DoctorAdvice>> {
    return this.http.get<PageResponse<DoctorAdvice>>(`${this.api}/doctor-advice/patient/${patientId}`, { params: { page, size } });
  }
  getDoctorAdviceByDoctor(doctorId: number, page = 0, size = 20): Observable<PageResponse<DoctorAdvice>> {
    return this.http.get<PageResponse<DoctorAdvice>>(`${this.api}/doctor-advice/doctor/${doctorId}`, { params: { page, size } });
  }
  getDoctorAdviceForDoctorPatient(doctorId: number, patientId: number, page = 0, size = 20): Observable<PageResponse<DoctorAdvice>> {
    return this.http.get<PageResponse<DoctorAdvice>>(`${this.api}/doctor-advice/doctor/${doctorId}/patient/${patientId}`, { params: { page, size } });
  }
  markAdviceAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/doctor-advice/${id}/read`, {});
  }
  getUnreadAdviceCount(patientId: number): Observable<{unreadCount: number}> {
    return this.http.get<{unreadCount: number}>(`${this.api}/doctor-advice/patient/${patientId}/unread-count`);
  }
  deleteDoctorAdvice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/doctor-advice/${id}`);
  }

  // ─── Baby Preview ─────────────────────────────────────
  generateBabyPreview(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/baby-preview/generate`, data);
  }
  getBabyPreviewStatus(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/baby-preview/status/${id}`);
  }
  getBabyPreviewsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/baby-preview/user/${userId}`);
  }
  getBabyPreviewRateLimit(userId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/baby-preview/rate-limit/${userId}`);
  }
  deleteBabyPreview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/baby-preview/${id}`);
  }
}
