import { Routes } from '@angular/router';
import { LoginComponent } from './ui/login/login.component';
import { LandingComponent } from './ui/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];
