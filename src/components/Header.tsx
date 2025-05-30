'use client';

interface HeaderProps {
  speed: number;
  showSpeedIndicator: boolean;
}

export default function Header({ speed, showSpeedIndicator }: HeaderProps) {
  return (
    <header className="site-header">
      <h1 className="site-title">Film Gallery</h1>
      <nav className="site-nav">
        <a href="#" className="nav-link">Gallery</a>
        <a href="#" className="nav-link">About</a>
        <a href="#" className="nav-link">Contact</a>
      </nav>
      <div className={`speed-indicator ${showSpeedIndicator ? 'visible' : ''}`}>
        速度: {speed.toFixed(1)}x
      </div>
    </header>
  );
} 