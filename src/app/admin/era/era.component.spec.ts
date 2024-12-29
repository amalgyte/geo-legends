import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EraComponent } from './era.component';

describe('EraComponent', () => {
  let component: EraComponent;
  let fixture: ComponentFixture<EraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
