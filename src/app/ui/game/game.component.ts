import { Component } from '@angular/core';
import { ResourceViewComponent } from '../resource-view/resource-view.component';
import { EconomyViewComponent } from '../economy-view/economy-view.component';
import { NavigationMenuComponent } from '../navigation-menu/navigation-menu.component';
import { MapViewComponent } from '../map-view/map-view.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../state/game-state.service';

@Component({
  selector: 'app-game',
  imports: [
    CommonModule,
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
  constructor(public authService: AuthService, private gameState: GameStateService) {}

  get headerTitle(): string {
    const age = this.gameState.getPlayerState().currentAge as string;
    return age
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  get headerScore(): number {
    const resources = this.gameState.getPlayerState().resources;
    return Object.values(resources).reduce((sum, v) => sum + (v || 0), 0);
  }

  get headerLevel(): number {
    const buildings = this.gameState.getPlayerState().buildings;
    return buildings.length;
  }
}
