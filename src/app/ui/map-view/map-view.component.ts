import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../map/map.component';
import { GameStateService } from '../../state/game-state.service';

@Component({
  selector: 'app-map-view',
  imports: [CommonModule, MapComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent implements OnInit {
  public details = '';
  public country: string | undefined;
  public selectedCellId: string | null = null;
  public message = '';

  public camps: { id: string; type: string; owned: boolean }[] = [];

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {
    const grid = this.gameState.getPlayerState().gridOwnership;
    this.camps = [
      ...Object.values(grid.owned).map((loc) => ({ id: loc.id, type: loc.type, owned: true })),
      ...Object.entries(grid.knownOthers).map(([id, info]) => ({ id, type: (info as any).type || '', owned: false })),
    ];
  }

  onCellEvent(event: {
    type: string;
    cellGUID: string;
    terrain?: any[];
    country?: string;
  }): void {
    this.selectedCellId = event.cellGUID;
    this.country = event.country;
    if (event.terrain) {
      this.details = event.country || '';
    }
  }

  isOwned(cellId: string): boolean {
    return this.camps?.some((c) => c.id === cellId && c.owned) ?? false;
  }

  claimCell(): void {
    if (!this.selectedCellId) return;
    const success = (this.gameState as any).claimCell
      ? (this.gameState as any).claimCell(this.selectedCellId, 'outpost')
      : false;
    if (success) {
      this.message = 'Cell claimed!';
      // Reflect in local camps
      const exists = this.camps.find((c) => c.id === this.selectedCellId);
      if (exists) {
        exists.owned = true;
        if (!exists.type) exists.type = 'outpost';
      } else {
        this.camps.push({ id: this.selectedCellId, type: 'outpost', owned: true });
      }
    } else {
      this.message = 'Not enough resources to claim cell.';
    }
  }
}
