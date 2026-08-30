'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function RazorpayCheckout() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscription_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    if (!subscriptionId) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: 'Seghro',
      description: 'Subscription Payment',
      handler: async () => {
        setStatus('success');
        window.location.href = '/dashboard?subscription=success';
      },
      modal: { ondismiss: () => setStatus('failed') },
      theme: { color: '#dc2626' },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [subscriptionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading payment...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-green-600 font-medium">Payment successful! Redirecting...</p>
          </div>
        )}
        {status === 'failed' && (
          <div>
            <p className="text-red-600 font-medium">Payment failed. Please try again.</p>
            <a href="/dashboard" className="text-red-600 underline mt-2 inline-block">Back to dashboard</a>
          </div>
        )}
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
