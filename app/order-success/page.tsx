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
    } else {
      router.replace('/orders');
    }
  }, [id, router]);

  return <DeliveryLoadingScreen message="Loading your order confirmation..." />;
}
