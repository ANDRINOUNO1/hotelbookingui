import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Lazy loading imports for better performance
const ReservationComponent = () => import('./reservation/reservation.component').then(m => m.ReservationComponent);
const LoginComponent = () => import('./login/login.component').then(m => m.LoginComponent);

// Admin lazy loading
const AdminSectionComponent = () => import('./admin-section/admin-section.component').then(m => m.AdminSectionComponent);
const HomeComponent = () => import('./home/home.component').then(m => m.HomeComponent);
const DashboardComponent = () => import('./admin-section/dashboard/dashboard.component').then(m => m.DashboardComponent);
const BookingComponent = () => import('./admin-section/booking/booking.component').then(m => m.BookingComponent);
const CustomersComponent = () => import('./admin-section/customers/customers.component').then(m => m.CustomersComponent);
const RoomsComponent = () => import('./admin-section/rooms/rooms.component').then(m => m.RoomsComponent);
const AdminPricingComponent = () => import('./admin-section/pricing/pricing.component').then(m => m.PricingComponent);
const AddAccountComponent = () => import('./admin-section/addaccount/add-account.component').then(m => m.AddAccountComponent);
const AllbookingsComponent = () => import('./admin-section/allbookings/allbookings.component').then(m => m.AllbookingsComponent);
const ArchiveComponent = () => import('./admin-section/archive/archive.component').then(m => m.ArchiveComponent);
const ContactMessagesComponent = () => import('./admin-section/contact-messages/contact-messages.component').then(m => m.ContactMessagesComponent);
const ContentManagementComponent = () => import('./admin-section/content-management/content-management.component').then(m => m.ContentManagementComponent);
const RoomstatusComponent = () => import('./admin-section/roomstatus/roomstatus.component').then(m => m.RoomstatusComponent);
const LoginHistoryComponent = () => import('./admin-section/history/history.component').then(m => m.LoginHistoryComponent);

// Frontdesk lazy loading
const FrontdeskComponent = () => import('./frontdesk/frontdesk.component').then(m => m.FrontdeskComponent);
const ReservationsComponent = () => import('./frontdesk/reservations/reservations.component').then(m => m.ReservationsComponent);
const PosComponent = () => import('./frontdesk/pos/pos.component').then(m => m.PosComponent);
const CalendarComponent = () => import('./frontdesk/calendar/calendar.component').then(m => m.CalendarComponent);
const ListsComponent = () => import('./frontdesk/lists/lists.component').then(m => m.ListsComponent);
const FrontdeskdashboardComponent = () => import('./frontdesk/frontdeskdashboard/frontdeskdashboard.component').then(m => m.FrontdeskdashboardComponent);
const AddbookingsComponent = () => import('./frontdesk/addbookings/addbookings.component').then(m => m.AddbookingsComponent);
const ProductsComponent = () => import('./frontdesk/products/products.component').then(m => m.ProductsComponent);
const RoomAvailabilityCalendarComponent = () => import('./frontdesk/room-availability-calendar/room-availability-calendar.component').then(m => m.RoomAvailabilityCalendarComponent);
const MonthlyRevenueReportComponent = () => import('./frontdesk/monthly-revenue-report/monthly-revenue-report.component').then(m => m.MonthlyRevenueReportComponent);

// Superadmin lazy loading
const SuperhomeComponent = () => import('./superadmin-sect/superhome.component').then(m => m.SuperhomeComponent);
const AccountListComponent = () => import('./superadmin-sect/accountlist/account-list.component').then(m => m.AccountListComponent);
const PendingAccountsComponent = () => import('./superadmin-sect/pendingaccount/pending-accounts.component').then(m => m.PendingAccountsComponent);
const ArchivesComponent = () => import('./superadmin-sect/archives/archives.component').then(m => m.ArchivesComponent);
const AddAccountComponentt = () => import('./superadmin-sect/addaccount/add-account.component').then(m => m.AddAccountComponentt);
const SuperAdminPricingComponent = () => import('./superadmin-sect/pricing/pricing.component').then(m => m.PricingComponent);

// Extras lazy loading
const BillingComponent = () => import('./frontdesk/lists/billing.component').then(m => m.BillingComponent);
const NotFoundComponent = () => import('./not-found/not-found.component').then(m => m.NotFoundComponent);

export const routes: Routes = [
  { path: '', loadComponent: HomeComponent },
  { path: 'reserve', loadComponent: ReservationComponent },
  { path: 'login', loadComponent: LoginComponent },
  {
    path: 'admin',
    loadComponent: AdminSectionComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: DashboardComponent },
      { path: 'booking', loadComponent: BookingComponent },
      { path: 'customers', loadComponent: CustomersComponent },
      { path: 'rooms', loadComponent: RoomsComponent },
      { path: 'pricing', loadComponent: AdminPricingComponent },
      { path: 'addaccount', loadComponent: AddAccountComponent },
      { path: 'allbooking', loadComponent: AllbookingsComponent },
      { path: 'archive', loadComponent: ArchiveComponent },
      { path: 'contact-messages', loadComponent: ContactMessagesComponent },
      { path: 'content-management', loadComponent: ContentManagementComponent },
      { path: 'roomstatus', loadComponent: RoomstatusComponent },
      { path: 'history', loadComponent: LoginHistoryComponent }
    ]
  },
  {
    path: 'frontdesk',
    loadComponent: FrontdeskComponent,
    children: [
      { path: '', redirectTo: 'frontdeskdashboard', pathMatch: 'full' },
      { path: 'frontdeskdashboard', loadComponent: FrontdeskdashboardComponent },
      { path: 'reservations', loadComponent: ReservationsComponent },
      { path: 'pos', loadComponent: PosComponent },
      { path: 'calendar', loadComponent: CalendarComponent },
      { path: 'availabilitycalendar', loadComponent: RoomAvailabilityCalendarComponent },
      { path: 'lists', loadComponent: ListsComponent },
      { path: 'addbookings', loadComponent: AddbookingsComponent },
      { path: 'products', loadComponent: ProductsComponent },
      { path: 'monthly-revenue-report', loadComponent: MonthlyRevenueReportComponent }
    ]
  },
  {
    path: 'superadmin',
    loadComponent: SuperhomeComponent,
    children: [
      { path: '', redirectTo: 'account-list', pathMatch: 'full' },
      { path: 'booking', loadComponent: BookingComponent },
      { path: 'allbooking', loadComponent: AllbookingsComponent },
      { path: 'account-list', loadComponent: AccountListComponent },
      { path: 'pending-accounts', loadComponent: PendingAccountsComponent },
      { path: 'add-accounts', loadComponent: AddAccountComponentt },
      { path: 'customers', loadComponent: CustomersComponent },
      { path: 'rooms', loadComponent: RoomsComponent },
      { path: 'roomstatus', loadComponent: RoomstatusComponent },
      { path: 'archives', loadComponent: ArchivesComponent},
      { path: 'pricing', loadComponent: SuperAdminPricingComponent }
    ]
  },
  { path: 'billing/:id', loadComponent: BillingComponent },
  { path: '**', loadComponent: NotFoundComponent }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }