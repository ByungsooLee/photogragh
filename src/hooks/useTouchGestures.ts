import { useRef, useEffect } from 'react';

interface TouchHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchStart,
  onPinchEnd
}: TouchHandlers = {}) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const initialDistance = useRef(0);
  const isPinching = useRef(false);
  
  useEffect(() => {
    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchStartX.current = touchEvent.touches[0].clientX;
      touchStartY.current = touchEvent.touches[0].clientY;
      
      // ピンチジェスチャーの検出
      if (touchEvent.touches.length === 2) {
        isPinching.current = true;
        initialDistance.current = Math.hypot(
          touchEvent.touches[0].clientX - touchEvent.touches[1].clientX,
          touchEvent.touches[0].clientY - touchEvent.touches[1].clientY
        );
        onPinchStart?.();
      }
    };
    
    const handleTouchMove = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchEndX.current = touchEvent.touches[0].clientX;
      touchEndY.current = touchEvent.touches[0].clientY;
      
      // ピンチジェスチャーの処理
      if (isPinching.current && touchEvent.touches.length === 2) {
        // ピンチの状態に応じた処理をここに追加
        // 現在は未使用のため、currentDistanceの計算を削除
      }
    };
    
    const handleTouchEnd = () => {
      const swipeDistanceX = touchStartX.current - touchEndX.current;
      const swipeDistanceY = touchStartY.current - touchEndY.current;
      const minSwipeDistance = 50;
      
      // 水平方向のスワイプ
      if (Math.abs(swipeDistanceX) > minSwipeDistance) {
        if (swipeDistanceX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
      
      // 垂直方向のスワイプ
      if (Math.abs(swipeDistanceY) > minSwipeDistance) {
        if (swipeDistanceY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
      
      // ピンチジェスチャーの終了
      if (isPinching.current) {
        isPinching.current = false;
        onPinchEnd?.();
      }
    };
    
    const element = document.querySelector('.gallery-container');
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinchStart, onPinchEnd]);
}; 