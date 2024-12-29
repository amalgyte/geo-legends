import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../ui/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-config',
  standalone: true, // Standalone component
  imports: [CommonModule, RouterModule, FooterComponent], // Import RouterModule here
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.scss'],
})
export class GameConfigComponent {
  constructor() {}
}
