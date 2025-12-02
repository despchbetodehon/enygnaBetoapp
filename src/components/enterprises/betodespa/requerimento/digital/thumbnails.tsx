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

  const handleOpen = (url: string) => {
    setSelectedImage(url);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!urls || urls.length === 0) return null;

  return (
    <>
      <div className={classes.thumbnailContainer}>
        {urls.map((url, index) => (
          url.includes('.pdf') ? (
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
              key={index}
              src={url}
              alt={`Documento ${index + 1}`}
              className={classes.thumbnail}
              onClick={() => handleOpen(url)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
          )
        ))}
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        className={classes.previewModal}
        maxWidth={false}
      >
        {selectedImage.includes('.pdf') ? (
          <iframe 
            src={selectedImage} 
            width="800px" 
            height="600px"
            style={{ border: 'none' }}
            title="Visualização do PDF"
          />
        ) : (
          <img src={selectedImage} alt="Visualização do documento" />
        )}
      </Dialog>
    </>
  );
};