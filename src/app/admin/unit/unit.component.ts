import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { StaticDataService } from "../../core/services/static-data.service";
import { UnitDefinition } from "../../core/models/interfaces";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-unit",
  templateUrl: "./unit.component.html",
  styleUrls: ["./unit.component.scss"],
  imports: [CommonModule, RouterModule],
})
export class UnitComponent implements OnInit {
  units: UnitDefinition[] = [];

  constructor(
    private staticDataService: StaticDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.units = this.staticDataService.get("globalUnits");
  }

  addUnit(): void {
    this.router.navigate(["/admin/units/add"]);
  }

  editUnit(unitId: string): void {
    this.router.navigate(["/admin/units/edit", unitId]);
  }

  deleteUnit(unitId: string): void {
    this.staticDataService.delete("globalUnits", unitId);
    this.units = this.staticDataService.get("globalUnits"); // Refresh list
  }
}
