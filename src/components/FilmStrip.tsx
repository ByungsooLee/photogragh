'use client';

interface FilmStripProps {
  id: string;
  isVertical?: boolean;
  position?: 'left' | 'center' | 'right';
  baseDuration: number;
  isReversed?: boolean;
}

export default function FilmStrip({ id, isVertical, position, baseDuration, isReversed }: FilmStripProps) {
  const wrapperClass = `film-strip-wrapper ${isVertical ? 'vertical' : ''} ${position || ''}`;
  const stripClass = `film-strip ${isReversed ? 'reversed' : ''}`;
  const style = {
    animationDuration: `${baseDuration}s`,
    animationDirection: isReversed ? 'reverse' : 'normal'
  };

  return (
    <div className={wrapperClass}>
      <div className={stripClass} id={id} style={style}>
        {/* フレームは JavaScript で生成 */}
      </div>
    </div>
  );
} 