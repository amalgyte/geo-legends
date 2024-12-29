import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StaticDataService } from '../../../core/services/static-data.service';
import {
  UnitDefinition,
  EraDefinition,
  AgeDefinition,
  ResourceCost,
} from '../../../core/models/interfaces';
import { UnitType } from '../../../core/enumerators/unit-type.enum';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-unit-form',
  templateUrl: './unit-form.component.html',
  styleUrls: ['./unit-form.component.scss'],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class UnitFormComponent implements OnInit {
  unit: UnitDefinition = {
    id: '',
    name: '',
    description: '',
    age: null as any,
    cost: [],
    stats: {
      attack: 0,
      defense: 0,
      health: 0,
      speed: 0,
    },
    category: UnitType.CIVILIAN,
    upgrades: [],
  };
  isEditMode: boolean = false;

  knownEras: EraDefinition[] = [];
  resources: string[] = []; // List of available resources
  newCost: { resourceId: string; amount: number } = {
    resourceId: '',
    amount: 0,
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private staticDataService: StaticDataService
  ) {}

  ngOnInit(): void {
    this.knownEras = this.staticDataService.getEras(); // Fetch all known eras
    this.resources = this.staticDataService
      .getResources()
      .map((resource) => resource.id); // Fetch all resource IDs
    const unitId = this.route.snapshot.paramMap.get('id');
    if (unitId) {
      const existingUnit = this.staticDataService.getUnitById(unitId);
      if (existingUnit) {
        this.unit = { ...existingUnit };
        this.isEditMode = true;
      } else {
        alert('Unit not found!');
        this.router.navigate(['/admin/units']);
      }
    }
  }

  isResourceAdded(resourceId: string): boolean {
    return this.unit.cost.some((cost) => cost.resourceId === resourceId);
  }

  addCost(): void {
    const { resourceId, amount } = this.newCost;
    if (resourceId && amount > 0 && !this.isResourceAdded(resourceId)) {
      this.unit.cost.push({ resourceId, amount });
      this.newCost = { resourceId: '', amount: 0 }; // Reset the form
    }
  }

  removeCost(resourceId: string): void {
    this.unit.cost = this.unit.cost.filter(
      (cost) => cost.resourceId !== resourceId
    );
  }

  saveUnit(): void {
    if (this.isEditMode) {
      this.staticDataService.updateUnit(this.unit); // Update existing unit
    } else {
      this.unit.id = `unit_${Date.now()}`; // Generate a unique ID for a new unit
      this.staticDataService.addUnit(this.unit); // Add new unit
    }
    this.router.navigate(['/admin/units']); // Redirect to the unit list
  }
}
