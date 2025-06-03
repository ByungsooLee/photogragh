'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --gold: #d4af37;
    --dark-gold: #b8941f;
    --blood-red: #8b0000;
    --bg-dark: #0a0a0a;
    --bg-medium: #1a1a1a;
    --film-bg: #151515;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #__next, main {
    width: 100vw;
    min-width: 0;
    height: 100vh;
    min-height: 100vh;
    background-color: var(--bg-dark);
    color: var(--gold);
    font-family: 'Noto Serif JP', serif;
    margin: 0;
    padding: 0;
    overflow: hidden !important;
    touch-action: none !important;
    overscroll-behavior: none !important;
  }

  body {
    position: fixed;
    inset: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`; 