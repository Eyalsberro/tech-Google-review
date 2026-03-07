'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { User, FileText, Camera, Check, X } from 'lucide-react';
import { getReviewsByTechnician, togglePaid } from '@/actions/reviews';
import { TECHNICIANS } from '@/lib/constants';
import { REVIEW_TYPES } from '@/lib/constants';
import type { Review } from '@/lib/types';

export default function TechnicianReport() {
  const [selectedTech, setSelectedTech] = useState<string>(TECHNICIANS[0]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getReviewsByTechnician(selectedTech).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, [selectedTech]);

  const handleTogglePaid = async (reviewId: number, currentPaid: boolean) => {
    const newPaid = !currentPaid;
    const success = await togglePaid(reviewId, newPaid);
    if (success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, paid: newPaid } : r))
      );
    }
  };

  const totalAmount = reviews.reduce((sum, r) => sum + Number(r.amount), 0);
  const paidAmount = reviews.filter((r) => r.paid).reduce((sum, r) => sum + Number(r.amount), 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Technician Report
      </h3>

      {/* Technician filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {TECHNICIANS.map((tech) => (
          <button
            key={tech}
            onClick={() => setSelectedTech(tech)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTech === tech
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-sm font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-xs text-green-600">Paid</div>
          <div className="text-sm font-bold text-green-700">${paidAmount.toFixed(2)}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <div className="text-xs text-red-500">Unpaid</div>
          <div className="text-sm font-bold text-red-600">${unpaidAmount.toFixed(2)}</div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No reviews for {selectedTech}.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Address</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Type</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-500">Amount</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Company</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500">Paid</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-600">
                      {format(new Date(r.review_date + 'T00:00:00'), 'MMM d, yyyy')}
                    </td>
                    <td className="py-2 px-2 text-gray-600">{r.customer_name || '—'}</td>
                    <td className="py-2 px-2 text-gray-600 max-w-[180px] truncate">{r.address}</td>
                    <td className="py-2 px-2">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        {r.review_type === 'review_pic' ? (
                          <Camera className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        {REVIEW_TYPES[r.review_type].label}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-green-600">
                      ${Number(r.amount).toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                        {r.company}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleTogglePaid(r.id, r.paid)}
                        className={`w-6 h-6 rounded-md border-2 inline-flex items-center justify-center transition-colors ${
                          r.paid
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 text-transparent hover:border-gray-400'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {r.customer_name && (
                      <div className="text-sm font-medium text-gray-900">{r.customer_name}</div>
                    )}
                    <div className="text-sm text-gray-600">{r.address}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{format(new Date(r.review_date + 'T00:00:00'), 'MMM d, yyyy')}</span>
                      <span>{r.company}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">${Number(r.amount).toFixed(2)}</span>
                    <button
                      onClick={() => handleTogglePaid(r.id, r.paid)}
                      className={`w-6 h-6 rounded-md border-2 inline-flex items-center justify-center transition-colors ${
                        r.paid
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 text-transparent hover:border-gray-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
