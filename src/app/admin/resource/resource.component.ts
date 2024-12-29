import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaticDataService } from '../../core/services/static-data.service';
import { ResourceDefinition } from '../../core/models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resource',
  standalone: true,
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  imports: [CommonModule]
})
export class ResourceComponent implements OnInit {
  resources: ResourceDefinition[] = [];

  constructor(
    private staticDataService: StaticDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resources = this.staticDataService.getResources();
  }

  addResource(): void {
    this.router.navigate(['/admin/resources/add']);
  }

  editResource(resourceId: string): void {
    this.router.navigate(['/admin/resources/edit', resourceId]);
  }

  deleteResource(resourceId: string): void {
    this.staticDataService.deleteResource(resourceId);
    this.resources = this.staticDataService.getResources(); // Refresh list
  }
}
