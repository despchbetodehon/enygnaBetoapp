import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Card, TextField, Button, CircularProgress, IconButton,
  List, ListItem, ListItemText, Divider, Grid, Avatar, Badge, Snackbar, Dialog, Tabs, Tab, AppBar
} from '@material-ui/core';
import { makeStyles, createTheme, ThemeProvider } from '@material-ui/core/styles';
import { collection, getFirestore, getDocs, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/logic/firebase/config/app';
import jsPDF from 'jspdf';
import {
  Refresh, ExpandMore, ExpandLess, PictureAsPdf, Edit,
  Assignment, CheckCircle, DateRange, Delete, Security, TransferWithinAStation
} from '@material-ui/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Timestamp } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { Thumbnails } from '@/components/enterprises/betodespa/requerimento/thumbnails';
import DashboardAnuencia from './anuencia';
import DashboardTransferencia from './transferencia';

// Configuração do Firebase
const db = getFirestore(app);
const storage = getStorage(app);

// Registre os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  BarElement
);

interface Stats {
  total: number;
  pendentes: number;
  concluidos: number;
  valorTotal: number;
}

// Tema personalizado
const theme = createTheme({
  palette: {
    type: 'light',
  },
});

const useStyles = makeStyles((theme) => ({
  dashboardHeader: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    backgroundColor: '#000'
  },
  statCard: {
    padding: '10px',
    textAlign: 'center',
    backgroundColor: '#fff',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[10],
    },
    width: '100px',
    maxWidth: '100px',
    margin: '0 auto',
  },
  dateFilter: {
    minWidth: '150px',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  paper: {
    padding: theme.spacing(4),
    margin: '20px auto',
    maxWidth: '1000px',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '12px',
    boxShadow: theme.shadows[5],
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
    flexWrap: 'wrap',
  },
  searchField: {
    flex: 1,
    minWidth: '250px',
  },
  title: {
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
  button: {
    whiteSpace: 'nowrap',
    margin: theme.spacing(0.5),
  },
  listItemExpanded: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  field: {
    fontSize: '1rem',
    marginBottom: theme.spacing(-1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    borderRadius: '4px',
  },
  chartHeader: {
    width: '400px',
    height: '200px',
    marginBottom: theme.spacing(4),
    borderRadius: '12px',
    boxShadow: theme.shadows[3],
    overflow: 'hidden',
  },
  listItemPendente: {
    backgroundColor: '#FFCDD2',
  },
  listItemConcluido: {
    backgroundColor: '#C8E6C9',
  },
  field3: {
    fontSize: '0.7rem',
    marginBottom: theme.spacing(1),
  },
  field2: {
    fontSize: '1.3rem',
    marginBottom: theme.spacing(1),
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
  signatureSection: {
    marginTop: theme.spacing(20),
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  signatureBlock: {
    textAlign: 'center',
    width: 'auto',
    borderTop: '2px solid #000',
    paddingTop: theme.spacing(1),
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    fontSize: '1.0rem',
    fontWeight: 'bold',
  },
  noPrint: {
    '@media print': {
      display: 'none !important',
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
  nomecomprador: string;
  cpfcomprador: string;
  enderecocomprador: string;
  complementocomprador: string;
  municipiocomprador: string;
  bairrocomprador: string;
  emailcomprador: string;
  celtelcomprador: string;
  celtelvendedor: string;
  cepvendedor: string;
  cepcomprador: string;
  tipo: string;
  cnpjempresa: string;
  nomeempresa: string;
  dataCriacao: string | Timestamp;
  signature?: string;
}

const formatDate = (date: string | Timestamp): string => {
  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else {
    dateObj = new Date(date);
  }

  const formattedDate = dateObj.toLocaleDateString('pt-BR');
  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return `${formattedDate} | ${formattedTime}`;
};

const convertStringToNumber = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value.replace(/\./g, '').replace(',', '.');
  const numberValue = parseFloat(cleanedValue);
  return isNaN(numberValue) ? 0 : numberValue;
};

const DashboardHeader: React.FC<{ stats: Stats }> = ({ stats }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.dashboardHeader}>
      <Grid container spacing={10}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <Assignment className={classes.statIcon} />
            <Typography variant="h6">Total Documentos</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <Badge color="secondary" badgeContent={stats.pendentes}>
              <Assignment className={classes.statIcon} />
            </Badge>
            <Typography variant="h6">Pendentes</Typography>
            <Typography variant="h4">{stats.pendentes}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statCard}>
            <CheckCircle className={classes.statIcon} />
            <Typography variant="h6">Concluídos</Typography>
            <Typography variant="h4">{stats.concluidos}</Typography>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

const Dashboard = () => {
  const classes = useStyles();
  const [documents, setDocuments] = useState<Item[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Item[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    concluidos: 0,
    valorTotal: 0,
  });
  const [showOnlyPendentes, setShowOnlyPendentes] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newDocumentMessage, setNewDocumentMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const calculateStats = (docs: Item[]) => {
    const newStats = {
      total: docs.length,
      pendentes: docs.filter(d => d.status === 'Pendente').length,
      concluidos: docs.filter(d => d.status === 'Concluído').length,
      valorTotal: docs.reduce((sum, d) => sum + convertStringToNumber(d.valordevenda || '0'), 0),
    };
    setStats(newStats);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'Betodespachanteintrncaodevendaoficial', id));
      setDocuments((prevDocuments) => prevDocuments.filter(doc => doc.id !== id));
      setFilteredDocuments((prev) => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Erro ao excluir o documento:', error);
    }
  };

  const sendWhatsApp = async (pdfURL: string) => { 
    const telefone = '5548988449379';
    const mensagemWhatsApp = `Olá! Seu documento foi gerado e está pronto. Você pode baixá-lo aqui: ${pdfURL}`;
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagemWhatsApp)}`;
    window.open(linkWhatsApp, '_blank');
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const itemsCollectionRef = collection(db, 'Betodespachanteintrncaodevendaoficial');
      const querySnapshot = await getDocs(itemsCollectionRef);
      const fetchedItems: Item[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Item, 'id'>;
        const documentDate = formatDate(data.dataCriacao);

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if ((!start || new Date(documentDate) >= start) && (!end || new Date(documentDate) <= end)) {
          fetchedItems.push({ id: doc.id, ...data });
        }
      });

      fetchedItems.sort((a, b) => {
        const dateA = formatDate(a.dataCriacao);
        const dateB = formatDate(b.dataCriacao);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setDocuments(fetchedItems);
      setFilteredDocuments([]); // Inicialmente vazia
      calculateStats(fetchedItems);
    } catch (error) {
      console.error('Erro ao buscar os itens:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: -35mm 10mm; /* Reduzindo a margem superior e lateral */
        }
  
        body {
          margin: 0;
          padding: 0;
        }
  
        .printContent {
          visibility: visible;
          position: absolute;
          left: 0;
          top: 0; /* Garante que o conteúdo comece no topo */
          width: 100%;
          height: auto;
          min-height: 9vh; /* Garante que o conteúdo ocupe toda a página */
          background: white !important;
        }
        
        .printContent * {
          visibility: visible;
        }
  
        .noPrint {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const itemsCollectionRef = collection(db, 'Betodespachanteintrncaodevendaoficial');
    const unsubscribe = onSnapshot(itemsCollectionRef, (snapshot) => {
      const updatedDocuments: Item[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Item, 'id'>;
        updatedDocuments.push({ id: doc.id, ...data });
      });

      updatedDocuments.sort((a, b) => {
        const dateA = formatDate(a.dataCriacao);
        const dateB = formatDate(b.dataCriacao);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setDocuments(updatedDocuments);
      calculateStats(updatedDocuments);

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newDoc = change.doc.data() as Item;
          if (newDoc.status === 'Pendente') {
            setNewDocumentMessage('Novo requerimento adicionado!');
            setSnackbarOpen(true);
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // Filtra os documentos quando o texto de pesquisa muda
 useEffect(() => {
  if (searchText.length >= 5) {
    const filtered = documents.filter(doc => 
      (doc.nomeempresa ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
      (doc.cnpjempresa ?? '').includes(searchText)
    );
    setFilteredDocuments(filtered);
  } else {
    setFilteredDocuments([]);
  }
}, [searchText, documents]);


  const generatePDF = async () => {
    const input = document.getElementById('pdf-content');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    const pdfBlob = pdf.output('blob');
    const storageRef = ref(storage, `pdfs/documento_${Date.now()}.pdf`);
    await uploadBytes(storageRef, pdfBlob);
    const pdfURL = await getDownloadURL(storageRef);
    sendWhatsApp(pdfURL);
  };

  const documentsByDay = documents.reduce((acc, doc) => {
    const date = formatDate(doc.dataCriacao);
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += 1;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(documentsByDay);
  const data = Object.values(documentsByDay);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Documentos Criados por Dia',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Documentos Criados por Dia',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Documentos',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Data',
        },
      },
    },
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const docRef = doc(db, 'Betodespachanteintrncaodevendaoficial', id);
      await updateDoc(docRef, { status });
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && children}
    </div>
  );

  const displayedDocuments = showOnlyPendentes
    ? filteredDocuments.filter(doc => doc.status === 'Pendente')
    : filteredDocuments;

  const pendentes = displayedDocuments.filter(doc => doc.status === 'Pendente');
  const concluidos = displayedDocuments.filter(doc => doc.status === 'Concluído').slice(0, 5);

  const sortedDocuments = [...pendentes, ...concluidos];

  const handlePrintDocument = () => {
    const printContent = document.getElementById("printable-content");
    if (!printContent) return;
  
    printContent.style.width = "100%";
    printContent.style.margin = "0";
    printContent.style.padding = "0";
  
    window.print();
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <AppBar position="static" color="default" className={classes.noPrint}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab 
              label="Requerimentos" 
              icon={<Assignment />} 
            />
            <Tab 
              label="Anuência" 
              icon={<Security />} 
            />
            <Tab 
              label="Transferência" 
              icon={<TransferWithinAStation />} 
            />
          </Tabs>
        </AppBar>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2} className={classes.noPrint}>

            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className={classes.paper}>
                <div className={classes.filterContainer}>
                  <TextField
                    label="Buscar Nome/CNPJ (mínimo 5 caracteres)"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    variant="outlined"
                    className={classes.searchField}
                  />
                  
                  <TextField
                    label="Data Início"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    className={classes.dateFilter}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  
                  <TextField
                    label="Data Fim"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    className={classes.dateFilter}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />

                  <Button 
                    onClick={fetchDocuments} 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Refresh />}
                    className={classes.button}
                  >
                    Atualizar
                  </Button>
                  
                  <Button 
                    onClick={generatePDF} 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<PictureAsPdf />}
                    className={classes.button}
                  >
                    Exportar PDF
                  </Button>

                  <Button 
                    onClick={() => setShowOnlyPendentes(!showOnlyPendentes)} 
                    variant="contained" 
                    color={showOnlyPendentes ? 'primary' : 'default'}
                    className={classes.button}
                  >
                    {showOnlyPendentes ? 'Mostrar Todos' : 'Mostrar Apenas Pendentes'}
                  </Button>
                </div>

                {loading ? (
                  <CircularProgress />
                ) : (
                  <List>
                    {sortedDocuments.map((doc) => (
                      <React.Fragment key={doc.id}>
                        <ListItem 
                          className={`${classes.noPrint} ${expanded === doc.id ? classes.listItemExpanded : ''} ${
                            doc.status === 'Pendente' ? classes.listItemPendente : classes.listItemConcluido
                          }`}
                        >
                          <Avatar 
                            className={classes.noPrint} 
                            style={{ marginRight: 1, backgroundColor: doc.status === 'Concluído' ? '#4CAF50' : '#FFC107' }}
                          >
                            <DateRange className={classes.noPrint} />
                          </Avatar>
                          
                          <ListItemText 
                            className={classes.noPrint}
                            primary={`${doc.nomeempresa} - ${doc.cnpjempresa}`}
                            secondary={
                              <>
                                <Typography variant="body2">
                                  Placa: {doc.id} | Responsável: {doc.nomevendedor}
                                </Typography>
                                <Typography variant="body2">
                                  Data: {formatDate(doc.dataCriacao)} | 
                                  Valor: R$ {String(doc.valordevenda || '0')}
                                </Typography>
                                <div className={classes.noPrint}>
                                  <Thumbnails urls={doc.imagemUrls} />
                                </div>
                              </>
                            }
                          />
                          
                          <div className={classes.noPrint}>
                            <IconButton onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}>
                              {expanded === doc.id ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                           
                            <Button 
                              variant="contained" 
                              color="primary" 
                              onClick={() => handleStatusUpdate(doc.id, 'Concluído')}
                              disabled={doc.status === 'Concluído'}
                            >
                              Concluído
                            </Button>
                            <Button 
                              variant="contained" 
                              color="secondary" 
                              onClick={() => handleStatusUpdate(doc.id, 'Pendente')}
                              disabled={doc.status === 'Pendente'}
                            >
                              Pendente
                            </Button>
                          </div>
                        </ListItem>

                        {expanded === doc.id && (
                          <Card className={`${classes.paper} printContent`} id="printable-content">
                            <div className={classes.header}>
                              <Typography className={classes.title2}>Estado de Santa Catarina</Typography>
                              <Typography className={classes.subtitle}>Secretaria de Estado de Segurança Pública</Typography>
                              <Typography className={classes.subtitle}>Departamento Estadual de Trânsito</Typography>
                              <Typography className={classes.subtitle}>Diretoria de Veículo</Typography>
                            </div>
                            
                            <Typography className={classes.title} style={{ textAlign: 'center' }}>
                              Requerimento de Intenção de Venda
                            </Typography>
                            
                            <div key={doc.placa}>
                              <Typography className={classes.sectionTitle}>Identificação do Veículo</Typography>
                              <Typography className={classes.field}><strong>Placa:</strong> {doc.id}</Typography>
                              <Typography className={classes.field}><strong>Renavam:</strong> {doc.renavam}</Typography>
                              <Typography className={classes.field}><strong>CRV:</strong> {doc.crv}</Typography>
                              <Typography className={classes.field}><strong>Valor de Venda:</strong> R$ {doc.valordevenda}</Typography>
                            
                              <Typography className={classes.sectionTitle}>Identificação do Vendedor</Typography>
                              <Typography className={classes.field}><strong>Nome:</strong> {doc.nomevendedor}</Typography>
                              <Typography className={classes.field}><strong>CPF/CNPJ:</strong> {doc.cpfvendedor}</Typography>
                              <Typography className={classes.field}><strong>E-mail:</strong> {doc.emailvendedor}</Typography>
                            
                              <Typography className={classes.sectionTitle}>Identificação do Comprador</Typography>
                              <Typography className={classes.field}><strong>Nome:</strong> {doc.nomecomprador}</Typography>
                              <Typography className={classes.field}><strong>CPF/CNPJ:</strong> {doc.cpfcomprador}</Typography>
                              <Typography className={classes.field}><strong>CEP:</strong> {doc.cepcomprador}</Typography>
                              <Typography className={classes.field}><strong>Endereço:</strong> {doc.enderecocomprador}</Typography>
                              <Typography className={classes.field}><strong>Bairro:</strong> {doc.bairrocomprador}</Typography>
                              <Typography className={classes.field}><strong>Município:</strong> {doc.municipiocomprador}</Typography>
                              <Typography className={classes.field}><strong>Estado:</strong> {doc.complementocomprador}</Typography>
                              <Typography className={classes.field}><strong>E-mail:</strong> {doc.emailcomprador}</Typography>
                              <Typography className={classes.field}><strong>CEL/TEL:</strong> {doc.celtelcomprador}</Typography>
                            
                              <Typography className={classes.sectionTitle}></Typography>
                              <Typography className={classes.field2} style={{ marginTop: '20px' }}>
                                Eu <strong>VENDEDOR</strong>, com base na Resolução do CONTRAN nº 809, de 15 de dezembro 2020,
                                informo ao Departamento Estadual de Trânsito de Santa Catarina (DETRAN-SC) a,
                                <strong>INTENÇÃO DE VENDA</strong> em {formatDate(doc.dataCriacao)}, para o <strong>COMPRADOR</strong> conforme indicado acima.
                              </Typography>
                              {doc.signature && (
                                <div className={classes.signatureSection}>
                                  <img src={doc.signature} alt="Assinatura do Cliente" style={{ maxWidth: '100%' }} />
                                </div>
                              )}
                            
                              <div className={classes.signatureSection}>
                                <div className={classes.signatureBlock}>
                                  Assinatura do Vendedor ou Responsável
                                </div>
                              </div>
                            
                              <Typography className={classes.sectionTitle4}>b3certificacao@gmail.com</Typography>
                              <Typography className={classes.sectionTitle3}>Documentação Básica</Typography>
                              <Typography className={classes.field3}>Pessoa Física: Cópia da CNH ou RG/CPF</Typography>
                              <Typography className={classes.field3}>Pessoa Jurídica: Cópia do ato constitutivo e Cartão CNPJ</Typography>
                              <Typography className={classes.field3}>Obs: Cópia autenticada de procuração e cópia da CNH ou RG/CPF do procurador caso solicitado por terceiro.</Typography>
     
                              <Button onClick={handlePrintDocument} className={`${classes.downloadButton} ${classes.noPrint}`}>
                                Imprimir Documento
                              </Button>
                            </div>
                          </Card>
                        )}
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper className={`${classes.chartHeader} ${classes.noPrint}`}>
                <Bar data={chartData} options={chartOptions} />
              </Paper>
            </Grid>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={20000}
              onClose={handleSnackbarClose}
              message={newDocumentMessage}
            />
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <DashboardAnuencia />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <DashboardTransferencia />
        </TabPanel>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;