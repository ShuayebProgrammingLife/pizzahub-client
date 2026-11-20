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