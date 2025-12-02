// src/pages/beto/dashboard/thumbnails.tsx
import React, { useState } from 'react';
import { makeStyles, Dialog, Tooltip } from '@material-ui/core';
import { PictureAsPdf } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  thumbnailContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: theme.spacing(1),
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    borderRadius: '4px',
    objectFit: 'cover',
    border: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  previewModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiDialog-paper': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      maxWidth: 'none',
      maxHeight: 'none',
    },
    '& img': {
      maxWidth: '90vw',
      maxHeight: '90vh',
      objectFit: 'contain',
    },
  },
}));

interface ThumbnailsProps {
  urls: string[];
}

export const Thumbnails: React.FC<ThumbnailsProps> = ({ urls }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [saving, setSaving] = useState(false); // State to track saving process
  const [selectedIsPdf, setSelectedIsPdf] = useState(false); // State to track if selected is PDF

  const handleOpen = (url: string) => {
    setSelectedImage(url);
    setSelectedIsPdf(url.includes('.pdf'));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!selectedImage) return;
    if (selectedIsPdf) {
      alert("Conversão direta de PDF para PNG não está disponível aqui. Baixe o PDF ou converta externamente.");
      return;
    }
    setSaving(true);
    try {
      // Primeira tentativa: usar fetch para obter a imagem
      try {
        const response = await fetch(selectedImage);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = (e) => reject(e);
            image.src = objectUrl;
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas 2D context indisponível");
          ctx.drawImage(img, 0, 0);

          const pngBlob: Blob = await new Promise((resolve, reject) =>
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar PNG"))), "image/png")
          );

          const link = document.createElement('a');
          link.href = URL.createObjectURL(pngBlob);
          link.download = 'imagen.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => {
            URL.revokeObjectURL(link.href);
            URL.revokeObjectURL(objectUrl);
          }, 15000);
          return;
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (fetchErr) {
        console.warn("Tentativa com fetch falhou:", fetchErr);
        throw fetchErr;
      }
    } catch (error) {
      console.error('Erro ao baixar a imagem:', error);
      alert('Não foi possível salvar como PNG (CORS?). Tente baixar o arquivo original.');
    } finally {
      setSaving(false);
    }
  };

  if (!urls || urls.length === 0) return null;

  return (
    <>
      <div className={classes.thumbnailContainer}>
        {urls.map((url, index) => (
          <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
            {url.includes('.pdf') ? (
              <Tooltip title="Visualizar PDF" key={index}>
                <div
                  className={classes.thumbnail}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}
                  onClick={() => handleOpen(url)}
                >
                  <PictureAsPdf style={{ color: 'red', fontSize: 40 }} />
                </div>
              </Tooltip>
            ) : (
              <img
                src={url}
                alt={`Documento ${index + 1}`}
                className={classes.thumbnail}
                onClick={() => handleOpen(url)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpen(url); // Open dialog to show download options
              }}
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Salvar/Baixar"
            >
              ⬇
            </button>
          </div>
        ))}
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        className={classes.previewModal}
        maxWidth={false}
      >
        {selectedIsPdf ? (
          <iframe
            src={selectedImage}
            width="800px"
            height="600px"
            style={{ border: 'none' }}
            title="Visualização do PDF"
          />
        ) : (
          <>
            <img src={selectedImage} alt="Visualização do documento" />
            <button
              onClick={handleDownload}
              disabled={saving}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: saving ? 'not-allowed' : 'pointer',
                backgroundColor: saving ? '#cccccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {saving ? 'Salvando...' : 'Salvar como PNG'}
            </button>
          </>
        )}
      </Dialog>
    </>
  );
};