import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, LoginResponse, RegisterResponse, AuthError } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.API_URL_AUTH;

  constructor(private http: HttpClient) {}

  register(userData: Usuario): Observable<{success: boolean, token?: string, user?: any, qr_code?: string, error?: string}> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      map(response => {
        if (response.error) {
            return { success: false, error: response.error };
        }
        if (response.access_token && response.user) {
          // Guardar token opcionalmente tras registro
          this.setToken(response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          return {
            success: true,
            token: response.access_token,
            user: response.user,
            qr_code: response.qr_code
          };
        }
        return { success: false, error: 'Respuesta de backend inválida' };
      }),
      catchError((error) => {
        const errorMsg = error.error?.error || 'Error al registrar usuario';
        return of({ success: false, error: errorMsg });
      })
    );
  }

  login(credentials: Usuario): Observable<{success: boolean, token?: string, user?: any, error?: string}> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        if (response.error) {
          return { success: false, error: response.error };
        }
        if (response.access_token && response.user) {
          this.setToken(response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          return { success: true, token: response.access_token, user: response.user };
        }
        return { success: false, error: 'Respuesta de backend inválida' };
      }),
      catchError((error) => {
        const errorMsg = error.error?.error || 'Error al iniciar sesión';
        return of({ success: false, error: errorMsg });
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
