import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Route, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  templateUrl: './navigation-menu.component.html',
  styleUrl: './navigation-menu.component.scss',
  imports: [CommonModule, RouterModule],
})
export class NavigationMenuComponent {
  activeTab: string = 'dashboard';
  constructor(public authService: AuthService) {}
}
