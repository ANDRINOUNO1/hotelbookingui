import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReservationComponent  } from './reservation/reservation.component';

import { LoginComponent } from './login/login.component';

import { AdminSectionComponent } from './admin-section/admin-section.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './admin-section/dashboard/dashboard.component';
import { BookingComponent } from './admin-section/booking/booking.component';
import { CustomersComponent } from './admin-section/customers/customers.component';
import { RoomsComponent } from './admin-section/rooms/rooms.component';
import { PricingComponent } from './admin-section/pricing/pricing.component';
import { AddAccountComponent } from './admin-section/addaccount/add-account.component';
import { AccountListComponent } from './admin-section/accountlist/account-list.component';
import { AllbookingsComponent } from './admin-section/allbookings/allbookings.component';

import { FrontdeskComponent } from './frontdesk/frontdesk.component';
import { ReservationsComponent } from './frontdesk/reservations/reservations.component';
import { RequestsComponent } from './frontdesk/requests/requests.component';
import { CalendarComponent } from './frontdesk/calendar/calendar.component';
import { ListsComponent } from './frontdesk/lists/lists.component';
import { FrontdeskdashboardComponent } from './frontdesk/frontdeskdashboard/frontdeskdashboard.component';
import path from 'path';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'reserve', component: ReservationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminSectionComponent },
  {
    path: 'admin',
    component: AdminSectionComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'booking', component: BookingComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'addaccount', component: AddAccountComponent },
      { path: 'accountlist', component: AccountListComponent },
      { path: 'allbooking', component: AllbookingsComponent }
    ]
  },
  {
    path: 'frontdesk',
    component: FrontdeskComponent,
    children: [
      { path: '', redirectTo: 'frontdeskdashboard', pathMatch: 'full' },
      { path: 'frontdeskdashboard', component: FrontdeskdashboardComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'requests', component: RequestsComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'lists', component: ListsComponent }  
    ]
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }