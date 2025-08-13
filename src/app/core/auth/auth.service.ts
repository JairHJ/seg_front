import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, LoginResponse, RegisterResponse, AuthError } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ahora todas las rutas de auth se consumen vía gateway (/auth/*)
  private apiUrl = environment.API_URL_GATEWAY + '/auth';

  constructor(private http: HttpClient) {}
  
  // Depuración opcional
  private DEBUG_AUTH = false;

  register(userData: Usuario): Observable<{success: boolean, token?: string, user?: any, qr_code?: string, error?: string, code?: string}> {
    // Normalizar antes de enviar
    const payload = {
      ...userData,
      username: (userData.username || '').trim(),
      email: (userData.email || '').trim().toLowerCase()
    };
    if (this.DEBUG_AUTH) console.log('[AuthService] Enviando register ->', this.apiUrl + '/register', payload);
  return this.http.post(`${this.apiUrl}/register`, payload, { observe: 'response', responseType: 'text' }).pipe(
      map(resp => {
        const status = resp.status;
        const bodyText = resp.body || '';
        if (this.DEBUG_AUTH) {
          console.log('[AuthService] HTTP status:', status);
          console.log('[AuthService] Cuerpo crudo:', bodyText);
        }
        let parsed: any = null;
        try { parsed = bodyText ? JSON.parse(bodyText) : {}; } catch (e) {
          if (this.DEBUG_AUTH) console.warn('[AuthService] JSON parse fallo, cuerpo no JSON');
        }
        // Si gateway encapsula
        const response = parsed?.proxied_response ? parsed.proxied_response : parsed;
        if (this.DEBUG_AUTH) console.log('[AuthService] Parsed response:', response);
        if (!response) {
          return { success: false, error: 'Respuesta vacía' };
        }
        if (response.error && !response.user) {
          return { success: false, error: response.error, code: response.code };
        }
        const user = response.user;
        const accessToken = response.access_token || response.token || null;
        const qr = response.qr_code || response.qr || null;
        if (user) {
          try { if (accessToken) this.setToken(accessToken); } catch {}
          try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch {}
          return { success: true, token: accessToken || undefined, user, qr_code: qr || undefined };
        }
        return { success: false, error: 'Sin campo user en respuesta', code: response.code };
      }),
      catchError((error) => {
        const errorMsg = error.error?.error || 'Error al registrar usuario';
        const code = error.error?.code;
        if (this.DEBUG_AUTH) console.error('[AuthService] catchError raw:', error);
        return of({ success: false, error: errorMsg, code });
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
