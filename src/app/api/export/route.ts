import { NextRequest } from 'next/server';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import pool from '@/lib/db';
import { TECHNICIANS } from '@/lib/constants';
import type { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  const weekParam = request.nextUrl.searchParams.get('week');
  const weekDate = weekParam ? new Date(weekParam + 'T00:00:00') : new Date();
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });

  const startStr = format(weekStart, 'yyyy-MM-dd');
  const endStr = format(weekEnd, 'yyyy-MM-dd');

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT technician,
            SUM(CASE WHEN review_type = 'review' THEN 1 ELSE 0 END) as review_count,
            SUM(CASE WHEN review_type = 'review_pic' THEN 1 ELSE 0 END) as review_pic_count,
            SUM(amount) as total_amount
     FROM reviews
     WHERE review_date BETWEEN ? AND ?
     GROUP BY technician`,
    [startStr, endStr]
  );

  const reportMap = new Map(rows.map((r) => [r.technician, r]));

  let csv = `Tech Review Payroll - Week of ${format(weekStart, 'MMMM d, yyyy')}\n`;
  csv += `Technician,Reviews ($15),Rev+Pic ($25),Total Reviews,Total Amount\n`;

  let totalReviews = 0;
  let totalRevPic = 0;
  let totalAmount = 0;

  for (const tech of TECHNICIANS) {
    const row = reportMap.get(tech);
    const rc = Number(row?.review_count || 0);
    const rpc = Number(row?.review_pic_count || 0);
    const amt = Number(row?.total_amount || 0);
    totalReviews += rc;
    totalRevPic += rpc;
    totalAmount += amt;
    csv += `${tech},${rc},${rpc},${rc + rpc},$${amt.toFixed(2)}\n`;
  }

  csv += `,,,,\n`;
  csv += `TOTAL,${totalReviews},${totalRevPic},${totalReviews + totalRevPic},$${totalAmount.toFixed(2)}\n`;

  const filename = `payroll-${format(weekStart, 'yyyy-MM-dd')}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
