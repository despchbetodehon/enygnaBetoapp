
import React, { useState } from 'react';
import { makeStyles, Dialog, Tooltip, Button } from '@material-ui/core';
import { PictureAsPdf } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  thumbnailContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: theme.spacing(1),
  },
  thumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  pdfThumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  previewModal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    '& .MuiDialog-paper': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      maxWidth: 'none',
      maxHeight: 'none',
    },
    '& img': {
      maxWidth: '90vw',
      maxHeight: '75vh',
      objectFit: 'contain',
    },
    '& iframe': {
      border: 'none',
      width: '90vw',
      height: '85vh',
    },
  },
  actionsRow: {
    marginTop: theme.spacing(1),
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

interface ThumbnailsProps {
  files: File[];
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ files }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleOpen = (file: File) => {
    setSelectedFile(file);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
  };

  const isPdf = (file: File) => file.type === 'application/pdf';

  return (
    <>
      <div className={classes.thumbnailContainer}>
        {files.map((file, index) => (
          <div key={index}>
            {isPdf(file) ? (
              <Tooltip title="Visualizar PDF">
                <div
                  className={classes.pdfThumbnail}
                  onClick={() => handleOpen(file)}
                >
                  <PictureAsPdf style={{ color: '#d32f2f', fontSize: 30 }} />
                </div>
              </Tooltip>
            ) : (
              <img
                src={URL.createObjectURL(file)}
                alt={`Thumbnail ${index + 1}`}
                className={classes.thumbnail}
                onClick={() => handleOpen(file)}
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', e);
                }}
              />
            )}
          </div>
        ))}
      </div>

      <Dialog open={open} onClose={handleClose} className={classes.previewModal} maxWidth={false}>
        {selectedFile && (
          <>
            {isPdf(selectedFile) ? (
              <iframe 
                src={URL.createObjectURL(selectedFile)} 
                title="Visualização do PDF" 
              />
            ) : (
              <img 
                src={URL.createObjectURL(selectedFile)} 
                alt="Visualização do documento" 
              />
            )}
            <div className={classes.actionsRow}>
              <Button 
                variant="outlined" 
                onClick={handleClose}
              >
                Fechar
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default Thumbnails;
