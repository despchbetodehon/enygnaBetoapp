
import React, { useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import { GetApp, Image } from '@material-ui/icons';

interface ImageDownloaderProps {
  imageUrl: string;
  fileName?: string;
  className?: string;
}

export const ImageDownloader: React.FC<ImageDownloaderProps> = ({ 
  imageUrl, 
  fileName = "imagen.png",
  className = ""
}) => {
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async () => {
    setDownloading(true);

    try {
      // Método 1: Usar servidor proxy interno
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(fileName)}`;

      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      } catch (proxyError) {
        console.warn('Proxy download falhou:', proxyError);
      }

      // Método 2: Canvas com diferentes configurações de CORS
      const corsConfigs = ['anonymous', 'use-credentials', undefined];

      for (const corsConfig of corsConfigs) {
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new window.Image();
            if (corsConfig) image.crossOrigin = corsConfig;

            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imageUrl;
          });

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context não disponível');

          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 'image/png');

          return; // Sucesso, sair do loop
        } catch (canvasError) {
          console.warn(`Canvas com CORS ${corsConfig} falhou:`, canvasError);
        }
      }

      // Método 3: Fallback - abrir em nova aba
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (error) {
      console.error('Erro no download:', error);
      alert('Não foi possível baixar a imagem. Tente novamente ou use o botão direito do mouse para salvar.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={downloadImage}
      disabled={downloading}
      startIcon={downloading ? <CircularProgress size={16} /> : <GetApp />}
      className={className}
      variant="outlined"
      size="small"
    >
      {downloading ? 'Baixando...' : 'PNG'}
    </Button>
  );
};

export default ImageDownloader;