// src/app/pos/pos.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService} from '../../_services/product.service';
import { Product } from '../../_models/product.model';
import { BookingService, Booking } from '../../_services/booking.service';
import { RequestService, Request } from '../../_services/requests.service';


export interface CartItem {
  product: Product;
  qty: number;
  note?: string;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
})
export class PosComponent {
  bookings: Booking[] = [];
  products: Product[] = [];
  selectedBookingId: number | null = null;
  selectedBooking: Booking | null = null;   

  constructor(
    private productService: ProductService,
    private bookingService: BookingService,
    private requestService: RequestService
  ) {}

  categories = ['Lunch/Dinner', 'Sandwiches', 'Meals', 'Sides', 'Drinks', 'Furniture & Amenities'];
  selectedCategory = this.categories[1]; // default: Sandwiches
  cart: CartItem[] = [];
  ngOnInit(): void {
    this.loadProducts();
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getAllBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: (err) => console.error('Error fetching bookings:', err)
    });
  }

  selectBooking(id: number) {
    this.selectedBookingId = id;
    this.selectedBooking = this.bookings.find(b => b.id === id) || null;
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }


  // Add product to cart
  addToCart(p: Product) {
    const idx = this.cart.findIndex((c) => c.product.id === p.id);
    if (idx > -1) {
      this.cart[idx].qty += 1;
    } else {
      this.cart.push({ product: p, qty: 1 });
    }
  }

  changeQty(item: CartItem, delta: number) {
    const idx = this.cart.indexOf(item);
    if (idx === -1) return;
    this.cart[idx].qty += delta;
    if (this.cart[idx].qty <= 0) this.cart.splice(idx, 1);
  }

  removeItem(item: CartItem) {
    const idx = this.cart.indexOf(item);
    if (idx > -1) this.cart.splice(idx, 1);
  }

  get subtotal() {
    return this.cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  }

  clearCart() {
    this.cart = [];
  }

  get visibleProducts() {
    return this.products.filter((p) => p.category === this.selectedCategory);
  }

  productClass(p: Product) {
    return `product-tile ${p.color || 'green'}`;
  }

  onBookingChange(event: any) {
    const id = +event.target.value;
    this.selectedBooking = this.bookings.find(b => b.id === id) || null;
  }

  get checkedInBookings(): Booking[] {
    return this.bookings.filter(
      (b) => b.pay_status === true && b.status === 'checked_in'
    );
  }

  addRequest() {
    if (!this.selectedBooking) {
      alert('Please select a booking room first.');
      return;
    }
    if (this.cart.length === 0) {
      alert('No items in cart.');
      return;
    }

    const requestPayload: Request = {
      booking_id: this.selectedBooking.id,
      status: 'pending'
    };

    this.requestService.createRequest(requestPayload).subscribe({
      next: (newRequest) => {
        const productIds = this.cart.map(c => ({
          id: c.product.id as number,
          quantity: c.qty
        }));

        this.requestService.addProductsToRequest(newRequest.id!, productIds).subscribe({
          next: (updatedRequest) => {
            if (!this.selectedBooking!.requests) {
              this.selectedBooking!.requests = [];
            }
            this.selectedBooking!.requests.push(updatedRequest);
            this.refreshBooking(this.selectedBooking!.id!);
            this.clearCart();
          }
        });
      }
    });
  }

  refreshBooking(bookingId: number) {
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.selectedBooking = this.bookings.find(b => b.id === bookingId) || null;
      },
      error: (err) => console.error('Error refreshing bookings:', err)
    });
  }

  cancelRequest() {
    if (this.cart.length === 0) {
      alert('Nothing to cancel.');
      return;
    }
    if (confirm('Are you sure you want to cancel this request?')) {
      this.clearCart();
    }
  }


  activeTab: 'guest' | 'request' | 'view-requests' = 'guest'; // default to Guest details

  setActiveTab(tab: 'guest' | 'request' | 'view-requests') {
    this.activeTab = tab;
  }

  selectedRequestId: number | null = null;
  selectedRequest: Request | null = null;

  onRequestChange(event: any) {
    const id = +event.target.value;
    this.selectedRequest = this.selectedBooking?.requests?.find(r => r.id === id) || null;
  }

  updateRequestStatus(newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') {
    if (!this.selectedRequest) return;

    this.requestService.updateRequest(this.selectedRequest.id!, { status: newStatus }).subscribe({
      next: (updated) => {
        console.log('Request updated:', updated);

        // Refresh booking to sync changes
        this.refreshBooking(this.selectedBooking!.id!);

        // Keep selected request synced
        this.selectedRequest = updated;
      },
      error: (err) => {
        console.error('Error updating request status:', err);
        alert('Failed to update request.');
      }
    });
  }

  selectedGuestId: string | null = null;  // guest email or unique identifier
  filteredBookings: Booking[] = [];

  // Extract unique guests from bookings
  get uniqueGuests() {
    const seen = new Set<string>();
    return this.bookings
      .map(b => b.guest)
      .filter(g => {
        if (seen.has(g.email)) return false;
        seen.add(g.email);
        return true;
      });
  }

  // When guest is selected
  onGuestChange(event: any) {
    const guestEmail = event.target.value;
    this.selectedGuestId = guestEmail;
    this.filteredBookings = this.bookings.filter(
      b => b.guest.email === guestEmail && b.pay_status && b.status === 'checked_in'
    );
    this.selectedBooking = null;
    this.selectedBookingId = null;
    this.selectedRequest = null;
    this.selectedRequestId = null;
  }

  getTotalPrice(r: any): number {
    if (!r?.products) return 0;
    return r.products.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
  }

  getTotalQuantity(r: any): number {
    if (!r?.products) return 0;
    return r.products.reduce((sum: number, p: any) => sum + p.quantity, 0);
  }

  getProductList(r: any): string {
    if (!r?.products) return '';
    return r.products.map((p: any) => `${p.name} x${p.quantity}`).join(', ');
  }

  getProductNames(r: any): string {
    if (!r?.products) return '';
    return r.products.map((p: any) => p.name).join(', ');
  }

  getRequestTotal(r: any): number {
    if (!r?.products) return 0;
    return r.products.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
  }

  getRequestItems(r: any): string {
    if (!r?.products) return '';
    return r.products.map((p: any) => `${p.name} × ${p.quantity}`).join(', ');
  }

  getProductTotal(p: any): number {
    return (p?.price || 0) * (p?.quantity || 0);
  }

}
