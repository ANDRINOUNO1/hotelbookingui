import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FourthFloorComponent } from './fourth-floor.component';

describe('FourthFloorComponent', () => {
  let component: FourthFloorComponent;
  let fixture: ComponentFixture<FourthFloorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FourthFloorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FourthFloorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
