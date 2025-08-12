import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageService } from 'primeng/api';
import { Usuario } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    MessageModule,
    DialogModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen">
      <p-card header="Crear Cuenta" styleClass="shadow-2" [style]="{ width: '450px' }">
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="username">Nombre de Usuario</label>
            <input 
              pInputText 
              id="username" 
              formControlName="username"
              class="w-full"
              [class.ng-invalid]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
              placeholder="Ingresa tu nombre de usuario" />
            
            <ng-container *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
              <small class="p-error">Nombre de usuario es requerido</small>
            </ng-container>
          </div>

          <div class="field">
            <label for="email">Correo Electrónico</label>
            <input 
              pInputText 
              id="email" 
              formControlName="email"
              class="w-full"
              [class.ng-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              placeholder="Ingresa tu correo electrónico" />
            
            <ng-container *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <small class="p-error" *ngIf="registerForm.get('email')?.errors?.['required']">Email es requerido</small>
              <small class="p-error" *ngIf="registerForm.get('email')?.errors?.['email']">Email debe tener un formato válido</small>
            </ng-container>
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <p-password 
              formControlName="password"
              [toggleMask]="true"
              [feedback]="false"
              placeholder="Ingresa tu contraseña"
              styleClass="w-full"
              [inputStyle]="{ width: '100%' }" />
            
            <ng-container *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <small class="p-error" *ngIf="registerForm.get('password')?.errors?.['required']">Contraseña es requerida</small>
              <small class="p-error" *ngIf="registerForm.get('password')?.errors?.['minlength']">Contraseña debe tener al menos 6 caracteres</small>
            </ng-container>
          </div>

          <div class="field">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <p-password 
              formControlName="confirmPassword"
              [toggleMask]="true"
              [feedback]="false"
              placeholder="Confirma tu contraseña"
              styleClass="w-full"
              [inputStyle]="{ width: '100%' }" />
            
            <ng-container *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              <small class="p-error" *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Confirmación de contraseña es requerida</small>
            </ng-container>
            
            <ng-container *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched">
              <small class="p-error">Las contraseñas no coinciden</small>
            </ng-container>
          </div>

          <ng-container *ngIf="errorMessage()">
            <p-message 
              severity="error" 
              [text]="errorMessage()" 
              styleClass="w-full mb-3" />
          </ng-container>

          <div class="flex justify-content-between align-items-center">
            <p-button 
              type="submit" 
              label="Registrarse"
              [loading]="isLoading()"
              [disabled]="registerForm.invalid || isLoading()"
              styleClass="w-full" />
          </div>
        </form>

        <div class="text-center mt-3">
          <span class="text-600">¿Ya tienes cuenta? </span>
          <a routerLink="/auth/login" class="text-primary cursor-pointer">Inicia sesión aquí</a>
        </div>
      </p-card>
    </div>

    <!-- Dialog para mostrar código QR del MFA -->
    <p-dialog 
      [(visible)]="showQrDialog" 
      [modal]="true" 
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      header="Configurar Autenticación de Dos Factores"
      styleClass="qr-dialog">
      
      <div class="qr-content text-center">
        <h3 class="text-xl mb-3">¡Registro Exitoso!</h3>
        <p class="mb-4 text-600">
          Para completar tu configuración, escanea este código QR con Google Authenticator:
        </p>
        
        <div class="qr-container mb-4" *ngIf="qrCodeData()">
          <img [src]="qrCodeData()" alt="Código QR de autenticación" class="qr-image" />
        </div>
        
        <div class="instructions mb-4">
          <p class="text-sm text-500 mb-2">Instrucciones:</p>
          <ol class="text-left text-sm text-600">
            <li>Descarga Google Authenticator en tu móvil</li>
            <li>Escanea este código QR con la aplicación</li>
            <li>En futuros inicios de sesión necesitarás el código generado</li>
          </ol>
        </div>
        
        <p-button 
          label="Continuar" 
          (onClick)="closeQrDialog()"
          styleClass="w-full" />
      </div>
    </p-dialog>

    <p-toast></p-toast>
  `,
  styles: [`
    .field {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
    }
    
    .min-h-screen {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
    }

    :host ::ng-deep .qr-dialog {
      width: 90vw;
      max-width: 450px;
    }

    :host ::ng-deep .qr-dialog .p-dialog-header {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
      color: white;
      border-radius: 10px 10px 0 0;
    }

    :host ::ng-deep .qr-dialog .p-dialog-content {
      background: var(--surface-0);
      border-radius: 0 0 10px 10px;
      padding: 2rem;
    }

    .qr-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .qr-container {
      background: white;
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: inline-block;
    }

    .qr-image {
      display: block;
      max-width: 200px;
      height: auto;
    }

    .instructions {
      background: var(--surface-100);
      border-radius: 8px;
      padding: 1rem;
      border-left: 4px solid var(--primary-500);
    }

    .instructions ol {
      margin: 0;
      padding-left: 1.5rem;
    }

    .instructions li {
      margin-bottom: 0.5rem;
    }
  `],
  providers: [MessageService]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Signals para estado reactivo
  isLoading = signal(false);
  errorMessage = signal('');
  showQrDialog = signal(false);
  qrCodeData = signal<string | null>(null);

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { confirmPassword, ...userData } = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (result: any) => {
          if (result.success) {
            // Si hay código QR, mostrarlo en el diálogo
            if (result.qr_code) {
              this.qrCodeData.set(result.qr_code);
              this.showQrDialog.set(true);
            } else {
              // Registro sin MFA
              this.messageService.add({
                severity: 'success',
                summary: 'Registro exitoso',
                detail: 'Tu cuenta ha sido creada correctamente'
              });
              setTimeout(() => {
                this.router.navigate(['/tasks']);
              }, 1500);
            }
          } else {
            this.errorMessage.set(result.error || 'Error al registrar usuario');
          }
          this.isLoading.set(false);
        },
        error: (error: any) => {
          this.errorMessage.set('Error de conexión. Intenta nuevamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  closeQrDialog() {
    this.showQrDialog.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'MFA Configurado',
      detail: 'Autenticación de dos factores activada correctamente'
    });
    setTimeout(() => {
      this.router.navigate(['/tasks']);
    }, 1500);
  }
}
