import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Button, Grid, Paper, Typography, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery,
  CircularProgress, Divider, Fab, Tooltip, Collapse, Card, CardContent, Box
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { PhotoCamera, Delete, Close, Crop, CloudUpload, Send, HelpOutline, ExpandMore, ExpandLess, Edit, PictureAsPdf } from '@material-ui/icons';
import Cropper from 'react-easy-crop';
import SignaturePad from './SingnaturePad';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Firestore, Timestamp } from 'firebase/firestore';
import { storage } from '@/logic/firebase/config/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCroppedImg } from './cropUtils';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { converterParaSGDW } from '@/util/converterParaSGDW';
import { addDoc, collection ,setDoc, doc } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginTop: theme.spacing(-6),
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%)',
    padding: theme.spacing(1),
    color: 'Black',
    fontFamily: '"Playfair Display", "Crimson Text", "Libre Baskerville", "Georgia", serif',
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.5),
      marginTop: theme.spacing(-4),
    },
  },
  formContainer: {
    display: 'flex',
    marginTop: theme.spacing(-1),
    flexDirection: 'column',
    gap: theme.spacing(1),
    background: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    maxWidth: '100%',
    color: 'Black',
    margin: '0 auto',
    padding: theme.spacing(1),
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(45, 90, 61, 0.1)',
    overflowX: 'hidden',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      gap: theme.spacing(1),
      borderRadius: '12px',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.75),
      gap: theme.spacing(0.75),
      borderRadius: '8px',
    },
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    alignItems: 'center',
    color: 'Black',
    padding: theme.spacing(1),
    borderRadius: '16px',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.5),
    },
  },
  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    color: 'Black',
    objectFit: 'cover',
    border: '3px solid rgba(45, 90, 61, 0.2)',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      width: '50px',
      height: '50px',
    },
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    fontSize: '1.4rem',
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.9rem',
    },
  },
  compactSection: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: theme.spacing(1),
    color: 'Black',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.5),
      borderRadius: '8px',
    },
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 200,
    color: 'Black',
    marginBottom: theme.spacing(1.5),
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    '& span': {
      fontSize: '1.2rem',
      fontWeight: 200,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
      marginBottom: theme.spacing(1),
      '& span': {
        fontSize: '1rem',
      },
    },
  },
  uploadButton: {
    borderRadius: '8px',
    padding: theme.spacing(1.5),
    fontWeight: 600,
    textTransform: 'none',
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    boxShadow: '0 2px 8px rgba(45, 90, 61, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(45, 90, 61, 0.4)',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1),
      fontSize: '0.8rem',
    },
  },
  manualButton: {
    borderRadius: '8px',
    padding: theme.spacing(1),
    fontWeight: 500,
    color: 'Black',
    textTransform: 'none',
    border: '1px solid #2d5a3d',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'rgba(45, 90, 61, 0.05)',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.5),
      fontSize: '0.75rem',
    },
  },
  thumbnailContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
  },
  thumbnail: {
    position: 'relative',
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    flexShrink: 0,
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    [theme.breakpoints.down('xs')]: {
      width: '50px',
      height: '50px',
    },
  },
  deleteButton: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#ff1744',
    color: 'white',
    width: '20px',
    height: '20px',
    '&:hover': {
      backgroundColor: '#d50000',
    },
  },
  textField: {
    marginBottom: theme.spacing(1),
    width: '100%',
    maxWidth: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2d5a3d',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2d5a3d',
      },
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '1rem',
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.875rem',
      },
    },
  },
  submitButton: {
    padding: theme.spacing(1),
    fontSize: '1.1rem',
    fontWeight: 700,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    color: '#fff',
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(45, 90, 61, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(45, 90, 61, 0.4)',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1.5),
      fontSize: '1rem',
    },
  },
  servicesContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginBottom: theme.spacing(1),
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
  },
  serviceButton: {
    borderRadius: '20px',
    padding: theme.spacing(0.5, 0.3),
    fontWeight: 400,
    textTransform: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0.5, 1.5),
      fontSize: '0.8rem',
    },
  },
  serviceSelected: {
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    color: '#fff',
  },
  serviceUnselected: {
    border: '1px solid #2d5a3d',
    color: '#2d5a3d',
    backgroundColor: 'transparent',
  },
  expandableContent: {
    marginTop: theme.spacing(-1),
  },
  signatureContainer: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: theme.spacing(2),
    textAlign: 'center',
    border: '2px dashed #2d5a3d',
    marginTop: theme.spacing(1),
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1),
      borderRadius: '8px',
    },
  },
  processingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: '#2d5a3d',
    fontSize: '0.9rem',
    marginTop: theme.spacing(1),
  },
  dialogContent: {
    position: 'relative',
    height: '65vh',
    backgroundColor: '#0A1A2F',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    [theme.breakpoints.down('sm')]: {
      height: '55vh',
    },
    [theme.breakpoints.down('xs')]: {
      height: '50vh',
      borderRadius: '12px',
    },
  },
  cropControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2.5),
    display: 'flex',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)',
    zIndex: 1,
  },
  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  paper: {
    padding: theme.spacing(4),
    margin: 'auto',
    maxWidth: '1077px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ccc',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
    '@media print': {
      boxShadow: 'none',
      margin: '0',
      padding: '10px',
      width: '100%',
      fontSize: '20pt',
      boxSizing: 'border-box',
      pageBreakBefore: 'auto',
    },
  },
  header2: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    fontSize: '1.0rem',
    fontWeight: 'bold',
  },
  title1: {
    fontSize: '1.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title2: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '0.8rem',
    marginTop: theme.spacing(1),
    fontWeight: 'bold',
  },
  sectionTitle2: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    background: 'rgba(124, 124, 124, 0.58)',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    textAlign: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: theme.spacing(1),
  },
  sectionTitle3: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(2),
    borderBottom: '1px solid #ccc',
    paddingBottom: theme.spacing(0),
  },
  sectionTitle4: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
    borderBottom: '1px solid #ccc',
    paddingBottom: theme.spacing(0),
  },
  field: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(0),
    paddingLeft: '10px',
    background: 'rgba(201, 201, 201, 0.58)',
  },
  field3: {
    fontSize: '0.7rem',
    marginBottom: theme.spacing(1),
  },
  field2: {
    fontSize: '1.3rem',
    marginBottom: theme.spacing(1),
  },
  signatureSection: {
    marginTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  signatureBlock: {
    textAlign: 'center',
    width: 'auto',
    borderTop: '2px solid #000',
    paddingTop: theme.spacing(0),
    margin: '0 auto',
  },
  tutorialDialog: {
    borderRadius: '20px',
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    maxWidth: '500px',
  },
  tutorialTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#2d5a3d',
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    fontFamily: '"Playfair Display", serif',
  },
  tutorialContent: {
    fontSize: '1rem',
    color: '#333',
    lineHeight: 1.8,
    marginBottom: theme.spacing(3),
    whiteSpace: 'pre-line',
  },
  tutorialActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
  },
  tutorialButton: {
    borderRadius: '25px',
    padding: theme.spacing(1, 3),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
  },
  skipButton: {
    border: '2px solid #2d5a3d',
    color: '#2d5a3d',
    '&:hover': {
      backgroundColor: 'rgba(45, 90, 61, 0.1)',
    },
  },
  nextButton: {
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, #4a7c59 0%, #2d5a3d 100%)',
    },
  },
  fabTutorial: {
    position: 'fixed',
    top: theme.spacing(3),
    right: theme.spacing(3),
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    color: '#fff',
    zIndex: 1000,
    '&:hover': {
      background: 'linear-gradient(135deg, #4a7c59 0%, #2d5a3d 100%)',
      transform: 'scale(1.1)',
    },
  },
  sectionTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitleText: {
    flex: 1,
    fontFamily: '"Playfair Display", serif',
    fontWeight: 200,
    fontSize: '1.2rem',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
  },
  sectionIconsContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
}));

interface Item {
  id: string;
  cliente: string;
  status: string;
  quantidade: number;
  imagemUrls: string[];
  concluido: boolean;
  placa: string;
  renavam: string;
  crv: string;
  valordevenda: string;
  nomevendedor: string;
  cpfvendedor: string;
  enderecovendedor: string;
  complementovendedor: string;
  municipiovendedor: string;
  emailvendedor: string;
  bairrocomprador: string;
  nomecomprador: string;
  cpfcomprador: string;
  enderecocomprador: string;
  complementocomprador: string;
  municipiocomprador: string;
  emailcomprador: string;
  celtelcomprador: string;
  cepvendedor: string;
  cepcomprador: string;
  tipo: string;
  cnpjempresa: string;
  nomeempresa: string;
  dataCriacao: Timestamp;
  celtelvendedor: string;
  signature: string;
  chassi?: string;
  modelo?: string;
  produtosSelecionados?: string;
  docUuid?: string;
}

// Componente para seção compacta
const CompactSection: React.FC<{
  title: string;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManualEdit: () => void;
  processingImage: boolean;
  classes: any;
  manualExpanded: boolean;
  children?: React.ReactNode;
  uploadLabel?: string;
  setCameraOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showCameraIcon?: boolean;
}> = ({ 
  title, 
  files, 
  setFiles, 
  onFileChange, 
  onManualEdit, 
  processingImage, 
  classes, 
  manualExpanded, 
  children, 
  uploadLabel, 
  setCameraOpen,
  showCameraIcon = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.border = '2px dashed #2d5a3d';
    e.currentTarget.style.backgroundColor = 'rgba(45, 90, 61, 0.05)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.border = '';
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.border = '';
    e.currentTarget.style.backgroundColor = '';

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      setFiles(prev => [...prev, ...droppedFiles]);

      if (droppedFiles.length > 0) {
        const syntheticEvent = {
          target: {
            files: e.dataTransfer.files
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onFileChange(syntheticEvent);
      }
    }
  };

  return (
    <div 
      className={classes.compactSection}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ transition: 'all 0.2s ease' }}
    >
      <div className={classes.sectionTitleContainer}>
        <span className={classes.sectionTitleText}>
          {title}
        </span>
        <div className={classes.sectionIconsContainer}>
          {showCameraIcon && (
            <Tooltip title="Tirar Foto">
              <IconButton
                size="small"
                onClick={() => setCameraOpen(true)}
                disabled={processingImage}
                style={{
                  backgroundColor: 'rgba(45, 90, 61, 0.1)',
                  color: '#2d5a3d',
                  width: '32px',
                  height: '32px'
                }}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Preencher Manual">
            <IconButton
              size="small"
              onClick={onManualEdit}
              style={{
                backgroundColor: 'rgba(45, 90, 61, 0.1)',
                color: '#2d5a3d',
                width: '32px',
                height: '32px'
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {processingImage && (
        <div className={classes.processingIndicator}>
          <CircularProgress size={16} />
          <Typography variant="caption">Analisando documento...</Typography>
        </div>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={files.length > 0 ? 6 : 12}>
          <input
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            id={`upload-${title.replace(/\s+/g, '-')}`}
            type="file"
            onChange={onFileChange}
            multiple
          />
          <label htmlFor={`upload-${title.replace(/\s+/g, '-')}`}>
            <Button
              variant="contained"
              component="span"
              className={classes.uploadButton}
              fullWidth
              startIcon={<CloudUpload />}
              disabled={processingImage}
            >
              {uploadLabel || (isMobile ? 'Enviar' : `Enviar ${title}`)}
            </Button>
          </label>
        </Grid>

        {files.length > 0 && (
          <Grid item xs={12} sm={6}>
            <div className={classes.thumbnailContainer}>
              {files.map((file, index) => (
                <div key={index} className={classes.thumbnail}>
                  <img src={URL.createObjectURL(file)} alt={`${title} ${index}`} />
                  <IconButton
                    className={classes.deleteButton}
                    size="small"
                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          </Grid>
        )}
      </Grid>

      <Collapse in={manualExpanded}>
        <div className={classes.expandableContent}>
          {children}
        </div>
      </Collapse>
    </div>
  );
};

const ListPost: React.FC<{ setItems: React.Dispatch<React.SetStateAction<Item[]>>, onItemEnviado?: () => void }> = ({ setItems, onItemEnviado }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  // Estados principais
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const savingRef = useRef(false);
  const uploadCacheRef = useRef(new Map<string, string>());

  // Estados dos serviços
  const [produtosSelecionados, setProdutosSelecionados] = useState<string>('');

  // Estados das seções expandidas
  const [veiculoExpanded, setVeiculoExpanded] = useState(false);
  const [vendedorExpanded, setVendedorExpanded] = useState(false);
  const [compradorExpanded, setCompradorExpanded] = useState(false);
  const [solicitanteExpanded, setSolicitanteExpanded] = useState(false);
  const [assinaturaExpanded, setAssinaturaExpanded] = useState(false);
  const [documentosExpanded, setDocumentosExpanded] = useState(false);

  // Estados do tutorial
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Estados para os arquivos de cada seção
  const [veiculoFiles, setVeiculoFiles] = useState<File[]>([]);
  const [vendedorFiles, setVendedorFiles] = useState<File[]>([]);
  const [compradorDocFiles, setCompradorDocFiles] = useState<File[]>([]);
  const [compradorEndFiles, setCompradorEndFiles] = useState<File[]>([]);
  const [compradorResidenciaFiles, setCompradorResidenciaFiles] = useState<File[]>([]);
  const [solicitanteFiles, setSolicitanteFiles] = useState<File[]>([]);

  // Estados para crop e câmera
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Verificar se é a primeira vez do usuário
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenOCRTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('hasSeenOCRTutorial', 'true');
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const handleNextTutorial = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      handleCloseTutorial();
    }
  };

  const tutorialSteps = [
    {
      title: '📸 Bem-vindo ao Preenchimento Automático!',
      content: 'Aqui você pode anexar imagens, ou PDF, e enviar fotos dos documentos e o sistema preenche automaticamente os campos para você usando Inteligência Artificial.'
    },
    {
      title: '📤 Como Funciona o Upload',
      content: 'Cada seção tem seu botão de upload. Basta anexar, ou enviar a foto do documento correspondente (CRV/CRLV para veículo, RG/CPF para comprador, etc.) e aguarde o processamento automático.'
    },
    {
      title: '✏️ Edição e Conferência',
      content: 'Após o preenchimento automático, SEMPRE confira os dados! Clique no ícone de LÁPIS (✏️) ao lado de cada seção para expandir e editar manualmente os campos.'
    },
    {
      title: '📋 Dicas Importantes',
      content: '• Tire fotos nítidas e bem iluminadas\n• Confira TODOS os dados preenchidos automaticamente\n• Use o ícone de lápis para ajustar qualquer informação\n• Preencha manualmente se a IA não reconhecer algo'
    },
    {
      title: '🎯 Você já está preparado para usar o sistema.',
      content: 'Comece enviando a foto/PDF do CRV/CRLV do veículo e deixe que a tecnologia faça o trabalho por você.'
    }
  ];

  const handleReopenTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
  };

  // Hook para consulta CPF/CNPJ
  const useCpfCnpjSearch = () => {
    const [isLoading, setIsLoading] = useState(false);

    const search = async (doc: string, target: keyof Item, setNewItem: React.Dispatch<React.SetStateAction<Item>>) => {
      let tipo = '';

      try {
        const cleaned = doc.replace(/\D/g, '');
        if (cleaned.length !== 11 && cleaned.length !== 14) return;

        setIsLoading(true);
        tipo = cleaned.length === 14 ? 'cnpj' : 'cpf';

        console.log(`Iniciando consulta de ${tipo.toUpperCase()}:`, cleaned);

        const response = await fetch(`/api/${tipo}?${tipo}=${cleaned}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Erro ${response.status} ao buscar ${tipo.toUpperCase()}: ${errorData.error || response.statusText}`
          );
        }

        const data = await response.json();

        console.log(`Resposta da consulta de ${tipo.toUpperCase()}:`, data);

        if (data.nome) {
          setNewItem(prev => ({ ...prev, [target]: data.nome }));
        } else {
          console.warn(`Nenhum nome encontrado para ${tipo.toUpperCase()} ${cleaned}`);
        }
      } catch (error) {
        console.error(`Erro na consulta de ${tipo || 'documento'}:`, {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          document: doc
        });

        if (error instanceof Error && error.message.includes('Erro 404')) {
          alert('Serviço de consulta temporariamente indisponível. Por favor, preencha o nome manualmente.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    return { search, isLoading };
  };

  const useDebounce = (callback: Function, delay: number) => {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    return (...args: any[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  const { search: searchCpfCnpj, isLoading: isLoadingSearch } = useCpfCnpjSearch();
  const debouncedSearch = useDebounce(searchCpfCnpj, 1000);

  // FUNÇÃO PARA BUSCAR ENDEREÇO POR CEP (VIA CEP)
  const fetchAddressFromCEP = async (cep: string, fieldType: 'comprador' | 'vendedor') => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) {
        console.log('CEP inválido:', cepLimpo);
        return;
      }

      console.log(`Buscando endereço para CEP ${cepLimpo} (${fieldType})`);

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();

      if (data.erro) {
        console.warn('CEP não encontrado:', cepLimpo);
        return;
      }

      console.log('Dados retornados do ViaCEP:', data);

      setNewItem(prev => {
        const updated = { ...prev };

        if (fieldType === 'comprador') {
          updated.enderecocomprador = data.logradouro || '';
          updated.bairrocomprador = data.bairro || '';
          updated.municipiocomprador = data.localidade || '';
          updated.complementocomprador = data.uf || '';
        } else if (fieldType === 'vendedor') {
          updated.enderecovendedor = data.logradouro || '';
          updated.municipiovendedor = data.localidade || '';
        }

        console.log('Campos atualizados com ViaCEP:', {
          endereco: fieldType === 'comprador' ? updated.enderecocomprador : updated.enderecovendedor,
          bairro: fieldType === 'comprador' ? updated.bairrocomprador : 'N/A para vendedor',
          municipio: fieldType === 'comprador' ? updated.municipiocomprador : updated.municipiovendedor,
          estado: fieldType === 'comprador' ? updated.complementocomprador : 'N/A para vendedor'
        });

        return updated;
      });

    } catch (error) {
      console.error('Erro ao buscar CEP no ViaCEP:', error);
    }
  };

  // Camera handling
  useEffect(() => {
    if (cameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [cameraOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert("Não foi possível acessar a câmera. Por favor, verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFiles(prev => [...prev, file]);
          setCameraOpen(false);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const openCropDialog = (index: number) => {
    const file = files[index];
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCurrentImageIndex(index);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const cropImage = async () => {
    try {
      if (!imageToCrop || currentImageIndex === null || !croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const blob = await fetch(croppedImage).then(r => r.blob());
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });

      setFiles(prev => prev.map((f, i) => i === currentImageIndex ? file : f));
      setCropOpen(false);
    } catch (e) {
      console.error('Erro ao cortar imagem:', e);
      alert('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
    }
  };

  const [newItem, setNewItem] = useState<Item>({
    id: '',
    cliente: '',
    status: 'Pendente',
    quantidade: 0,
    imagemUrls: [],
    concluido: false,
    placa: '',
    renavam: '',
    crv: '',
    valordevenda: '',
    nomevendedor: '',
    cpfvendedor: '',
    enderecovendedor: '',
    complementovendedor: '',
    municipiovendedor: '',
    emailvendedor: 'b3certificacao@gmail.com',
    bairrocomprador: '',
    nomecomprador: '',
    cpfcomprador: '',
    enderecocomprador: '',
    complementocomprador: '',
    municipiocomprador: '',
    emailcomprador: 'b3certificacao@gmail.com',
    celtelcomprador: '',
    cepvendedor: '',
    cepcomprador: '',
    tipo: '',
    cnpjempresa: '',
    nomeempresa: '',
    dataCriacao: Timestamp.fromDate(new Date()),
    celtelvendedor: '',
    signature: '',
  });

  // Funções helper
  const fileSig = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
  const uniqueFiles = (arr: File[]) => {
    const seen = new Set<string>();
    return arr.filter(f => {
      const k = fileSig(f);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const formatarMoedaBrasileira = (valor: string) => {
    const numeroLimpo = valor.replace(/\D/g, '');
    const numero = parseFloat(numeroLimpo) / 100;
    if (isNaN(numero)) return '';
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).replace('R$', '').trim();
  };

  const formatCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, p1, p2, p3, p4) => {
        return [p1, p2, p3].filter(Boolean).join('.') + (p4 ? `-${p4}` : '');
      });
    } else {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
        return `${p1}.${p2}.${p3}/${p4}-${p5}`;
      });
    }
  };

  const isValidCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  };

  // MODIFICAÇÃO PRINCIPAL: Função handleInputChange atualizada
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Item
  ) => {
    let { value } = e.target;

    setNewItem(prev => {
      const updated = { ...prev };

      if (field === 'placa') {
        updated.id = value.toUpperCase();
        updated[field] = value.toUpperCase();
        return updated;
      }

      if (field === 'valordevenda') {
        value = formatarMoedaBrasileira(value);
      }

      // Busca automática por CEP do Vendedor
      if (field === 'cepvendedor') {
        const cepLimpo = value.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
          setTimeout(() => fetchAddressFromCEP(cepLimpo, 'vendedor'), 500);
        }
      }

      // Busca automática por CEP do Comprador usando ViaCEP
      if (field === 'cepcomprador') {
        const cepLimpo = value.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
          setTimeout(() => fetchAddressFromCEP(cepLimpo, 'comprador'), 500);
        }
      }

      const camposCpfCnpj: (keyof Item)[] = ['cpfvendedor', 'cpfcomprador', 'cnpjempresa'];
      if (camposCpfCnpj.includes(field)) {
        const raw = value.replace(/\D/g, '');
        const formatado = formatCpfCnpj(raw);
        (updated as Record<keyof Item, any>)[field] = value;

        setTimeout(() => {
          const input = document.querySelector(`input[name="${field}"]`) as HTMLInputElement;
          if (input) input.value = formatado;
        }, 0);

        if (isValidCpfCnpj(raw)) {
          const target =
            field === 'cpfvendedor'
              ? 'nomevendedor'
              : field === 'cpfcomprador'
              ? 'nomecomprador'
              : 'nomeempresa';

          debouncedSearch(raw, target, setNewItem);
        }
      }

      (updated as Record<keyof Item, any>)[field] = value;
      return updated;
    });
  };

  // Função para processar imagens com IA
  const processImageWithAI = async (file: File, section: string) => {
    setProcessingImage(true);
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('Chave da API Gemini não configurada. Processamento de IA desabilitado.');
      setProcessingImage(false);
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      let prompt = '';
      if (section === 'veiculo') {
        prompt = `Analise este documento de veículo (CRV/CRLV) e extraia ALL possible data in JSON, INCLUDING the data of the OWNER/SELLER. Look for:

        VEHICLE DATA: plate, renavam, chassis, model, brand, year, color, fuel, category, species, sale value or IPVA.

        OWNER/SELLER DATA: full owner name, owner CPF, address if available.

        Full JSON format: {"placa": "", "renavam": "", "crv": "", "chassi": "", "modelo": "", "valordevenda": "", "ano": "", "cor": "", "marca": "", "nomeVendedor": "", "cpfVendedor": "", "enderecoVendedor": ""}`;
      } else if (section === 'vendedor') {
        prompt = `Analyze this personal document (RG/CPF/CNH) and extract ALL data in JSON. Look for: full name, CPF, RG, date of birth, address if available. Format: {"nome": "", "cpf": "", "rg": "", "endereco": "", "dataNascimento": ""}`;
      } else if (section === 'comprador_doc') {
        prompt = `Analyze this personal document (RG/CPF/CNH) or CNPJ card (Proof of Registration and Cadastral Status) and extract ALL data in JSON. If individual: name, CPF, RG, date of birth, address if available. If CNPJ card: business name, trade name, CNPJ, address, main activity, cadastral status, opening date. Specifically look for terms like "PROOF OF REGISTRATION", "REGISTRATION STATUS", "BUSINESS NAME", "TRADE NAME". Format: {"nome": "", "cpf": "", "cnpj": "", "razaoSocial": "", "nomeFantasia": "", "endereco": "", "atividadePrincipal": "", "situacao": "", "dataAbertura": "", "rg": "", "dataNascimento": "", "categoria": "", "validade": ""}`;
      } else if (section === 'comprador_end') {
        prompt = `Analyze this proof of address and extract ALL location data in JSON. Look for: full address, neighborhood, city, state, ZIP code, holder's name if available. Format: {"endereco": "", "bairro": "", "municipio": "", "cep": "", "estado": "", "nome": ""}`;
      } else if (section === 'comprador_residencia') {
        prompt = `Analyze this proof of residence (utility bill) and extract ALL data in JSON. Look for: holder's name, full address, neighborhood, city, state, ZIP code, bill type. Format: {"nome": "", "endereco": "", "bairro": "", "municipio": "", "cep": "", "estado": "", "tipoConta": ""}`;
      } else if (section === 'solicitante') {
        prompt = `Analyze this document (CPF, RG, CNH or CNPJ Card) and extract ALL data in JSON. If individual: name, CPF, RG. If legal entity (CNPJ Card): business name, trade name, CNPJ, address, main activity, cadastral status. Format: {"nome": "", "cpf": "", "cnpj": "", "razaoSocial": "", "nomeFantasia": "", "endereco": "", "atividadePrincipal": "", "situacao": ""}`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: base64 } }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            topP: 0.8,
            topK: 10
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Resposta completa da IA para seção ${section}:`, result);

        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`Texto extraído da IA:`, text);

          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const data = JSON.parse(jsonMatch[0]);
              console.log(`Dados parseados:`, data);
              fillFieldsFromAI(data, section);
            } catch (parseError) {
              console.error('Erro ao fazer parse do JSON:', parseError);
              console.log('JSON problemático:', jsonMatch[0]);

              const manualData = extractDataManually(text, section);
              if (manualData && Object.keys(manualData).length > 0) {
                fillFieldsFromAI(manualData, section);
              }
            }
          } else {
            console.warn('Nenhum JSON encontrado na resposta da IA');
            const manualData = extractDataManually(text, section);
            if (manualData && Object.keys(manualData).length > 0) {
              fillFieldsFromAI(manualData, section);
            }
          }
        }
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error(`Erro na requisição para IA: ${response.status} - ${errorText}`);

        if (response.status === 503) {
          alert('O serviço de IA está temporariamente sobrecarregado. Tente novamente em alguns minutos ou preencha manualmente.');
        } else {
          alert(`Erro ao processar imagem: ${response.status} - Verifique o console para detalhes.`);
        }
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Ocorreu um erro inesperado ao processar a imagem. Tente novamente ou preencha manualmente.');
    } finally {
      setProcessingImage(false);
    }
  };

  // Função para extrair dados manualmente quando o JSON falha
  const extractDataManually = (text: string, section: string) => {
    const data: any = {};
    const upperText = text.toUpperCase();

    try {
      if (section === 'solicitante') {
        const cnpjMatch = text.match(/CNPJ[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i);
        if (cnpjMatch) {
          data.cnpj = cnpjMatch[1].replace(/\D/g, '');
        }

        if (!data.cnpj) {
          const cpfMatch = text.match(/CPF[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i);
          if (cpfMatch) {
            data.cpf = cpfMatch[1].replace(/\D/g, '');
          }
        }

        const razaoMatch = text.match(/RAZ[AÃ]O\s+SOCIAL[:\s]*([^\n\r]{5,})/i);
        if (razaoMatch) {
          data.razaoSocial = razaoMatch[1].trim();
        }

        const fantasiaMatch = text.match(/NOME\s+FANTASIA[:\s]*([^\n\r]{3,})/i);
        if (fantasiaMatch) {
          data.nomeFantasia = fantasiaMatch[1].trim();
        }

        if (!data.razaoSocial && !data.nomeFantasia) {
          const nomeMatch = text.match(/NOME[:\s]*([^\n\r]{3,})/i);
          if (nomeMatch) {
            data.nome = nomeMatch[1].trim();
          }
        }
      }

      console.log(`Dados extraídos manualmente para ${section}:`, data);
      return data;
    } catch (error) {
      console.error('Erro na extração manual:', error);
      return {};
    }
  };

  // Função para extrair apenas CEP do endereço
  const extractCEPFromAddress = (enderecoCompleto: string) => {
    if (!enderecoCompleto) return null;

    console.log('Endereço original para extração de CEP:', enderecoCompleto);

    const cepMatch = enderecoCompleto.match(/(\d{2}\.?\d{3}-?\d{3})/);
    const cep = cepMatch ? cepMatch[1].replace(/\D/g, '') : null;

    console.log('CEP extraído:', cep);
    return cep;
  };

  // Função para buscar endereço completo por CEP usando ViaCEP
  const fetchFullAddressFromCEP = async (cep: string, fieldType: string) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) return;

      console.log(`Buscando endereço para CEP: ${cepLimpo}`);

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        console.log('Dados do ViaCEP:', data);

        setNewItem(prev => {
          const updated = { ...prev };

          if (fieldType === 'comprador') {
            updated.cepcomprador = cepLimpo;
            updated.enderecocomprador = data.logradouro || '';
            updated.bairrocomprador = data.bairro || '';
            updated.municipiocomprador = data.localidade || '';
            updated.complementocomprador = data.uf || '';
          } else if (fieldType === 'vendedor') {
            updated.cepvendedor = cepLimpo;
            updated.enderecovendedor = data.logradouro || '';
            updated.municipiovendedor = data.localidade || '';
          }

          console.log('Campos atualizados com ViaCEP:', updated);
          return updated;
        });
      } else {
        console.warn('CEP não encontrado no ViaCEP');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP no ViaCEP:', error);
    }
  };

  // Função para preencher campos (melhorada)
  const fillFieldsFromAI = (data: any, section: string) => {
    console.log(`Dados extraídos da seção ${section}:`, data);

    setNewItem(prev => {
      const updated = { ...prev };

      if (section === 'veiculo') {
        if (data.placa) {
          const placaLimpa = data.placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
          updated.id = placaLimpa;
          updated.placa = placaLimpa;
        }
        if (data.renavam) updated.renavam = data.renavam.toString().replace(/\D/g, '');
        if (data.crv) updated.crv = data.crv.toString().replace(/\D/g, '');
        if (data.chassi) updated.chassi = data.chassi.toUpperCase();
        if (data.modelo) updated.modelo = data.modelo.toUpperCase();
        if (data.valordevenda) {
          const valorLimpo = data.valordevenda.toString().replace(/\D/g, '');
          if (valorLimpo) updated.valordevenda = formatarMoedaBrasileira(valorLimpo);
        }

        if (data.nomeVendedor && !updated.nomevendedor) {
          updated.nomevendedor = data.nomeVendedor.toUpperCase();
        }
        if (data.cpfVendedor && !updated.cpfvendedor) {
          updated.cpfvendedor = data.cpfVendedor.replace(/\D/g, '');
        }
        if (data.enderecoVendedor && !updated.enderecovendedor) {
          const cep = extractCEPFromAddress(data.enderecoVendedor);
          if (cep) {
            setTimeout(() => fetchFullAddressFromCEP(cep, 'vendedor'), 500);
          }
        }
      } else if (section === 'vendedor') {
        if (data.nome) updated.nomevendedor = data.nome.toUpperCase();
        if (data.cpf) updated.cpfvendedor = data.cpf.replace(/\D/g, '');
        if (data.endereco && !updated.enderecovendedor) {
          const cep = extractCEPFromAddress(data.endereco);
          if (cep) {
            setTimeout(() => fetchFullAddressFromCEP(cep, 'vendedor'), 500);
          }
        }
      } else if (section === 'comprador_doc') {
        if (data.nome) updated.nomecomprador = data.nome.toUpperCase();
        if (data.cpf) updated.cpfcomprador = data.cpf.replace(/\D/g, '');

        if (data.cnpj) {
          updated.cpfcomprador = data.cnpj.replace(/\D/g, '');
          updated.nomecomprador = data.razaoSocial?.toUpperCase() || data.nomeFantasia?.toUpperCase() || data.nome?.toUpperCase();
          updated.cnpjempresa = data.cnpj.replace(/\D/g, '');
          updated.nomeempresa = data.razaoSocial?.toUpperCase() || data.nomeFantasia?.toUpperCase() || data.nome?.toUpperCase();

          if (data.endereco) {
            const cep = extractCEPFromAddress(data.endereco);
            if (cep) {
              setTimeout(() => fetchFullAddressFromCEP(cep, 'comprador'), 500);
            }
          }
        } else {
          if (data.endereco) {
            const cep = extractCEPFromAddress(data.endereco);
            if (cep) {
              setTimeout(() => fetchFullAddressFromCEP(cep, 'comprador'), 500);
            }
          }
        }
      } else if (section === 'comprador_end') {
        if (data.endereco) {
          const cep = extractCEPFromAddress(data.endereco);
          if (cep) {
            setTimeout(() => fetchFullAddressFromCEP(cep, 'comprador'), 500);
          }
        }

        if (data.cep && !updated.cepcomprador) {
          const cepLimpo = data.cep.replace(/\D/g, '');
          if (cepLimpo.length === 8) {
            setTimeout(() => fetchFullAddressFromCEP(cepLimpo, 'comprador'), 500);
          }
        }

        if (data.nome && !updated.nomecomprador) updated.nomecomprador = data.nome.toUpperCase();
      } else if (section === 'comprador_residencia') {
        if (data.endereco) {
          const cep = extractCEPFromAddress(data.endereco);
          if (cep) {
            setTimeout(() => fetchFullAddressFromCEP(cep, 'comprador'), 500);
          }
        }

        if (data.cep && !updated.cepcomprador) {
          const cepLimpo = data.cep.replace(/\D/g, '');
          if (cepLimpo.length === 8) {
            setTimeout(() => fetchFullAddressFromCEP(cepLimpo, 'comprador'), 500);
          }
        }

        if (data.nome && !updated.nomecomprador) updated.nomecomprador = data.nome.toUpperCase();
      } else if (section === 'solicitante') {
        if (data.cnpj) {
          updated.cnpjempresa = data.cnpj.replace(/\D/g, '');
          if (data.razaoSocial) {
            updated.nomeempresa = data.razaoSocial.toUpperCase();
          } else if (data.nome) {
            updated.nomeempresa = data.nome.toUpperCase();
          }
        } else if (data.cpf) {
          updated.cnpjempresa = data.cpf.replace(/\D/g, '');
          if (data.nome) updated.nomeempresa = data.nome.toUpperCase();
        } else if (data.nome) {
          updated.nomeempresa = data.nome.toUpperCase();
        }

        console.log(`Solicitante processado - CNPJ/CPF: ${updated.cnpjempresa}, Nome: ${updated.nomeempresa}`);
      }

      return updated;
    });
  };

  // Handlers para uploads
  const handleVeiculoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setVeiculoFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'veiculo');
    }
  };

  const handleVendedorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setVendedorFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'vendedor');
    }
  };

  const handleCompradorDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setCompradorDocFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'comprador_doc');
    }
  };

  const handleCompradorEndFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setCompradorEndFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'comprador_end');
    }
  };

  const handleCompradorResidenciaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setCompradorResidenciaFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'comprador_residencia');
    }
  };

  const handleSolicitanteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setSolicitanteFiles(prev => [...prev, ...selectedFiles]);
    if (selectedFiles.length > 0) {
      processImageWithAI(selectedFiles[0], 'solicitante');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => uniqueFiles([...prev, ...selectedFiles]));
  };

  const toggleProduto = (produto: string) => {
    setProdutosSelecionados(prev => prev === produto ? '' : produto);
  };

  const uploadFiles = async (): Promise<string[]> => {
    const allFiles = [...files, ...veiculoFiles, ...vendedorFiles, ...compradorDocFiles, ...compradorEndFiles, ...compradorResidenciaFiles, ...solicitanteFiles];
    const toUpload = uniqueFiles(allFiles);
    if (toUpload.length === 0) return [];

    setIsLoading(true);
    try {
      const uploadPromises = toUpload.map(async (file) => {
        const k = fileSig(file);
        const cached = uploadCacheRef.current.get(k);
        if (cached) return cached;

        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
        const fileName = `${timestamp}-${sanitizedName}`;
        const storageRef = ref(storage, `uploads/${fileName}`);

        const metadata = {
          contentType: file.type,
          customMetadata: {
            'originalName': file.name,
            'uploadedAt': new Date().toISOString(),
            'placa': newItem.id || 'sem-placa',
            'fileSignature': k
          }
        };

        const snap = await uploadBytes(storageRef, file, metadata);
        const url = await getDownloadURL(snap.ref);
        uploadCacheRef.current.set(k, url);
        return url;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async (): Promise<string | null> => {
    const input = document.getElementById('pdf-content');
    if (!input) return null;

    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, logging: false });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      const blob = pdf.output('blob');
      const fileName = `Requerimento_${newItem.id}_${Date.now()}.pdf`;
      const pdfRef = ref(storage, `pdfs/${fileName}`);

      await uploadBytes(pdfRef, blob);
      const pdfURL = await getDownloadURL(pdfRef);
      return pdfURL;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return null;
    }
  };

  const formatDate = (date: string | Timestamp | undefined | null) => {
    if (!date) return 'Data inválida';
    let localDate;
    if (date instanceof Timestamp) {
      localDate = date.toDate();
    } else {
      localDate = new Date(date);
    }
    if (isNaN(localDate.getTime())) return 'Data inválida';
    const offsetMs = localDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(localDate.getTime() - offsetMs - 3 * 3600000);
    return format(adjustedDate, 'dd/MM/yyyy');
  };

  const handleAddItem = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSubmitting(true);

    try {
      if (!newItem.id) {
        alert('ID do item (placa) não foi gerado corretamente. Por favor, recarregue a página.');
        savingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      if (!produtosSelecionados) {
        alert('Por favor, selecione um serviço antes de enviar.');
        savingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      if (!newItem.cnpjempresa || newItem.cnpjempresa.trim() === '') {
        alert('Por favor, preencha o CPF/CNPJ do Solicitante.');
        savingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      if (!newItem.nomeempresa || newItem.nomeempresa.trim() === '') {
        alert('Por favor, preencha o Nome do Solicitante.');
        savingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      setIsLoading(true);
      const uploadedUrls = await uploadFiles();

      const itemParaSalvar = {
        ...newItem,
        imagemUrls: uploadedUrls,
        dataCriacao: Timestamp.fromDate(new Date()),
        produtosSelecionados: produtosSelecionados,
      };

      const docUuid = uuidv4();

      console.log('Salvando documento principal:', { ...itemParaSalvar, docUuid });
      await setDoc(
        doc(db, 'Betodespachanteintrncaodevendaoficialdigital', docUuid),
        { ...itemParaSalvar, docUuid },
        { merge: true }
      );

      const jsonSGDW = converterParaSGDW(itemParaSalvar);
      console.log('📤 Dados convertidos para SGDW:', jsonSGDW);
      await addDoc(collection(db, 'OrdensDeServicoBludata'), jsonSGDW);
      console.log('✅ Documento SGDW salvo com sucesso!');

      setItems(prev => [...prev, { ...itemParaSalvar, id: newItem.id, docUuid }]);

      const pdfURL = await generatePDF();
      const numeroWhatsApp = '5548988749403';
      const servicos = produtosSelecionados || 'Nenhum serviço selecionado';
      const mensagemInicial = `Olá! Tudo certo, o requerimento foi preenchido!\n\n📌 *Placa:* ${newItem.id}\n🛠️ *Serviços:* ${servicos}\n📄 *Documento:* ${pdfURL}`;

      window.location.href = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagemInicial)}`;

      resetForm();

      setTimeout(() => {
        alert('Item adicionado com sucesso! Os dados foram salvos.');
        if (onItemEnviado) onItemEnviado();
      }, 5000);
    } catch (error) {
      console.error('Erro detalhado ao adicionar item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Ocorreu um erro ao salvar o requerimento: ${errorMessage}\n\nTente novamente.`);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
      savingRef.current = false;
    }
  };

  const resetForm = () => {
    setNewItem({
      id: '',
      cliente: '',
      status: 'Pendente',
      quantidade: 0,
      imagemUrls: [],
      concluido: false,
      placa: '',
      renavam: '',
      crv: '',
      valordevenda: '',
      nomevendedor: '',
      cpfvendedor: '',
      enderecovendedor: '',
      complementovendedor: '',
      municipiovendedor: '',
      emailvendedor: 'b3certificacao@gmail.com',
      bairrocomprador: '',
      nomecomprador: '',
      cpfcomprador: '',
      enderecocomprador: '',
      complementocomprador: '',
      municipiocomprador: '',
      emailcomprador: 'b3certificacao@gmail.com',
      celtelcomprador: '',
      cepvendedor: '',
      cepcomprador: '',
      tipo: '',
      cnpjempresa: '',
      nomeempresa: '',
      dataCriacao: Timestamp.fromDate(new Date()),
      celtelvendedor: '',
      signature: '',
    });
    setFiles([]);
    setProdutosSelecionados('');
    setVeiculoFiles([]);
    setVendedorFiles([]);
    setCompradorDocFiles([]);
    setCompradorEndFiles([]);
    setCompradorResidenciaFiles([]);
    setSolicitanteFiles([]);
    setVeiculoExpanded(false);
    setVendedorExpanded(false);
    setCompradorExpanded(false);
    setSolicitanteExpanded(false);
    setAssinaturaExpanded(false);
    setDocumentosExpanded(false);
  };

  return (
    <div className={classes.root}>
      <div className={`${classes.formContainer} ${classes.noPrint}`}>
        {/* PDF Content (hidden) */}
        <div id="pdf-content" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <Paper className={classes.paper}>
            <div className={classes.header2}>
              <Typography component="div" className={classes.title1}>Estado de Santa Catarina</Typography>
              <Typography component="div" className={classes.subtitle}>Secretaria de Estado de Segurança Pública</Typography>
              <Typography component="div" className={classes.subtitle}>Departamento Estadual de Trânsito</Typography>
              <Typography component="div" className={classes.subtitle}>Diretoria de Veículo</Typography>
            </div>

            <Typography component="div" className={classes.title2} style={{ textAlign: 'center' }}>
              Requerimento de Intenção de Venda
            </Typography>

            <Typography component="div" className={classes.sectionTitle2}>Identificação do Veículo</Typography>
            <Typography component="div" className={classes.field}><strong>Placa:</strong> {newItem.id}</Typography>
            <Typography component="div" className={classes.field}><strong>Renavam:</strong> {newItem.renavam}</Typography>
            <Typography component="div" className={classes.field}><strong>CRV:</strong> {newItem.crv}</Typography>
            <Typography component="div" className={classes.field}><strong>Valor de Venda:</strong> R$ {newItem.valordevenda}</Typography>

            <Typography component="div" className={classes.sectionTitle2}>Identificação do Vendedor</Typography>
            <Typography component="div" className={classes.field}><strong>Nome:</strong> {newItem.nomevendedor}</Typography>
            <Typography component="div" className={classes.field}><strong>CPF/CNPJ:</strong> {newItem.cpfvendedor}</Typography>
            <Typography component="div" className={classes.field}><strong>E-mail:</strong> {newItem.emailvendedor}</Typography>

            <Typography component="div" className={classes.sectionTitle2}>Identificação do Comprador</Typography>
            <Typography component="div" className={classes.field}><strong>Nome:</strong> {newItem.nomecomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>CPF/CNPJ:</strong> {newItem.cpfcomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>CEP:</strong> {newItem.cepcomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>Endereço:</strong> {newItem.enderecocomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>Bairro:</strong> {newItem.bairrocomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>Município:</strong> {newItem.municipiocomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>Estado:</strong> {newItem.complementocomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>E-mail:</strong> {newItem.emailcomprador}</Typography>
            <Typography component="div" className={classes.field}><strong>CEL/TEL:</strong> {newItem.celtelcomprador}</Typography>

            <div
              style={{
                marginBottom: 16,
                color: '#2d5a3d',
                fontSize: '1rem',
                lineHeight: 1.5,
              }}
            >
              Eu <strong>VENDEDOR</strong>, com base na Resolução do CONTRAN nº 809, de 15 de dezembro 2020,
              informo ao Departamento Estadual de Trânsito de Santa Catarina (DETRAN-SC) a,
              <strong>INTENÇÃO DE VENDA</strong> em {formatDate(newItem.dataCriacao)}, para o <strong>COMPRADOR</strong> conforme indicado acima.
            </div>

            {newItem.signature && (
              <div className={classes.signatureSection}>
                <img src={newItem.signature} alt="Assinatura do Cliente" style={{ maxWidth: '300px' }} />
              </div>
            )}

            <div className={classes.signatureSection}>
              <div className={classes.signatureBlock}>
                Assinatura do Vendedor ou Responsável
              </div>
            </div>

            <Typography component="div" className={classes.sectionTitle4}>b3certificacao@gmail.com</Typography>
            <Typography component="div" className={classes.sectionTitle3}>Documentação Básica</Typography>
            <Typography component="div" className={classes.field3}>Pessoa Física: Cópia da CNH ou RG/CPF</Typography>
            <Typography component="div" className={classes.field3}>Pessoa Jurídica: Cópia do ato constitutivo e Cartão CNPJ</Typography>
            <Typography component="div" className={classes.field3}>
              Obs: Cópia autenticada de procuração e cópia da CNH ou RG/CPF do procurador caso solicitado por terceiro.
            </Typography>
          </Paper>
        </div>

        <Paper className={classes.formContainer}>
          {/* Header */}
          <div className={classes.header}>
            <img src="/betologo.jpg" alt="Logo" className={classes.logo} />
            <Typography component="h1" variant="h4" className={classes.title}>
              Requerimento de Intenção de Venda
            </Typography>
          </div>

          {/* Serviços */}
          <div className={classes.compactSection}>
            <Typography component="h2" className={classes.sectionTitle}>Selecione os Serviços</Typography>
            <div className={classes.servicesContainer}>
              {['ATPV' ,'ATPV - ASSINATURA - COMUNICAÇÃO DE VENDA', 'ATPV - COMUNICAÇÃO DE VENDA', 'ATPV - ASSINATURA'].map((produto) => (
                <Button
                  key={produto}
                  onClick={() => toggleProduto(produto)}
                  className={`${classes.serviceButton} ${
                    produtosSelecionados === produto
                      ? classes.serviceSelected
                      : classes.serviceUnselected
                  }`}
                >
                  {produto}
                </Button>
              ))}
            </div>
          </div>

          {/* Primeira linha: Veículo e Vendedor */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CompactSection
                title="Identificação do Veículo"
                files={veiculoFiles}
                setFiles={setVeiculoFiles}
                onFileChange={handleVeiculoFileChange}
                onManualEdit={() => setVeiculoExpanded(!veiculoExpanded)}
                processingImage={processingImage}
                classes={classes}
                manualExpanded={veiculoExpanded}
                uploadLabel={isMobile ? 'CRV/CRLV' : 'Enviar CRV/CRLV'}
                setCameraOpen={setCameraOpen}
              >
                <Grid container spacing={2}>
                  {[{ label: 'Placa', value: 'id' }, { label: 'Renavam', value: 'renavam' }, { label: 'CRV', value: 'crv' }, { label: 'Valor de Venda', value: 'valordevenda' }].map((field) => (
                    <Grid item xs={12} sm={6} key={field.value}>
                      <TextField
                        name={field.value}
                        label={field.label}
                        value={newItem[field.value as keyof Item] || ''}
                        onChange={(e) => handleInputChange(e, field.value as keyof Item)}
                        fullWidth
                        variant="outlined"
                        className={classes.textField}
                        size="small"
                      />
                    </Grid>
                  ))}
                </Grid>
              </CompactSection>
            </Grid>

            <Grid item xs={12} md={6}>
              <CompactSection
                title="Identificação do Vendedor"
                files={vendedorFiles}
                setFiles={setVendedorFiles}
                onFileChange={handleVendedorFileChange}
                onManualEdit={() => setVendedorExpanded(!vendedorExpanded)}
                processingImage={processingImage}
                classes={classes}
                manualExpanded={vendedorExpanded}
                uploadLabel={isMobile ? 'RG/CNH/CPF' : 'Enviar RG/CNH/CPF'}
                setCameraOpen={setCameraOpen}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="cpfvendedor"
                      label="CPF"
                      value={formatCpfCnpj(newItem.cpfvendedor || '')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        handleInputChange({
                          ...e,
                          target: {
                            ...e.target,
                            name: 'cpfvendedor',
                            value: rawValue
                          }
                        } as any, 'cpfvendedor');
                      }}
                      fullWidth
                      variant="outlined"
                      className={classes.textField}
                      size="small"
                      error={!!newItem.cpfvendedor && !isValidCpfCnpj(newItem.cpfvendedor)}
                      helperText={!!newItem.cpfvendedor && !isValidCpfCnpj(newItem.cpfvendedor)
                        ? 'CPF inválido'
                        : ''}
                      InputProps={{
                        endAdornment: isLoadingSearch && newItem.cpfvendedor?.length === 11 ? (
                          <CircularProgress size={24} />
                        ) : null,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nome do Vendedor"
                      value={newItem.nomevendedor || ''}
                      onChange={(e) => handleInputChange(e, 'nomevendedor')}
                      fullWidth
                      variant="outlined"
                      className={classes.textField}
                      size="small"
                      helperText="Preencha manualmente se a consulta automática falhar"
                    />
                  </Grid>
                </Grid>
              </CompactSection>
            </Grid>
          </Grid>

          {/* Segunda linha: Comprador e Solicitante */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <div 
                className={classes.compactSection}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.border = '2px dashed #2d5a3d';
                  e.currentTarget.style.backgroundColor = 'rgba(45, 90, 61, 0.05)';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.border = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.border = '';
                  e.currentTarget.style.backgroundColor = '';

                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
                    setCompradorDocFiles(prev => [...prev, ...droppedFiles]);

                    if (droppedFiles.length > 0) {
                      processImageWithAI(droppedFiles[0], 'comprador_doc');
                    }
                  }
                }}
                style={{ transition: 'all 0.2s ease' }}
              >
                <div className={classes.sectionTitleContainer}>
                  <span className={classes.sectionTitleText}>
                    Identificação do Comprador
                  </span>
                  <div className={classes.sectionIconsContainer}>
                    <Tooltip title="Tirar Foto">
                      <IconButton
                        size="small"
                        onClick={() => setCameraOpen(true)}
                        disabled={processingImage}
                        style={{
                          backgroundColor: 'rgba(45, 90, 61, 0.1)',
                          color: '#2d5a3d',
                          width: '32px',
                          height: '32px'
                        }}
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preencher Manual">
                      <IconButton
                        size="small"
                        onClick={() => setCompradorExpanded(!compradorExpanded)}
                        style={{
                          backgroundColor: 'rgba(45, 90, 61, 0.1)',
                          color: '#2d5a3d',
                          width: '32px',
                          height: '32px'
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>

                {processingImage && (
                  <div className={classes.processingIndicator}>
                    <CircularProgress size={16} />
                    <Typography component="span" variant="caption">Analisando documento...</Typography>
                  </div>
                )}

                {/* Upload de Documentos do Comprador */}
                <Grid container spacing={2} style={{ marginBottom: 16 }}>
                  <Grid item xs={12} sm={6}>
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      id="comprador-doc-upload"
                      type="file"
                      onChange={handleCompradorDocFileChange}
                      multiple
                    />
                    <label htmlFor="comprador-doc-upload">
                      <Button
                        variant="contained"
                        component="span"
                        className={classes.uploadButton}
                        fullWidth
                        startIcon={<CloudUpload />}
                        disabled={processingImage}
                      >
                        {isMobile ? 'Doc. Pessoal' : 'Enviar RG/CPF/CNH'}
                      </Button>
                    </label>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      id="comprador-residencia-upload"
                      type="file"
                      onChange={handleCompradorResidenciaFileChange}
                      multiple
                    />
                    <label htmlFor="comprador-residencia-upload">
                      <Button
                        variant="contained"
                        component="span"
                        className={classes.uploadButton}
                        fullWidth
                        startIcon={<CloudUpload />}
                        disabled={processingImage}
                      >
                        {isMobile ? 'Comprovante' : 'Comprovante de Residência'}
                      </Button>
                    </label>
                  </Grid>
                </Grid>

                {/* Thumbnails dos arquivos */}
                {(compradorDocFiles.length > 0 || compradorResidenciaFiles.length > 0) && (
                  <div className={classes.thumbnailContainer}>
                    {compradorDocFiles.map((file, index) => (
                      <div key={`doc-${index}`} className={classes.thumbnail}>
                        <img src={URL.createObjectURL(file)} alt={`Doc ${index}`} />
                        <IconButton
                          className={classes.deleteButton}
                          size="small"
                          onClick={() => setCompradorDocFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    ))}
                    {compradorResidenciaFiles.map((file, index) => (
                      <div key={`res-${index}`} className={classes.thumbnail}>
                        <img src={URL.createObjectURL(file)} alt={`Residência ${index}`} />
                        <IconButton
                          className={classes.deleteButton}
                          size="small"
                          onClick={() => setCompradorResidenciaFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}

                <Collapse in={compradorExpanded}>
                  <div className={classes.expandableContent}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="cpfcomprador"
                          label="CPF/CNPJ"
                          value={formatCpfCnpj(newItem.cpfcomprador || '')}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            handleInputChange({
                              ...e,
                              target: {
                                ...e.target,
                                name: 'cpfcomprador',
                                value: rawValue
                              }
                            } as any, 'cpfcomprador');
                          }}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                          error={!!newItem.cpfcomprador && !isValidCpfCnpj(newItem.cpfcomprador)}
                          helperText={!!newItem.cpfcomprador && !isValidCpfCnpj(newItem.cpfcomprador)
                            ? 'CPF/CNPJ inválido'
                            : ''}
                          InputProps={{
                            endAdornment: isLoadingSearch && newItem.cpfcomprador?.length >= 11 ? (
                              <CircularProgress size={24} />
                            ) : null,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Nome"
                          value={newItem.nomecomprador || ''}
                          onChange={(e) => handleInputChange(e, 'nomecomprador')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                          helperText="Preencha manualmente se a consulta automática falhar"
                        />
                      </Grid>
                      {[
                        { label: 'CEL/TEL', value: 'celtelcomprador' },
                        { label: 'CEP', value: 'cepcomprador' },
                        { label: 'Endereço', value: 'enderecocomprador' },
                        { label: 'Bairro', value: 'bairrocomprador' },
                        { label: 'Município', value: 'municipiocomprador' },
                        { label: 'Estado', value: 'complementocomprador' },
                      ].map((field) => (
                        <Grid item xs={12} sm={6} key={field.value}>
                          <TextField
                            name={field.value}
                            label={field.label}
                            value={newItem[field.value as keyof Item] || ''}
                            onChange={(e) => handleInputChange(e, field.value as keyof Item)}
                            fullWidth
                            variant="outlined"
                            className={classes.textField}
                            size="small"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                </Collapse>
              </div>
            </Grid>

            <Grid item xs={12} md={6}>
              <div 
                className={classes.compactSection}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.border = '2px dashed #2d5a3d';
                  e.currentTarget.style.backgroundColor = 'rgba(45, 90, 61, 0.05)';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.border = '';
                  e.currentTarget.style.backgroundColor = '';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.style.border = '';
                  e.currentTarget.style.backgroundColor = '';

                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
                    setSolicitanteFiles(prev => [...prev, ...droppedFiles]);

                    if (droppedFiles.length > 0) {
                      processImageWithAI(droppedFiles[0], 'solicitante');
                    }
                  }
                }}
                style={{ transition: 'all 0.2s ease' }}
              >
                <div className={classes.sectionTitleContainer}>
                  <span className={classes.sectionTitleText}>
                    Solicitante
                  </span>
                  <div className={classes.sectionIconsContainer}>
                    <Tooltip title="Tirar Foto">
                      <IconButton
                        size="small"
                        onClick={() => setCameraOpen(true)}
                        disabled={processingImage}
                        style={{
                          backgroundColor: 'rgba(45, 90, 61, 0.1)',
                          color: '#2d5a3d',
                          width: '32px',
                          height: '32px'
                        }}
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preencher Manual">
                      <IconButton
                        size="small"
                        onClick={() => setSolicitanteExpanded(!solicitanteExpanded)}
                        style={{
                          backgroundColor: 'rgba(45, 90, 61, 0.1)',
                          color: '#2d5a3d',
                          width: '32px',
                          height: '32px'
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>

                {processingImage && (
                  <div className={classes.processingIndicator}>
                    <CircularProgress size={16} />
                    <Typography component="span" variant="caption">Analisando documento...</Typography>
                  </div>
                )}

                {/* Upload de Documentos do Solicitante */}
                <Grid container spacing={2} style={{ marginBottom: 16 }}>
                  <Grid item xs={12}>
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      id="solicitante-upload"
                      type="file"
                      onChange={handleSolicitanteFileChange}
                      multiple
                    />
                    <label htmlFor="solicitante-upload">
                      <Button
                        variant="contained"
                        component="span"
                        className={classes.uploadButton}
                        fullWidth
                        startIcon={<CloudUpload />}
                        disabled={processingImage}
                      >
                        {isMobile ? 'Doc. Solicitante' : 'Enviar Documento do Solicitante'}
                      </Button>
                    </label>
                  </Grid>
                </Grid>

                {/* Thumbnails dos arquivos */}
                {solicitanteFiles.length > 0 && (
                  <div className={classes.thumbnailContainer}>
                    {solicitanteFiles.map((file, index) => (
                      <div key={`sol-${index}`} className={classes.thumbnail}>
                        <img src={URL.createObjectURL(file)} alt={`Solicitante ${index}`} />
                        <IconButton
                          className={classes.deleteButton}
                          size="small"
                          onClick={() => setSolicitanteFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}

                <Collapse in={solicitanteExpanded}>
                  <div className={classes.expandableContent}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="cnpjempresa"
                          label="CPF/CNPJ *"
                          value={formatCpfCnpj(newItem.cnpjempresa || '')}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            handleInputChange({
                              ...e,
                              target: {
                                ...e.target,
                                name: 'cnpjempresa',
                                value: rawValue
                              }
                            } as any, 'cnpjempresa');
                          }}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                          required
                          error={!!newItem.cnpjempresa && !isValidCpfCnpj(newItem.cnpjempresa)}
                          helperText={!!newItem.cnpjempresa && !isValidCpfCnpj(newItem.cnpjempresa)
                            ? 'CPF/CNPJ inválido'
                            : 'Campo obrigatório'}
                          InputProps={{
                            endAdornment: isLoadingSearch && newItem.cnpjempresa?.length >= 11 ? (
                              <CircularProgress size={24} />
                            ) : null,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Nome *"
                          value={newItem.nomeempresa || ''}
                          onChange={(e) => handleInputChange(e, 'nomeempresa')}
                          fullWidth
                          variant="outlined"
                          className={classes.textField}
                          size="small"
                          required
                          helperText="Campo obrigatório - preencha manualmente se a consulta automática falhar"
                        />
                      </Grid>
                    </Grid>
                  </div>
                </Collapse>
              </div>
            </Grid>
          </Grid>

          {/* Seção Assinatura */}
          <div className={classes.compactSection}>
            <Typography component="h2" className={classes.sectionTitle}>
              Assinatura do Cliente
              <Button
                size="small"
                onClick={() => setAssinaturaExpanded(!assinaturaExpanded)}
                className={classes.manualButton}
                startIcon={assinaturaExpanded ? <ExpandLess /> : <ExpandMore />}
              >
                {assinaturaExpanded ? 'Esconder' : 'Mostrar'}
              </Button>
            </Typography>

            <Collapse in={assinaturaExpanded}>
              <div className={classes.expandableContent}>
                <div className={classes.signatureContainer}>
                  <SignaturePad onSave={(signature) => setNewItem(prev => ({ ...prev, signature }))} />
                </div>
              </div>
            </Collapse>
          </div>

          {/* Seção Documentos Adicionais */}
          <div className={classes.compactSection}>
            <Typography component="h2" className={classes.sectionTitle}>
              Documentos Adicionais (Opcional)
              <Button
                size="small"
                onClick={() => setDocumentosExpanded(!documentosExpanded)}
                className={classes.manualButton}
                startIcon={documentosExpanded ? <ExpandLess /> : <ExpandMore />}
              >
                {documentosExpanded ? 'Esconder' : 'Mostrar'}
              </Button>
            </Typography>

            <Collapse in={documentosExpanded}>
              <div className={classes.expandableContent}>
                <Typography component="p" variant="body2" style={{ marginBottom: 16, color: '#666' }}>
                  Ex: Procuração, outros documentos...
                </Typography>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={files.length > 0 ? 6 : 12}>
                    <input
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      id="additional-files"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                    />
                    <label htmlFor="additional-files">
                      <Button
                        variant="contained"
                        component="span"
                        className={classes.uploadButton}
                        fullWidth
                        startIcon={<CloudUpload />}
                      >
                        {isMobile ? 'Anexar' : 'Anexar Documentos'}
                      </Button>
                    </label>
                  </Grid>

                  {files.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <div className={classes.thumbnailContainer}>
                        {files.map((file, index) => (
                          <div key={index} className={classes.thumbnail}>
                            <img src={URL.createObjectURL(file)} alt={`Documento ${index}`} />
                            <IconButton
                              className={classes.deleteButton}
                              size="small"
                              onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    </Grid>
                  )}
                </Grid>
              </div>
            </Collapse>
          </div>

          {/* Botão de Envio */}
          <Button
            onClick={handleAddItem}
            variant="contained"
            className={classes.submitButton}
            fullWidth
            startIcon={<Send />}
            disabled={isLoading || isSubmitting || processingImage}
          >
            {isLoading || isSubmitting || processingImage ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Enviar Requerimento'
            )}
          </Button>
        </Paper>

        {/* Modal Câmera */}
        <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Tirar Foto</Typography>
              <IconButton onClick={() => setCameraOpen(false)}>
                <Close />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: isMobile ? '50vh' : '60vh',
                borderRadius: '8px',
                backgroundColor: '#000'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={takePhoto}
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<PhotoCamera />}
            >
              Capturar Foto
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Recorte */}
        <Dialog open={cropOpen} onClose={() => setCropOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Recortar Imagem</Typography>
              <IconButton onClick={() => setCropOpen(false)}>
                <Close />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Cropper
              image={imageToCrop || ''}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  backgroundColor: '#f5f5f5'
                }
              }}
            />
            <div className={classes.cropControls}>
              <Button
                onClick={() => setCropOpen(false)}
                variant="outlined"
                color="secondary"
                style={{ marginRight: '16px' }}
              >
                Cancelar
              </Button>
              <Button
                onClick={cropImage}
                variant="contained"
                color="primary"
              >
                Aplicar Recorte
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tutorial Dialog */}
        <Dialog
          open={showTutorial}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: classes.tutorialDialog
          }}
        >
          <DialogContent>
            <Typography component="h2" className={classes.tutorialTitle}>
              {tutorialSteps[tutorialStep].title}
            </Typography>
            <Typography component="p" className={classes.tutorialContent}>
              {tutorialSteps[tutorialStep].content}
            </Typography>
            <Typography component="p" variant="caption" style={{ textAlign: 'center', display: 'block', color: '#666' }}>
              Passo {tutorialStep + 1} de {tutorialSteps.length}
            </Typography>
          </DialogContent>
          <DialogActions className={classes.tutorialActions}>
            <Button
              onClick={handleCloseTutorial}
              className={`${classes.tutorialButton} ${classes.skipButton}`}
            >
              {tutorialStep === tutorialSteps.length - 1 ? 'Fechar' : 'Pular Tutorial'}
            </Button>
            <Button
              onClick={handleNextTutorial}
              className={`${classes.tutorialButton} ${classes.nextButton}`}
            >
              {tutorialStep === tutorialSteps.length - 1 ? 'Começar!' : 'Próximo'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Botão flutuante para reabrir tutorial */}
        <Tooltip title="Ver Tutorial Novamente">
          <Fab
            className={classes.fabTutorial}
            onClick={handleReopenTutorial}
            size="medium"
          >
            <HelpOutline />
          </Fab>
        </Tooltip>
      </div>
    </div>
  );
};

export default ListPost;