import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TasksService } from '../tasks.service';
import { Task, TASK_STATUS_LABELS, TASK_STATUS_COLORS, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    ProgressSpinnerModule,
    DividerModule,
    SkeletonModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
  providers: [MessageService, ConfirmationService]
})
export class TaskListComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(false);
  statusLabels = TASK_STATUS_LABELS;
  statusColors = TASK_STATUS_COLORS;
  taskStatuses: TaskStatus[] = ['InProgress', 'Revision', 'Completed', 'Paused', 'Incomplete'];

  constructor(
    private tasksService: TasksService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.tasksService.getAllTasks().subscribe({
      next: (response) => {
        if (response.statusCode === 200 && Array.isArray(response.intData.data)) {
          this.tasks.set(response.intData.data);
        } else {
          this.showError('Error al cargar las tareas');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.showError('Error al cargar las tareas');
        this.loading.set(false);
      }
    });
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter(task => task.status === status);
  }

  toggleTaskStatus(task: Task) {
    if (task.id) {
      const action = task.is_alive ? 'desactivar' : 'activar';
      this.confirmationService.confirm({
        message: `¿Estás seguro de que quieres ${action} esta tarea?`,
        header: 'Confirmar acción',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          if (task.id) {
            const operation = task.is_alive 
              ? this.tasksService.disableTask(task.id as string)
              : this.tasksService.enableTask(task.id as string);
            
            operation.subscribe({
              next: (response) => {
                if (response.statusCode === 200) {
                  task.is_alive = !task.is_alive;
                  this.showSuccess(`Tarea ${action}da correctamente`);
                } else {
                  this.showError(response.intData.message || `Error al ${action} la tarea`);
                }
              },
              error: (error) => {
                console.error(`Error ${action}ing task:`, error);
                this.showError(`Error al ${action} la tarea`);
              }
            });
          }
        }
      });
    }
  }

  confirmDelete(task: Task) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteTask(task);
      }
    });
  }

  deleteTask(task: Task) {
    if (task.id) {
      this.tasksService.deleteTask(task.id as string).subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            const currentTasks = this.tasks();
            this.tasks.set(currentTasks.filter(t => t.id !== task.id));
            this.showSuccess('Tarea eliminada correctamente');
          } else {
            this.showError(response.intData.message || 'Error al eliminar la tarea');
          }
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.showError('Error al eliminar la tarea');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  isOverdue(dateString: string): boolean {
    const deadlineDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  }

  private showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
}
