'use client';

import { useEffect, useState } from 'react';

const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY_DAYS = 20;

type StoredLocation = {
  country: string;
  city: string;
  timestamp: number;
};

const getStoredLocation = (): StoredLocation | null => {
  // ✅ Guard against SSR
  if (typeof window === 'undefined') return null;

  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!storedData) return null;

  try {
    const parsedData: StoredLocation = JSON.parse(storedData);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsedData.timestamp > expiryTime;

    return isExpired ? null : parsedData;
  } catch (err) {
    console.error('Failed to parse stored location:', err);
    return null;
  }
};

const useLocationTracking = () => {
  console.log(
    'useLocationTracking:',
    typeof window === 'undefined' ? 'server' : 'client'
  );

  // ✅ Initialize with null, only read from localStorage in useEffect
  const [location, setLocation] = useState<StoredLocation | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Now safely read localStorage
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
      return;
    }

    // Fetch location if not stored
    fetch('http://ip-api.com/json/')
      .then((res) => res.json())
      .then((data) => {
        const newLocation: StoredLocation = {
          country: data?.country,
          city: data.city,
          timestamp: Date.now(),
        };

        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        setLocation(newLocation);
      })
      .catch((error) => console.log('Failed to get location', error));
  }, []);

  return location;
};

export default useLocationTracking;
