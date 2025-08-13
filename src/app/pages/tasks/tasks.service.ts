import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task, TaskResponse, TaskCreateRequest } from '../../core/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:5000/task'; // Proxy Flask

  constructor(private http: HttpClient) {}

  // Obtener todas las tareas (público, sin token)
  getAllTasks(): Observable<TaskResponse> {
  return this.http.get<TaskResponse>(`${this.apiUrl}/tasks`);
  }

  // Obtener tarea por ID (requiere token - interceptor lo maneja)
  getTaskById(id: string): Observable<TaskResponse> {
  return this.http.get<TaskResponse>(`${this.apiUrl}/tasks/${id}`);
  }

  // Crear nueva tarea (requiere token - interceptor lo maneja)
  createTask(task: TaskCreateRequest): Observable<TaskResponse> {
  return this.http.post<TaskResponse>(`${this.apiUrl}/register_task`, task);
  }

  // Actualizar tarea (requiere token - interceptor lo maneja)
  updateTask(id: string, task: TaskCreateRequest): Observable<TaskResponse> {
  return this.http.put<TaskResponse>(`${this.apiUrl}/update_task/${id}`, task);
  }

  // Eliminar tarea (requiere token - interceptor lo maneja)
  deleteTask(id: string): Observable<TaskResponse> {
  return this.http.delete<TaskResponse>(`${this.apiUrl}/delete_task/${id}`);
  }

  // Deshabilitar tarea (requiere token - interceptor lo maneja)
  disableTask(id: string): Observable<TaskResponse> {
  return this.http.put<TaskResponse>(`${this.apiUrl}/disable_task/${id}`, {});
  }

  // Habilitar tarea (requiere token - interceptor lo maneja)
  enableTask(id: string): Observable<TaskResponse> {
  return this.http.put<TaskResponse>(`${this.apiUrl}/enable_task/${id}`, {});
  }
}
