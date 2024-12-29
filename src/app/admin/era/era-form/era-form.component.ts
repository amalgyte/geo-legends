import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { StaticDataService } from "../../../core/services/static-data.service";
import { EraDefinition, AgeDefinition } from "../../../core/models/interfaces";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-era-form",
  templateUrl: "./era-form.component.html",
  styleUrls: ["./era-form.component.scss"],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class EraFormComponent implements OnInit {
  era: EraDefinition = {
    id: "",
    name: "",
    description: "",
    previousEraId: "",
    nextEraId: "",
    ages: [],
    unlockRequirements: [],
    technologies: [],
    buildings: [],
    units: [],
  };
  isEditMode: boolean = false;
  knownEras: EraDefinition[] = [];
  knownAges: AgeDefinition[] = [];
  newAge: AgeDefinition = this.createEmptyAge(); // Temporary new age for creation
  filteredEras: EraDefinition[] = []; // Filtered list excluding the current era
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private staticDataService: StaticDataService
  ) {}

  ngOnInit(): void {
    this.knownEras = this.staticDataService.getEras();
    const eraId = this.route.snapshot.paramMap.get("id");
    if (eraId) {
      const existingEra = this.staticDataService.getEraById(eraId);
      if (existingEra) {
        this.era = { ...existingEra };
        this.loadAvailableAges(eraId); // Fetch available ages
        this.isEditMode = true;
        this.filterEras(eraId); // Filter eras to exclude the current one
      } else {
        alert("Era not found!");
        this.router.navigate(["/admin/eras"]);
      }
    }
  }

  filterEras(currentEraId: string): void {
    this.filteredEras = this.knownEras.filter((era) => era.id !== currentEraId);
  }

  loadAvailableAges(eraId: string): void {
    const allAges = this.staticDataService.getAges(eraId); // Fetch all ages for this era
    this.knownAges = allAges.filter(
      (age) => !this.era.ages.some((eraAge) => eraAge.id === age.id)
    );
  }

  createEmptyAge(): AgeDefinition {
    return {
      id: null as any, // Temporary placeholder
      name: "",
      description: "",
      previousAgeId: "",
      nextAgeId: "",
      unlockRequirements: [],
      technologies: [],
      buildings: [],
      units: [],
      sequence: 999,
    };
  }

  addNewAge(): void {
    if (this.newAge.name.trim() !== "") {
      // Generate a unique ID by combining the Era ID and a sanitized version of the Age name
      const sanitizedAgeName = this.newAge.name
        .toLowerCase()
        .replace(/\s+/g, "_"); // Replace spaces with underscores
      this.newAge.id = `${this.era.id}_${sanitizedAgeName}` as any; // Assign the unique ID

      this.era.ages.push({ ...this.newAge }); // Add the new age to the era
      this.newAge = this.createEmptyAge(); // Reset the new age form
      this.loadAvailableAges(this.era.id); // Refresh dropdown
    }
  }

  addExistingAge(ageId: string): void {
    const selectedAge = this.knownAges.find((age) => age.id === ageId);
    if (selectedAge) {
      this.era.ages.push({ ...selectedAge }); // Add the selected age to the era
      this.loadAvailableAges(this.era.id); // Refresh dropdown
    }
  }

  removeAge(ageId: string): void {
    this.era.ages = this.era.ages.filter((age) => age.id !== ageId);
    this.loadAvailableAges(this.era.id); // Refresh dropdown
  }

  saveEra(): void {
    if (this.isEditMode) {
      this.staticDataService.updateEra(this.era); // Update existing era
    } else {
      this.era.id = `era_${Date.now()}`; // Generate a unique ID for a new era
      this.staticDataService.addEra(this.era); // Add new era
    }
    this.router.navigate(["/admin/eras"]); // Redirect to the era list
  }

  addExistingAgeFromEvent(event: Event): void {
    const target = event.target as HTMLSelectElement; // Cast event target
    const selectedValue = target.value;
    this.addExistingAge(selectedValue); // Pass the value to the existing method
  }
}
