/**
 * レイアウトと一致させる単一のブレークポイント定義。
 * JS の matchMedia / styled-components の @media の両方でこの値を使う。
 */
export const MOBILE_BREAKPOINT = 760;
export const TABLET_BREAKPOINT = 1100;

/** Desktop min width: TABLET_BREAKPOINT + 1（desktop は 1101px から開始） */
export const DESKTOP_MIN_WIDTH = TABLET_BREAKPOINT + 1;
