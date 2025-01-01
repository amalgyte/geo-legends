import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaticDataService } from '../../core/services/static-data.service';
import { EraDefinition } from '../../core/models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-era',
  standalone: true,
  templateUrl: './era.component.html',
  styleUrls: ['./era.component.scss'],
  imports: [CommonModule],
})
export class EraComponent implements OnInit {
  eras: EraDefinition[] = [];

  constructor(
    private router: Router,
    private staticDataService: StaticDataService
  ) {}

  ngOnInit(): void {
    this.eras = this.staticDataService.get('eras');
  }

  addEra(): void {
    this.router.navigate(['/admin/eras/add']);
  }

  editEra(eraId: string): void {
    this.router.navigate(['/admin/eras/edit', eraId]);
  }

  deleteEra(eraId: string): void {
    this.staticDataService.delete('eras',eraId);
    this.eras = this.staticDataService.get('eras'); // Refresh list
  }
}
