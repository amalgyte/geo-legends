import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EconomyViewComponent } from './economy-view.component';

describe('EconomyViewComponent', () => {
  let component: EconomyViewComponent;
  let fixture: ComponentFixture<EconomyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EconomyViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EconomyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
