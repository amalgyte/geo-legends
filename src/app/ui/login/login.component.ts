import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  email = '';
  password = '';
  redirectTo: string = '/game';

  constructor(private authService: AuthService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      if (params['redirectTo']) {
        this.redirectTo = params['redirectTo'];
      }
    });
  }

  loginWithEmail() {
    this.authService
      .loginWithEmail(this.email, this.password)
      .catch((error) => {
        console.error('Login failed:', error);
      });
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle().catch((error) => {
      console.error('Google login failed:', error);
    });
  }
}
