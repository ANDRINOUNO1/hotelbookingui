import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdFloorComponent } from './third-floor.component';

describe('ThirdFloorComponent', () => {
  let component: ThirdFloorComponent;
  let fixture: ComponentFixture<ThirdFloorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdFloorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdFloorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
