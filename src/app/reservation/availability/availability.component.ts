import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationDataService } from '../../_services/reservation-data.service';
import { RoomService, RoomType } from '../../_services/room.service';

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

  // Multiple room images for each room type
  roomImages = {
    'Classic': [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4cb84b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop'
    ],
    'Deluxe': [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4cb84b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop'
    ],
    'Prestige': [
      'https://images.unsplash.com/photo-1582719478250-c89cae4cb84b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop'
    ],
    'Luxury': [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4cb84b?w=300&h=200&fit=crop'
    ]
  };

  constructor(
    private reservationDataService: ReservationDataService,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.loadAvailableRoomTypes();
  }

  async loadAvailableRoomTypes() {
    this.loading = true;
    this.error = '';

    try {
      // Get room types from backend
      const roomTypes = await this.roomService.getRoomTypes().toPromise();
      
      if (roomTypes) {
        // Filter room types that have available rooms
        this.availableRoomTypes = [];
        
        for (const roomType of roomTypes) {
          const availableRooms = await this.roomService.getAvailableRoomsByType(roomType.type).toPromise();
          if (availableRooms && availableRooms.length > 0) {
            // Add the room type with the first available room's price
            this.availableRoomTypes.push({
              ...roomType,
              rate: availableRooms[0].price
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading room types:', error);
      this.error = 'Failed to load room types. Please try again.';
      
      // Fallback to static data if backend is not available
      this.loadStaticRoomTypes();
    } finally {
      this.loading = false;
    }
  }

  // Fallback to static data
  loadStaticRoomTypes() {
    this.availableRoomTypes = [
      { id: 1, type: 'Classic', description: 'Comfortable and affordable accommodation', basePrice: 120, rate: 120 },
      { id: 2, type: 'Deluxe', description: 'Enhanced amenities and spacious rooms', basePrice: 200, rate: 200 },
      { id: 3, type: 'Prestige', description: 'Luxury accommodations with premium services', basePrice: 150, rate: 150 },
      { id: 4, type: 'Luxury', description: 'Ultimate luxury experience with top-tier amenities', basePrice: 80, rate: 80 }
    ];
  }

  getRoomImage(roomType: string, viewNumber: number): string {
    const roomImages = this.roomImages[roomType as keyof typeof this.roomImages];
    if (roomImages && roomImages[viewNumber - 1]) {
      return roomImages[viewNumber - 1];
    }
    // Fallback to first image of Classic room type
    return this.roomImages['Classic'][0];
  }

  selectRoomType(roomType: RoomType) {
    this.reservationDataService.setSelectedRoomType(roomType);
    this.next.emit(roomType);
  }
}
