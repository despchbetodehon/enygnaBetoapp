
// src/components/enterprises/betodespa/transferencia/thumbnails.tsx
import React, { useState } from 'react';
import { makeStyles, Dialog, Tooltip, IconButton, DialogContent } from '@material-ui/core';
import { PictureAsPdf, Close, GetApp } from '@material-ui/icons';

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
  pdfThumbnail: {
    width: '80px',
    height: '80px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
      backgroundColor: '#e0e0e0',
    },
  },
  previewModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogPaper: {
    width: '95vw',
    height: '95vh',
    maxWidth: 'none',
    margin: 0,
  },
  dialogContent: {
    padding: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  downloadButton: {
    position: 'absolute',
    right: 56,
    top: 8,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  iframeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 0,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    },
  },
}));

interface ThumbnailsProps {
  urls: string[];
  defaultDownloadBaseName?: string;
}

// Função auxiliar para obter URL via proxy
function getProxiedUrl(firebaseUrl: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(firebaseUrl)}`;
}

// Função para fazer download do arquivo
async function handleDownload(url: string, filename: string) {
  try {
    const proxyUrl = getProxiedUrl(url);
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
  } catch (error) {
    console.error('Erro no download:', error);
    // Fallback: tentar abrir em nova aba
    window.open(url, '_blank');
  }
}

export const Thumbnails: React.FC<ThumbnailsProps> = ({ urls, defaultDownloadBaseName = 'documento' }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'pdf' | 'image' | null>(null);

  const handleOpen = (url: string, type: 'pdf' | 'image') => {
    setSelectedImage(url);
    setSelectedType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
    setSelectedType(null);
  };

  const isPdf = (url: string) => {
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf');
  };

  const getFileName = (url: string, index: number) => {
    if (isPdf(url)) {
      return `${defaultDownloadBaseName}_${index + 1}.pdf`;
    }
    return `${defaultDownloadBaseName}_${index + 1}.png`;
  };

  if (!urls || urls.length === 0) return null;

  return (
    <>
      <div className={classes.thumbnailContainer}>
        {urls.map((url, index) => {
          const isPdfFile = isPdf(url);
          
          if (isPdfFile) {
            return (
              <Tooltip title="Clique para visualizar PDF" key={index}>
                <div 
                  className={classes.pdfThumbnail}
                  onClick={() => handleOpen(url, 'pdf')}
                >
                  <PictureAsPdf style={{ color: '#d32f2f', fontSize: 40 }} />
                </div>
              </Tooltip>
            );
          }

          return (
            <Tooltip title="Clique para ampliar" key={index}>
              <img
                src={getProxiedUrl(url)}
                alt={`Documento ${index + 1}`}
                className={classes.thumbnail}
                onClick={() => handleOpen(url, 'image')}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  console.error('Erro ao carregar imagem:', url);
                }}
              />
            </Tooltip>
          );
        })}
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        className={classes.previewModal}
        maxWidth={false}
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogContent className={classes.dialogContent}>
          <IconButton
            className={classes.closeButton}
            onClick={handleClose}
            size="small"
          >
            <Close />
          </IconButton>

          {selectedImage && (
            <IconButton
              className={classes.downloadButton}
              onClick={() => {
                const index = urls.indexOf(selectedImage);
                handleDownload(selectedImage, getFileName(selectedImage, index));
              }}
              size="small"
            >
              <GetApp />
            </IconButton>
          )}

          {selectedType === 'pdf' && selectedImage ? (
            <iframe
              src={getProxiedUrl(selectedImage)}
              className={classes.iframeContainer}
              title="Visualização de PDF"
            />
          ) : selectedType === 'image' && selectedImage ? (
            <div className={classes.imageContainer}>
              <img 
                src={getProxiedUrl(selectedImage)} 
                alt="Visualização ampliada"
                onError={(e) => {
                  console.error('Erro ao carregar imagem ampliada:', selectedImage);
                  const target = e.target as HTMLImageElement;
                  target.alt = 'Erro ao carregar imagem';
                }}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};
