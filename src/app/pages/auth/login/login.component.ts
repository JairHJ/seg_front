import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen">
      <p-card 
        header="Iniciar Sesión" 
        [style]="{ width: '400px' }"
        styleClass="shadow-2">
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="username">Usuario o Email</label>
            <input 
              pInputText 
              id="username" 
              formControlName="username"
              class="w-full"
              [class.ng-invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
              placeholder="Ingresa tu usuario o email" />
            
            <ng-container *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
              <small class="p-error">Usuario es requerido</small>
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
            
            <ng-container *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <small class="p-error">Contraseña es requerida</small>
            </ng-container>
          </div>

          <div class="field">
            <label for="otp_code">Código de Autenticación (Google Authenticator)</label>
            <input 
              pInputText 
              id="otp_code" 
              formControlName="otp_code"
              class="w-full"
              [class.ng-invalid]="loginForm.get('otp_code')?.invalid && loginForm.get('otp_code')?.touched"
              placeholder="Ingresa el código de 6 dígitos"
              maxlength="6"
              pattern="[0-9]{6}" />
            
            <ng-container *ngIf="loginForm.get('otp_code')?.invalid && loginForm.get('otp_code')?.touched">
              <small class="p-error">Código OTP es requerido (6 dígitos)</small>
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
              label="Iniciar Sesión"
              [loading]="isLoading()"
              [disabled]="loginForm.invalid || isLoading()"
              styleClass="w-full" />
          </div>
        </form>

        <div class="text-center mt-3">
          <span class="text-600">¿No tienes cuenta? </span>
          <a routerLink="/auth/register" class="text-primary cursor-pointer">Regístrate aquí</a>
        </div>
      </p-card>
    </div>
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
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para estado reactivo
  isLoading = signal(false);
  errorMessage = signal('');

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    otp_code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: (result: any) => {
          if (result.success) {
            this.router.navigate(['/tasks']);
          } else {
            this.errorMessage.set(result.error || 'Error al iniciar sesión');
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
}
