import dynamic from 'next/dynamic';

// Lazy load heavy components
export const LazyParticles = dynamic(() => import('./particals'), {
  loading: () => <div className="w-full h-full bg-neutral-900" />,
  ssr: false, // Disable SSR for particles
});

export const LazyAdminDashboard = dynamic(() => import('../app/admin/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400"></div>
    </div>
  ),
});

export const LazyBookingForm = dynamic(() => import('../app/booking/[id]/components/BookingForm'), {
  loading: () => (
    <div className="animate-pulse bg-white/5 rounded-3xl p-6">
      <div className="h-6 bg-gray-700 rounded mb-4 w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded mb-2 w-1/2"></div>
      <div className="h-12 bg-gray-700 rounded mb-4"></div>
    </div>
  ),
});

export const LazyGallery = dynamic(() => import('./galery1'), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-700 rounded-xl mb-4"></div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  ),
});

// Lazy load FontAwesome icons
export const LazyFontAwesome = dynamic(() => import('@fortawesome/react-fontawesome'), {
  loading: () => <div className="w-4 h-4 bg-gray-600 rounded" />,
});

// Lazy load Framer Motion
export const LazyMotion = dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion })), {
  loading: () => <div />,
  ssr: false,
});
