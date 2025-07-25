import React, { useRef, useState } from 'react';

interface ComprobanteButtonProps {
  comprobante: { url: string; name: string } | null;
  onUpload: (file: File) => void;
  onView: () => void;
}

const ComprobanteButton: React.FC<ComprobanteButtonProps> = ({ comprobante, onUpload, onView }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleButtonClick = () => {
    if (!comprobante) {
      fileInputRef.current?.click();
    } else {
      setMenuOpen((open) => !open);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      setMenuOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        className={`px-4 py-2 rounded text-xs font-semibold w-full text-center transition bg-green-600 text-white hover:bg-green-700`}
        onClick={handleButtonClick}
        type="button"
      >
        Ver / Cargar comprobante
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />
             {comprobante && menuOpen && (
         <div className="absolute right-0 w-44 bg-white border border-gray-200 rounded shadow-lg z-[9999]" style={{ top: 'auto', bottom: '100%', marginBottom: '0.5rem' }}>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setMenuOpen(false);
              onView();
            }}
          >
            Ver comprobante
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              setMenuOpen(false);
              fileInputRef.current?.click();
            }}
          >
            Reemplazar comprobante
          </button>
        </div>
      )}
    </div>
  );
};

export default ComprobanteButton; 