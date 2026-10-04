'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DeliveryLoadingScreen from '@/components/DeliveryLoadingScreen';

export default function OrderSuccessFallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get('id') || searchParams.get('orderId') || searchParams.get('order_id');

  useEffect(() => {
    if (id) {
      router.replace(`/order-success/${encodeURIComponent(id)}`);
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        const latest = sessionStorage.getItem('latest_completed_order') || localStorage.getItem('latest_completed_order');
        if (latest) {
          const parsed = JSON.parse(latest);
          const targetId = parsed.id || parsed._id || parsed.orderNumber;
          if (targetId) {
            router.replace(`/order-success/${encodeURIComponent(targetId)}`);
            return;
          }
        }
      } catch (e) {}
    }
    router.replace('/orders');
  }, [id, router]);

  return <DeliveryLoadingScreen message="Opening your order confirmation..." />;
}
