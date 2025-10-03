import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw new Error('An unexpected error occurred');
    }
  }
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  createdAt: Date;
}

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    const { data } = await axios.get(`${API_URL}/products`);
    return data;
  }

  static async createProduct(product: Omit<Product, '_id' | 'createdAt'>): Promise<Product> {
    const { data } = await axios.post(`${API_URL}/products`, product);
    return data;
  }

  static async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data } = await axios.put(`${API_URL}/products/${id}`, product);
    return data;
  }

  static async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_URL}/products/${id}`);
  }
}

export interface OrderProduct {
  product: string;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string;
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

export class OrderService {
  static async createOrder(userId: string, products: Array<{ productId: string, quantity: number }>): Promise<Order> {
    const { data } = await axios.post(`${API_URL}/orders`, {
      userId,
      products,
    });
    return data;
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    const { data } = await axios.get(`${API_URL}/orders/user/${userId}`);
    return data;
  }

  static async getAllOrders(): Promise<Order[]> {
    const { data } = await axios.get(`${API_URL}/orders`);
    return data;
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const { data } = await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
    return data;
  }
}