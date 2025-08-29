import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { RoomService, RoomType, Room } from '../../_services/room.service';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {
  @Output() next = new EventEmitter<RoomType>();
  @Output() back = new EventEmitter<void>();

  availableRoomTypes: RoomType[] = [];
  loading = false;
  error = '';
  expandedRoomType: string | null = null;
  selectedDates: { checkIn: string; checkOut: string } | null = null;
  roomAvailabilityCounts: { [key: string]: { available: number; total: number } } = {};
  roomAmenities: { [key: string]: string[] } = {};

      // Multiple room images for each room type
      roomImages = {
      'Classic': [
        'assets/images/BEACH.jpg',
        'assets/images/bombo.jpg',
        'assets/images/CR.jpg',
        'assets/images/bomboa.png'
      ],
      'Deluxe': [
        'assets/images/deluxe.jpg',
        'assets/images/deluxe1.jpg',
        'assets/images/prev.jpg',
        'assets/images/MainPICTURE.jpg'
      ],
      'Prestige': [
        'assets/images/woww.png',
        'assets/images/STANDARD ROOM.jpg',
        'assets/images/HALLWAY.jpg',
        'assets/images/CHIC ROOM.jpg'
      ],
      'Luxury': [
        'assets/images/hahahaha.png',
        'assets/images/BEACHVIEW.jpg',
        'assets/images/hahha.png',
        'assets/images/DELUXE VIEW.jpg'
      ]
    };

  constructor(
    private reservationDataService: ReservationDataService,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.loadSelectedDates();
    this.loadAvailableRoomTypes();
  }

  loadSelectedDates() {
    const reservation = this.reservationDataService.getReservation();
    if (reservation) {
      this.selectedDates = {
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut
      };
    }
  }

  async loadAvailableRoomTypes() {
    this.loading = true;
    this.error = '';

    try {
      // Get room types from backend
      const roomTypes = await this.roomService.getRoomTypes().toPromise();
      // Get all rooms from backend
      const allRooms = await this.roomService.getAllRooms().toPromise();

      if (roomTypes && roomTypes.length > 0) {
        this.availableRoomTypes = [];
        for (const roomType of roomTypes) {
          // Get rooms for this type
          const roomsOfType = Array.isArray(allRooms) ? allRooms.filter(room => room.roomTypeId === roomType.id) : [];

          // Count available rooms by status
          const availableCount = roomsOfType.filter(
            room => room.roomStatus === 'Vacant and Ready' || room.roomStatus === 'Vacant and Clean'
          ).length;

          // Add the room type with pricing
          let enhancedRoomType = roomType;
          try {
            const detailedRoomType = await this.roomService.getRoomTypeDetails(roomType.id).toPromise();
            if (detailedRoomType) {
              enhancedRoomType = detailedRoomType;
            }
          } catch (error) {
            console.log('Using basic room type data for room type', roomType.id);
          }

          this.availableRoomTypes.push({
            ...enhancedRoomType,
            rate: roomsOfType.length > 0 ? roomsOfType[0].price : enhancedRoomType.basePrice
          });

          // Set counts for UI
          this.roomAvailabilityCounts[enhancedRoomType.type] = {
            available: availableCount,
            total: roomsOfType.length
          };

          // Load amenities for this room type (don't await to avoid blocking)
          this.loadRoomAmenities(roomType.id).catch(error => {
            console.error('Error loading amenities for room type', roomType.id, error);
          });
        }
      } else {
        this.error = 'No room types found.';
      }
    } catch (error) {
      console.error('Error loading room types or rooms:', error);
      this.error = 'Failed to load room types. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async loadRoomAmenities(roomTypeId: number) {
    try {
      const amenities = await this.roomService.getRoomAmenities(roomTypeId).toPromise();
      if (amenities && amenities.length > 0) {
        const roomType = this.availableRoomTypes.find(rt => rt.id === roomTypeId);
        if (roomType) {
          this.roomAmenities[roomType.type] = amenities;
        }
      } else {
        const roomType = this.availableRoomTypes.find(rt => rt.id === roomTypeId);
        if (roomType) {
          this.roomAmenities[roomType.type] = this.getAmenitiesByRoomType(roomType.type);
        }
      }
    } catch (error) {
      console.error('Error loading room amenities from backend:', error);
      const roomType = this.availableRoomTypes.find(rt => rt.id === roomTypeId);
      if (roomType) {
        this.roomAmenities[roomType.type] = this.getAmenitiesByRoomType(roomType.type);
      }
    }
  }

  getAmenitiesByRoomType(roomType: string): string[] {
    const amenitiesMap: { [key: string]: string[] } = {
      'Classic': [
        'Air conditioning',
        'Private bathroom',
        'Free WiFi',
        'TV',
        'Daily housekeeping',
        'Towels and linens'
      ],
      'Deluxe': [
        'All Classic amenities',
        'Premium bedding',
        'Mini refrigerator',
        'Coffee maker',
        'Work desk',
        'Enhanced toiletries'
      ],
      'Prestige': [
        'All Deluxe amenities',
        'Balcony/terrace',
        'Premium toiletries',
        'Room service',
        'King-size bed',
        'Ocean view option'
      ],
      'Luxury': [
        'All Prestige amenities',
        'Ocean view',
        'Butler service',
        'Premium dining access',
        'Spa access',
        'Concierge service'
      ]
    };

    return amenitiesMap[roomType] || [];
  }

  getRoomImage(roomType: string, viewNumber: number): string {
    const roomImages = this.roomImages[roomType as keyof typeof this.roomImages];
    if (roomImages && roomImages[viewNumber - 1]) {
      return roomImages[viewNumber - 1];
    }
    return this.roomImages['Classic'][0];
  }

  toggleRoomDetails(roomType: string) {
    if (this.expandedRoomType === roomType) {
      this.expandedRoomType = null;
    } else {
      this.expandedRoomType = roomType;
    }
  }

  getRoomDescription(roomType: string): string {
    const roomTypeData = this.availableRoomTypes.find(rt => rt.type === roomType);
    return roomTypeData?.description || 'No description available.';
  }

  getAvailabilityCount(roomType: string): { available: number; total: number } {
    return this.roomAvailabilityCounts[roomType] || { available: 0, total: 0 };
  }

  getRoomAmenities(roomType: string): string[] {
    return this.roomAmenities[roomType] || [];
  }

  isLowAvailability(roomType: string): boolean {
    const { available, total } = this.getAvailabilityCount(roomType);
    if (total === 0 || available === 0) return false;
    return available / total <= 0.2;
  }


  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  selectRoomType(roomType: RoomType) {
    this.reservationDataService.setSelectedRoomType(roomType);
    this.next.emit(roomType);
  }
}