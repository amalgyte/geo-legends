// ui/resources/resources.component.ts
import { Component, OnInit } from '@angular/core';
import { GameStateService } from '../../state/game-state.service';
import { CommonModule } from '@angular/common';
import { EdgeProgressSquareComponent } from "../edge-progress-square/edge-progress-square.component";

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  standalone: true, // Mark as standalone
  imports: [CommonModule, EdgeProgressSquareComponent], // Import CommonModule for pipes like 'keyvalue'
})
export class ResourcesComponent implements OnInit {
  resources: { [resourceId: string]: number } = {};

  constructor(private gameStateService: GameStateService) {}

  ngOnInit(): void {
    this.resources = this.gameStateService.getPlayerState().resources;
  }
}
