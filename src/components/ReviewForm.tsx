'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { FileText, Camera, Plus, DollarSign, Loader2 } from 'lucide-react';
import { createReview, getWeekEarnings } from '@/actions/reviews';
import { TECHNICIANS, COMPANIES, REVIEW_TYPES } from '@/lib/constants';
import type { EarningsData, FormState } from '@/lib/types';

const initialState: FormState = { success: false, message: '' };

export default function ReviewForm() {
  const [state, formAction, isPending] = useActionState(createReview, initialState);
  const [selectedTech, setSelectedTech] = useState('');
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (selectedTech) {
      getWeekEarnings(selectedTech).then(setEarnings);
    } else {
      setEarnings(null);
    }
  }, [selectedTech]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setSelectedTech('');
      if (selectedTech) {
        getWeekEarnings(selectedTech).then(setEarnings);
      }
    }
  }, [state]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-5">
        <Plus className="w-5 h-5 text-blue-600" />
        Add Review
      </h2>

      <form ref={formRef} action={formAction} className="space-y-4">
        {/* Technician */}
        <div>
          <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-1">
            Technician
          </label>
          <select
            id="technician"
            name="technician"
            required
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select technician...</option>
            {TECHNICIANS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="review_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="review_date"
            name="review_date"
            defaultValue={today}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            placeholder="123 Main St"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Customer Name (optional) */}
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            placeholder="John Doe"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company <span className="text-red-500">*</span>
          </label>
          <select
            id="company"
            name="company"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select company...</option>
            {COMPANIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Review Type */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Review Type
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative flex items-center gap-3 rounded-lg border border-gray-300 p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="review_type"
                value="review"
                required
                className="accent-blue-600"
              />
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{REVIEW_TYPES.review.label}</div>
                  <div className="text-sm text-green-600 font-semibold">${REVIEW_TYPES.review.amount}</div>
                </div>
              </div>
            </label>
            <label className="relative flex items-center gap-3 rounded-lg border border-gray-300 p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
              <input
                type="radio"
                name="review_type"
                value="review_pic"
                className="accent-blue-600"
              />
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{REVIEW_TYPES.review_pic.label}</div>
                  <div className="text-sm text-green-600 font-semibold">${REVIEW_TYPES.review_pic.amount}</div>
                </div>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Submit Review
            </>
          )}
        </button>

        {/* Status message */}
        {state.message && (
          <p className={`text-sm text-center ${state.success ? 'text-green-600' : 'text-red-600'}`}>
            {state.message}
          </p>
        )}
      </form>

      {/* Live Earnings */}
      {selectedTech && earnings && (
        <div className="mt-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {selectedTech}&apos;s earnings this week
            </span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            ${earnings.totalAmount.toFixed(2)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {earnings.reviewCount} review{earnings.reviewCount !== 1 ? 's' : ''} ($15)
            {' + '}
            {earnings.reviewPicCount} rev+pic{earnings.reviewPicCount !== 1 ? 's' : ''} ($25)
          </div>
        </div>
      )}
    </div>
  );
}
