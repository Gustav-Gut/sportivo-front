import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMonths: number | null;
  active: boolean;
  schoolId: string;
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  price: number;
  durationMonths?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/plans`;

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }

  createPlan(data: CreatePlanDto): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, data);
  }

  updatePlan(id: string, data: Partial<CreatePlanDto> & { active?: boolean }): Observable<Plan> {
    return this.http.patch<Plan>(`${this.apiUrl}/${id}`, data);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
