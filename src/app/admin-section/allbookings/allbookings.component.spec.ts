import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllbookingsComponent } from './allbookings.component';

describe('AllbookingsComponent', () => {
  let component: AllbookingsComponent;
  let fixture: ComponentFixture<AllbookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllbookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllbookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
