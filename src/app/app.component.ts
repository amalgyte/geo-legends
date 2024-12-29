import { Component } from '@angular/core';
import { HeaderComponent } from './ui/header/header.component';
import { MapViewComponent } from './ui/map-view/map-view.component';
import { ResourceViewComponent } from './ui/resource-view/resource-view.component';
import { EconomyViewComponent } from './ui/economy-view/economy-view.component';
import { NavigationMenuComponent } from './ui/navigation-menu/navigation-menu.component';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './ui/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public currentRouteName = '';
  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      if (this.router.url.includes('game')) {
        this.currentRouteName = 'Game';
      } else if (this.router.url.includes('admin')) {
        this.currentRouteName = 'Admin';
      } else {
        this.currentRouteName = '';
      }
    });
  }
}
