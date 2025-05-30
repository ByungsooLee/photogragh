'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // 速度制御の設定
    let currentSpeed = 1.0;
    const minSpeed = 0.5;
    const maxSpeed = 20.0;
    const speedStep = 0.2;
    let speedTimeout: ReturnType<typeof setTimeout>;

    // 速度表示要素
    const speedIndicator = document.querySelector('.speed-indicator');
    const speedValue = document.querySelector('.speed-value');

    // 各ストリップの基本速度を取得
    function getBaseDuration(index: number): number {
      const durations = [80, 85, 78, 82, 88, 120];
      return durations[index] || 80;
    }

    // 速度を更新する関数
    function updateSpeed(newSpeed: number): void {
      currentSpeed = Math.max(minSpeed, Math.min(maxSpeed, newSpeed));
      const strips = document.querySelectorAll('.film-strip');
      
      strips.forEach((strip, index) => {
        const baseDuration = getBaseDuration(index);
        const newDuration = baseDuration / currentSpeed;
        (strip as HTMLElement).style.animationDuration = `${newDuration}s`;
      });

      // 速度表示を更新
      if (speedValue && speedIndicator) {
        speedValue.textContent = currentSpeed.toFixed(1);
        speedIndicator.classList.add('visible');
        
        // 3秒後に速度表示を非表示
        clearTimeout(speedTimeout);
        speedTimeout = setTimeout(() => {
          speedIndicator.classList.remove('visible');
        }, 3000);
      }
    }

    // ホイールイベントの処理
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // スクロール方向に応じて速度を変更
      const delta = e.deltaY > 0 ? -speedStep : speedStep;
      updateSpeed(currentSpeed + delta);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    // 初期速度の設定
    updateSpeed(1.0);

    // フィルムフレームの生成
    function createFilmFrame(index: number): HTMLElement {
      const frame = document.createElement('div');
      frame.className = 'film-frame';
      frame.style.transform = 'translateZ(0)';
      frame.style.backfaceVisibility = 'hidden';
      frame.style.willChange = 'transform';
      frame.innerHTML = `
        <div class="film-perforations left"></div>
        <div class="film-perforations right"></div>
        <div class="film-content">
          <div class="film-photo"></div>
        </div>
      `;
      
      // クリックイベントの追加
      frame.addEventListener('click', () => {
        const modal = document.querySelector('.modal-overlay');
        const modalImage = document.querySelector('.modal-image');
        const modalTitle = document.querySelector('.modal-title');
        const modalCaption = document.querySelector('.modal-caption');
        
        if (modal && modalImage && modalTitle && modalCaption) {
          // モーダルに画像を設定
          const photo = frame.querySelector('.film-photo');
          if (photo) {
            const bg = (photo as HTMLElement).style.backgroundImage;
            if (bg && bg.startsWith('url')) {
              const imageUrl = bg.replace(/url\(['"]?(.+?)['"]?\)/, '$1');
              (modalImage as HTMLImageElement).src = imageUrl;
              modalImage.className = 'modal-image' + (frame.classList.contains('portrait') ? ' portrait' : '');
            }
          }
          
          // モーダルを表示
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
      
      // ここで縦長画像かどうかを判定してクラスを付与
      setTimeout(() => {
        const photo = frame.querySelector('.film-photo');
        if (photo) {
          const bg = (photo as HTMLElement).style.backgroundImage;
          if (bg && bg.startsWith('url')) {
            const imageUrl = bg.replace(/url\(['"]?(.+?)['"]?\)/, '$1');
            const img = new window.Image();
            img.onload = function(this: GlobalEventHandlers, ev: Event) {
              const imgElement = this as HTMLImageElement;
              if (imgElement.height > imgElement.width) {
                frame.classList.add('portrait');
              }
            };
            img.src = imageUrl;
          }
        }
      }, 0);

      return frame;
    }

    // 各ストリップにフレームを追加
    const strips = document.querySelectorAll('.film-strip');
    strips.forEach((strip, stripIndex) => {
      // 各ストリップに40個のフレームを作成
      for (let i = 0; i < 40; i++) {
        const frame = createFilmFrame(i);
        strip.appendChild(frame);
      }
      // 無限ループのために同じ数の複製を追加
      for (let i = 0; i < 40; i++) {
        const clone = createFilmFrame(i);
        clone.classList.add('clone');
        strip.appendChild(clone);
      }
    });

    // ページの可視性が変更されたときの処理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const strips = document.querySelectorAll('.film-strip');
        strips.forEach((strip) => {
          (strip as HTMLElement).style.animationPlayState = 'paused';
        });
      } else {
        const strips = document.querySelectorAll('.film-strip');
        strips.forEach((strip) => {
          (strip as HTMLElement).style.animationPlayState = 'running';
        });
      }
    });

    // スポットライト効果
    const spotlight = document.querySelector('.spotlight');
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let rafId: number | null = null;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    function animateSpotlight() {
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;
      
      if (spotlight) {
        (spotlight as HTMLElement).style.setProperty('--x', currentX + '%');
        (spotlight as HTMLElement).style.setProperty('--y', currentY + '%');
      }
      
      rafId = requestAnimationFrame(animateSpotlight);
    }
    
    // アニメーションの開始
    animateSpotlight();
    
    // ページの可視性が変更されたときの処理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      } else {
        animateSpotlight();
      }
    });
    
    // 初期回転角度を保存
    document.querySelectorAll('.film-strip-wrapper').forEach((strip, index) => {
      const rotations = ['-12deg', '8deg', '-5deg', '10deg', '-8deg'];
      if (!strip.classList.contains('vertical') && index < rotations.length) {
        (strip as HTMLElement).dataset.rotation = rotations[index];
      }
    });
    
    // ビューポート内でのアニメーション制御
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '50px 0px 50px 0px'
    };
    
    const filmObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animationPlayState = 'running';
        } else {
          (entry.target as HTMLElement).style.animationPlayState = 'paused';
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.film-strip').forEach(strip => {
      filmObserver.observe(strip);
    });
    
    // フレームのホバーエフェクト強化
    document.querySelectorAll('.film-frame').forEach((frame) => {
      frame.addEventListener('mouseenter', () => {
        (frame as HTMLElement).style.transitionDelay = '0s';
        (frame as HTMLElement).style.zIndex = '100';
      });
      
      frame.addEventListener('mouseleave', () => {
        (frame as HTMLElement).style.transitionDelay = '0.1s';
        setTimeout(() => {
          (frame as HTMLElement).style.zIndex = '';
        }, 100);
      });
    });
    
    // モーダルを閉じる処理
    const modal = document.querySelector('.modal-overlay');
    const closeButton = document.querySelector('.modal-close');
    
    function closeModal() {
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
    
    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        closeModal();
      }
    });

    // クリーンアップ
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      clearTimeout(speedTimeout);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700&family=Bebas+Neue&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        :root {
          --gold: #d4af37;
          --dark-gold: #b8941f;
          --blood-red: #8b0000;
          --bg-dark: #0a0a0a;
          --bg-medium: #1a1a1a;
          --film-bg: #151515;
        }
        
        body {
          background-color: var(--bg-dark);
          color: var(--gold);
          font-family: 'Noto Serif JP', serif;
          overflow: hidden;
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="10" fill="none" stroke="%23d4af37" stroke-width="2" opacity="0.5"/><circle cx="16" cy="16" r="3" fill="%23d4af37"/></svg>') 16 16, auto;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100vh;
        }
        
        /* グローバルアニメーション */
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
          80% { opacity: 0.95; }
        }
        
        @keyframes filmMove {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        
        /* スポットライトエフェクト */
        .spotlight {
          position: fixed;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), transparent 10%, rgba(0,0,0,0.4) 50%);
          mix-blend-mode: multiply;
        }
        
        /* フィルムノイズ効果 */
        .film-noise {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.02;
          z-index: 1000;
          background-image: 
            repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 4px);
          animation: noise 8s steps(10) infinite;
        }
        
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-2%, 2%); }
          40% { transform: translate(2%, -2%); }
          60% { transform: translate(-2%, -2%); }
          80% { transform: translate(2%, 2%); }
        }
        
        /* フィルムストリップギャラリー */
        .film-gallery {
          position: relative;
          width: 100%;
          height: 100vh;
          padding: 0;
          background: radial-gradient(ellipse at center, var(--bg-medium) 0%, var(--bg-dark) 100%);
          overflow: hidden;
        }

        .film-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
        }

        /* 交差するフィルムストリップ */
        .film-strip-wrapper {
          position: relative;
          width: 150%;
          left: -25%;
          height: auto;
          overflow: hidden;
          opacity: 0;
          animation: fadeInStrip 1s forwards;
          margin: 10px 0;
          z-index: 6;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* 縦スクロール用フィルムストリップ */
        .film-strip-wrapper.vertical {
          position: absolute;
          width: 200px;
          height: 120%;
          top: -10%;
          left: 50%;
          transform: translateX(-50%) rotate(-3deg);
          transform-origin: center center;
          margin: 0;
        }
        /* 左右の縦列用 */
        .film-strip-wrapper.vertical.left {
          left: 18%;
          transform: translateX(-50%) rotate(-7deg);
          z-index: 6;
        }
        .film-strip-wrapper.vertical.right {
          left: 82%;
          transform: translateX(-50%) rotate(7deg);
          z-index: 8;
        }

        .film-strip-wrapper.vertical .film-strip {
          flex-direction: column;
          width: 100%;
          height: 200%;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .film-strip-wrapper.vertical .film-frame {
          width: 150px;
          height: 200px;
          margin: 20px auto;
        }

        @keyframes fadeInStrip {
          to { opacity: 1; }
        }

        .film-strip-wrapper:nth-child(1) {
          transform: rotate(-12deg);
          animation-delay: 0.2s;
        }

        .film-strip-wrapper:nth-child(2) {
          transform: rotate(8deg);
          animation-delay: 0.4s;
        }

        .film-strip-wrapper:nth-child(3) {
          transform: rotate(-5deg);
          animation-delay: 0.6s;
          z-index: 4;
        }

        .film-strip-wrapper:nth-child(4) {
          transform: rotate(10deg);
          animation-delay: 0.8s;
        }

        .film-strip-wrapper:nth-child(5) {
          transform: rotate(-8deg);
          animation-delay: 1s;
        }

        /* 縦スクロールフィルムの配置 */
        .film-strip-wrapper.vertical {
          z-index: 5;
          box-shadow: 
            0 0 50px rgba(0, 0, 0, 0.8),
            0 0 30px rgba(212, 175, 55, 0.1);
        }

        /* 縦フィルムの強調効果 */
        .film-strip-wrapper.vertical::before,
        .film-strip-wrapper.vertical::after {
          background: linear-gradient(180deg, var(--bg-dark) 0%, transparent 20%, transparent 80%, var(--bg-dark) 100%);
        }

        .film-strip {
          display: flex;
          height: 100%;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          transform-style: preserve-3d;
          animation-timing-function: linear;
        }

        /* 横スクロール用アニメーション */
        @keyframes scrollHorizontal {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-25%, 0, 0);
          }
        }

        /* 縦スクロール用アニメーション */
        @keyframes scrollVertical {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -25%, 0);
          }
        }

        .film-strip-wrapper:nth-child(1) .film-strip {
          animation: scrollHorizontal 80s infinite linear;
        }

        .film-strip-wrapper:nth-child(2) .film-strip {
          animation: scrollHorizontal 85s infinite linear reverse;
        }

        .film-strip-wrapper:nth-child(3) .film-strip {
          animation: scrollHorizontal 78s infinite linear;
        }

        .film-strip-wrapper:nth-child(4) .film-strip {
          animation: scrollHorizontal 82s infinite linear reverse;
        }

        .film-strip-wrapper:nth-child(5) .film-strip {
          animation: scrollHorizontal 88s infinite linear;
        }

        .film-strip-wrapper.vertical .film-strip {
          animation: scrollVertical 120s infinite linear;
        }
        
        .film-frame {
          flex-shrink: 0;
          width: 200px;
          height: 140px;
          margin: 0 15px;
          background: var(--film-bg);
          border: 2px solid #222;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 5px 20px rgba(0,0,0,0.5),
            inset 0 0 15px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: transform;
          cursor: pointer;
        }
        
        /* 縦長画像用フレーム */
        .film-frame.portrait {
          width: 140px;
          height: 200px;
        }
        .film-strip-wrapper.vertical .film-frame.portrait {
          width: 120px;
          height: 180px;
        }
        @media (max-width: 768px) {
          .film-frame {
            width: 120px;
            height: 80px;
            margin: 0 8px;
          }
          
          .film-strip-wrapper.vertical {
            width: 120px;
          }
          
          .film-strip-wrapper.vertical .film-frame {
            width: 100px;
            height: 140px;
            margin: 10px auto;
          }

          .film-strip-wrapper.vertical.left {
            left: 15%;
            transform: translateX(-50%) rotate(-5deg);
          }

          .film-strip-wrapper.vertical.right {
            left: 85%;
            transform: translateX(-50%) rotate(5deg);
          }
          
          .film-perforations {
            width: 12px;
          }

          .modal-content {
            width: 95%;
            height: 80vh;
          }

          .modal-content.portrait {
            width: 80%;
            height: 85vh;
          }
        }
        
        @media (max-width: 480px) {
          .film-frame {
            width: 90px;
            height: 60px;
            margin: 0 5px;
          }
          
          .film-strip-wrapper.vertical {
            width: 90px;
          }
          
          .film-strip-wrapper.vertical .film-frame {
            width: 70px;
            height: 100px;
            margin: 8px auto;
          }

          .film-strip-wrapper.vertical.left {
            left: 12%;
            transform: translateX(-50%) rotate(-3deg);
          }

          .film-strip-wrapper.vertical.right {
            left: 88%;
            transform: translateX(-50%) rotate(3deg);
          }

          .film-perforations {
            width: 10px;
          }

          .modal-content {
            width: 98%;
            height: 75vh;
          }

          .modal-content.portrait {
            width: 90%;
            height: 80vh;
          }
        }
        
        .film-frame:hover {
          transform: scale(1.05) translateZ(30px);
          box-shadow: 
            0 10px 30px rgba(212, 175, 55, 0.3),
            0 5px 20px rgba(0,0,0,0.7),
            inset 0 0 20px rgba(212, 175, 55, 0.1);
          z-index: 10;
          border-color: var(--dark-gold);
        }
        
        /* フィルムの穴 */
        .film-perforations {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 18px;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 10px,
            #0a0a0a 10px,
            #0a0a0a 18px
          );
          z-index: 2;
        }
        
        .film-perforations.left {
          left: 0;
          border-right: 1px solid #333;
        }
        
        .film-perforations.right {
          right: 0;
          border-left: 1px solid #333;
        }
        
        .film-content {
          position: absolute;
          inset: 0;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(34,34,34,0.8) 0%, rgba(17,17,17,0.8) 100%);
        }
        
        .film-photo {
          width: 100%;
          height: 100%;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect fill="%23333" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23d4af37" font-size="20" font-family="serif" opacity="0.5">PHOTO</text></svg>') center/cover;
          border-radius: 5px;
          filter: sepia(20%) contrast(1.1);
          transition: filter 0.3s ease;
        }
        
        .film-frame:hover .film-photo {
          filter: sepia(0%) contrast(1.2) brightness(1.1);
        }
        
        /* 複製フレーム（無限ループ用） */
        .film-frame.clone {
          background: var(--film-bg);
          opacity: 0.99;
        }
        
        /* ホバー時のアニメーション一時停止 */
        .film-strip-wrapper:hover .film-strip {
          animation-play-state: paused;
        }

        /* モーダルスタイル */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .modal-overlay.active {
          display: flex;
          opacity: 1;
        }

        .modal-content {
          position: relative;
          width: 90%;
          max-width: 1400px;
          height: 85vh;
          background: var(--film-bg);
          border: 3px solid var(--gold);
          border-radius: 4px;
          overflow: hidden;
          transform: scale(0.8);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 0 50px rgba(212, 175, 55, 0.3),
            0 0 100px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
        }

        .modal-content.portrait {
          width: 60%;
          max-width: 800px;
          height: 90vh;
        }

        .modal-overlay.active .modal-content {
          transform: scale(1);
        }

        .modal-header {
          padding: 20px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
          color: var(--gold);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          letter-spacing: 2px;
          border-bottom: 1px solid var(--gold);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
        }

        .modal-title {
          text-transform: uppercase;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .modal-close {
          width: 40px;
          height: 40px;
          background: var(--gold);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bg-dark);
          font-size: 24px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .modal-overlay.active .modal-close {
          opacity: 1;
          transform: scale(1);
        }

        .modal-close:hover {
          background: var(--dark-gold);
          transform: scale(1.1);
        }

        .modal-image-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: sepia(20%) contrast(1.1);
          transition: all 0.3s ease;
        }

        .modal-image.portrait {
          max-width: 80%;
          max-height: 90%;
        }

        .modal-image::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(0,0,0,0.2) 0%,
            transparent 20%,
            transparent 80%,
            rgba(0,0,0,0.2) 100%
          );
          pointer-events: none;
        }

        .modal-footer {
          padding: 20px;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          color: var(--gold);
          font-family: 'Noto Serif JP', serif;
          font-size: 16px;
          border-top: 1px solid var(--gold);
          text-align: center;
          z-index: 2;
        }

        .modal-caption {
          font-style: italic;
          opacity: 0.8;
        }

        /* フィルムフレームのクリック可能なスタイル */
        .film-frame::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .film-frame:hover::after {
          opacity: 1;
        }

        /* 速度表示用のスタイル */
        .speed-indicator {
          color: var(--gold);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
          border: 1px solid var(--gold);
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.8);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .speed-indicator.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .speed-indicator {
            font-size: 14px;
            padding: 6px 12px;
          }
        }

        @media (max-width: 480px) {
          .speed-indicator {
            font-size: 12px;
            padding: 4px 8px;
          }
        }

        /* ヘッダーとフッターのスタイル */
        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 20px;
          background: linear-gradient(to bottom, rgba(10, 10, 10, 0.95), transparent);
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(5px);
        }

        .site-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .site-nav {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          color: var(--gold);
          text-decoration: none;
          font-family: 'Noto Serif JP', serif;
          font-size: 16px;
          padding: 8px 16px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          border-color: var(--gold);
          background: rgba(212, 175, 55, 0.1);
        }

        .site-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 20px;
          background: linear-gradient(to top, rgba(10, 10, 10, 0.95), transparent);
          z-index: 1000;
          text-align: center;
          backdrop-filter: blur(5px);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-text {
          color: var(--gold);
          font-family: 'Noto Serif JP', serif;
          font-size: 14px;
          opacity: 0.8;
        }

        .social-links {
          display: flex;
          gap: 15px;
        }

        .social-link {
          color: var(--gold);
          text-decoration: none;
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          color: var(--dark-gold);
          transform: scale(1.1);
        }

        /* フィルムギャラリーの位置調整 */
        .film-gallery {
          padding-top: 80px;
          padding-bottom: 80px;
        }

        /* レスポンシブ対応の追加 */
        @media (max-width: 768px) {
          .site-header {
            padding: 15px;
          }

          .site-title {
            font-size: 24px;
          }

          .site-nav {
            gap: 10px;
          }

          .nav-link {
            font-size: 14px;
            padding: 6px 12px;
          }

          .site-footer {
            padding: 15px;
          }

          .footer-text {
            font-size: 12px;
          }

          .social-links {
            gap: 10px;
          }

          .social-link {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .site-header {
            padding: 10px;
          }

          .site-title {
            font-size: 20px;
          }

          .site-nav {
            display: none;
          }

          .site-footer {
            padding: 10px;
          }

          .footer-content {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      {/* ヘッダー */}
      <header className="site-header">
        <h1 className="site-title">Film Gallery</h1>
        <nav className="site-nav">
          <a href="#" className="nav-link">Gallery</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Contact</a>
        </nav>
        <div className="speed-indicator">
          速度: <span className="speed-value">1.0</span>x
        </div>
      </header>
      
      <div className="spotlight"></div>
      <div className="film-noise"></div>
      
      {/* モーダルオーバーレイ */}
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">Film Frame</div>
            <button className="modal-close">&times;</button>
          </div>
          <div className="modal-image-container">
            <img 
              className="modal-image" 
              src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect fill='%23333' width='300' height='200'/><text x='150' y='100' text-anchor='middle' fill='%23d4af37' font-size='20' font-family='serif' opacity='0.5'>PHOTO</text></svg>" 
              alt="拡大画像" 
            />
          </div>
          <div className="modal-footer">
            <div className="modal-caption">A moment captured in time</div>
          </div>
        </div>
      </div>
      
      <section className="film-gallery">
        <div className="film-container">
          {/* 横スクロール フィルムストリップ */}
          <div className="film-strip-wrapper">
            <div className="film-strip" id="strip1">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
          
          <div className="film-strip-wrapper">
            <div className="film-strip" id="strip2">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
          
          <div className="film-strip-wrapper">
            <div className="film-strip" id="strip3">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
          
          <div className="film-strip-wrapper">
            <div className="film-strip" id="strip4">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
          
          <div className="film-strip-wrapper">
            <div className="film-strip" id="strip5">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
          
          {/* 縦スクロール フィルムストリップ */}
          <div className="film-strip-wrapper vertical left">
            <div className="film-strip" id="vstripL">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
          <div className="film-strip-wrapper vertical">
            <div className="film-strip" id="vstrip1">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
          <div className="film-strip-wrapper vertical right">
            <div className="film-strip" id="vstripR">
              {/* フレームは JavaScript で生成 */}
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-text">
            © 2024 Film Gallery. All rights reserved.
          </div>
          <div className="social-links">
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">Facebook</a>
          </div>
        </div>
      </footer>
    </>
  );
}
