import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() title: string = 'Bronze Age'; // Current age of the game
  @Input() score: number = 453333; // Player's current score
  @Input() level: number = 15; // Player's current level
}
