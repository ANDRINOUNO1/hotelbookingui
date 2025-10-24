// src/app/pos/pos.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService} from '../../_services/product.service';
import { Product } from '../../_models/product.model';
import { BookingService } from '../../_services/booking.service';
import { Booking as NestedBooking } from '../../_models/booking.model';
import { Booking as FlattenedBooking } from '../../_services/booking.service';
import { RequestService, Request as ServiceRequest } from '../../_services/requests.service';
import { Request as ModelRequest } from '../../_models/booking.model';


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
  bookings: FlattenedBooking[] = [];
  products: Product[] = [];
  selectedBookingId: number | null = null;
  selectedBooking: NestedBooking | null = null;   

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
      next: (data) => {
        console.log('🔍 POS: All bookings received:', data);
        console.log('🔍 POS: Booking statuses:', data.map(b => ({ id: b.id, status: b.status, guest: `${b.guest_firstName} ${b.guest_lastName}` })));
        console.log('🔍 POS: Unique status values:', [...new Set(data.map(b => b.status))]);
        
        // Filter to only show checked-in bookings
        const checkedInBookings = data.filter(booking => 
          booking.status === 'checked_in'
        );
        
        console.log('🔍 POS: Checked-in bookings:', checkedInBookings);
        console.log('🔍 POS: Checked-in count:', checkedInBookings.length);
        
        // If no checked-in bookings found, show all bookings for debugging
        if (checkedInBookings.length === 0) {
          console.log('⚠️ POS: No checked-in bookings found, showing all bookings for debugging');
          this.bookings = data;
        } else {
          this.bookings = checkedInBookings;
        }
      },
      error: (err) => console.error('Error fetching bookings:', err)
    });
  }

  selectBooking(id: number) {
    this.selectedBookingId = id;
    const flattenedBooking = this.bookings.find(b => b.id === id);
    this.selectedBooking = flattenedBooking ? this.convertFlattenedToNested(flattenedBooking) : null;
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
    const bookingId = +event.target.value;
    console.log('🔍 POS: Booking selected, ID:', bookingId);
    
    const flattenedBooking = this.filteredBookings.find(b => b.id === bookingId);
    if (flattenedBooking) {
      this.selectedBooking = this.convertFlattenedToNested(flattenedBooking);
    } else {
      this.selectedBooking = null;
    }
    
    this.selectedBookingId = bookingId;
    this.selectedRequest = null;
    this.selectedRequestId = null;
    
    console.log('🔍 POS: Selected booking:', this.selectedBooking);
  }

  private convertFlattenedToNested(flattened: FlattenedBooking): NestedBooking {
    return {
      id: flattened.id,
      room_id: flattened.room_id,
      guest: {
        first_name: flattened.guest?.first_name || flattened.guest_firstName || '',
        last_name: flattened.guest?.last_name || flattened.guest_lastName || '',
        email: flattened.guest?.email || flattened.guest_email || '',
        phone: flattened.guest?.phone || flattened.guest_phone || '',
        address: flattened.guest?.address || flattened.guest_address || '',
        city: flattened.guest?.city || flattened.guest_city || ''
      },
      availability: {
        checkIn: flattened.availability?.checkIn || flattened.checkIn || '',
        checkOut: flattened.availability?.checkOut || flattened.checkOut || '',
        adults: flattened.availability?.adults || flattened.adults || 0,
        children: flattened.availability?.children || flattened.children || 0,
        rooms: flattened.availability?.rooms || flattened.rooms || 1
      },
      payment: flattened.payment ? {
        paymentMode: flattened.payment.paymentMode || flattened.paymentMode || '',
        paymentMethod: flattened.payment.paymentMethod || flattened.paymentMethod || '',
        amount: flattened.payment.amount || flattened.amount || 0,
        mobileNumber: '',
        cardNumber: flattened.cardNumber || '',
        expiry: flattened.expiry || '',
        cvv: flattened.cvv || ''
      } : undefined,
      pay_status: flattened.pay_status,
      status: flattened.status as 'reserved' | 'checked_in' | 'checked_out' | undefined,
      created_at: flattened.created_at,
      updated_at: flattened.updated_at,
      specialRequests: flattened.specialRequests,
      paidamount: flattened.paidamount,
      requests: []
    };
  }

  get checkedInBookings(): FlattenedBooking[] {
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

    const requestPayload: ServiceRequest = {
      booking_id: this.selectedBooking.id!,
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
            const modelRequest: ModelRequest = {
              id: updatedRequest.id,
              booking_id: updatedRequest.booking_id,
              status: updatedRequest.status,
              created_at: updatedRequest.created_at,
              updated_at: updatedRequest.updated_at,
              products: updatedRequest.products
            };
            this.selectedBooking!.requests.push(modelRequest);
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
        // Filter to only show checked-in bookings
        this.bookings = data.filter(booking => 
          booking.status === 'checked_in'
        );
        const flattenedBooking = this.bookings.find(b => b.id === bookingId);
        this.selectedBooking = flattenedBooking ? this.convertFlattenedToNested(flattenedBooking) : null;
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
  selectedRequest: ServiceRequest | null = null;

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
  filteredBookings: FlattenedBooking[] = [];

  // Extract unique guests from bookings
  get uniqueGuests() {
    console.log('🔍 POS: uniqueGuests called, bookings:', this.bookings);
    const seen = new Set<string>();
    const guests = this.bookings
      .map(b => {
        const guest = {
          email: b.guest?.email || '',
          firstName: b.guest?.first_name || '',
          lastName: b.guest?.last_name || '',
          phone: b.guest?.phone || ''
        };
        console.log('🔍 POS: Mapped guest:', guest, 'from booking:', b);
        return guest;
      })
      .filter(g => {
        if (seen.has(g.email)) return false;
        seen.add(g.email);
        return true;
      });
    
    console.log('🔍 POS: Final unique guests:', guests);
    return guests;
  }

  // When guest is selected
  onGuestChange(event: any) {
    const guestEmail = event.target.value;
    this.selectedGuestId = guestEmail;
    this.filteredBookings = this.bookings.filter(
      b => b.guest?.email === guestEmail && b.pay_status && b.status === 'checked_in'
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
