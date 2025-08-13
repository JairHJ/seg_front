import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LogsService {
  // Base del gateway (Render). No usar localhost en producción.
  private baseUrl = environment.API_URL_GATEWAY; // Ej: https://api-gateway-xxxx.onrender.com

  constructor(private http: HttpClient) {}

  getLogsSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/logs/summary`);
  }

  getAllLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/logs/all`);
  }
}
