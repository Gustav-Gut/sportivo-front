import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay, tap } from 'rxjs';

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

  // Cache the school data for the entire session — avoids repeated GET /schools calls
  private school$ = this.http.get<School>(this.apiUrl).pipe(shareReplay(1));

  getSchool(): Observable<School> {
    return this.school$;
  }

  getPublicInfo(slug: string): Observable<{ name: string, logoUrl: string, defaultLanguage: string }> {
    return this.http.get<{ name: string, logoUrl: string, defaultLanguage: string }>(`${this.apiUrl}/public/${slug}`);
  }

  /** Call this after updating school data to bust the cache */
  invalidateCache() {
    this.school$ = this.http.get<School>(this.apiUrl).pipe(shareReplay(1));
  }

  updateSchool(data: Partial<Omit<School, 'id' | 'slug' | 'active' | 'createdAt' | 'logoUrl'>>): Observable<School> {
    return this.http.patch<School>(this.apiUrl, data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  uploadLogo(file: File): Observable<School> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<School>(`${this.apiUrl}/logo`, formData).pipe(
      tap(() => this.invalidateCache())
    );
  }
}
