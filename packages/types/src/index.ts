export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: "USER" | "MERCHANT" | "ADMIN";
  kycStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  publicKey: string;
  chain: "stellar" | "solana";
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId?: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  type: "TRANSFER" | "REMITTANCE" | "DEPOSIT" | "WITHDRAW";
  txHash?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Remittance {
  id: string;
  senderId: string;
  receiverName: string;
  receiverPhone: string;
  amount: number;
  currency: string;
  fee: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  wallets: WalletResponse[];
}

export interface WalletResponse {
  address: string;
  balance: number;
  currency: string;
  chain: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateWalletRequest {
  chain: "stellar" | "solana";
}

export interface CreateRemittanceRequest {
  receiver_name: string;
  receiver_phone: string;
  amount: string;
  currency: string;
}

export interface AgriProduct {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  currency: string;
  location: string;
  imageUrl?: string;
  description: string;
  isOrganic: boolean;
  createdAt: string;
}

export interface TourismBooking {
  id: string;
  userId: string;
  serviceType: "hotel" | "guide" | "trek" | "transport";
  serviceName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  currency: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
}
