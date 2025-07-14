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
  created_at?: string;
  updated_at?: string;
  room?: Room; // Optional: populated if joined
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
  paymentMethod: string;
  amount: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
}