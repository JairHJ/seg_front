import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskResponse, TaskCreateRequest } from '../../core/models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  // Base via API Gateway unificado. Se incluye /tasks para simplificar.
  private apiUrl = (environment.API_URL_GATEWAY + '/tasks').replace('http://', 'https://');
  private DEBUG_TASKS = false;

  private logBaseOnce() {
    if (!this.DEBUG_TASKS) return;
    try {
      if (typeof window !== 'undefined' && !(window as any).__TASKS_BASE_LOGGED) {
        console.log('[TasksService] Base URL:', this.apiUrl, 'env.production=', environment.production);
        (window as any).__TASKS_BASE_LOGGED = true;
      }
    } catch {}
  }

  constructor(private http: HttpClient) {
    this.logBaseOnce();
  }

  // Obtener todas las tareas (público, sin token)
  getAllTasks(): Observable<TaskResponse> {
    const url = `${this.apiUrl}`;
    if (this.DEBUG_TASKS) console.log('[TasksService] GET all ->', url);
    return this.http.get<TaskResponse>(url);
  }

  // Obtener tarea por ID (requiere token - interceptor lo maneja)
  getTaskById(id: string): Observable<TaskResponse> {
    const url = `${this.apiUrl}/${id}`;
    if (this.DEBUG_TASKS) console.log('[TasksService] GET by id ->', url);
    return this.http.get<TaskResponse>(url);
  }

  // Crear nueva tarea (requiere token - interceptor lo maneja)
  createTask(task: TaskCreateRequest): Observable<TaskResponse> {
    const url = `${this.apiUrl}/register_task`;
    if (this.DEBUG_TASKS) console.log('[TasksService] POST create ->', url, task);
    return this.http.post<TaskResponse>(url, task);
  }

  // Actualizar tarea (requiere token - interceptor lo maneja)
  updateTask(id: string, task: TaskCreateRequest): Observable<TaskResponse> {
    const url = `${this.apiUrl}/update_task/${id}`;
    if (this.DEBUG_TASKS) console.log('[TasksService] PUT update ->', url, task);
    return this.http.put<TaskResponse>(url, task);
  }

  // Eliminar tarea (requiere token - interceptor lo maneja)
  deleteTask(id: string): Observable<TaskResponse> {
    const url = `${this.apiUrl}/delete_task/${id}`;
    if (this.DEBUG_TASKS) console.log('[TasksService] DELETE ->', url);
    return this.http.delete<TaskResponse>(url);
  }

  // Deshabilitar tarea (requiere token - interceptor lo maneja)
  disableTask(id: string): Observable<TaskResponse> {
    const url = `${this.apiUrl}/disable_task/${id}`;
    if (this.DEBUG_TASKS) console.log('[TasksService] PUT disable ->', url);
    return this.http.put<TaskResponse>(url, {});
  }

  // Habilitar tarea (requiere token - interceptor lo maneja)
  enableTask(id: string): Observable<TaskResponse> {
    const url = `${this.apiUrl}/enable_task/${id}`;
    if (this.DEBUG_TASKS) console.log('[TasksService] PUT enable ->', url);
    return this.http.put<TaskResponse>(url, {});
  }
}
