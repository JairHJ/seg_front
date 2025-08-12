import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TasksService } from '../tasks.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Task, TaskCreateRequest, TASK_STATUSES, TASK_STATUS_LABELS, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
  Textarea,
  SelectModule,
  DatePickerModule,
    CheckboxModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  template: `
    <div class="create-task-container">
      <p-card [header]="isEditMode() ? 'Editar Tarea' : 'Nueva Tarea'" styleClass="task-form-card">
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
          <div class="grid">
            <div class="col-12">
              <div class="field">
                <label for="name" class="required">Nombre de la Tarea</label>
                <input 
                  pInputText 
                  id="name" 
                  formControlName="name"
                  class="w-full"
                  [class.ng-invalid]="taskForm.get('name')?.invalid && taskForm.get('name')?.touched"
                  placeholder="Ingresa el nombre de la tarea" />
                
                <ng-container *ngIf="taskForm.get('name')?.invalid && taskForm.get('name')?.touched">
                  <small class="p-error">El nombre de la tarea es requerido</small>
                </ng-container>
              </div>
            </div>

            <div class="col-12">
              <div class="field">
                <label for="description" class="required">Descripción</label>
                <textarea 
                  pTextarea 
                  id="description" 
                  formControlName="description"
                  class="w-full"
                  [class.ng-invalid]="taskForm.get('description')?.invalid && taskForm.get('description')?.touched"
                  placeholder="Describe la tarea..."
                  [rows]="4">
                </textarea>
                
                <ng-container *ngIf="taskForm.get('description')?.invalid && taskForm.get('description')?.touched">
                  <small class="p-error">La descripción es requerida</small>
                </ng-container>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="created_at" class="required">Fecha de Creación</label>
                <p-datepicker 
                  formControlName="created_at"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  placeholder="Selecciona fecha"
                  styleClass="w-full">
                </p-datepicker>
                
                <ng-container *ngIf="taskForm.get('created_at')?.invalid && taskForm.get('created_at')?.touched">
                  <small class="p-error">La fecha de creación es requerida</small>
                </ng-container>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="dead_line" class="required">Fecha de Vencimiento</label>
                <p-datepicker 
                  formControlName="dead_line"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  placeholder="Selecciona fecha"
                  styleClass="w-full">
                </p-datepicker>
                
                <ng-container *ngIf="taskForm.get('dead_line')?.invalid && taskForm.get('dead_line')?.touched">
                  <small class="p-error">La fecha de vencimiento es requerida</small>
                </ng-container>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="status" class="required">Estado</label>
                <p-select 
                  formControlName="status"
                  [options]="statusOptions"
                  placeholder="Selecciona el estado"
                  styleClass="w-full">
                </p-select>
                
                <ng-container *ngIf="taskForm.get('status')?.invalid && taskForm.get('status')?.touched">
                  <small class="p-error">El estado es requerido</small>
                </ng-container>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label for="created_by" class="required">Creado por</label>
                <input 
                  pInputText 
                  id="created_by" 
                  formControlName="created_by"
                  class="w-full"
                  [readonly]="true"
                  [class.ng-invalid]="taskForm.get('created_by')?.invalid && taskForm.get('created_by')?.touched"
                  placeholder="Nombre del creador" />
                
                <ng-container *ngIf="taskForm.get('created_by')?.invalid && taskForm.get('created_by')?.touched">
                  <small class="p-error">El campo 'Creado por' es requerido</small>
                </ng-container>
              </div>
            </div>

            <div class="col-12">
              <div class="field-checkbox">
                <p-checkbox 
                  formControlName="is_alive"
                  binary="true"
                  inputId="is_alive">
                </p-checkbox>
                <label for="is_alive" class="ml-2">Tarea activa</label>
              </div>
            </div>
          </div>

          <div class="flex justify-content-between pt-3">
            <p-button 
              label="Cancelar" 
              icon="pi pi-times" 
              severity="secondary"
              [outlined]="true"
              (onClick)="onCancel()">
            </p-button>
            
            <p-button 
              type="submit"
              [label]="isEditMode() ? 'Actualizar' : 'Crear'"
              [icon]="isEditMode() ? 'pi pi-check' : 'pi pi-plus'"
              [loading]="isLoading()"
              [disabled]="taskForm.invalid || isLoading()">
            </p-button>
          </div>
        </form>
      </p-card>
    </div>

    <p-toast></p-toast>
  `,
  styles: [`
    .create-task-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .task-form-card {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
    
    .field {
      margin-bottom: 1.5rem;
    }
    
    .field-checkbox {
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
    }
    
    label.required::after {
      content: ' *';
      color: var(--red-500);
    }
    
    :host ::ng-deep {
      .p-calendar {
        width: 100%;
      }
      
      .p-dropdown {
        width: 100%;
      }
      
      .p-inputtextarea {
        width: 100%;
      }
    }
  `],
  providers: [MessageService]
})
export class TaskCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  isLoading = signal(false);
  isEditMode = signal(false);
  taskId = signal<string | null>(null);

  statusOptions = TASK_STATUSES.map(status => ({
    label: TASK_STATUS_LABELS[status],
    value: status
  }));

  taskForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    created_at: [new Date(), [Validators.required]],
    dead_line: [new Date(), [Validators.required]],
    status: ['InProgress', [Validators.required]],
    is_alive: [true],
    created_by: ['', [Validators.required]]
  });

  ngOnInit() {
    // Auto-completar el campo created_by con el usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.taskForm.patchValue({
        created_by: currentUser.username
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId.set(id);
      this.isEditMode.set(true);
      this.loadTask();
    }
  }

  loadTask() {
    const id = this.taskId();
    if (id) {
      this.isLoading.set(true);
      this.tasksService.getTaskById(id).subscribe({
        next: (response) => {
          if (response.statusCode === 200 && response.intData.data) {
            const task = response.intData.data as Task;
            this.taskForm.patchValue({
              name: task.name,
              description: task.description,
              created_at: new Date(task.created_at),
              dead_line: new Date(task.dead_line),
              status: task.status,
              is_alive: task.is_alive,
              created_by: task.created_by
            });
          } else {
            this.showError('Error al cargar la tarea');
            this.router.navigate(['/tasks']);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading task:', error);
          this.showError('Error al cargar la tarea');
          this.router.navigate(['/tasks']);
          this.isLoading.set(false);
        }
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isLoading.set(true);
      
      const formValue = this.taskForm.value;
      const taskData: TaskCreateRequest = {
        name: formValue.name,
        description: formValue.description,
        created_at: this.formatDate(formValue.created_at),
        dead_line: this.formatDate(formValue.dead_line),
        status: formValue.status,
        is_alive: formValue.is_alive,
        created_by: formValue.created_by
      };

      const operation = this.isEditMode() 
        ? this.tasksService.updateTask(this.taskId()!, taskData)
        : this.tasksService.createTask(taskData);

      operation.subscribe({
        next: (response) => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            this.showSuccess(
              this.isEditMode() 
                ? 'Tarea actualizada correctamente'
                : 'Tarea creada correctamente'
            );
            setTimeout(() => {
              this.router.navigate(['/tasks']);
            }, 1500);
          } else {
            this.showError(response.intData.message || 'Error al procesar la tarea');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error processing task:', error);
          this.showError('Error al procesar la tarea');
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/tasks']);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
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
