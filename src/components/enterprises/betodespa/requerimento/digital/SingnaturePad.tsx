import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Box, Typography, Paper, useTheme, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// Estilos personalizados
const useStyles = makeStyles((theme) => ({
  signatureContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: 'rgba(190, 190, 190, 0.42)',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  signatureCanvas: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.64)',
    boxShadow: theme.shadows[2],
    
    
    height: 'auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
      width: '100%',
    height: 'auto',
  },
  errorMessage: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(1),
  },
}));






interface SignaturePadProps {
  onSave: (signature: string) => void; // Callback para salvar a assinatura automaticamente
}



const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const classes = useStyles();
  const theme = useTheme();
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [error, setError] = useState<string | null>(null); // Estado para mensagens de erro
  useEffect(() => {
    const handleSaveSignature = () => {
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        onSave(signature);
      }
    };
  
    const interval = setInterval(handleSaveSignature, 2000); // Salva a cada 2 segundos
    
    return () => clearInterval(interval);
  }, [onSave]);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Define largura e altura diferentes dependendo do tamanho da tela
  const canvasWidth = isSmallScreen ? 300 : 500;
  const canvasHeight = isSmallScreen ? 150 : 200;

  // Limpa o canvas de assinatura
  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setError(null); // Limpa o erro ao limpar a assinatura
    }
  };

  
  // Salva a assinatura
  const handleSave = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        setError('Por favor, assine antes de salvar.'); 
        return;
      }
      const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      onSave(signature);
      setError(null); 
    }
  };
  

  return (
    <Paper elevation={3} className={classes.signatureContainer}>
      <Typography variant="h6" gutterBottom>
       
      </Typography>
      <SignatureCanvas
        ref={(ref) => (sigCanvas.current = ref)}
        canvasProps={{
          width: 300,
          height: 200,
          className: classes.signatureCanvas,
        }}
      />
      {error && (
        <Typography variant="body2" className={classes.errorMessage}>
          {error}
        </Typography>
      )}
      <Box className={classes.buttonGroup}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClear}
          aria-label="Limpar assinatura"
        >
          Limpar
        </Button>
        
      </Box>
    </Paper>
  );
};

export default SignaturePad;
