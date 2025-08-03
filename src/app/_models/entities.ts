import { RoomType, Room, ReservationFee } from './booking.model';

export const RESERVATION_FEES: ReservationFee[] = [
    { fee: 50 }
];

export const ROOM_TYPES: RoomType[] = [
    { id: 1, type: 'Classic', rate: 120, basePrice: 120, description: 'Comfortable and affordable accommodation with essential amenities', reservationFeePercentage: 10.00 },
    { id: 2, type: 'Deluxe', rate: 200, basePrice: 200, description: 'Enhanced amenities and spacious rooms for a premium experience', reservationFeePercentage: 15.00 },
    { id: 3, type: 'Prestige', rate: 150, basePrice: 150, description: 'Luxury accommodations with premium services and amenities', reservationFeePercentage: 12.50 },
    { id: 4, type: 'Luxury', rate: 80, basePrice: 80, description: 'Ultimate luxury experience with top-tier amenities and services', reservationFeePercentage: 8.00 }
];

export const ROOMS: Room[] = [];

ROOM_TYPES.forEach(roomType => {
  let floors = 1;
  let roomsPerFloor = 1;

  switch (roomType.type) {
    case 'Classic': 
      floors = 2;
      roomsPerFloor = 8;
      break;
    case 'Deluxe':
      floors = 2;
      roomsPerFloor = 5;
      break;
    case 'Prestige':
      floors = 2;
      roomsPerFloor = 3;
      break;
    case 'Luxury':
      floors = 1;
      roomsPerFloor = 4;
      break;
  }

  for (let floor = 1; floor <= floors; floor++) {
    for (let i = 1; i <= roomsPerFloor; i++) {
      const baseNumber = roomType.id * 100 + i;
      const roomNumber = `${baseNumber}-${floor}`;
             ROOMS.push({
         id: ROOMS.length + 1,
         roomNumber,
         room_type_id: roomType.id,
         floor,
         status: true,
         RoomType: roomType
       });
    }
  }
});