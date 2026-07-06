export type Role = "admin" | "waiter";

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
  phone?: string;
  active: boolean;
  shift?: string;
}

export type VegType = "veg" | "nonveg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  veg: VegType;
  available: boolean;
  image: string;
  popular?: number; // order count for popularity
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type TableStatus = "available" | "occupied" | "billing";

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string | null;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "completed";

export type PaymentMethod = "cash" | "upi" | "card";

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
  veg: VegType;
}

export interface Order {
  id: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  specialInstructions?: string;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  discount: number;
  total: number;
  paymentMethod?: PaymentMethod;
  paid: boolean;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface AppNotification {
  id: string;
  type: "new_order" | "order_ready" | "bill_generated";
  message: string;
  read: boolean;
  createdAt: number;
}
