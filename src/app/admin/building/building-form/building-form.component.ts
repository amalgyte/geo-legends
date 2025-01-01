import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { StaticDataService } from "../../../core/services/static-data.service";
import {
  BuildingDefinition,
  EraDefinition,
  AgeDefinition,
  ResourceCost,
} from "../../../core/models/interfaces";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BuildingType } from "../../../core/enumerators/building-type.enum";

@Component({
  selector: "app-building-form",
  templateUrl: "./building-form.component.html",
  styleUrls: ["./building-form.component.scss"],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class BuildingFormComponent implements OnInit {
  building: BuildingDefinition = {
    id: "",
    name: "",
    description: "",
    age: null as any,
    baseCost: [],
    production: [],
    upgrades: [],
    category: BuildingType.ECONOMIC,
    unlocks: [],
  };
  isEditMode: boolean = false;

  knownEras: EraDefinition[] = [];
  resources: string[] = []; // List of available resources
  newBaseCost: { resourceId: string; amount: number } = {
    resourceId: "",
    amount: 0,
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private staticDataService: StaticDataService
  ) {}

  ngOnInit(): void {
    this.knownEras = this.staticDataService.get("eras"); // Fetch all known eras
    this.resources = this.staticDataService
      .get("globalResources")
      .map((resource) => resource.name); // Fetch all resource IDs
    const buildingId = this.route.snapshot.paramMap.get("id");
    if (buildingId) {
      const existingBuilding =
        this.staticDataService.getBuildingById(buildingId);
      if (existingBuilding) {
        this.building = { ...existingBuilding };
        this.isEditMode = true;
      } else {
        alert("Building not found!");
        this.router.navigate(["/admin/buildings"]);
      }
    }
  }

  addBaseCost(): void {
    const { resourceId, amount } = this.newBaseCost;
    if (
      resourceId &&
      amount > 0 &&
      !this.building.baseCost.some((cost) => cost.resourceId === resourceId)
    ) {
      this.building.baseCost.push({ resourceId, amount });
      this.newBaseCost = { resourceId: "", amount: 0 }; // Reset the form
    }
  }

  removeBaseCost(resourceId: string): void {
    this.building.baseCost = this.building.baseCost.filter(
      (cost) => cost.resourceId !== resourceId
    );
  }

  saveBuilding(): void {
    if (this.isEditMode) {
      this.staticDataService.update("globalBuildings", this.building); // Update existing building
    } else {
      this.staticDataService.add("globalBuildings", this.building); // Add new building
    }
    this.router.navigate(["/admin/buildings"]); // Redirect to the building list
  }

  isResourceAdded(resourceId: string): boolean {
    return this.building.baseCost.some(
      (cost) => cost.resourceId === resourceId
    );
  }
}
