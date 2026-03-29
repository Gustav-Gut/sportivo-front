import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Facility {
  id: string;
  name: string;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    lessons: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FacilitiesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/facilities`;

  getFacilities(): Observable<Facility[]> {
    return this.http.get<Facility[]>(this.apiUrl, { withCredentials: true });
  }

  getFacility(id: string): Observable<Facility> {
    return this.http.get<Facility>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createFacility(data: { name: string }): Observable<Facility> {
    return this.http.post<Facility>(this.apiUrl, data, { withCredentials: true });
  }

  updateFacility(id: string, data: { name: string }): Observable<Facility> {
    return this.http.patch<Facility>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  deleteFacility(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
