export interface Product {
  id?: number; // optional when creating
  name: string;
  category: string;
  price: number;
  color?: string;
  RequestProduct?: {
    quantity: number;
  };
}
