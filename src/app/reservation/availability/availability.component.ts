   
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { FormsModule } from '@angular/forms';
    import { ReservationDataService } from '../../_services/reservation-data.service';
    import { RoomService, RoomType, Room } from '../../_services/room.service';
    import { RoomAvailabilityService, RoomAvailability } from '../../_services/room-availability.service';

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
        private roomService: RoomService,
        private roomAvailabilityService: RoomAvailabilityService
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
          
          if (roomTypes && roomTypes.length > 0) {
            this.availableRoomTypes = [];
            
            // Process each room type
            for (const roomType of roomTypes) {
              try {
                // Get availability for the selected dates
                const availability = await this.getRoomAvailabilityForDates(roomType.id);
                
                // Always add the room type, even if no availability data
                let enhancedRoomType = roomType;
                try {
                  const detailedRoomType = await this.roomService.getRoomTypeDetails(roomType.id).toPromise();
                  if (detailedRoomType) {
                    enhancedRoomType = detailedRoomType;
                  }
                } catch (error) {
                  console.log('Using basic room type data for room type', roomType.id);
                }

                // Add the room type with pricing
                this.availableRoomTypes.push({
                  ...enhancedRoomType,
                  rate: availability && availability.length > 0 ? availability[0].price : enhancedRoomType.basePrice
                });

                // Calculate availability counts
                const totalRooms = await this.getTotalRoomsByType(roomType.id);
                this.roomAvailabilityCounts[enhancedRoomType.type] = {
                  available: availability ? availability.length : 0,
                  total: totalRooms
                };

                // Load amenities for this room type (don't await to avoid blocking)
                this.loadRoomAmenities(roomType.id).catch(error => {
                  console.error('Error loading amenities for room type', roomType.id, error);
                });
              } catch (roomTypeError) {
                console.error('Error processing room type', roomType.id, roomTypeError);
                // Still add the room type even if availability check failed
                this.availableRoomTypes.push(roomType);
                this.roomAvailabilityCounts[roomType.type] = {
                  available: 0,
                  total: 0
                };
              }
            }
          } else {
            this.error = 'No room types found.';
          }
        } catch (error) {
          console.error('Error loading room types:', error);
          this.error = 'Failed to load room types. Please try again.';
        } finally {
          this.loading = false;
        }
      }

      async getRoomAvailabilityForDates(roomTypeId: number): Promise<Room[]> {
        if (!this.selectedDates) {
          return [];
        }

        // Add a small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          // Use the simpler room availability service first
          const availableRooms = await this.roomAvailabilityService
            .getAvailableRooms(this.selectedDates.checkIn, this.selectedDates.checkOut, roomTypeId)
            .toPromise();
          
          if (availableRooms && availableRooms.length > 0) {
            // Convert RoomAvailability to Room format
            return availableRooms.map((room: any) => ({
              id: room.roomId,
              roomNumber: room.roomNumber,
              roomTypeId: roomTypeId,
              price: 0, // This will be set from the room type
              isAvailable: room.isAvailable,
              RoomType: this.availableRoomTypes.find(rt => rt.id === roomTypeId)
            }));
          }
        } catch (error) {
          console.error('Error getting room availability for roomTypeId', roomTypeId, ':', error);
        }

        try {
          // Fallback to enhanced availability API with pricing
          const enhancedAvailability = await this.roomService
            .getRoomAvailabilityWithPricing(this.selectedDates.checkIn, this.selectedDates.checkOut, roomTypeId)
            .toPromise();
          
          if (enhancedAvailability && enhancedAvailability.length > 0) {
            return enhancedAvailability.map((room: any) => ({
              id: room.roomId || room.id,
              roomNumber: room.roomNumber,
              roomTypeId: roomTypeId,
              price: room.price || room.rate || 0,
              isAvailable: room.isAvailable !== false,
              RoomType: this.availableRoomTypes.find(rt => rt.id === roomTypeId)
            }));
          }
        } catch (error) {
          console.error('Error getting enhanced room availability for roomTypeId', roomTypeId, ':', error);
        }

        // Final fallback to basic room service
        try {
          const roomType = this.availableRoomTypes.find(rt => rt.id === roomTypeId);
          if (roomType) {
            return await this.roomService.getAvailableRoomsByType(roomType.type).toPromise() || [];
          }
        } catch (fallbackError) {
          console.error('Fallback error for roomTypeId', roomTypeId, ':', fallbackError);
        }
        
        return [];
      }

      async getTotalRoomsByType(roomTypeId: number): Promise<number> {
        try {
          const allRooms = await this.roomService.getAllRooms().toPromise();
          if (allRooms) {
            return allRooms.filter(room => room.roomTypeId === roomTypeId).length;
          }
        } catch (error) {
          console.error('Error getting total rooms:', error);
        }
        return 0;
      }

      async loadRoomAmenities(roomTypeId: number) {
        try {
          // Try to get amenities from backend first
          const amenities = await this.roomService.getRoomAmenities(roomTypeId).toPromise();
          if (amenities && amenities.length > 0) {
            const roomType = this.availableRoomTypes.find(rt => rt.id === roomTypeId);
            if (roomType) {
              this.roomAmenities[roomType.type] = amenities;
            }
          } else {
            // Fallback to static mapping if backend doesn't return amenities
            const roomType = this.availableRoomTypes.find(rt => rt.id === roomTypeId);
            if (roomType) {
              this.roomAmenities[roomType.type] = this.getAmenitiesByRoomType(roomType.type);
            }
          }
        } catch (error) {
          console.error('Error loading room amenities from backend:', error);
          // Fallback to static mapping
          const roomType = this.availableRoomTypes.find(rt => rt.id === roomTypeId);
          if (roomType) {
            this.roomAmenities[roomType.type] = this.getAmenitiesByRoomType(roomType.type);
          }
        }
      }

      getAmenitiesByRoomType(roomType: string): string[] {
        // This could be fetched from backend, but for now using a mapping
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
        // Fallback to first image of Classic room type
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
