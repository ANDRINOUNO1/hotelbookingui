import { Routes } from '@angular/router';
import { ReservationFormComponent } from './home/reservation-form/reservation-form.component';
import { LoginComponent } from './login/login.component';
import { AdminSectionComponent } from './admin-section/admin-section.component';
import { HomeComponent } from './home/home.component';
import { FrontdeskComponent } from './frontdesk/frontdesk.component';
import { DashboardComponent } from './admin-section/dashboard/dashboard.component';
import { BookingComponent } from './admin-section/booking/booking.component';
import { CustomersComponent } from './admin-section/customers/customers.component';
import { RoomsComponent } from './admin-section/rooms/rooms.component';
import { PayrollComponent } from './admin-section/payroll/payroll.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'reserve', component: ReservationFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminSectionComponent },
  { path: 'frontdesk', component: FrontdeskComponent },
  {
    path: 'admin',
    component: AdminSectionComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'booking', component: BookingComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: 'payroll', component: PayrollComponent }
    ]
  }
];