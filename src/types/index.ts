export type Role = "ADMIN" | "PROCUREMENT" | "VENDOR";
export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "BLACKLISTED";
export type AuctionStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: Role;
}

export interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  categories: string[];
  status: VendorStatus;
}

export interface Auction {
  id: string;
  title: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  deliveryTerms?: string;
  startTime: string;
  endTime: string;
  autoExtendMins: number;
  minDecrement: number;
  status: AuctionStatus;
  createdById: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  vendorId: string;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}
