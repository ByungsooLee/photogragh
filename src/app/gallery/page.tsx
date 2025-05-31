'use client';

import styled from 'styled-components';
import { useState, useEffect, useRef, useCallback } from 'react';
import FilmStrip from '@/components/FilmStrip';
import Header from '@/components/Header';
import { getPhotos, type Photo as MicroCMSPhoto } from '@/lib/microcms';
import Modal from '@/components/Modal';
import React from 'react';
import { CustomSelect } from '@/components/CustomSelect';

// カテゴリーの型定義
type Category = 'all' | 'camp' | 'outdoor' | 'still-life' | 'cooking' | 'portrait' | 'landscape' | 'overseas' | 'bath' | 'person';

// 写真データの型定義
interface Photo extends MicroCMSPhoto {
  category: Category;
  date: string;
}

// スタイル定義
const GalleryContainer = styled.div`
  min-height: 100vh;
  padding-top: 80px;
  background: var(--bg-dark);
  position: relative;
  padding-left: 40px;
  padding-right: 40px;
  @media (max-width: 1024px) {
    padding-left: 0;
    padding-right: 0;
    padding-top: 200px;
  }
  @media (max-width: 600px) {
    padding-left: 0;
    padding-right: 0;
    padding-top: 200px;
  }
`;

const FilterContainer = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  @media (max-width: 1024px) {
    flex-direction: row;
    gap: 1rem;
    padding: 0.5rem 1rem;
    align-items: center;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
  min-width: 0;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.2rem;
    align-items: stretch;
    width: 100%;
  }
`;

const FilterLabel = styled.span`
  color: var(--dark-gold);
  font-size: 0.9rem;
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--dark-gold);
  color: var(--dark-gold);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
  }

  &:focus {
    outline: none;
    border-color: var(--gold);
  }

  @media (max-width: 600px) {
    font-size: 0.95rem;
    padding: 0.3rem 0.5rem;
    width: 100%;
    min-width: 0;
  }
`;

const FilmContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  @media (max-width: 1024px) {
    padding: 0;
    gap: 1rem;
  }
`;

// フィルムストリップ全体
const FilmStripRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: #111;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 4px #000;
  min-height: 320px;
  padding: 32px 0;
  overflow-x: visible;

  @media (max-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    max-width: 100vw;
    width: 100vw;
    margin: 0;
    min-height: 220px;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    background: none;
    overflow-x: hidden;
  }
  @media (max-width: 600px) {
    gap: 0;
    min-height: 160px;
    padding: 0;
  }
`;
// 上下黒帯
const FilmStripBand = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 32px;
  background: #000;
  z-index: 2;
`;
const FilmStripBandTop = styled(FilmStripBand)`
  top: 0;
  border-radius: 16px 16px 0 0;
  @media (max-width: 1024px) {
    display: none;
  }
`;
const FilmStripBandBottom = styled(FilmStripBand)`
  bottom: 0;
  border-radius: 0 0 16px 16px;
  @media (max-width: 1024px) {
    display: none;
  }
`;
// 穴（パーフォレーション）
const FilmStripHoles = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  z-index: 3;
  pointer-events: none;
`;
const FilmStripHolesTop = styled(FilmStripHoles)`
  top: 6px;
  @media (max-width: 1024px) {
    display: none;
  }
`;
const FilmStripHolesBottom = styled(FilmStripHoles)`
  bottom: 6px;
  @media (max-width: 1024px) {
    display: none;
  }
`;
const FilmHole = styled.div`
  width: 24px;
  height: 14px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px #0004;
`;
// 画像間の仕切り線
const FilmDivider = styled.div`
  width: 6px;
  background: #000;
  margin: 0 0px;
  z-index: 2;
  @media (max-width: 600px) {
    display: none;
  }
`;

// 画像のfilter強化
const GalleryImage = styled.img<{ $isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  opacity: ${props => props.$isLoaded ? 1 : 0};
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1);
  filter: sepia(12%) contrast(1.08) brightness(1.08) saturate(1.1);
`;

const Caption = styled.div`
  width: 100%;
  padding: 1.2rem 0.5rem 0.7rem 0.5rem;
  text-align: center;
  color: #fff;
  font-family: 'Bebas Neue', 'Noto Serif JP', serif;
  font-size: 1.25rem;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 8px #000, 0 0 2px #b8941f;
  background: linear-gradient(0deg, rgba(10,10,10,0.85) 60%, transparent 100%);
  border-radius: 0 0 12px 12px;
`;

// フィルム風モーダル
const FilmModalFrame = styled.div`
  position: relative;
  background: #111;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 4px #000;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 320px;
  min-height: 320px;
  aspect-ratio: 4/3;
  margin: 0 auto;
`;
const FilmModalBand = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 32px;
  background: #000;
  z-index: 2;
`;
const FilmModalBandTop = styled(FilmModalBand)`
  top: 0;
  border-radius: 16px 16px 0 0;
`;
const FilmModalBandBottom = styled(FilmModalBand)`
  bottom: 0;
  border-radius: 0 0 16px 16px;
`;
const FilmModalHoles = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  z-index: 3;
  pointer-events: none;
`;
const FilmModalHolesTop = styled(FilmModalHoles)`
  top: 6px;
`;
const FilmModalHolesBottom = styled(FilmModalHoles)`
  bottom: 6px;
`;
const FilmModalHole = styled.div`
  width: 24px;
  height: 14px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 2px #0004;
`;
const ModalArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.6);
  border: none;
  color: #fff;
  font-size: 2.5rem;
  z-index: 10;
  cursor: pointer;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover { background: #d4af37; color: #111; }
`;
const ModalArrowLeft = styled(ModalArrow)`
  left: -60px;
`;
const ModalArrowRight = styled(ModalArrow)`
  right: -60px;
`;

// モーダル用: 前後画像のサムネイル
const ModalSideThumb = styled.img<{
  $side: 'left' | 'right';
}>`
  position: absolute;
  top: 50%;
  ${props => props.$side === 'left' ? 'left: 12px;' : 'right: 12px;'}
  transform: translateY(-50%) scale(0.7);
  width: 30%;
  height: 70%;
  object-fit: cover;
  opacity: 0.5;
  filter: blur(1.5px) grayscale(30%);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  cursor: pointer;
  z-index: 7;
  transition: opacity 0.2s, filter 0.2s;
  &:hover {
    opacity: 0.8;
    filter: blur(0.5px) grayscale(10%);
  }
  @media (max-width: 1024px) {
    width: 28%;
    height: 60%;
    ${props => props.$side === 'left' ? 'left: 4px;' : 'right: 4px;'}
  }
  @media (max-width: 600px) {
    width: 32%;
    height: 50%;
    ${props => props.$side === 'left' ? 'left: 2px;' : 'right: 2px;'}
  }
`;

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalCaption, setModalCaption] = useState('');
  const [modalSourcePosition, setModalSourcePosition] = useState<{ x: number; y: number } | undefined>();
  const [isLoadedArr, setIsLoadedArr] = useState<boolean[]>([]);
  const [currentModalIndex, setCurrentModalIndex] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const PHOTOS_PER_PAGE = 12;

  // microCMSから画像を取得
  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const { photos: fetched, totalCount } = await getPhotos({ limit: PHOTOS_PER_PAGE, offset: 0 });
        // 仮のロジック: 取得した順にportrait, bath, personを割り振る
        const categories: Category[] = ['portrait', 'bath', 'person'];
        const withMeta = fetched.map((p, i) => ({
          ...p,
          category: categories[i % categories.length],
          date: '2024-03-01'
        }));
        setPhotos(withMeta);
        setFilteredPhotos(withMeta);
        setTotalCount(totalCount);
      } catch (e) {
        setPhotos([]);
        setFilteredPhotos([]);
        setTotalCount(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    let filtered = photos;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(photo => photo.category === selectedCategory);
    }
    if (selectedDate !== 'all') {
      filtered = filtered.filter(photo => photo.date.startsWith(selectedDate));
    }
    setFilteredPhotos(filtered);
  }, [selectedCategory, selectedDate, photos]);

  useEffect(() => {
    setIsLoadedArr(Array(filteredPhotos.length).fill(false));
  }, [filteredPhotos.length]);

  // カテゴリーの一覧
  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'portrait', label: 'ポートレート' },
    { value: 'bath', label: 'バス' },
    { value: 'person', label: '人物' }
  ];

  // 日付の一覧（実際のデータから生成）
  const dates = [
    { value: 'all', label: 'すべて' },
    { value: '2024-03', label: '2024年3月' },
    { value: '2024-02', label: '2024年2月' },
    // 他の日付を追加
  ];

  const handlePhotoClick = (e: React.MouseEvent, photo: Photo, idx: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setModalImage(photo.url);
    setModalTitle(photo.title);
    setModalCaption(photo.caption || '');
    setModalSourcePosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    setCurrentModalIndex(idx);
    setIsModalOpen(true);
  };

  // 無限スクロール: 追加取得
  const fetchMorePhotos = useCallback(async () => {
    if (isFetchingMore) return;
    if (photos.length >= (totalCount || 0)) return;
    setIsFetchingMore(true);
    try {
      const { photos: morePhotos } = await getPhotos({ limit: PHOTOS_PER_PAGE, offset: photos.length });
      // 仮のロジック: 取得した順にportrait, bath, personを割り振る
      const categories: Category[] = ['portrait', 'bath', 'person'];
      const withMeta = morePhotos.map((p, i) => ({
        ...p,
        category: categories[(photos.length + i) % categories.length],
        date: '2024-03-01'
      }));
      setPhotos(prev => [...prev, ...withMeta]);
      setFilteredPhotos(prev => [...prev, ...withMeta]);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, photos.length, totalCount, PHOTOS_PER_PAGE]);

  // IntersectionObserverで下端検知
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePhotos();
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [fetchMorePhotos]);

  return (
    <>
      <Header />
      <GalleryContainer>
        <FilterContainer>
          <FilterGroup>
            <CustomSelect
              options={categories}
              value={selectedCategory}
              onChange={v => setSelectedCategory(v as Category)}
              label="カテゴリー:"
            />
          </FilterGroup>

          <FilterGroup>
            <CustomSelect
              options={dates}
              value={selectedDate}
              onChange={v => setSelectedDate(v)}
              label="撮影日:"
            />
          </FilterGroup>
        </FilterContainer>

        <FilmContainer>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              <FilmStripBandTop />
              <FilmStripBandBottom />
              <FilmStripHolesTop>
                {Array.from({ length: filteredPhotos.length * 2 + 1 }).map((_, i) => <FilmHole key={i} />)}
              </FilmStripHolesTop>
              <FilmStripHolesBottom>
                {Array.from({ length: filteredPhotos.length * 2 + 1 }).map((_, i) => <FilmHole key={i} />)}
              </FilmStripHolesBottom>
              <FilmStripRow>
                {filteredPhotos.map((photo, idx) => {
                  // PCのみ仕切り線を出力
                  if (typeof window !== 'undefined' && window.innerWidth > 1024 && idx !== 0) {
                    return [
                      <FilmDivider key={`divider-${photo.id}-divider`} />,
                      <div
                        key={`frame-${photo.id}`}
                        onClick={e => handlePhotoClick(e, photo, idx)}
                        tabIndex={0}
                        role="button"
                        aria-label={`拡大表示: ${photo.title}`}
                        style={{
                          cursor: 'pointer',
                          position: 'relative',
                          boxSizing: 'border-box',
                        }}
                      >
                        <GalleryImage
                          src={photo.url}
                          alt={photo.title}
                          $isLoaded={isLoadedArr[idx]}
                          loading="lazy"
                          onLoad={() => {
                            setIsLoadedArr(prev => {
                              const next = [...prev];
                              next[idx] = true;
                              return next;
                            });
                          }}
                          style={{
                            width: '100%',
                            aspectRatio: '2/3',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            boxShadow: '0 2px 16px rgba(0,0,0,0.18)'
                          }}
                        />
                        <Caption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4 }}>{photo.title}</Caption>
                      </div>
                    ];
                  }
                  // タブレット・SPは画像だけ
                  return (
                    <div
                      key={`frame-${photo.id}`}
                      onClick={e => handlePhotoClick(e, photo, idx)}
                      tabIndex={0}
                      role="button"
                      aria-label={`拡大表示: ${photo.title}`}
                      style={{
                        cursor: 'pointer',
                        position: 'relative',
                        boxSizing: 'border-box',
                      }}
                    >
                      <GalleryImage
                        src={photo.url}
                        alt={photo.title}
                        $isLoaded={isLoadedArr[idx]}
                        loading="lazy"
                        onLoad={() => {
                          setIsLoadedArr(prev => {
                            const next = [...prev];
                            next[idx] = true;
                            return next;
                          });
                        }}
                        style={{
                          width: '100%',
                          aspectRatio: '2/3',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          boxShadow: '0 2px 16px rgba(0,0,0,0.18)'
                        }}
                      />
                      <Caption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4 }}>{photo.title}</Caption>
                    </div>
                  );
                })}
              </FilmStripRow>
              {/* 無限スクロール用ローダー */}
              <div ref={loaderRef} style={{ height: 32 }} />
              {isFetchingMore && <div style={{ textAlign: 'center', color: '#d4af37', margin: 8 }}>Loading...</div>}
              {photos.length >= (totalCount || 0) && (
                <div style={{ textAlign: 'center', color: '#888', margin: 8, fontSize: '0.95rem' }}>すべての写真を表示しました</div>
              )}
            </div>
          )}
        </FilmContainer>
        {isModalOpen && currentModalIndex !== null && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FilmModalFrame>
              <FilmModalBandTop />
              <FilmModalBandBottom />
              <FilmModalHolesTop>
                {Array.from({ length: 9 }).map((_, i) => <FilmModalHole key={i} />)}
              </FilmModalHolesTop>
              <FilmModalHolesBottom>
                {Array.from({ length: 9 }).map((_, i) => <FilmModalHole key={i} />)}
              </FilmModalHolesBottom>
              {/* 左右サムネイル（前後画像） */}
              {currentModalIndex > 0 && (
                <ModalSideThumb
                  src={filteredPhotos[currentModalIndex - 1].url}
                  alt={filteredPhotos[currentModalIndex - 1].title}
                  $side="left"
                  onClick={() => setCurrentModalIndex(currentModalIndex - 1)}
                />
              )}
              {currentModalIndex < filteredPhotos.length - 1 && (
                <ModalSideThumb
                  src={filteredPhotos[currentModalIndex + 1].url}
                  alt={filteredPhotos[currentModalIndex + 1].title}
                  $side="right"
                  onClick={() => setCurrentModalIndex(currentModalIndex + 1)}
                />
              )}
              {currentModalIndex > 0 && (
                <ModalArrowLeft onClick={() => setCurrentModalIndex(currentModalIndex - 1)} aria-label="前の写真へ">&#8592;</ModalArrowLeft>
              )}
              {currentModalIndex < filteredPhotos.length - 1 && (
                <ModalArrowRight onClick={() => setCurrentModalIndex(currentModalIndex + 1)} aria-label="次の写真へ">&#8594;</ModalArrowRight>
              )}
              <img
                src={filteredPhotos[currentModalIndex].url}
                alt={filteredPhotos[currentModalIndex].title}
                style={{
                  width: '100%',
                  height: 'calc(100% - 64px)',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
                  zIndex: 5
                }}
              />
              <Caption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6 }}>{filteredPhotos[currentModalIndex].title}</Caption>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 24, cursor: 'pointer' }}
                aria-label="閉じる"
              >×</button>
            </FilmModalFrame>
          </div>
        )}
      </GalleryContainer>
    </>
  );
} 