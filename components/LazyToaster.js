'use client';

import dynamic from 'next/dynamic';

const Toaster = dynamic(() => import('react-hot-toast').then(mod => ({ default: mod.Toaster })), {
  ssr: false,
  loading: () => null
});

export default function LazyToaster() {
  return <Toaster position="bottom-right" reverseOrder={false} />;
}
