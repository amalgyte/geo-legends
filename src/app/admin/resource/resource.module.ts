import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResourceComponent } from './resource.component'; // Import standalone component

const routes: Routes = [
  { path: '', component: ResourceComponent }, // Use directly in routes
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // No CommonModule needed
})
export class ResourceModule {}
