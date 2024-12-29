import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdgeProgressSquareComponent } from './edge-progress-square.component';

describe('EdgeProgressSquareComponent', () => {
  let component: EdgeProgressSquareComponent;
  let fixture: ComponentFixture<EdgeProgressSquareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdgeProgressSquareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdgeProgressSquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
