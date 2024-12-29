import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.role$.pipe(
      take(1), // Only take the first emitted value
      map((role) => {
        if (role) {
          if (route.url[0]?.path === 'admin' && role !== 'admin') {
            // Redirect to the game if trying to access admin without admin role
            this.router.navigate(['/game']);
            return false;
          }
          return true; // Allow access
        } else {
          // Redirect to login if unauthenticated
          this.router.navigate(['/login'], {
            queryParams: { redirectTo: state.url },
          });
          return false;
        }
      })
    );
  }
}
