'use client';

import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { getWeeklyReport } from '@/actions/reviews';
import { TECHNICIANS } from '@/lib/constants';
import type { WeeklyReportRow } from '@/lib/types';
import ExportButton from './ExportButton';

export default function WeeklyReport() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [report, setReport] = useState<WeeklyReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  useEffect(() => {
    setLoading(true);
    getWeeklyReport(weekStartStr).then((data) => {
      setReport(data);
      setLoading(false);
    });
  }, [weekStartStr]);

  const prevWeek = () => setWeekStart((d) => addWeeks(d, -1));
  const nextWeek = () => setWeekStart((d) => addWeeks(d, 1));

  // Build full report with all technicians (even those with 0)
  const fullReport = TECHNICIANS.map((tech) => {
    const row = report.find((r) => r.technician === tech);
    return {
      technician: tech,
      review_count: Number(row?.review_count || 0),
      review_pic_count: Number(row?.review_pic_count || 0),
      total_amount: Number(row?.total_amount || 0),
    };
  });

  const totals = fullReport.reduce(
    (acc, r) => ({
      review_count: acc.review_count + r.review_count,
      review_pic_count: acc.review_pic_count + r.review_pic_count,
      total_amount: acc.total_amount + r.total_amount,
    }),
    { review_count: 0, review_pic_count: 0, total_amount: 0 }
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Weekly Report
      </h3>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-2">
        <button onClick={prevWeek} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-sm font-medium text-gray-700">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </div>
        <button onClick={nextWeek} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Technician</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Reviews ($15)</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Rev+Pic ($25)</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {fullReport.map((r) => (
                  <tr
                    key={r.technician}
                    className={`border-b border-gray-100 ${r.total_amount > 0 ? 'hover:bg-gray-50' : 'text-gray-400'}`}
                  >
                    <td className="py-2 px-2 font-medium">{r.technician}</td>
                    <td className="py-2 px-2 text-right">{r.review_count}</td>
                    <td className="py-2 px-2 text-right">{r.review_pic_count}</td>
                    <td className="py-2 px-2 text-right font-semibold text-green-600">
                      ${r.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-2 px-2">Total</td>
                  <td className="py-2 px-2 text-right">{totals.review_count}</td>
                  <td className="py-2 px-2 text-right">{totals.review_pic_count}</td>
                  <td className="py-2 px-2 text-right text-green-700">
                    ${totals.total_amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {fullReport
              .filter((r) => r.total_amount > 0)
              .map((r) => (
                <div key={r.technician} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <div>
                    <div className="font-medium text-gray-900">{r.technician}</div>
                    <div className="text-xs text-gray-500">
                      {r.review_count} reviews + {r.review_pic_count} rev+pic
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-600">${r.total_amount.toFixed(2)}</div>
                </div>
              ))}
            {totals.total_amount > 0 && (
              <div className="flex justify-between items-center bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="font-bold text-green-800">Total</div>
                <div className="text-lg font-bold text-green-700">${totals.total_amount.toFixed(2)}</div>
              </div>
            )}
            {totals.total_amount === 0 && (
              <p className="text-gray-400 text-center py-4">No reviews this week.</p>
            )}
          </div>
        </>
      )}

      <div className="mt-4">
        <ExportButton weekStart={weekStartStr} />
      </div>
    </div>
  );
}
