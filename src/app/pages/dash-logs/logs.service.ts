import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogsService {
  private apiUrl = 'http://localhost:5000/logs/summary'; // Cambia si tu backend está en otra URL

  constructor(private http: HttpClient) {}

  getLogsSummary(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAllLogs(): Observable<any[]> {
    // Nuevo endpoint para obtener todos los logs (debe existir en backend)
    return this.http.get<any[]>('http://localhost:5000/logs/all');
  }
}
