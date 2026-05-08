'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --font-noto-serif-jp: 'Noto Serif JP';
    --font-bebas-neue: 'Bebas Neue';
    --font-inter: 'Inter';
    --ink: #22170f;
    --muted: #796b55;
    --paper: #efe1bf;
    --paper-soft: #f6ebcf;
    --line: rgba(34, 23, 15, 0.22);
    --gold: #c99a34;
    --dark-gold: #8f641f;
    --blood-red: #8f271d;
    --teal-shadow: #0e5154;
    --film-black: #17120d;
    --bg-dark: #17120d;
    --bg-medium: #2b2118;
    --film-bg: #2a1c12;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body {
    width: 100%;
    min-width: 0;
    min-height: 100%;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-inter), var(--font-noto-serif-jp), serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  body {
    min-height: 100vh;
    background:
      radial-gradient(circle at 20% 0%, rgba(201, 154, 52, 0.18), transparent 34vw),
      radial-gradient(circle at 90% 18%, rgba(14, 81, 84, 0.16), transparent 28vw),
      linear-gradient(180deg, var(--paper-soft), var(--paper));
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    /* 質感用の最前面レイヤー。pointer-events: none のためクリックは下へ通る。
       フルスクリーンのモーダル等はこの値より大きい z-index を使うこと */
    z-index: 2147483646;
    pointer-events: none;
    background:
      radial-gradient(circle at center, transparent 48%, rgba(23, 18, 13, 0.18) 100%),
      repeating-linear-gradient(90deg, rgba(34, 23, 15, 0.025) 0 1px, transparent 1px 5px),
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 4px);
    mix-blend-mode: multiply;
    opacity: 0.52;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    color: inherit;
  }
`;
