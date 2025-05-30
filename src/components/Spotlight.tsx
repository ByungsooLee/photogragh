import { useEffect, useRef } from 'react';

export function Spotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId: number | null = null;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
    };

    const animateSpotlight = () => {
      if (spotlightRef.current) {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;
        
        spotlightRef.current.style.setProperty('--x', `${currentX}%`);
        spotlightRef.current.style.setProperty('--y', `${currentY}%`);
      }
      rafId = requestAnimationFrame(animateSpotlight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId = requestAnimationFrame(animateSpotlight);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return <div ref={spotlightRef} className="spotlight" />;
} 