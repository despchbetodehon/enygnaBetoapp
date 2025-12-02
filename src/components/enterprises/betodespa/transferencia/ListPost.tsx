import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Button, Grid, Paper, Typography, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery,
  CircularProgress, Divider, Fab, Tooltip
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { motion } from 'framer-motion';
import { PhotoCamera, Delete, Close, Crop, CloudUpload, Send, HelpOutline } from '@material-ui/icons';
import Cropper from 'react-easy-crop';
import SignaturePad from './SingnaturePad';
import Colecao from '@/logic/firebase/db/Colecao';
import Item from './Item';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Timestamp } from 'firebase/firestore';
import { storage } from '@/logic/firebase/config/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCroppedImg } from './cropUtils';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%)',
    padding: theme.spacing(3),
    color: '#ffff',
    fontFamily: '"Playfair Display", "Crimson Text", "Libre Baskerville", "Georgia", serif',
    '@media print': {
      background: '#ffffff',
      color: '#000000',
      padding: 0,
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1.5),
    },
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3.5),
    background: 'rgba(255, 255, 255, 0.95)',
    maxWidth: '95vw',
    margin: '0 auto',
     color: '#ffff',
    padding: theme.spacing(4),
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(45, 90, 61, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(45, 90, 61, 0.1)',
    '@media print': {
      background: '#ffffff',
      boxShadow: 'none',
      border: 'none',
      borderRadius: 0,
      maxWidth: '100%',
      margin: 0,
      padding: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2.5),
      gap: theme.spacing(2.5),
    },
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)',
    alignItems: 'center',
    padding: theme.spacing(3),
     color: '#ffff',
    borderRadius: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    marginBottom: theme.spacing(4),
    '@media print': {
      background: '#ffffff',
      boxShadow: 'none',
      borderRadius: 0,
      borderBottom: '2px solid #2d5a3d',
    },
  },
  logo: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
     color: '#fff',
    objectFit: 'cover',
    border: '4px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 0 15px rgba(100, 150, 255, 0.5)',
    marginBottom: theme.spacing(2),
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  title: {
    fontWeight: 800,
    fontSize: '2rem',
     color: '#fff',
    textAlign: 'center',
    background: 'linear-gradient(90deg, #5C7AEA 0%, #A3BFFA 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 2px 10px rgba(92, 122, 234, 0.5)',
    marginBottom: theme.spacing(1),
  },
  sectionTitle: {
    fontWeight: 700,
     color: '#ffff',
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    letterSpacing: '0.5px',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
       color: '#ffff',
      transition: 'all 0.3s ease',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#A3BFFA',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderWidth: '1px',
        borderColor: '#5C7AEA',
        boxShadow: '0 0 10px rgba(92, 122, 234, 0.5)',
      },
    },
    '& .MuiInputLabel-outlined': {
      color: 'rgba(255, 255, 255, 0.6)',
    },
    '& .MuiInputLabel-outlined.Mui-focused': {
      color: '#A3BFFA',
    },
  },
  button: {
    borderRadius: '12px',
    padding: theme.spacing(1.75),
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(-2px)',
    },
  },
  primaryButton: {
    background: 'linear-gradient(90deg, #5C7AEA 0%, #A3BFFA 100%)',
    color: '#fff',
  },
  secondaryButton: {
    border: '1px solid #A3BFFA',
    color: '#A3BFFA',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cameraButton: {
    marginLeft: theme.spacing(2),
    background: 'linear-gradient(90deg, #00C4B4 0%, #26A69A 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(90deg, #00A896 0%, #00897B 100%)',
    },
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: theme.spacing(4),
    padding: theme.spacing(3),
    border: '1px dashed rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.05)',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '350px',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  thumbnailContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2.5),
    marginTop: theme.spacing(2.5),
  },
  thumbnail: {
    position: 'relative',
    width: '110px',
    height: '110px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  actionButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    padding: '4px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#fff',
      transform: 'scale(1.1)',
    },
  },
  deleteButton: {
    top: '6px',
    right: '6px',
    color: '#FF6B6B',
  },
  cropButton: {
    bottom: '6px',
    right: '6px',
    color: '#5C7AEA',
  },
  signatureContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: theme.spacing(4),
    padding: theme.spacing(3),
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(3),
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  dialogContent: {
    position: 'relative',
    height: '65vh',
    backgroundColor: '#0A1A2F',
    borderRadius: '16px',
    [theme.breakpoints.down('sm')]: {
      height: '55vh',
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120px',
    color: '#A3BFFA',
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
     color: '#ffff',
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

  searchField: {
    marginBottom: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },
  downloadButton: {
    marginTop: theme.spacing(1),
    backgroundColor: '#4CAF50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
  tutorialContainer: {
    background: 'linear-gradient(145deg, rgba(30, 40, 60, 0.95) 0%, rgba(50, 70, 100, 0.85) 100%)',
    padding: theme.spacing(3),
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 10, 50, 0.3)',
    maxWidth: 'min(80vw, 400px)',
    textAlign: 'center',
    color: '#E0E7FF',
    [theme.breakpoints.down('xs')]: {
      maxWidth: 'min(90vw, 320px)',
      padding: theme.spacing(2),
    },
  },
  tutorialTitle: {
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#A3BFFA',
    marginBottom: theme.spacing(2),
  },
  tutorialContent: {
    fontSize: '0.9rem',
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
  },
  tutorialActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  tutorialButton: {
    borderRadius: '8px',
    padding: theme.spacing(1),
    fontWeight: 600,
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  },
  skipButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#A3BFFA',
    border: '1px solid #A3BFFA',
  },
  nextButton: {
    background: 'linear-gradient(90deg, #5C7AEA 0%, #A3BFFA 100%)',
    color: '#fff',
  },

  fabButton: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    background: 'linear-gradient(90deg, #5C7AEA 0%, #A3BFFA 100%)',
    color: '#fff',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    '&:hover': {
      background: 'linear-gradient(90deg, #4B6CD9 0%, #8AACE3 100%)',
      transform: 'scale(1.1)',
    },
    zIndex: 1000,
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
}));

interface ItemListProps {
  items: Item[];
}

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
    return cleaned
      .replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, p1, p2, p3, p4) => {
        return [p1, p2, p3].filter(Boolean).join('.') + (p4 ? `-${p4}` : '');
      });
  } else {
    return cleaned
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
        return `${p1}.${p2}.${p3}/${p4}-${p5}`;
      });
  }
};

const isValidCpfCnpj = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return /^\d{11}$/.test(cleaned);
  } else if (cleaned.length === 14) {
    return /^\d{14}$/.test(cleaned);
  }
  return false;
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

const useCpfCnpjSearch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const search = async (doc: string, target: keyof Item, setNewItem: React.Dispatch<React.SetStateAction<Item>>) => {
    let tipo = ''; // Define tipo here

    try {
      const cleaned = doc.replace(/\D/g, '');
      if (cleaned.length !== 11 && cleaned.length !== 14) return;

      setIsLoading(true);
      tipo = cleaned.length === 14 ? 'cnpj' : 'cpf'; // Set the value

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

      // Mostra feedback para o usuário (opcional)
      if (error instanceof Error && error.message.includes('Erro 404')) {
        alert('Serviço de consulta temporariamente indisponível. Por favor, preencha o nome manualmente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { search, isLoading };
};


const tutorialSteps = [
  {
    id: 'services',
    title: 'Selecione os Serviços Desejados',
    content: 'Escolha os serviços clicando em "ATPV", "Assinatura" ou "Comunicação de Venda". Os botões destacam-se quando selecionados.',
  },
  {
    id: 'vehicle',
    title: 'Identificação do Veículo',
    content: 'Preencha os dados do veículo: Placa (ex.: ABC1234), Renavam, CRV, e Valor de Venda (ex.: 50000, formatado como 50.000,00).',
  },
  {
    id: 'applicant',
    title: 'Solicitante',
    content: 'Insira o CPF/CNPJ do responsável (pessoa física ou jurídica). Se válido, o nome é preenchido automaticamente. Caso contrário, preencha o Nome manualmente.',
  },
  {
    id: 'documents',
    title: 'Anexar Documentos (Opcional)',
    content: 'Envie documentos como procuração (PDFs, fotos, etc.). Clique em "Selecionar Arquivos" e, no Windows, ajuste o explorador de arquivos para "Todos os Arquivos". Use "Tirar Foto" para capturar imagens com a câmera.',
  },
  {
    id: 'submit',
    title: 'Enviar Arquivos',
    content: 'Revise os dados e clique em "Enviar Requerimento". Aguarde 5 segundos para a confirmação de salvamento.',
  },
];

const ListPost: React.FC<{ setItems: React.Dispatch<React.SetStateAction<Item[]>> }> = ({ setItems }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'), { noSsr: true });

  const [files, setFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const { search: searchCpfCnpj, isLoading: isLoadingSearch } = useCpfCnpjSearch();
  const debouncedSearch = useDebounce(searchCpfCnpj, 1000);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    chassi: '',
    cargo: '',
    cargo2: '',
    cargo3: '',
    modelo: '',
    valordevenda: '',
    nomesocio1: '',
    cpfsocio1: '',
    cpfsocio3: '',
     nomesocio3: '',
    enderecosocio1: '',
    complementosocio1: '',
    municipiosocio1: '',
    emailsocio1: 'b3certificacao@gmail.com',
    celtelsocio1: '',
    cepsocio1: '',
    nomesocio2: '',
    cpfsocio2: '',
    enderecosocio2: '',
    complementosocio2: '',
    municipiosocio2: '',
    emailsocio2: 'b3certificacao@gmail.com',
    celtelsocio2: '',
    cepsocio2: '',
    bairroempresa: '',
    nomeempresa: '',
    cpfempresa: '',
    enderecoempresa: '',
    complementoempresa: '',
    municipioempresa: '',
    emailempresa: 'b3certificacao@gmail.com',
    celtelempresa: '',

    cepempresa: '',
    tipo: '',
    cnpjempresa: '',

    dataCriacao: Timestamp.fromDate(new Date()),

    signature: '',
  });

  // Verifica se o tutorial já foi visto
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const toggleProduto = (produto: string) => {
    setProdutosSelecionados(prev =>
      prev.includes(produto)
        ? prev.filter(p => p !== produto)
        : [...prev, produto]
    );
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

  // Image cropping
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

  const fetchAddressFromCEP = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setNewItem(prev => ({
          ...prev,
          enderecoempresa: data.logradouro,
          municipioempresa: data.localidade,
          bairroempresa: data.bairro,
          complementoempresa: data.uf,
        }));
      } else {
        console.error('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.files) return;
    const selectedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsLoading(true);
    try {
      const uploadPromises = files.map(file => {
        const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
        return uploadBytes(storageRef, file)
          .then(snapshot => getDownloadURL(snapshot.ref));
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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

      const camposCpfCnpj: (keyof Item)[] = ['cpfsocio1','cpfsocio2','cpfsocio3', 'cpfempresa', 'cnpjempresa'];
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
            field === 'cpfsocio1'
              ? 'nomesocio1':
               field === 'cpfsocio2'
              ? 'nomesocio2'
              :
               field === 'cpfsocio3'
              ? 'nomesocio3'
              : field === 'cpfempresa'
              ? 'nomeempresa'
              : 'nomeempresa';

          debouncedSearch(raw, target, setNewItem);
        }
      }

      if (field === 'cepempresa' && value.replace(/\D/g, '').length === 8) {
        fetchAddressFromCEP(value);
      }

      (updated as Record<keyof Item, any>)[field] = value;

      return updated;
    });
  };

  const generatePreview = async () => {
    const input = document.getElementById('pdf-content');
    if (!input) return;

    try {
      const canvas = await html2canvas(input, { 
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        logging: false
      });
      setPreviewImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Erro ao gerar pré-visualização:', error);
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
    try {
      if (!newItem.id) {
        alert('ID do item não foi gerado corretamente. Por favor, recarregue a página.');
        return;
      }

      setIsLoading(true);

      const uploadedUrls = files.length > 0 ? await uploadFiles() : [];

      const colecao = new Colecao();
      const itemParaSalvar = {
        ...newItem,
        imagemUrls: uploadedUrls,
        dataCriacao: Timestamp.fromDate(new Date()),
        produtosSelecionados,
      };

      console.log('Salvando item:', itemParaSalvar);

      const itemSalvo = await colecao.salvar('Betodespachantetransferencia', itemParaSalvar);

      setItems(prev => [...prev, { ...itemParaSalvar, id: itemSalvo.id }]);
      const pdfURL = await generatePDF();

      generatePDF().then((pdfURL) => {
        if (pdfURL) {

          console.log('PDF gerado:', pdfURL);
        }
      });

      resetForm();

      setTimeout(() => {
        alert('Item adicionado com sucesso! Os dados foram salvos.');
      }, 5000);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Ocorreu um erro ao salvar o requerimento. Tente novamente.');
    } finally {
      setIsLoading(false);
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
    chassi: '',
    cargo: '',
    cargo2: '',
    cargo3: '',
    modelo: '',
    valordevenda: '',
    nomesocio1: '',
    cpfsocio1: '',
     cpfsocio3: '',
    enderecosocio1: '',
    complementosocio1: '',
    municipiosocio1: '',
    emailsocio1: 'b3certificacao@gmail.com',
    celtelsocio1: '',
    cepsocio1: '',
    nomesocio2: '',
    nomesocio3: '',
    cpfsocio2: '',
    enderecosocio2: '',
    complementosocio2: '',
    municipiosocio2: '',
    emailsocio2: 'b3certificacao@gmail.com',
    celtelsocio2: '',
    cepsocio2: '',
    bairroempresa: '',
    nomeempresa: '',
    cpfempresa: '',
    enderecoempresa: '',
    complementoempresa: '',
    municipioempresa: '',
    emailempresa: 'b3certificacao@gmail.com',
    celtelempresa: '',

    cepempresa: '',
    tipo: '',
    cnpjempresa: '',

    dataCriacao: Timestamp.fromDate(new Date()),

    signature: '',
    });
    setFiles([]);
    setPreviewImage(null);
    setProdutosSelecionados([]);
  };

  const generatePDF = async (): Promise<string | null> => {
    const input = document.getElementById('pdf-content');
    if (!input) return null;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

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

  const handleNextTutorial = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      handleCloseTutorial();
    }
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleReopenTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0); // Reinicia o tutorial do início
  };
   const renderSociosText = () => {
    const socios = [];
    if (newItem.nomesocio1) socios.push(`seu sócio administrador ${newItem.nomesocio1}`);
    if (newItem.nomesocio2) socios.push(`seu sócio diretor ${newItem.nomesocio2}`);
    if (newItem.nomesocio3) socios.push(`seu sócio ${newItem.nomesocio3}`);

    if (socios.length === 0) return 'representado neste ato por seu representante legal';

    return `representado neste ato por ${socios.join(', ')}`;
  };

 const renderSignatureBlocks = () => {
    const blocks = [];

    if (newItem.nomesocio1) {
      blocks.push(
        <div key="socio1" className={classes.signatureSection}>
          {newItem.signature && (
            <img src={newItem.signature} alt="Assinatura do Cliente" style={{ maxWidth: '300px' }} />
          )}
          <div className={classes.signatureBlock}>
            Assinatura do sócio ou Responsável
            <br />{newItem.nomesocio1}
            <br />{newItem.cpfsocio1}
            <br />{newItem.cargo}
          </div>
        </div>
      );
    }

    if (newItem.nomesocio2) {
      blocks.push(
        <div key="socio2" className={classes.signatureSection}>
          {newItem.signature && (
            <img src={newItem.signature} alt="Assinatura do Cliente" style={{ maxWidth: '300px' }} />
          )}
          <div className={classes.signatureBlock}>
            Assinatura do sócio ou Responsável
            <br />{newItem.nomesocio2}
            <br />{newItem.cpfsocio2}
            <br />{newItem.cargo2}
          </div>
        </div>
      );
    }

    return blocks;
  };

  return (
    <>
      <div className={classes.root}>
        <Paper className={classes.formContainer}>
          <div id="pdf-content" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <Paper className={classes.paper}>
            <div className={classes.header2}>
              <Typography component="h1" className={classes.title1}>Detran</Typography>
              <Typography component="p" className={classes.subtitle}>Departamento Estadual de Trânsito</Typography>
            </div>

            <Typography component="h2" className={classes.title2} style={{ textAlign: 'center' }}>
              Banco De Arquivos Veiculares
            </Typography>

            <Typography component="div" className={classes.field2} style={{ marginTop: '20px' }}>
              A <strong>empresa</strong>, {newItem.nomeempresa}, inscrita no CNPJ sob o nº, {newItem.cnpjempresa}, com sede localizada à 
              <br /><strong>CEP:</strong> {newItem.cepempresa}
              <br /><strong>Endereço:</strong> {newItem.enderecoempresa}
              <br /><strong>Bairro:</strong> {newItem.bairroempresa}
              <br /><strong>Município:</strong> {newItem.municipioempresa}
              <br /><strong>Estado:</strong> {newItem.complementoempresa}, {renderSociosText()}, vem por meio deste, declarar que está ciente e anuente com a solicitação de baixa permanente do veículo de sua propriedade, conforme dados abaixo:
              <Typography component="div" className={classes.field}><strong>Placa:</strong> {newItem.id}</Typography>
              <Typography component="div" className={classes.field}><strong>Modelo:</strong> {newItem.modelo}</Typography>
              <Typography component="div" className={classes.field}><strong>Chassi:</strong> {newItem.chassi}</Typography>
              <Typography component="div" className={classes.field}><strong>Renavam:</strong> {newItem.renavam}</Typography>
            </Typography>

            <Typography component="div" className={classes.field2} style={{ marginTop: '20px' }}>
              A empresa declara ainda que a baixa do referido veículo será realizada conforme as normas e procedimentos vigentes estabelecidos pelo DETRAN/SC, 
              estando ciente de que, uma vez efetuada a baixa permanente, o veículo não poderá retornar à circulação.
              <br /><strong>Nestes termos, pede deferimento.</strong>
              <br /><strong>Município:</strong> {newItem.municipioempresa} em {formatDate(newItem.dataCriacao)}, para o <strong>empresa</strong> conforme indicado acima.
            </Typography>

            {renderSignatureBlocks()}

            <Typography component="div" className={classes.sectionTitle4}>b3certificacao@gmail.com</Typography>
          </Paper>
        </div>

        <div className={classes.header}>
          <img src="/betologo.jpg" alt="Logo" className={classes.logo} />
          <Typography  className={classes.title}>
           Banco De Arquivos Veiculares
          </Typography>
        </div>


        <Grid container spacing={3}>

        <Grid item xs={12}>
  <Typography variant="h6" className={classes.sectionTitle}>Selecione os Serviços Desejados</Typography>
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    {['TRANSFERÊNCIA', 'SEGUNDA VIA', ' LICENCIAMENT', 'ALTERAÇÃO DE DADOS' ].map((produto) => (
      <Button
        key={produto}
        variant={produtosSelecionados.includes(produto) ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => toggleProduto(produto)}
        className={classes.button}
      >
        {produto}
      </Button>
    ))}
  </div>
</Grid>
          {/* Seção Veículo */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" className={classes.sectionTitle}>Identificação Do Veículo</Typography>
            {(
              [
                { label: 'Placa', value: 'id' },
             

              ] as Array<{ label: string; value: keyof Item; type?: string }>
            ).map((field) => (
              <TextField
                key={field.value}
                name={field.value}
                label={field.label}
                value={newItem[field.value] || ''}
                onChange={(e) => handleInputChange(e, field.value)}
                fullWidth
                variant="outlined"
                className={classes.textField}
                margin="normal"
                type={field.type ?? 'text'}
              />
            ))}
          </Grid>

          
          <Grid item xs={12} md={3}>
            <Typography variant="h6" className={classes.sectionTitle}>Solicitante</Typography>

            <TextField
              name="cnpjempresa"
              label="CPF/CNPJ"
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
                }, 'cnpjempresa');
              }}
              fullWidth
              variant="outlined"
              className={classes.textField}
              margin="normal"
              error={!!newItem.cnpjempresa && !isValidCpfCnpj(newItem.cnpjempresa)}
              helperText={!!newItem.cnpjempresa && !isValidCpfCnpj(newItem.cnpjempresa)
                ? 'CPF/CNPJ inválido'
                : ''}
              InputProps={{
                endAdornment: isLoadingSearch && newItem.cnpjempresa?.length === 14 ? (
                  <CircularProgress size={24} />
                ) : null,
              }}
            />

            <TextField
              label="Nome"
              value={newItem.nomeempresa || ''}
              onChange={(e) => handleInputChange(e, 'nomeempresa')}
              fullWidth
              variant="outlined"
              className={classes.textField}
              margin="normal"
            />
          </Grid>


          {/* Seção Documentos */}
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Anexar Documentos (Opcional)
            </Typography>
            <Typography variant="h6" className={classes.sectionTitle}>
              Ex:Procuração...
            </Typography>

            <div 
              style={{ 
                display: 'flex', 
                gap: '16px', 
                flexWrap: 'wrap',
                padding: '16px',
                border: '2px dashed rgba(45, 90, 61, 0.3)',
                borderRadius: '8px',
                backgroundColor: 'rgba(45, 90, 61, 0.02)'
              }}
              onDragOver={handleDragOver}
              onDrop={handleFileDrop}
            >
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  className={`${classes.button} ${classes.secondaryButton}`}
                  startIcon={<CloudUpload />}
                >
                  Selecionar Arquivos
                </Button>
              </label>

              <Button
                variant="contained"
                className={`${classes.button} ${classes.cameraButton}`}
                startIcon={<PhotoCamera />}
                onClick={() => setCameraOpen(true)}
              >
                Tirar Foto
              </Button>
            </div>

            {/* Miniaturas */}
            {files.length > 0 && (
              <div className={classes.thumbnailContainer}>
                {files.map((file, index) => (
                  <div key={index} className={classes.thumbnail}>
                    <img src={URL.createObjectURL(file)} alt={`Documento ${index}`} />
                    <IconButton
                      className={`${classes.actionButton} ${classes.deleteButton}`}
                      size="small"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                    <IconButton
                      className={`${classes.actionButton} ${classes.cropButton}`}
                      size="small"
                      onClick={() => openCropDialog(index)}
                    >
                      <Crop fontSize="small" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </Grid>

          {/* Pré-visualização */}
          {previewImage && (
            <Grid item xs={12}>
              <div className={classes.previewContainer}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Pré-visualização do Documento
                </Typography>
                <img src={previewImage} alt="Pré-visualização" className={classes.previewImage} />
              </div>
            </Grid>
          )}
        </Grid>

        {/* Botões de ação */}
        <div className={classes.actionBar}>
          <Button
            onClick={handleAddItem}
            variant="contained"
            className={`${classes.button} ${classes.primaryButton}`}
            startIcon={<Send />}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Enviar Requerimento'}
          </Button>
        </div>
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

      <Dialog
        open={showTutorial}
        maxWidth="sm"
        PaperProps={{
          className: classes.tutorialContainer,
        }}
      >
        <DialogContent>
          <Typography className={classes.tutorialTitle}>
            {tutorialSteps[tutorialStep].title} ({tutorialStep + 1}/{tutorialSteps.length})
          </Typography>
          <Typography className={classes.tutorialContent}>
            {tutorialSteps[tutorialStep].content}
          </Typography>
        </DialogContent>
        <DialogActions className={classes.tutorialActions}>
          <Button
            onClick={handleCloseTutorial}
            className={`${classes.tutorialButton} ${classes.skipButton}`}
          >
            Pular
          </Button>
          <Button
            onClick={handleNextTutorial}
            className={`${classes.tutorialButton} ${classes.nextButton}`}
          >
            {tutorialStep === tutorialSteps.length - 1 ? 'Concluir' : 'Próximo'}
          </Button>
        </DialogActions>
      </Dialog>
        {/* Botão flutuante para reabrir o tutorial */}
        <Tooltip title="Reabrir Tutorial">
        <Fab
          className={classes.fabButton}
          onClick={handleReopenTutorial}
        >
          <HelpOutline />
        </Fab>
      </Tooltip>
      </div>
    </>
  );
};

export default ListPost;
