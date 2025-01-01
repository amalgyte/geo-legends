import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StaticDataService } from '../../core/services/static-data.service';
import { BuildingDefinition } from '../../core/models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class BuildingComponent implements OnInit {
  buildings: BuildingDefinition[] = [];

  constructor(
    private staticDataService: StaticDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildings = this.staticDataService.get('globalBuildings');
  }

  addBuilding(): void {
    this.router.navigate(['/admin/buildings/add']);
  }

  editBuilding(buildingId: string): void {
    this.router.navigate(['/admin/buildings/edit', buildingId]);
  }

  deleteBuilding(buildingId: string): void {
    this.staticDataService.delete('globalBuildings',buildingId);
    this.buildings = this.staticDataService.get('globalBuildings'); // Refresh list
  }
}
