import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-edge-progress-square',
  imports: [],
  templateUrl: './edge-progress-square.component.html',
  styleUrl: './edge-progress-square.component.scss',
})
export class EdgeProgressSquareComponent {
  @Input() percentage: number = 0; // Percentage to show
  @Input() color: string = 'blue'; // Edge color
  @Input() backgroundColor: string = 'white'; // Internal square background color
  @Input() textColor: string = 'black'; // Title text color
  @Input() percentageColor: string = 'black'; // Percentage text color
  @Input() title: string = ''; // Title at the bottom
}
