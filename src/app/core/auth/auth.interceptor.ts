// app/core/auth/auth.interceptor.ts
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: any = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService); // Inyecta AuthService
  const token = authService.getToken();

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 429) {
        // Mostrar un mensaje simple (alert) o podrías integrar un ToastService
        alert('Se superó el límite de peticiones permitidas. Intenta de nuevo más tarde.');
      }
      return throwError(() => err);
    })
  );
};
