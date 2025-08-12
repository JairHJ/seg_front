import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task, TaskResponse, TaskCreateRequest, TaskProxyResponse } from '../../core/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:5000/task'; // Proxy Flask

  constructor(private http: HttpClient) {}

  // Obtener todas las tareas (público, sin token)
  getAllTasks(): Observable<TaskResponse> {
    return this.http.get<TaskProxyResponse>(`${this.apiUrl}/tasks`).pipe(
      map(response => response.proxied_response)
    );
  }

  // Obtener tarea por ID (requiere token - interceptor lo maneja)
  getTaskById(id: string): Observable<TaskResponse> {
    return this.http.get<TaskProxyResponse>(`${this.apiUrl}/tasks/${id}`).pipe(
      map(response => response.proxied_response)
    );
  }

  // Crear nueva tarea (requiere token - interceptor lo maneja)
  createTask(task: TaskCreateRequest): Observable<TaskResponse> {
    return this.http.post<TaskProxyResponse>(`${this.apiUrl}/register_task`, task).pipe(
      map(response => response.proxied_response)
    );
  }

  // Actualizar tarea (requiere token - interceptor lo maneja)
  updateTask(id: string, task: TaskCreateRequest): Observable<TaskResponse> {
    return this.http.put<TaskProxyResponse>(`${this.apiUrl}/update_task/${id}`, task).pipe(
      map(response => response.proxied_response)
    );
  }

  // Eliminar tarea (requiere token - interceptor lo maneja)
  deleteTask(id: string): Observable<TaskResponse> {
    return this.http.delete<TaskProxyResponse>(`${this.apiUrl}/delete_task/${id}`).pipe(
      map(response => response.proxied_response)
    );
  }

  // Deshabilitar tarea (requiere token - interceptor lo maneja)
  disableTask(id: string): Observable<TaskResponse> {
    return this.http.put<TaskProxyResponse>(`${this.apiUrl}/disable_task/${id}`, {}).pipe(
      map(response => response.proxied_response)
    );
  }

  // Habilitar tarea (requiere token - interceptor lo maneja)
  enableTask(id: string): Observable<TaskResponse> {
    return this.http.put<TaskProxyResponse>(`${this.apiUrl}/enable_task/${id}`, {}).pipe(
      map(response => response.proxied_response)
    );
  }
}
