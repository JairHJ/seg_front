import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Usuario, LoginResponse, RegisterResponse, AuthError } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/auth'; // Proxy Flask

  constructor(private http: HttpClient) {}

  register(userData: Usuario): Observable<{success: boolean, token?: string, user?: any, qr_code?: string, error?: string}> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      map(response => {
        // El registro ahora solo devuelve información del usuario y QR code
        if (response.proxied_response.user) {
          return {
            success: true,
            user: response.proxied_response.user,
            qr_code: response.proxied_response.qr_code // QR code para MFA
          };
        }
        return { success: false, error: 'Error en el registro' };
      }),
      catchError((error) => {
        const errorMsg = error.error?.proxied_response?.error || 'Error al registrar usuario';
        return of({ success: false, error: errorMsg });
      })
    );
  }

  login(credentials: Usuario): Observable<{success: boolean, token?: string, user?: any, error?: string}> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        if (response.proxied_response.access_token) {
          this.setToken(response.proxied_response.access_token);
          // Guardar información del usuario
          localStorage.setItem('currentUser', JSON.stringify(response.proxied_response.user));
          return {
            success: true,
            token: response.proxied_response.access_token,
            user: response.proxied_response.user
          };
        }
        // Si hay error explícito en la respuesta
        if (response.proxied_response.error) {
          return { success: false, error: response.proxied_response.error };
        }
        return { success: false, error: 'Error en el login' };
      }),
      catchError((error) => {
        // Mostrar siempre el mensaje real del backend si existe
        const errorMsg = error.error?.proxied_response?.error || error.error?.error || 'Error al iniciar sesión';
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
