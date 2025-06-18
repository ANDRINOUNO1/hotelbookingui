export interface Booking {
  id?: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  childs: number;
  rooms: number;
  requests?: string;
}