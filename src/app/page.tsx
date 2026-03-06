import { Suspense } from 'react';
import { ClipboardList } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import RecentReviews from '@/components/RecentReviews';
import WeeklyReport from '@/components/WeeklyReport';
import TechnicianReport from '@/components/TechnicianReport';
import TabSwitcher from '@/components/TabSwitcher';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Tech Google Review Tracker</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column - Form */}
          <div className="lg:col-span-2">
            <ReviewForm />
          </div>

          {/* Right column - History & Reports */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <TabSwitcher
                recentReviews={
                  <Suspense fallback={<p className="text-gray-400 text-center py-8">Loading...</p>}>
                    <RecentReviews />
                  </Suspense>
                }
                weeklyReport={<WeeklyReport />}
                technicianReport={<TechnicianReport />}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
