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

  cancelAtPeriodEnd: boolean;
  canManageBilling: boolean;
  
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

export type AdminOverview = {
  totalUsers: number;
  vendors: number;
  customers: number;
  admins: number;
  blockedUsers: number;
  totalItems: number;
  pendingItems: number;
  totalTransactions: number;
  revenue: number;
  itemsByStatus: { pending: number; approved: number; rejected: number; inactive: number };
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "vendor" | "customer" | "admin";
  businessName?: string;
  isBlocked?: boolean;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpiresAt?: string | null;
  createdAt: string;
};

export type AdminUserDetails = { user: AdminUser; stats: Record<string, number> };

export type AdminItem = {
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
  vendor: { id?: string; name?: string; email?: string; isBlocked?: boolean };
};

export type AdminTransaction = {
  _id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  stripeSessionId?: string;
  createdAt: string;
  vendor: { name?: string; email?: string };
};