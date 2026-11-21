export type MenuItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  createdAt: string;
  vendor: { id: string; name: string; image?: string | null; isPremium: boolean };
};

export type ItemsResponse = {
  items: MenuItem[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export type ItemsMeta = {
  categories: { name: string; count: number; cover: string | null }[];
  locations: string[];
};

export type VendorItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: "pending" | "approved" | "rejected" | "inactive";
  isAvailable?: boolean;
  createdAt: string;
};

export type VendorOrder = {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
  createdAt: string;
  priceAtOrder: number;
  customer: { name?: string; email?: string; image?: string | null };
  item: { _id?: string; itemName?: string; image?: string | null; price?: number };
};

export type VendorOverview = {
  totalItems: number;
  activeItems: number;
  pendingItems: number;
  pendingOrders: number;
  acceptedOrders: number;
  acceptedRevenue: number;
  plan: "free" | "premium";
  planExpiresAt: string | null;
  limit: number | null;
};


export type CustomerOrder = {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
  createdAt: string;
  respondedAt?: string;
  cancelledAt?: string;
  priceAtOrder: number;
  item: { _id?: string; itemName?: string; image?: string | null; location?: string };
  vendor: { name?: string; image?: string | null };
};

export type CustomerSummary = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
};