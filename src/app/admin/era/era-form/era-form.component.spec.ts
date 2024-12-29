import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EraFormComponent } from './era-form.component';

describe('EraFormComponent', () => {
  let component: EraFormComponent;
  let fixture: ComponentFixture<EraFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EraFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EraFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
