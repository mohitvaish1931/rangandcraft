export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  createdAt?: string;
  orderCount?: number;
}

export interface AdminOrderItem {
  name: string;
  qty: number;
  price: number;
  image: string;
  product: string;
  _id?: string;
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface AdminOrder {
  _id: string;
  user?: string | { _id: string; name?: string; email?: string } | null;
  orderItems: AdminOrderItem[];
  items?: AdminOrderItem[];
  shippingAddress?: { name?: string; fullName?: string; email?: string; phoneNumber?: string; address?: string; city?: string; postalCode?: string };
  totalPrice: number;
  totalAmount?: number;
  isDelivered?: boolean;
  status: string;
  paymentStatus?: string;
  isPaid?: boolean;
  createdAt: string;
  couponCode?: string;
  awbNumber?: string;
  courierName?: string;
}

const orderUser = (o: AdminOrder) => (o.user && typeof o.user === 'object' ? o.user : null);
export const orderUserId = (o: AdminOrder) => orderUser(o)?._id ?? (typeof o.user === 'string' ? o.user : undefined);
export const orderUserName = (o: AdminOrder) => orderUser(o)?.name;
