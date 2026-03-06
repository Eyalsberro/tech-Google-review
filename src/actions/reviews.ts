'use server';

import { revalidatePath } from 'next/cache';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import pool from '@/lib/db';
import { REVIEW_TYPES, TECHNICIANS, COMPANIES } from '@/lib/constants';
import type { Review, WeeklyReportRow, EarningsData, FormState } from '@/lib/types';
import type { RowDataPacket } from 'mysql2';

export async function createReview(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const technician = formData.get('technician') as string;
  const reviewDate = formData.get('review_date') as string;
  const address = formData.get('address') as string;
  const reviewType = formData.get('review_type') as string;
  const company = formData.get('company') as string;
  const customerName = (formData.get('customer_name') as string) || null;

  if (!technician || !TECHNICIANS.includes(technician as typeof TECHNICIANS[number])) {
    return { success: false, message: 'Please select a valid technician.' };
  }
  if (!reviewDate) {
    return { success: false, message: 'Please select a date.' };
  }
  if (!address || address.trim().length === 0) {
    return { success: false, message: 'Please enter an address.' };
  }
  if (!reviewType || !(reviewType in REVIEW_TYPES)) {
    return { success: false, message: 'Please select a review type.' };
  }
  if (!company || !COMPANIES.includes(company as typeof COMPANIES[number])) {
    return { success: false, message: 'Please select a company.' };
  }

  const amount = REVIEW_TYPES[reviewType as keyof typeof REVIEW_TYPES].amount;

  try {
    await pool.execute(
      `INSERT INTO reviews (technician, review_date, address, review_type, amount, company, customer_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [technician, reviewDate, address.trim(), reviewType, amount, company, customerName?.trim() || null]
    );

    revalidatePath('/');
    return { success: true, message: 'Review added successfully!' };
  } catch (error) {
    console.error('Failed to create review:', error);
    return { success: false, message: 'Failed to save review. Please try again.' };
  }
}

export async function getRecentReviews(limit: number = 10): Promise<Review[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, technician, DATE_FORMAT(review_date, '%Y-%m-%d') as review_date,
              address, review_type, amount, company, customer_name, paid, created_at
       FROM reviews
       ORDER BY review_date DESC, created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows as Review[];
  } catch (error) {
    console.error('Failed to fetch recent reviews:', error);
    return [];
  }
}

export async function getReviewsByTechnician(technician: string): Promise<Review[]> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, technician, DATE_FORMAT(review_date, '%Y-%m-%d') as review_date,
              address, review_type, amount, company, customer_name, paid, created_at
       FROM reviews
       WHERE technician = ?
       ORDER BY review_date DESC, created_at DESC`,
      [technician]
    );
    return rows as Review[];
  } catch (error) {
    console.error('Failed to fetch reviews by technician:', error);
    return [];
  }
}

export async function togglePaid(reviewId: number, paid: boolean): Promise<boolean> {
  try {
    await pool.execute(
      `UPDATE reviews SET paid = ? WHERE id = ?`,
      [paid, reviewId]
    );
    revalidatePath('/');
    return true;
  } catch (error) {
    console.error('Failed to toggle paid status:', error);
    return false;
  }
}

export async function getWeeklyReport(weekStartDate: string): Promise<WeeklyReportRow[]> {
  const weekStart = startOfWeek(new Date(weekStartDate + 'T00:00:00'), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(weekStartDate + 'T00:00:00'), { weekStartsOn: 1 });

  const startStr = format(weekStart, 'yyyy-MM-dd');
  const endStr = format(weekEnd, 'yyyy-MM-dd');

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT technician,
              SUM(CASE WHEN review_type = 'review' THEN 1 ELSE 0 END) as review_count,
              SUM(CASE WHEN review_type = 'review_pic' THEN 1 ELSE 0 END) as review_pic_count,
              SUM(amount) as total_amount
       FROM reviews
       WHERE review_date BETWEEN ? AND ?
       GROUP BY technician
       ORDER BY technician`,
      [startStr, endStr]
    );
    return rows as WeeklyReportRow[];
  } catch (error) {
    console.error('Failed to fetch weekly report:', error);
    return [];
  }
}

export async function getWeekEarnings(technician: string): Promise<EarningsData> {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const startStr = format(weekStart, 'yyyy-MM-dd');
  const endStr = format(weekEnd, 'yyyy-MM-dd');

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
              COALESCE(SUM(amount), 0) as totalAmount,
              COALESCE(SUM(CASE WHEN review_type = 'review' THEN 1 ELSE 0 END), 0) as reviewCount,
              COALESCE(SUM(CASE WHEN review_type = 'review_pic' THEN 1 ELSE 0 END), 0) as reviewPicCount
       FROM reviews
       WHERE technician = ? AND review_date BETWEEN ? AND ?`,
      [technician, startStr, endStr]
    );
    const row = rows[0];
    return {
      totalAmount: Number(row?.totalAmount || 0),
      reviewCount: Number(row?.reviewCount || 0),
      reviewPicCount: Number(row?.reviewPicCount || 0),
    };
  } catch (error) {
    console.error('Failed to fetch week earnings:', error);
    return { totalAmount: 0, reviewCount: 0, reviewPicCount: 0 };
  }
}
