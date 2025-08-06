import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardchartviewComponent } from './dashboardchartview.component';

describe('DashboardchartviewComponent', () => {
  let component: DashboardchartviewComponent;
  let fixture: ComponentFixture<DashboardchartviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardchartviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardchartviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
