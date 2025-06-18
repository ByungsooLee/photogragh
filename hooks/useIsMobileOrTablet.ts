import { useEffect, useState } from 'react';

/**
 * SP・タブレット（max-width: 1024px）判定用フック
 */
const useIsMobileOrTablet = () => {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobileOrTablet(window.matchMedia('(max-width: 1024px)').matches);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobileOrTablet;
};

export default useIsMobileOrTablet; 