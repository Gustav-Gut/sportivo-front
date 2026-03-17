import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SportsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sports`;

  getSportsSchema(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/schema`);
  }

  updateSportConfig(schoolSportId: string, customFields: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/config/${schoolSportId}`, customFields);
  }
}
