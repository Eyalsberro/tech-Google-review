'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { User, FileText, Camera, Check, X, Pencil, Loader2 } from 'lucide-react';
import { getReviewsByTechnician, togglePaid, updateReview } from '@/actions/reviews';
import { TECHNICIANS, COMPANIES, REVIEW_TYPES } from '@/lib/constants';
import type { Review } from '@/lib/types';

export default function TechnicianReport() {
  const [selectedTech, setSelectedTech] = useState<string>(TECHNICIANS[0]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({
    technician: '',
    review_date: '',
    address: '',
    customer_name: '',
    company: '',
    review_type: '',
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setLoading(true);
    getReviewsByTechnician(selectedTech).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, [selectedTech]);

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      technician: review.technician,
      review_date: review.review_date,
      address: review.address,
      customer_name: review.customer_name || '',
      company: review.company,
      review_type: review.review_type,
    });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    setSaving(true);
    setEditError('');

    const result = await updateReview(editingReview.id, {
      ...editForm,
      customer_name: editForm.customer_name || null,
    });

    if (result.success) {
      const amount = REVIEW_TYPES[editForm.review_type as keyof typeof REVIEW_TYPES].amount;
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? {
                ...r,
                technician: editForm.technician as Review['technician'],
                review_date: editForm.review_date,
                address: editForm.address,
                customer_name: editForm.customer_name || null,
                company: editForm.company as Review['company'],
                review_type: editForm.review_type as Review['review_type'],
                amount,
              }
            : r
        )
      );
      setEditingReview(null);
    } else {
      setEditError(result.message);
    }
    setSaving(false);
  };

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
                  <th className="text-center py-2 px-2 font-medium text-gray-500"></th>
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
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => openEdit(r)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit review"
                      >
                        <Pencil className="w-4 h-4" />
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
                    <button
                      onClick={() => openEdit(r)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit review"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Edit Review</h3>
              <button
                onClick={() => setEditingReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <select
                  value={editForm.technician}
                  onChange={(e) => setEditForm({ ...editForm, technician: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TECHNICIANS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editForm.review_date}
                  onChange={(e) => setEditForm({ ...editForm, review_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editForm.customer_name}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {COMPANIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(REVIEW_TYPES) as Array<keyof typeof REVIEW_TYPES>).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                        editForm.review_type === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="edit_review_type"
                        value={type}
                        checked={editForm.review_type === type}
                        onChange={(e) => setEditForm({ ...editForm, review_type: e.target.value })}
                        className="accent-blue-600"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{REVIEW_TYPES[type].label}</div>
                        <div className="text-xs text-green-600 font-semibold">${REVIEW_TYPES[type].amount}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {editError && (
              <p className="text-sm text-red-600">{editError}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingReview(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
