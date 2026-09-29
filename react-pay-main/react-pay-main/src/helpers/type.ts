export type PropsModal = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

export type FieldType = {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
  address: string;
  phone: string;
};

export type typeInitState = {
  auth: {
    user: {
      _id: string;
      email: string;
      name: string;
      role: string;
      phone: string;
      address: string;
      image: null | string;
    } | null;
    isLoggedIn: boolean;
    accessToken: string | null;
    error: boolean;
    message: string | null;
  };
  cart: {
    items: cartItemType[];
  };
  category: {
    categories: categoryType[];
  };

  serie: {
    series: serieType[];
  };

  product: {
    search: string;
  };
};

export type cartItemType = {
  _id: string; // Product ID
  variantId: string; // Variant ID
  sku: string;
  name: string;
  price: number;
  mainImage: string | null;
  quantity: number;
  storage: string;
  color: string;
  condition: string;
};

export type categoryType = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export type serieType = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export type productType = {
  _id: string;
  category?: categoryType;
  serie?: serieType;
  name: string;
  slug?: string;
  description?: string;
  mainImage: string | undefined | null;
  specifications: {
    screen?: string;
    chip?: string;
    gpu?: string;
    ram?: string;
    rearCamera?: string;
    frontCamera?: string;
    battery?: string;
    weight?: string;
  };
  isFeatured?: boolean;
  isActive?: boolean;
};

export type productVariantType = {
  _id: string;
  product: productType | null;
  sku: string;
  storage: '128GB' | '256GB' | '512GB' | '1T';
  color: string;
  condition: 'New' | '99%' | '98%' | 'Kính phẩy';
  region: string;
  price: string;
  originalPrice: string;
  stock: string;
  images?: string[];
  isActive: boolean;
  imageColor: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export interface DataType {
  _id: string | null;
  name: string;
  description: string;
  isActive?: boolean;
}

export interface orderType {
  _id: string;
  userId: string;
  variantId: string;
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}
export interface userType {
  _id: string | null;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  userImage?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  totalSpent?: number;
  currentTier?: {
    _id?: string;
    name: string;
    minSpent: number;
    discount: number;
    color?: string;
  };
  nextTier?: {
    name: string;
    minSpent: number;
    discount: number;
    color?: string;
    needed: number;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

interface KPIInfo {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  totalProducts: number;
  revenueDiff?: number;
  lastMonthRevenue?: number;
}

interface TrendEntry {
  date: string;
  revenue: number;
  orders: number;
}

interface BestSeller {
  variant: {
    _id: string;
    sku: string;
    storage: string;
    color: string;
    condition: string;
    price: number;
    product: {
      name: string;
      mainImage?: string;
    };
  };
  quantitySold: number;
}

export interface StatData {
  kpis: KPIInfo;
  salesTrend: TrendEntry[];
  distribution: {
    PENDING: number;
    PAID: number;
    CANCELLED: number;
  };
  bestSellers: BestSeller[];
  lowStockAlerts: LowStock[];
  recentOrders: RecentOrder[];
}

export interface LowStock {
  _id: string;
  sku: string;
  storage: string;
  color: string;
  condition: string;
  price: number;
  stock: number;
  product: {
    name: string;
  };
}

export interface RecentOrder {
  _id: string;
  orderCode: string;
  totalAmount: number;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  info?: {
    name?: string;
    phone?: string;
  };
}
