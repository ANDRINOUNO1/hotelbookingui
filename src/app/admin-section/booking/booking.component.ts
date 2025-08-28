import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../../_models/booking.model';
import { Room } from '../../_models/room.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  occupiedRooms: any[] = [];
  selectedBooking: any = null;
  isLoading = true;
  showSuccessMessage = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOccupiedRooms();
  }

  loadOccupiedRooms() { 
    this.isLoading = true;
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe({
      next: (roomsData) => {
        this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe({
          next: (bookingsData) => {
            this.occupiedRooms = bookingsData
              .filter(booking => booking.status === 'reserved')
              .map(booking => {
                const room = roomsData.find(r => r.id === booking.room_id);
                if (room) {
                  return {
                    id: booking.id,
                    number: room.roomNumber,
                    roomId: booking.room_id,
                    guest: `${booking.guest.first_name} ${booking.guest.last_name}`,
                    type: room.roomType?.type || room.RoomType?.type || 'Classic',
                    status: booking.pay_status ? 'Reserved - Guaranteed' : 'Reserved - Not Guaranteed',
                    paymentStatus: booking.pay_status ? 'Paid' : 'Unpaid',
                    booking 
                  };
                }
                return null;
              })
              .filter(room => room !== null);
            // Hide loading after data is loaded
            setTimeout(() => {
              this.isLoading = false;
            }, 500);
          },
          error: (err) => {
            console.error('Failed to load bookings:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Reserved - Guaranteed':
        return 'reserved-guaranteed';
      case 'Reserved - Not Guaranteed':
        return 'reserved-not-guaranteed';
      case 'Occupied':
        return 'occupied';
      case 'Vacant':
        return 'vacant';
      default:
        return 'default';
    }
  }

  addBooking(newBooking: Booking) {
    this.http.post<Booking>(`${environment.apiUrl}/bookings`, newBooking).subscribe(() => {
      this.loadOccupiedRooms();
    });
  }

  updateBooking(id: number, changes: Partial<Booking>) {
    // Check if payment status is being changed to paid
    const wasUnpaid = !this.selectedBooking.pay_status;
    const willBePaid = changes.pay_status === true;
    
    this.http.put<Booking>(`${environment.apiUrl}/bookings/${id}`, changes).subscribe({
      next: (updatedBooking) => {
        // Send email if payment status changed from unpaid to paid
        if (wasUnpaid && willBePaid) {
          this.sendPaymentConfirmationEmail(updatedBooking);
        }
        this.loadOccupiedRooms();
        this.closePopup();
      },
      error: (err) => {
        console.error('Failed to update booking:', err);
      }
    });
  }

  sendPaymentConfirmationEmail(booking: any) {
    const emailData = {
      bookingId: booking.id,
      guestEmail: booking.guest.email,
      guestName: `${booking.guest.first_name} ${booking.guest.last_name}`,
      paymentAmount: booking.paidamount || booking.payment?.amount,
      paymentMethod: booking.payment?.paymentMethod || booking.paidamount?.paymentMode
    };

    this.http.post(`${environment.apiUrl}/bookings/send-payment-confirmation`, emailData).subscribe({
      next: (response) => {
        console.log('✅ Payment confirmation email sent successfully');
      },
      error: (err) => {
        console.error('❌ Failed to send payment confirmation email:', err);
      }
    });
  }

  updateRoomStatus(roomId: number, guaranteed: boolean) {
  const newStatus = guaranteed ? 'Reserved - Guaranteed' : 'Reserved - Not Guaranteed';

    this.http.put(`${environment.apiUrl}/rooms/${roomId}`, { roomStatus: newStatus }).subscribe({
      next: () => {
        console.log(`✅ Room status updated to ${newStatus}`);
        this.loadOccupiedRooms();
      },
      error: (err) => {
        console.error('❌ Failed to update room status:', err);
      }
    });
  }

  confirmPayment(room: any) {
    if (confirm(`Are you sure you want to confirm payment for ${room.guest}? This will send a payment confirmation email.`)) {
      const updatedBooking = {
        ...room.booking,
        pay_status: true
      };

      this.http.put<Booking>(`${environment.apiUrl}/bookings/${room.id}`, updatedBooking).subscribe({
        next: (updatedBooking) => {
          console.log('✅ Payment confirmed successfully');
          
          // 1. Send confirmation email
          this.sendPaymentConfirmationEmail(updatedBooking);

          // 2. Update room status
          this.updateRoomStatus(room.booking.room_id, true);

          // 3. Record revenue
          const revenueRecord = {
            bookingId: updatedBooking.id,
            amount: updatedBooking.paidamount || updatedBooking.payment?.amount,
            source: 'Reservation',
            description: `Reservation payment for booking #${updatedBooking.id}`,
            date: new Date()
          };

          this.http.post(`${environment.apiUrl}/revenues`, revenueRecord).subscribe({
            next: () => {
              console.log('💰 Revenue recorded successfully');
            },
            error: (err) => {
              console.error('❌ Failed to record revenue:', err);
            }
          });

          // 4. Reload & show success
          this.loadOccupiedRooms();
          this.displaySuccessMessage();
        },
        error: (err) => {
          console.error('❌ Failed to confirm payment:', err);
        }
      });
    }
  }

  deleteBooking(id: number, roomId: number) {
    if (!id) {
      console.error('❌ Cannot delete booking: Invalid or missing booking ID.');
      return;
    }

    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      this.http.delete(`${environment.apiUrl}/bookings/${id}`).subscribe({
        next: () => {
          console.log('✅ Booking deleted successfully');
          if (roomId) {
            this.setRoomVacant(roomId); // 👈 now always has a valid id
          }
          this.loadOccupiedRooms();
        },
        error: (err) => {
          console.error('❌ Failed to delete booking:', err);
        }
      });
    }
  }


  setRoomVacant(roomId: number) {
    this.http.put(`${environment.apiUrl}/rooms/${roomId}`, { roomStatus: 'Vacant and Ready' })
      .subscribe({
        next: () => console.log(`Room ${roomId} set to Vacant and Ready`),
        error: err => console.error('❌ Failed to update room status:', err)
      });
  }

  editMode = false;
  openEditPopup(room: any) {
  this.selectedBooking = { 
    ...room.booking,
    paidamount: {
      amount: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      mobileNumber: '',
      paymentMethod: '',
      paymentMode: '',
      ...room.booking.paidamount
    }
  };
  this.editMode = true;
}

openViewPopup(room: any) {
  this.selectedBooking = { 
    ...room.booking,
    paidamount: {
      amount: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      mobileNumber: '',
      paymentMethod: '',
      paymentMode: '',
      ...room.booking.paidamount
    }
  };
  this.editMode = false;
}

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
  closePopup() {
    this.selectedBooking = null;
    this.editMode = false;
  }

  displaySuccessMessage() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.hideSuccessMessage();
    }, 5000); // Auto hide after 5 seconds
  }

  hideSuccessMessage() {
    this.showSuccessMessage = false;
  }
}
