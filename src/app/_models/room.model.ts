export interface Room {
  id: number;
  roomNumber: string;
  roomTypeId: number;
  price: number;
  isAvailable: boolean;
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
