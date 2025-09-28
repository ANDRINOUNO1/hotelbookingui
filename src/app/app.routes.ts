import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReservationComponent  } from './reservation/reservation.component';

import { LoginComponent } from './login/login.component';

//Admin
import { AdminSectionComponent } from './admin-section/admin-section.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './admin-section/dashboard/dashboard.component';
import { BookingComponent } from './admin-section/booking/booking.component';
import { CustomersComponent } from './admin-section/customers/customers.component';
import { RoomsComponent } from './admin-section/rooms/rooms.component';
import { PricingComponent as AdminPricingComponent } from './admin-section/pricing/pricing.component';
import { AddAccountComponent } from './admin-section/addaccount/add-account.component';
import { AllbookingsComponent } from './admin-section/allbookings/allbookings.component';
import { ArchiveComponent } from './admin-section/archive/archive.component';
import { ContactMessagesComponent } from './admin-section/contact-messages/contact-messages.component';
import { ContentManagementComponent } from './admin-section/content-management/content-management.component';
import { RoomstatusComponent } from './admin-section/roomstatus/roomstatus.component';
import { LoginHistoryComponent } from './admin-section/history/history.component';

//Frontdesk
import { FrontdeskComponent } from './frontdesk/frontdesk.component';
import { ReservationsComponent } from './frontdesk/reservations/reservations.component';
import { PosComponent } from './frontdesk/pos/pos.component';
import { CalendarComponent } from './frontdesk/calendar/calendar.component';
import { ListsComponent } from './frontdesk/lists/lists.component';
import { FrontdeskdashboardComponent } from './frontdesk/frontdeskdashboard/frontdeskdashboard.component';
import { AddbookingsComponent } from './frontdesk/addbookings/addbookings.component';
import { ProductsComponent } from './frontdesk/products/products.component';

//Superadmin
import { SuperhomeComponent } from './superadmin-sect/superhome.component';
import { AccountListComponent } from './superadmin-sect/accountlist/account-list.component';
import { PendingAccountsComponent } from './superadmin-sect/pendingaccount/pending-accounts.component';
import { ArchivesComponent } from './superadmin-sect/archives/archives.component';
import { AddAccountComponentt } from './superadmin-sect/addaccount/add-account.component';
import { PricingComponent as SuperAdminPricingComponent } from './superadmin-sect/pricing/pricing.component';


//extras
import { BillingComponent } from './frontdesk/lists/billing.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'reserve', component: ReservationComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminSectionComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'booking', component: BookingComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: 'pricing', component: AdminPricingComponent },
      { path: 'addaccount', component: AddAccountComponent },
      { path: 'allbooking', component: AllbookingsComponent },
      { path: 'archive', component: ArchiveComponent },
      { path: 'contact-messages', component: ContactMessagesComponent },
      { path: 'content-management', component: ContentManagementComponent },
      { path: 'roomstatus', component: RoomstatusComponent },
      { path: 'history', component: LoginHistoryComponent }
    ]
  },
  {
    path: 'frontdesk',
    component: FrontdeskComponent,
    children: [
      { path: '', redirectTo: 'frontdeskdashboard', pathMatch: 'full' },
      { path: 'frontdeskdashboard', component: FrontdeskdashboardComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'requests', component: PosComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'lists', component: ListsComponent },
      { path: 'addbookings', component: AddbookingsComponent },
      { path: 'products', component: ProductsComponent }
    ]
  },
  {
    path: 'superadmin',
    component: SuperhomeComponent,
    children: [
      { path: '', redirectTo: 'account-list', pathMatch: 'full' },
      { path: 'account-list', component: AccountListComponent },
      { path: 'pending-accounts', component: PendingAccountsComponent },
      { path: 'add-accounts', component: AddAccountComponentt },
      { path: 'archives', component: ArchivesComponent},
      { path: 'pricing', component: SuperAdminPricingComponent }
    ]
  },
  { path: 'billing/:id', component: BillingComponent },
  { path: '**', component: NotFoundComponent }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }