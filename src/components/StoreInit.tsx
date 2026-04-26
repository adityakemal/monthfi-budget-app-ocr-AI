'use client';

import { useEffect } from 'react';
import { useBudgetStore } from '@/store/budget';

export function StoreInit() {
  const { initStore } = useBudgetStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  return null;
}
