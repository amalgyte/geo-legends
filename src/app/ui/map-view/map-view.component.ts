import { Component } from '@angular/core';
import { ResourcesComponent } from '../resources/resources.component';
import { MapComponent } from '../map/map.component';
import { NavigationMenuComponent } from "../navigation-menu/navigation-menu.component";
@Component({
  selector: 'app-map-view',
  imports: [MapComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent {
  public details = '';

  onCellEvent(event: {
    type: string;
    cellGUID: string;
    terrain?: any[];
    country?: string;
  }): void {
    // console.log('Event received:', event);
    if (event.terrain) {
      // console.log('Terrain data:', event.terrain);
      this.details = event.country || '';
    }
  }
}
