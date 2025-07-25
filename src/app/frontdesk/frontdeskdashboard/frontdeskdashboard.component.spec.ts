import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrontdeskdashboardComponent } from './frontdeskdashboard.component';

describe('FrontdeskdashboardComponent', () => {
  let component: FrontdeskdashboardComponent;
  let fixture: ComponentFixture<FrontdeskdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontdeskdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrontdeskdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
