export interface ApiResponse<T> {
  results?: number;
  metadata?: {
    currentPage: number;
    numberOfPages: number;
    limit: number;
    nextPage?: number;
  };
  data: T;
  message?: string;
  statusMsg?: string;
}

export interface AuthUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  category: Category;
  subcategories?: SubCategory[];
  brand?: Brand;
  ratingsAverage: number;
  ratingsQuantity: number;
  sold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartProduct {
  count: number;
  _id: string;
  product: Product;
  price: number;
}

export interface CartData {
  _id: string;
  cartOwner: string;
  products: CartProduct[];
  totalCartPrice: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CartResponse {
  status: string;
  message?: string;
  numOfCartItems: number;
  cartId?: string;
  data: CartData;
}

export interface WishlistResponse {
  status: string;
  count?: number;
  message?: string;
  data: Product[];
}

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
}

export interface AddressItem {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface AddressResponse {
  status: string;
  message?: string;
  data: AddressItem[];
}

export interface OrderItem {
  count: number;
  _id: string;
  product: Product;
  price: number;
}

export interface Order {
  _id: string;
  id?: number;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: string;
  isPaid: boolean;
  isDelivered: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  cartItems: OrderItem[];
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}
