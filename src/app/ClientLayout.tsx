'use client';

import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
      {children}
    </StyleSheetManager>
  );
} 