import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Booking } from '../../_models/booking.model';
import { Room } from '../../_models/room.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LoadingSpinnerComponent } from '../../_components/loading-spinner.component';
import { ConfirmationModalService } from '../../_services/confirmation-modal.service';

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

  constructor(
    private http: HttpClient,
    private confirmationModalService: ConfirmationModalService
  ) {}

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
    this.http.post<Booking>(`${environment.apiUrl}/bookings`, newBooking).subscribe({
      next: (createdBooking) => {
        console.log('✅ Booking created successfully:', createdBooking);
        
        // Send booking confirmation email for new bookings
        this.sendBookingConfirmationEmail(createdBooking);
        
        this.loadOccupiedRooms();
      },
      error: (err) => {
        console.error('❌ Failed to create booking:', err);
      }
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
    // Enhanced validation for booking data
    if (!booking) {
      console.error('❌ No booking data provided');
      return;
    }
    
    if (!booking.guest) {
      console.error('❌ No guest data found in booking');
      console.log('Available booking fields:', Object.keys(booking));
      return;
    }
    
    if (!booking.guest.email) {
      console.error('❌ No guest email found in booking');
      console.log('Guest data:', booking.guest);
      return;
    }

    const emailData = {
      bookingId: booking.id,
      guestEmail: booking.guest.email,
      guestName: `${booking.guest.first_name || ''} ${booking.guest.last_name || ''}`.trim(),
      paymentAmount: booking.paidamount || booking.payment?.amount || 0,
      paymentMethod: booking.payment?.paymentMethod || booking.paidamount?.paymentMode || 'Cash'
    };

    console.log('📧 Sending payment confirmation email with data:', emailData);

    this.http.post(`${environment.apiUrl}/bookings/send-payment-confirmation`, emailData).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('✅ Payment confirmation email sent successfully:', response);
          // You could add a success notification here
        } else {
          console.log('⚠️ Payment confirmation email failed:', response);
          console.log('Error:', response.error);
          // You could add a warning notification here
        }
      },
      error: (err) => {
        console.error('❌ Failed to send payment confirmation email:', err);
        console.error('Error details:', err.error);
        
        // Handle authentication errors
        if (err.status === 401 || err.status === 403) {
          console.log('🔐 Authentication error - please login again');
          console.log('💡 Clear browser storage and refresh the page');
        } else if (err.status === 400) {
          console.log('⚠️ Bad request - check booking data structure');
        } else if (err.status === 500) {
          console.log('🚨 Server error - check backend logs');
        }
        // You could add an error notification here
      }
    });
  }

  sendBookingConfirmationEmail(booking: any) {
    // Ensure we have all required data
    if (!booking || !booking.guest || !booking.guest.email) {
      console.error('❌ Missing booking or guest email data');
      return;
    }

    const emailData = {
      bookingId: booking.id,
      guestEmail: booking.guest.email
    };

    console.log('📧 Sending booking confirmation email with data:', emailData);

    this.http.post(`${environment.apiUrl}/bookings/send-booking-confirmation`, emailData).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('✅ Booking confirmation email sent successfully:', response);
          // You could add a success notification here
        } else {
          console.log('⚠️ Booking confirmation email failed:', response);
          console.log('Error:', response.error);
          // You could add a warning notification here
        }
      },
      error: (err) => {
        console.error('❌ Failed to send booking confirmation email:', err);
        console.error('Error details:', err.error);
        // You could add an error notification here
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

  async confirmPayment(room: any) {
    const confirmed = await this.confirmationModalService.confirmPayment(room.guest);
    if (confirmed) {
      const updatedBooking = {
        ...room.booking,
        pay_status: true
      };

      this.http.put<Booking>(`${environment.apiUrl}/bookings/${room.id}`, updatedBooking).subscribe({
        next: (apiResponse) => {
          console.log('✅ Payment confirmed successfully');
          
          // Use the original room.booking data for email (preserves guest structure)
          const emailBookingData = {
            ...room.booking,
            ...apiResponse, // Merge API response data
            pay_status: true
          };
          
          // 1. Send confirmation email with proper data structure
          this.sendPaymentConfirmationEmail(emailBookingData);

          // 2. Update room status
          this.updateRoomStatus(room.booking.room_id, true);

          // 3. Record revenue
          const amount = room.booking.paidamount ?? room.booking.payment?.amount ?? apiResponse.paidamount ?? apiResponse.payment?.amount;

          if (amount == null || amount === 0) {
            console.error('❌ Cannot record revenue: amount is null or empty');
            console.log('Booking data:', {
              original: room.booking,
              apiResponse: apiResponse,
              amount: amount
            });
            return;
          }

          const revenueRecord = {
            bookingId: room.booking.id,
            amount: Number(amount),
            source: 'Reservation',
            description: `Reservation payment for booking #${room.booking.id}`,
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

  async deleteBooking(id: number, roomId: number) {
    if (!id) {
      console.error('❌ Cannot delete booking: Invalid or missing booking ID.');
      return;
    }

    const confirmed = await this.confirmationModalService.confirmDelete('this booking');
    if (confirmed) {
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

  closeViewPopup() {
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
