// app/core/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isPublicRoute = ['/auth/login', '/auth/register'].includes(route.routeConfig?.path || '');
    if (this.authService.isLoggedIn() || isPublicRoute) {
      return true;
    } else {
      console.log('AuthGuard: Usuario no autenticado, redirigiendo a /auth/login');
      return this.router.createUrlTree(['/auth/login']);
    }
  }
}
