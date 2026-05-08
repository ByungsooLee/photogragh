'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --font-noto-serif-jp: 'Noto Serif JP';
    --font-bebas-neue: 'Bebas Neue';
    --font-inter: 'Inter';
    --ink: #f4efe6;
    --muted: #9e988e;
    --paper: #050506;
    --paper-soft: #f7f2e8;
    --line: rgba(247, 242, 232, 0.16);
    --gold: #c8ccd2;
    --dark-gold: #767f8a;
    --light-gold: #f8f5ef;
    --blood-red: #6f2623;
    --teal-shadow: #253d42;
    --film-black: #050506;
    --bg-dark: #050506;
    --bg-medium: #101114;
    --film-bg: #0a0b0d;
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
      radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.08), transparent 32vw),
      radial-gradient(circle at 88% 16%, rgba(93, 110, 122, 0.18), transparent 30vw),
      linear-gradient(180deg, #111216 0%, var(--paper) 58%, #020203 100%);
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    /* Foreground texture layer. pointer-events: none lets clicks pass through.
       Fullscreen modals and similar overlays should use a larger z-index. */
    z-index: 2147483646;
    pointer-events: none;
    background:
      radial-gradient(circle at center, transparent 42%, rgba(0, 0, 0, 0.44) 100%),
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.024) 0 1px, transparent 1px 5px),
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.018) 0 1px, transparent 1px 4px);
    mix-blend-mode: screen;
    opacity: 0.34;
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
