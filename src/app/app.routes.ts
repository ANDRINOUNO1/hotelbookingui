import { Routes } from '@angular/router';
import { ReservationFormComponent } from './home/reservation-form/reservation-form.component';
import { LoginComponent } from './login/login.component';
import { AdminSectionComponent } from './admin-section/admin-section.component';
import { HomeComponent } from './home/home.component';
import { FrontdeskComponent } from './frontdesk/frontdesk.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'reserve', component: ReservationFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminSectionComponent },
  { path: 'frontdesk', component: FrontdeskComponent }
];