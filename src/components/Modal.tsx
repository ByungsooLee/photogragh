'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  isPortrait: boolean;
}

export default function Modal({ isOpen, onClose, imageUrl, isPortrait }: ModalProps) {
  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className={`modal-content ${isPortrait ? 'portrait' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Film Frame</div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-image-container">
          <img 
            className={`modal-image ${isPortrait ? 'portrait' : ''}`}
            src={imageUrl}
            alt="拡大画像"
          />
        </div>
        <div className="modal-footer">
          <div className="modal-caption">A moment captured in time</div>
        </div>
      </div>
    </div>
  );
} 