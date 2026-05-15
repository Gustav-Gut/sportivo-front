import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminEnrollmentDto {
  planId: string;
  isAdult: boolean;
  
  studentRut: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone?: string;

  tutorRut?: string;
  tutorFirstName?: string;
  tutorLastName?: string;
  tutorEmail?: string;
  tutorPhone?: string;
  relationType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  enrollStudent(data: AdminEnrollmentDto): Observable<{ link: string, subscriptionId: string }> {
    return this.http.post<{ link: string, subscriptionId: string }>(`${this.apiUrl}/enroll`, data);
  }
}
