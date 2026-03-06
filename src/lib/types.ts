import type { Company, ReviewType, Technician } from './constants';

export interface Review {
  id: number;
  technician: Technician;
  review_date: string;
  address: string;
  review_type: ReviewType;
  amount: number;
  company: Company;
  customer_name: string | null;
  paid: boolean;
  created_at: string;
}

export interface WeeklyReportRow {
  technician: string;
  review_count: number;
  review_pic_count: number;
  total_amount: number;
}

export interface EarningsData {
  totalAmount: number;
  reviewCount: number;
  reviewPicCount: number;
}

export interface FormState {
  success: boolean;
  message: string;
}
