import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface UserListResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(page: number = 1, limit: number = 100, search?: string, roles?: string): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (roles) {
      params = params.set('roles', roles);
    }

    return this.http.get<UserListResponse>(this.apiUrl, { params, withCredentials: true });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData, { withCredentials: true });
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, userData, { withCredentials: true });
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
