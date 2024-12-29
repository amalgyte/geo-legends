import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.role$.pipe(
      take(1), // Only take the latest value
      map((role) => {
        console.log('AdminGuard role:', role);
        if (role === 'admin') {
          return true; // Allow access
        } else {
          this.router.navigate(['/login'], { queryParams: { redirectTo: '/admin' } });
          return false; // Redirect to login with a query parameter
        }
      })
    );
  }
}
