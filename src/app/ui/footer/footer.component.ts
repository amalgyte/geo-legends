import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  template: `
    <div class="footer" (click)="go()">
      {{ name }}
    </div>
  `,
  styles: [
    `
      .footer {
        position: fixed;
        bottom: 0;
        right: 0;
        padding: 0.5rem 1rem;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 1rem;
        font-weight: bold;
        border-radius: 0.5rem 0 0 0.5rem;
        animation: fadeIn 0.5s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
  standalone: true,
})
export class FooterComponent {
  @Input() name!: string; // The name to display in the footer

  constructor(private router: Router) {}

  go() {
    this.router.navigate(['/' + this.name.toLocaleLowerCase()]);
  }
}
