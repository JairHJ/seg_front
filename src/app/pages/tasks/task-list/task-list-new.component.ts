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
  template: `
    <div class="task-board">
      <div class="board-header">
        <h1 class="text-3xl font-bold text-primary mb-3">Gestión de Tareas</h1>
        <p-button 
          label="Nueva Tarea" 
          icon="pi pi-plus" 
          routerLink="/tasks/create"
          styleClass="mb-4">
        </p-button>
      </div>

      <div class="board-columns" *ngIf="!loading(); else loadingTemplate">
        <div class="status-column" *ngFor="let status of taskStatuses">
          <div class="column-header">
            <h3 class="column-title">{{ statusLabels[status] }}</h3>
            <span class="task-count">{{ getTasksByStatus(status).length }}</span>
          </div>
          
          <div class="tasks-container">
            <div class="task-card" *ngFor="let task of getTasksByStatus(status)">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="card-header">
                    <p-tag 
                      [value]="statusLabels[task.status]"
                      [severity]="statusColors[task.status]"
                      styleClass="mb-2">
                    </p-tag>
                    <p-tag 
                      [value]="task.is_alive ? 'Activa' : 'Inactiva'"
                      [severity]="task.is_alive ? 'success' : 'danger'"
                      styleClass="mb-2 ml-2">
                    </p-tag>
                  </div>
                </ng-template>
                
                <div class="card-content">
                  <h4 class="task-title">{{ task.name }}</h4>
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-dates">
                    <div class="date-item">
                      <span class="date-label">Creado:</span>
                      <span class="date-value">{{ formatDate(task.created_at) }}</span>
                    </div>
                    <div class="date-item">
                      <span class="date-label">Vence:</span>
                      <span class="date-value" [class.overdue]="isOverdue(task.dead_line)">
                        {{ formatDate(task.dead_line) }}
                      </span>
                    </div>
                    <div class="date-item">
                      <span class="date-label">Creado por:</span>
                      <span class="date-value">{{ task.created_by }}</span>
                    </div>
                  </div>
                </div>
                
                <ng-template pTemplate="footer">
                  <div class="card-actions">
                    <p-button 
                      icon="pi pi-pencil" 
                      [text]="true"
                      severity="secondary" 
                      [routerLink]="['/tasks/edit', task.id]"
                      pTooltip="Editar">
                    </p-button>
                    
                    <p-button 
                      [icon]="task.is_alive ? 'pi pi-pause' : 'pi pi-play'" 
                      [text]="true"
                      [severity]="task.is_alive ? 'warning' : 'success'"
                      (onClick)="toggleTaskStatus(task)"
                      [pTooltip]="task.is_alive ? 'Desactivar' : 'Activar'">
                    </p-button>
                    
                    <p-button 
                      icon="pi pi-trash" 
                      [text]="true"
                      severity="danger" 
                      (onClick)="confirmDelete(task)"
                      pTooltip="Eliminar">
                    </p-button>
                  </div>
                </ng-template>
              </p-card>
            </div>
            
            <div class="empty-column" *ngIf="getTasksByStatus(status).length === 0">
              <i class="pi pi-inbox text-4xl text-300"></i>
              <p class="text-500">No hay tareas en {{ statusLabels[status].toLowerCase() }}</p>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="board-columns">
          <div class="status-column" *ngFor="let i of [1,2,3,4,5]">
            <p-skeleton width="100%" height="3rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="100%" height="10rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="100%" height="10rem" styleClass="mb-2"></p-skeleton>
          </div>
        </div>
      </ng-template>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
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
              ? this.tasksService.disableTask(task.id)
              : this.tasksService.enableTask(task.id);
            
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
      this.tasksService.deleteTask(task.id).subscribe({
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
