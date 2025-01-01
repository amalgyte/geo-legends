import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { StaticDataService } from "../../core/services/static-data.service";
import { TechnologyDefinition } from "../../core/models/interfaces";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-technology",
  standalone: true,
  templateUrl: "./technology.component.html",
  styleUrls: ["./technology.component.scss"],
  imports: [CommonModule, RouterModule],
})
export class TechnologyComponent implements OnInit {
  technologies: TechnologyDefinition[] = [];

  constructor(
    private staticDataService: StaticDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.technologies = this.staticDataService.get("globalTechnologies");
  }

  addTechnology(): void {
    this.router.navigate(["/admin/technologies/add"]);
  }

  editTechnology(technologyId: string): void {
    this.router.navigate(["/admin/technologies/edit", technologyId]);
  }

  deleteTechnology(technologyId: string): void {
    this.staticDataService.delete("globalTechnologies", technologyId);
    this.technologies = this.staticDataService.get("globalTechnologies"); // Refresh list
  }
}
