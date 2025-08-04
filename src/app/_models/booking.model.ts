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
  room?: Room;
  requests?: string;
  paidamount: number;
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
  status: boolean; // true for available, false for occupied
  RoomType?: RoomType; // Backend alias for room type
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