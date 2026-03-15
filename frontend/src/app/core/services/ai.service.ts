import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly aiUrl = environment.aiServiceUrl;

  constructor(private http: HttpClient) {}

  chat(message: string, pregnancyWeek?: number, context?: { role: string; content: string }[]): Observable<{ response: string }> {
    return this.http.post<{ message: string; suggested_actions?: string[] }>(`${this.aiUrl}/api/ai/chat`, {
      message,
      pregnancy_week: pregnancyWeek,
      context
    }).pipe(map(res => ({ response: res.message })));
  }

  predictRisk(vitals: any): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/api/ai/risk/predict`, vitals);
  }

  analyzeSymptoms(symptom: any): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/api/ai/symptoms/analyze`, symptom);
  }

  getNutritionSuggestions(week: number, conditions: string[], country?: string): Observable<any> {
    const body: any = { pregnancy_week: week, dietary_restrictions: conditions };
    if (country) body.country = country;
    return this.http.post<any>(`${this.aiUrl}/api/ai/nutrition/suggest`, body);
  }

  compareGrowth(growthData: any): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/api/ai/growth/compare`, growthData);
  }
}
