import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // NO agregar token para endpoints de autenticación
  if (req.url.includes('/api/auth/login') || 
      req.url.includes('/api/auth/register')) {
    return next(req);
  }

  // Para otras peticiones, agregar el token
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};








