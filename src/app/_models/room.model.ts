export const ROOM_STATUSES = [
    'Occupied', 'Stay Over', 'On Change', 'Do Not Disturb', 
    'Cleaning in Progress', 'Sleep Out', 'On Queue', 'Skipper', 
    'Vacant and Ready', 'Out of Order', 'Out of Service', 'Lockout', 
    'Did Not Check Out', 'Due Out', 'Check Out', 'Early Check In',
    'Vacant and Clean', 'Reserved - Guaranteed', 'Reserved - Not Guaranteed'
] as const;

// This creates a TypeScript type from the array above
export type RoomStatus = typeof ROOM_STATUSES[number];

export interface Room {
  id: number;
  roomNumber: string;
  roomTypeId: number;
  price: number;
  roomStatus: RoomStatus;
  roomType?: {
    type: string;
    description: string;
    basePrice: number;
    reservationFeePercentage: number;
  };
  RoomType?: {
    type: string;
    description: string;
    basePrice: number;
    reservationFeePercentage: number;
  };
}
