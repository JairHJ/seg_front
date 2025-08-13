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
  
  // Debug rápido: imprimir base URL (puedes removerlo tras verificar en consola de prod)
  // Se ejecuta en la inicialización del servicio.
  public debugBase(): void {
    if (typeof window !== 'undefined' && (window as any).location) {
      // Solo log en entorno navegador
      // Evitar múltiples logs si el servicio se inyecta varias veces
      if (!(window as any).__AUTH_BASE_LOGGED) {
        // eslint-disable-next-line no-console
        console.log('[AuthService] Base URL:', this.apiUrl, 'env.production=', environment.production);
        (window as any).__AUTH_BASE_LOGGED = true;
      }
    }
  }

  // Llamar inmediatamente para registrar en consola
  private _ = this.debugBase();

  register(userData: Usuario): Observable<{success: boolean, token?: string, user?: any, qr_code?: string, error?: string, code?: string}> {
    // Normalizar antes de enviar
    const payload = {
      ...userData,
      username: (userData.username || '').trim(),
      email: (userData.email || '').trim().toLowerCase()
    };
  return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      map(raw => {
        debugger;
        // Debug: mostrar crudo (eliminar después)
        try { console.log('[AuthService] raw register response:', raw); } catch {}

        // Unificar formato si viene anidado (proxied_response) o directo
        const response = raw?.proxied_response ? raw.proxied_response : raw;

        // Si backend indica error explícito
        if (response && typeof response === 'object' && 'error' in response && !('access_token' in response || 'user' in response)) {
          return { success: false, error: response.error, code: response.code };
        }

        const user = response?.user;
        const accessToken = response?.access_token || response?.token || null;
        const qr = response?.qr_code || response?.qr || null;

        // Criterio relajado: si hay user ya consideramos éxito (token opcional)
        if (user) {
          if (accessToken) {
            try { this.setToken(accessToken); } catch {}
          }
            try { localStorage.setItem('currentUser', JSON.stringify(user)); } catch {}
          return { success: true, token: accessToken || undefined, user, qr_code: qr || undefined };
        }
        return { success: false, error: 'Respuesta sin user' };
      }),
      catchError((error) => {
        const errorMsg = error.error?.error || 'Error al registrar usuario';
        const code = error.error?.code;
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
