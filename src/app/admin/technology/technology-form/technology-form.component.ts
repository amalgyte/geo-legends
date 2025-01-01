import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { StaticDataService } from "../../../core/services/static-data.service";
import {
  TechnologyDefinition,
  EraDefinition,
  AgeDefinition,
  ResourceCost,
} from "../../../core/models/interfaces";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-technology-form",
  templateUrl: "./technology-form.component.html",
  styleUrls: ["./technology-form.component.scss"],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class TechnologyFormComponent implements OnInit {
  technology: TechnologyDefinition = {
    id: "",
    name: "",
    description: "",
    age: null as any,
    cost: [],
    time: 0,
    unlocks: [],
    effects: [],
  };
  isEditMode: boolean = false;

  knownEras: EraDefinition[] = [];
  resources: string[] = []; // List of available resources
  newCost: { resourceId: string; amount: number } = {
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
    const technologyId = this.route.snapshot.paramMap.get("id");
    if (technologyId) {
      const existingTechnology =
        this.staticDataService.getTechnologyById(technologyId);
      if (existingTechnology) {
        this.technology = { ...existingTechnology };
        this.isEditMode = true;
      } else {
        alert("Technology not found!");
        this.router.navigate(["/admin/technologies"]);
      }
    }
  }

  isResourceAdded(resourceId: string): boolean {
    return this.technology.cost.some((cost) => cost.resourceId === resourceId);
  }

  addCost(): void {
    const { resourceId, amount } = this.newCost;
    if (resourceId && amount > 0 && !this.isResourceAdded(resourceId)) {
      this.technology.cost.push({ resourceId, amount });
      this.newCost = { resourceId: "", amount: 0 }; // Reset the form
    }
  }

  removeCost(resourceId: string): void {
    this.technology.cost = this.technology.cost.filter(
      (cost) => cost.resourceId !== resourceId
    );
  }

  saveTechnology(): void {
    if (this.isEditMode) {
      this.staticDataService.update("globalTechnologies", this.technology);
    } else {
      this.staticDataService.add("globalTechnologies", this.technology); // Add new technology
    }
    this.router.navigate(["/admin/technologies"]); // Redirect to the technology list
  }
}
