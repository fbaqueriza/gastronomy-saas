import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

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

  const handleViewComprobante = () => {
    if (!comprobante?.url) return;
    
    // Usar la función onView que maneja data URLs correctamente
    onView();
  };

  // Si hay comprobante, mostrar botón que usa onView
  if (comprobante) {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleViewComprobante}
          className="inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-400"
        >
          <Upload className="h-4 w-4 mr-1" /> Ver comprobante
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-2 inline-flex items-center px-4 py-2 rounded-md text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500"
        >
          Reemplazar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // Si no hay comprobante, mostrar solo el botón de cargar
  return (
    <div className="relative inline-block">
      <button
        className="px-4 py-2 rounded text-xs font-semibold w-full text-center transition bg-green-600 text-white hover:bg-green-700"
        onClick={handleButtonClick}
        type="button"
      >
        Cargar comprobante
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ComprobanteButton; 