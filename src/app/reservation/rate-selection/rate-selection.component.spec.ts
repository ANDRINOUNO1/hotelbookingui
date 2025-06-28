import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateSelectionComponent } from './rate-selection.component';

describe('RateSelectionComponent', () => {
  let component: RateSelectionComponent;
  let fixture: ComponentFixture<RateSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
