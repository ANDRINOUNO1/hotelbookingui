export const ROOM_STATUSES = [
    'Occupied', 'Stay Over', 'On Change', 'Do Not Disturb', 
    'Cleaning in Progress', 'Sleep Out', 'On Queue', 'Skipper', 
    'Vacant and Ready', 'Out of Order', 'Out of Service', 'Lockout', 
    'Did Not Check Out', 'Due Out', 'Check Out', 'Early Check In',
    'Vacant and Clean', 'Reserved - Guaranteed', 'Reserved - Not Guaranteed'   
] as const;

// This creates a TypeScript type from the array above
export type RoomStatus = typeof ROOM_STATUSES[number];

// Forward declaration for Request interface
export interface Request {
  id?: number;
  booking_id: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  products?: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
}


export interface Availability {
  id?: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}
export interface Booking {
  id?: number;
  room_id: number;
  guest: Guest;
  availability: Availability;
  payment?: PaymentDetails;
  pay_status: boolean;
  status?: 'reserved' | 'checked_in' | 'checked_out';
  created_at?: string;
  updated_at?: string;
  room?: Room;
  specialRequests?: string;
  paidamount: number;
  requests?: Request[];
}

export interface Guest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface RoomType {
  id: number;
  type: string;
  rate?: number;
  basePrice?: number;
  description?: string;
  reservationFeePercentage?: number;
}

export interface Room {
  id: number;
  roomNumber: string;
  room_type_id: number;
  floor: number;
  roomStatus: RoomStatus; // true for available, false for occupied
  RoomType?: RoomType; // Backend alias for room type
  roomType?: RoomType; // Backend alias for room type (lowercase)
}

export interface PaymentDetails {
  paymentMode: string;
  paymentMethod: string;
  amount: number;
  mobileNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface ReservationFee{
  fee: number;
}