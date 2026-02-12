'use client';

import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';

const useDeviceTracking = () => {
  console.log(
    'useDeviceTracking:',
    typeof window === 'undefined' ? 'server' : 'client'
  );

  const [deviceInfo, setDeviceInfo] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const parser = new UAParser();
    const result = parser.getResult();

    setDeviceInfo(
      `${result.device.type || 'Desktop'} - ${result.os.name} ${
        result.os.version
      } - ${result.browser.name} ${result.browser.version}`
    );
  }, []);

  return isMounted ? deviceInfo : '';
};

export default useDeviceTracking;
