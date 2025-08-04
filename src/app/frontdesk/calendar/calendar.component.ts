import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RoomType, Room, Booking } from '../../_models/booking.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BookingModalComponent } from './booking-modal.component';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, BookingModalComponent, DragDropModule],
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  roomTypes: RoomType[] = [];
  allRooms: Room[] = [];
  bookings: Booking[] = [];

  selectedType: string = '';

  dates: Date[] = [];
  currentDateRange: { start: Date; end: Date } = { start: new Date(), end: new Date() };
  visibleDays = 14; // Number of days to show at once
  currentStartIndex = 0; // Track the starting index for navigation
  
  // Modal state
  showModal = false;
  selectedBooking: Booking | null = null;
  selectedRoom: Room | null = null;
  dragStart = false;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient // ✅ inject HttpClient
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRoomsAndBookings();
    }

    this.initializeCalendar();
  }

  initializeCalendar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate dates for the next 90 days (3 months) to allow scrolling
    this.dates = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      this.dates.push(date);
    }
    
    // Set initial visible range
    this.currentDateRange.start = new Date(today);
    this.currentDateRange.end = new Date(today);
    this.currentDateRange.end.setDate(today.getDate() + this.visibleDays - 1);
  }

  loadRoomsAndBookings() {
    this.http.get<Room[]>(`${environment.apiUrl}/rooms`).subscribe(rooms => {
      this.allRooms = rooms;
      this.roomTypes = this.getUniqueRoomTypes(rooms);
      this.selectedType = this.roomTypes.length ? this.roomTypes[0].type : '';
      this.http.get<Booking[]>(`${environment.apiUrl}/bookings`).subscribe(bookings => {
        this.bookings = bookings;
      });
    });
  }

  getUniqueRoomTypes(rooms: Room[]): RoomType[] {
    const types: { [key: string]: RoomType } = {};
    rooms.forEach(room => {
      if (room.RoomType) {
        types[room.RoomType.type] = room.RoomType;
      }
    });
    return Object.values(types);
  }

  get filteredRooms(): Room[] {
    return this.allRooms.filter(r => r.RoomType?.type === this.selectedType);
  }

  getBookingsForRoomAndDate(roomId: number, date: Date) {
    return this.bookings.filter(b => {
      if (b.room_id !== roomId) return false;

      const checkIn = new Date(b.availability.checkIn);
      const checkOut = new Date(b.availability.checkOut);

      const target = new Date(date);
      target.setHours(0, 0, 0, 0);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      return target >= checkIn && target < checkOut;
    });
  }

  isCheckInDate(booking: any, date: Date): boolean {
    const checkIn = new Date(booking.availability.checkIn);
    const currentDate = new Date(date);

    checkIn.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    return checkIn.getTime() === currentDate.getTime();
  }


  getBookingWidth(booking: any): number {
    const checkIn = new Date(booking.availability.checkIn);
    const checkOut = new Date(booking.availability.checkOut);

    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const dayCount = Math.max((timeDiff / (1000 * 60 * 60 * 24)), 1);

    return dayCount * (100 / this.visibleDates.length);
  }

  // Helper for colspan-based booking rendering
  shouldRenderCell(room: Room, date: Date, dateIdx: number): boolean {
    // Only render a cell if it's not covered by a previous booking
    const bookings = this.bookings.filter(b => b.room_id === room.id);
    for (const booking of bookings) {
      const checkIn = new Date(booking.availability.checkIn);
      const checkOut = new Date(booking.availability.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);
      if (current > checkIn && current < checkOut) {
        // This cell is covered by a previous booking's colspan
        return false;
      }
    }
    return true;
  }

  isCheckInForBooking(room: Room, date: Date): boolean {
    // Returns true if this date is the check-in date for a booking in this room
    return !!this.getBookingForRoomAndDate(room, date);
  }

  getBookingForRoomAndDate(room: Room, date: Date): Booking | null {
    // Returns the booking for this room and date if this date is the check-in date
    return this.bookings.find(b => {
      if (b.room_id !== room.id) return false;
      const checkIn = new Date(b.availability.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);
      return checkIn.getTime() === current.getTime();
    }) || null;
  }

  getBookingColspan(room: Room, date: Date): number {
    // Returns the number of days for the booking starting at this date
    const booking = this.getBookingForRoomAndDate(room, date);
    if (!booking) return 1;
    const checkIn = new Date(booking.availability.checkIn);
    const checkOut = new Date(booking.availability.checkOut);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    const days = Math.max((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24), 1);
    // Limit colspan to not overflow the visible calendar
    const visibleDates = this.visibleDates;
    const startIdx = visibleDates.findIndex(d => d.getTime() === checkIn.getTime());
    const endIdx = visibleDates.findIndex(d => d.getTime() === checkOut.getTime());
    if (startIdx === -1) return days;
    if (endIdx === -1) return visibleDates.length - startIdx;
    return endIdx - startIdx;
  }

  // Precompute cells for each room row for colspan-based rendering
  getRowCells(room: Room): Array<{ type: 'booking' | 'empty', colspan: number, booking?: Booking }> {
    const cells: Array<{ type: 'booking' | 'empty', colspan: number, booking?: Booking }> = [];
    let dateIdx = 0;
    const bookings = this.bookings.filter(b => b.room_id === room.id);
    const visibleDates = this.visibleDates;
    
    while (dateIdx < visibleDates.length) {
      const currentDate = visibleDates[dateIdx];
      // Find a booking that overlaps with the current date and hasn't been rendered yet
      const booking = bookings.find(b => {
        const checkIn = new Date(b.availability.checkIn);
        const checkOut = new Date(b.availability.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        const start = checkIn.getTime();
        const end = checkOut.getTime();
        const current = currentDate.getTime();
        // Booking overlaps if current date is within [checkIn, checkOut)
        return current >= start && current < end &&
          // Only render at the first visible date for this booking
          (dateIdx === 0 || visibleDates[dateIdx - 1].getTime() < start);
      });
      if (booking) {
        // Calculate the visible start and end indices for the booking
        const checkIn = new Date(booking.availability.checkIn);
        const checkOut = new Date(booking.availability.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        const bookingStartIdx = visibleDates.findIndex(d => d.getTime() === checkIn.getTime());
        const bookingEndIdx = visibleDates.findIndex(d => d.getTime() === checkOut.getTime());
        const startIdx = bookingStartIdx === -1 ? 0 : bookingStartIdx;
        const endIdx = bookingEndIdx === -1 ? visibleDates.length : bookingEndIdx;
        const colspan = endIdx - Math.max(dateIdx, startIdx);
        cells.push({ type: 'booking', colspan, booking });
        dateIdx += colspan;
      } else {
        // No booking overlaps with this date
        cells.push({ type: 'empty', colspan: 1 });
        dateIdx++;
      }
    }
    return cells;
  }

  isMaintenance(cell: { booking?: Booking }): boolean {
    return !!cell.booking?.requests && cell.booking.requests!.toLowerCase().includes('maintenance');
  }
  
  setSelectedType(type: string) {
    this.selectedType = type;
  }

  // Modal methods
  openBookingModal(booking: Booking, room: Room) {
    this.selectedBooking = booking;
    this.selectedRoom = room;
    this.showModal = true;
  }

  closeBookingModal() {
    this.showModal = false;
    this.selectedBooking = null;
    this.selectedRoom = null;
  }

  getRoomStatus(room: Room, date: Date): 'available' | 'reserved' | 'occupied' {
    const booking = this.bookings.find(b => {
      if (b.room_id !== room.id) return false;
      const checkIn = new Date(b.availability.checkIn);
      const checkOut = new Date(b.availability.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      return date >= checkIn && date < checkOut;
    });
    if (!booking) return 'available';
    if (booking.pay_status) return 'occupied';
    return 'reserved';
  }

  getStatusDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const idx = this.dates.findIndex(d => d.getTime() === today.getTime());
    return idx !== -1 ? this.dates[idx] : this.dates[0];
  }

  onClickBooking(booking: any, room: any) {
  if (this.dragStart) {
    setTimeout(() => this.dragStart = false, 100); 
    return;
  }
  this.openBookingModal(booking, room);
  }
  bookingColspan(booking: Booking): number {
    const checkIn = new Date(booking.availability.checkIn);
    const checkOut = new Date(booking.availability.checkOut);
    return Math.max((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24), 1);
  }

  // Navigation methods
  goToToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.currentStartIndex = this.dates.findIndex(date => date.getTime() === today.getTime());
    if (this.currentStartIndex === -1) {
      this.currentStartIndex = 0;
    }
    this.updateVisibleRange();
  }

  goToPrevious() {
    if (this.currentStartIndex > 0) {
      this.currentStartIndex = Math.max(0, this.currentStartIndex - this.visibleDays);
      this.updateVisibleRange();
    }
  }

  goToNext() {
    if (this.currentStartIndex + this.visibleDays < this.dates.length) {
      this.currentStartIndex = Math.min(this.dates.length - this.visibleDays, this.currentStartIndex + this.visibleDays);
      this.updateVisibleRange();
    }
  }

  updateVisibleRange() {
    this.currentDateRange.start = new Date(this.dates[this.currentStartIndex]);
    this.currentDateRange.end = new Date(this.dates[Math.min(this.currentStartIndex + this.visibleDays - 1, this.dates.length - 1)]);
  }

  get visibleDates(): Date[] {
    return this.dates.slice(this.currentStartIndex, this.currentStartIndex + this.visibleDays);
  }

  get canGoPrevious(): boolean {
    return this.currentStartIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentStartIndex + this.visibleDays < this.dates.length;
  }

  get currentDateRangeText(): string {
    const startDate = this.currentDateRange.start;
    const endDate = this.currentDateRange.end;
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  // Handle keyboard navigation
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.goToNext();
        break;
      case 'Home':
        event.preventDefault();
        this.goToToday();
        break;
    }
  }

  onDragEnd(event: CdkDragEnd, booking: Booking, room: Room) {
  const deltaX = event.distance.x;

  const parent = event.source.element.nativeElement.parentElement;
  if (!parent) return;

  const colspan = this.getBookingColspan(room, new Date(booking.availability.checkIn));
  if (colspan === 0) return;

  const cellWidth = parent.offsetWidth / colspan;
  const daysMoved = Math.round(deltaX / cellWidth);

  if (daysMoved !== 0) {
    const newCheckIn = new Date(booking.availability.checkIn);
    const newCheckOut = new Date(booking.availability.checkOut);

    newCheckIn.setDate(newCheckIn.getDate() + daysMoved);
    newCheckOut.setDate(newCheckOut.getDate() + daysMoved);

    booking.availability.checkIn = newCheckIn.toISOString();
    booking.availability.checkOut = newCheckOut.toISOString();

    this.http.patch(`${environment.apiUrl}/bookings/${booking.id}`, {
      availability: {
        checkIn: booking.availability.checkIn,
        checkOut: booking.availability.checkOut
      }
    }).subscribe(() => {
      console.log('Booking updated!');
    }, err => {
      console.error('Failed to update booking', err);
    });
  }
}

}

