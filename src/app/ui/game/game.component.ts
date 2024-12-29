import { Component } from '@angular/core';
import { ResourceViewComponent } from '../resource-view/resource-view.component';
import { EconomyViewComponent } from '../economy-view/economy-view.component';
import { NavigationMenuComponent } from '../navigation-menu/navigation-menu.component';
import { MapViewComponent } from '../map-view/map-view.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  imports: [CommonModule,
    ResourceViewComponent,
    EconomyViewComponent,
    NavigationMenuComponent,
    MapViewComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {

  constructor(public authService: AuthService){}
}
