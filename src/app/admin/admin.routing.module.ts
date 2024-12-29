import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameConfigComponent } from './game-config/game-config.component';
import { ResourceComponent } from './resource/resource.component';

import { EraComponent } from './era/era.component';
import { AgeComponent } from './age/age.component';
import { TechnologyComponent } from './technology/technology.component';
import { BuildingComponent } from './building/building.component';
import { UnitComponent } from './unit/unit.component';
import { CommonModule } from '@angular/common';
import { EraFormComponent } from './era/era-form/era-form.component';
import { ResourceFormComponent } from './resource/resource-form/resource-form.component';
import { TechnologyFormComponent } from './technology/technology-form/technology-form.component';
import { BuildingFormComponent } from './building/building-form/building-form.component';
import { UnitFormComponent } from './unit/unit-form/unit-form.component';

const routes: Routes = [
  {
    path: '',
    component: GameConfigComponent,
    children: [
      { path: 'resources', component: ResourceComponent },
      { path: 'resources/add', component: ResourceFormComponent }, // Add form
      { path: 'resources/edit/:id', component: ResourceFormComponent }, // Edit form

      { path: 'eras', component: EraComponent },
      { path: 'eras/add', component: EraFormComponent }, // Add form
      { path: 'eras/edit/:id', component: EraFormComponent }, // Edit form

      { path: 'ages', component: AgeComponent },
    //   { path: 'ages/add', component: AgesFormComponent }, // Add form
    //   { path: 'ages/edit/:id', component: AgesFormComponent }, // Edit form

      { path: 'technologies', component: TechnologyComponent },
      { path: 'technologies/add', component: TechnologyFormComponent }, // Add form
      { path: 'technologies/edit/:id', component: TechnologyFormComponent }, // Edit form

      { path: 'buildings', component: BuildingComponent },
      { path: 'buildings/add', component: BuildingFormComponent }, // Add form
      { path: 'buildings/edit/:id', component: BuildingFormComponent }, // Edit form

      { path: 'units', component: UnitComponent },
      { path: 'units/add', component: UnitFormComponent }, // Add form
      { path: 'units/edit/:id', component: UnitFormComponent }, // Edit form
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
