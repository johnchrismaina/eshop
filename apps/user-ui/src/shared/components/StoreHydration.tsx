'use client';

import { useEffect } from 'react';
import { useStore } from '../../store';
// import { useStore } from '../store';

export default function StoreHydration() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  return null;
}
