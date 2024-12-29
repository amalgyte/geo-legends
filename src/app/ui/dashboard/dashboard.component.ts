import { Component, OnInit } from '@angular/core';
import { GameStateService } from '../../state/game-state.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  resources: { [key: string]: number } = {};
  personnel: { [key: string]: number } = {}; // Track different personnel types
  ownedGridTiles: number = 0;
  playerName: string = '';

  constructor(private gameStateService: GameStateService) {}

  ngOnInit(): void {
    const playerState = this.gameStateService.getPlayerState();
    this.playerName = playerState.name
    this.resources = playerState.resources;
    this.ownedGridTiles = Object.keys(playerState.gridOwnership?.owned || {}).length;
    this.personnel = this.calculatePersonnel(playerState);
  }

  private calculatePersonnel(playerState: any): { [key: string]: number } {
    // Mocked logic to calculate personnel counts
    return {
      workers: 10,
      scouts: 5,
      soldiers: 2,
    };
  }
}
