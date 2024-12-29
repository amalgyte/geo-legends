import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { GameConfigComponent } from './game-config/game-config.component';
import { EraComponent } from './era/era.component';
import { ResourceComponent } from './resource/resource.component';
import { AdminRoutingModule } from './admin.routing.module';
// Add other components here

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    FormsModule,
    GameConfigComponent,
    EraComponent,
    ResourceComponent,
  ],
  exports: [],
})
export class AdminModule {}
