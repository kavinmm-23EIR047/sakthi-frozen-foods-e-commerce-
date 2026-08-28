export interface CategoryType {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

export interface ProductType {
  id: string;
  code: string;
  name: string;
  weight: string;
  mrp?: number;
  price: number;
  category: string;
  description: string;
  stock: number;
  image: string;
  rating: number;
  isPopular?: boolean;
  variants?: { weight: string; price: number }[];
}

export interface OrderItemType {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItemType[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  razorpayPaymentId?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Admin';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  address: string;
}
