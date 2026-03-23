import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface School {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  active: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/schools`;

  getSchool(): Observable<School> {
    return this.http.get<School>(this.apiUrl);
  }

  updateSchool(data: Partial<Omit<School, 'id' | 'slug' | 'active' | 'createdAt' | 'logoUrl'>>): Observable<School> {
    return this.http.patch<School>(this.apiUrl, data);
  }

  uploadLogo(file: File): Observable<School> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<School>(`${this.apiUrl}/logo`, formData);
  }
}
