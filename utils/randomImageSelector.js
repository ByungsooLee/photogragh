import { useMemo } from 'react';

/**
 * Fisher-Yatesシャッフルアルゴリズムを実装した関数
 * @param {Array} array - シャッフルする配列
 * @returns {Array} - シャッフルされた配列
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 全フィルムの画像をフラット化し、重複なしでランダムに選択
 * @param {Object} filmCategories - フィルムカテゴリのオブジェクト
 * @param {number} count - 選択する画像の数（デフォルト: 12）
 * @returns {Array} - 選択された画像の配列
 */
export const useRandomFilmImages = (filmCategories, count = 12) => {
  return useMemo(() => {
    const allImages = Object.values(filmCategories).flat();
    return shuffleArray(allImages).slice(0, count);
  }, [filmCategories, count]);
};

/**
 * 単一のフィルムタイプからランダムに画像を選択する関数
 * @param {Array} images - 画像の配列
 * @param {number} count - 選択する画像の数
 * @returns {Array} - 選択された画像の配列
 */
export const selectRandomImages = (images, count) => {
  if (!images || images.length === 0) return [];
  return shuffleArray(images).slice(0, count);
}; 