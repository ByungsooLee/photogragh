import { useRef, useEffect, ReactNode } from 'react';
import styled from 'styled-components';

interface FocusTrapProps {
  children: ReactNode;
  isActive: boolean;
}

export const FocusTrap = ({ children, isActive }: FocusTrapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = containerRef.current?.querySelectorAll<HTMLElement>(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements?.length) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
  
  return <div ref={containerRef}>{children}</div>;
};

interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export const SkipLink = ({ 
  targetId = 'main-content',
  label = 'メインコンテンツへスキップ'
}: SkipLinkProps) => (
  <StyledSkipLink href={`#${targetId}`}>
    {label}
  </StyledSkipLink>
);

const StyledSkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1001;
  transition: top 0.2s ease-in-out;
  
  &:focus {
    top: 0;
  }
`;

// スクリーンリーダー用のテキスト
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// キーボードフォーカスインジケーター
export const FocusOutline = styled.div`
  &:focus-visible {
    outline: 2px solid #007AFF;
    outline-offset: 2px;
  }
`;

// アクセシビリティラベル
interface A11yLabelProps {
  id: string;
  label: string;
  children: ReactNode;
}

export const A11yLabel = ({ id, label, children }: A11yLabelProps) => (
  <div>
    <VisuallyHidden id={id}>{label}</VisuallyHidden>
    <div aria-labelledby={id}>{children}</div>
  </div>
); 