'use client';

import { useEffect } from 'react';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
}

export default function Lightbox({ imageUrl, onClose }: LightboxProps) {
  useEffect(() => {
    // Cerrar con ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={imageUrl}
        alt="Ticket"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-[#C8FF4D] transition-colors"
      >
        ×
      </button>
    </div>
  );
}
