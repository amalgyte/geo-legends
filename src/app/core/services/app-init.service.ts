import { Injectable } from '@angular/core';
import { StaticDataService } from './static-data.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  constructor(private staticDataService: StaticDataService) {}

  async initializeApp(): Promise<void> {
    try {
      await this.staticDataService.loadStaticData();
      console.log('Static data initialized successfully.');
    } catch (error) {
      console.error('Error initializing static data:', error);
    }
  }
}
