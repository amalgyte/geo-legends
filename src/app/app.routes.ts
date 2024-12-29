import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameConfigComponent } from './admin/game-config/game-config.component';
import { ResourceComponent } from './admin/resource/resource.component';
import { GameComponent } from './ui/game/game.component';
import { EraComponent } from './admin/era/era.component';
import { AgeComponent } from './admin/age/age.component';
import { TechnologyComponent } from './admin/technology/technology.component';
import { BuildingComponent } from './admin/building/building.component';
import { UnitComponent } from './admin/unit/unit.component';
import { AuthGuard } from './core/services/auth.guard';
import { LoginComponent } from './ui/login/login.component';
import { AdminGuard } from './core/services/admin.guard';

export const routes: Routes = [
  { path: 'game', component: GameComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
