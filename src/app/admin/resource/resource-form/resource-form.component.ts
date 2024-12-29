import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StaticDataService } from '../../../core/services/static-data.service';
import { ResourceDefinition } from '../../../core/models/interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceCategory } from '../../../core/enumerators/resource-category.enum';

@Component({
  selector: 'app-resource-form',
  standalone: true,
  templateUrl: './resource-form.component.html',
  styleUrls: ['./resource-form.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ResourceFormComponent implements OnInit {
  resource: ResourceDefinition = {
    id: '', // Leave blank for a new resource
    name: '',
    description: '',
    baseValue: 0,
    category: ResourceCategory.BASIC,
  };
  isEditMode: boolean = false;

  categories: string[] = [
    ResourceCategory.BASIC,
    ResourceCategory.LUXURY,
    ResourceCategory.STRATEGIC,
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private staticDataService: StaticDataService
  ) {}

  ngOnInit(): void {
    const resourceId = this.route.snapshot.paramMap.get('id');
    if (resourceId) {
      const existingResource =
        this.staticDataService.getResourceById(resourceId);
      if (existingResource) {
        this.resource = { ...existingResource }; // Load existing resource data
        this.isEditMode = true;
      } else {
        alert('Resource not found!');
        this.router.navigate(['/admin/resources']);
      }
    }
  }

  saveResource(): void {
    if (this.isEditMode) {
      this.staticDataService.updateResource(this.resource); // Update existing resource
    } else {
      this.resource.id = `resource_${Date.now()}`; // Generate a unique ID for a new resource
      this.staticDataService.addResource(this.resource); // Add new resource
    }
    this.router.navigate(['/admin/resources']); // Redirect to the resource list
  }
}
