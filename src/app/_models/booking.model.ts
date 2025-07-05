export interface Availability {
  id?: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  requests?: string;
}
export interface Booking {
  id?: number;
  room_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  availability: Availability;
  payment?: string;
  pay_status: boolean;
  created_at?: string;
  updated_at?: string;
  room?: Room; // Optional: populated if joined
}
export interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phonenumber: string;
}

export interface RoomType {
  id: number;
  type: string;
  rate?: number;
}

export interface Room {
  id: number;
  room_number: number;
  room_type_id: number;
  floor: number;
  status: boolean; // true for available, false for occupied
  roomType?: RoomType; // Optional: populated if joined
}

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface Reservation {
  id: number;
  checkIn: string;
  checkOut: string;
  roomType: string;
  rate: number;
  guest: Guest;
  paymentStatus: 'pending' | 'paid';
  paymentDetails?: PaymentDetails;
}