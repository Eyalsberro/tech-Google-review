import { format } from 'date-fns';
import { Clock, FileText, Camera, Check } from 'lucide-react';
import { getRecentReviews } from '@/actions/reviews';
import { REVIEW_TYPES } from '@/lib/constants';

export default async function RecentReviews() {
  const reviews = await getRecentReviews(10);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Reviews
      </h3>

      {reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No reviews yet. Add your first one!</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">Tech</th>
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
                      {format(new Date(r.review_date + 'T00:00:00'), 'MMM d')}
                    </td>
                    <td className="py-2 px-2 font-medium text-gray-900">{r.technician}</td>
                    <td className="py-2 px-2 text-gray-600 max-w-[200px] truncate">{r.address}</td>
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
                      {r.paid ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-500 text-white">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md border-2 border-gray-300 text-gray-300">
                          <Check className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">{r.technician}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">${Number(r.amount).toFixed(2)}</span>
                    {r.paid ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-green-500 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded border-2 border-gray-300 text-gray-300">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">{r.address}</div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    {r.review_type === 'review_pic' ? (
                      <Camera className="w-3 h-3 text-blue-500" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    {REVIEW_TYPES[r.review_type].label}
                  </span>
                  <span>{r.company}</span>
                  <span>{format(new Date(r.review_date + 'T00:00:00'), 'MMM d')}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
