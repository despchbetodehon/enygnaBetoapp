
// Dashboard de Anuência
import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Card, TextField, Button, CircularProgress, IconButton,
  List, ListItem, ListItemText, Divider, Grid, Avatar, Badge, Snackbar, Dialog
} from '@material-ui/core';
import { makeStyles, createTheme, ThemeProvider } from '@material-ui/core/styles';
import { collection, getFirestore, getDocs, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/logic/firebase/config/app';
import jsPDF from 'jspdf';
import {
  Refresh, ExpandMore, ExpandLess, PictureAsPdf, Edit,
  Assignment, CheckCircle, DateRange, Delete, Security
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
  button: {
    whiteSpace: 'nowrap',
    margin: theme.spacing(0.5),
  },
  listItemExpanded: {
    backgroundColor: theme.palette.action.hover,
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
  },
  listItemPendente: {
    backgroundColor: '#FFCDD2',
  },
  listItemConcluido: {
    backgroundColor: '#C8E6C9',
  },
  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
}));

interface Item {
  id: string;
  cliente: string;
  status: string;
  tipo: string;
  orgao: string;
  protocolo: string;
  valor: string;
  dataCriacao: string | Timestamp;
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

const DashboardAnuencia = () => {
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

  const calculateStats = (docs: Item[]) => {
    const newStats = {
      total: docs.length,
      pendentes: docs.filter(d => d.status === 'Pendente').length,
      concluidos: docs.filter(d => d.status === 'Concluído').length,
      valorTotal: docs.reduce((sum, d) => sum + parseFloat(d.valor || '0'), 0),
    };
    setStats(newStats);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Simulação de dados - substitua pela collection real
      const mockData: Item[] = [
        {
          id: '1',
          cliente: 'Empresa ABC Ltda',
          status: 'Pendente',
          tipo: 'Anuência ANTT',
          orgao: 'ANTT',
          protocolo: 'ANT2024001',
          valor: '250.00',
          dataCriacao: new Date().toISOString(),
        },
        {
          id: '2',
          cliente: 'Transportes XYZ S.A.',
          status: 'Concluído',
          tipo: 'Anuência IBAMA',
          orgao: 'IBAMA',
          protocolo: 'IBA2024002',
          valor: '180.00',
          dataCriacao: new Date().toISOString(),
        }
      ];

      setDocuments(mockData);
      setFilteredDocuments(mockData);
      calculateStats(mockData);
    } catch (error) {
      console.error('Erro ao buscar os itens:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (searchText.length >= 3) {
      const filtered = documents.filter(doc => 
        doc.cliente.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.protocolo.includes(searchText) ||
        doc.orgao.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchText, documents]);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Typography variant="h4" style={{ marginBottom: 20, textAlign: 'center', color: '#2d5a3d' }}>
          <Security style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Dashboard de Anuência
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper className={classes.paper}>
              <div className={classes.filterContainer}>
                <TextField
                  label="Buscar Cliente/Protocolo/Órgão"
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
              </div>

              {loading ? (
                <CircularProgress />
              ) : (
                <List>
                  {filteredDocuments.map((doc) => (
                    <React.Fragment key={doc.id}>
                      <ListItem 
                        className={`${expanded === doc.id ? classes.listItemExpanded : ''} ${
                          doc.status === 'Pendente' ? classes.listItemPendente : classes.listItemConcluido
                        }`}
                      >
                        <Avatar 
                          style={{ marginRight: 16, backgroundColor: doc.status === 'Concluído' ? '#4CAF50' : '#FFC107' }}
                        >
                          <Security />
                        </Avatar>
                        
                        <ListItemText 
                          primary={`${doc.cliente} - ${doc.tipo}`}
                          secondary={
                            <>
                              <Typography variant="body2">
                                Órgão: {doc.orgao} | Protocolo: {doc.protocolo}
                              </Typography>
                              <Typography variant="body2">
                                Data: {formatDate(doc.dataCriacao)} | 
                                Valor: R$ {doc.valor}
                              </Typography>
                            </>
                          }
                        />
                        
                        <div>
                          <IconButton onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}>
                            {expanded === doc.id ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </div>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper style={{ padding: 16, marginBottom: 16 }}>
              <Typography variant="h6" gutterBottom>Estatísticas de Anuência</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card className={classes.statCard}>
                    <Typography variant="h4">{stats.total}</Typography>
                    <Typography variant="body2">Total</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card className={classes.statCard}>
                    <Typography variant="h4">{stats.pendentes}</Typography>
                    <Typography variant="body2">Pendentes</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card className={classes.statCard}>
                    <Typography variant="h4">{stats.concluidos}</Typography>
                    <Typography variant="body2">Concluídos</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card className={classes.statCard}>
                    <Typography variant="h4">R$ {stats.valorTotal.toFixed(2)}</Typography>
                    <Typography variant="body2">Valor Total</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
};

export default DashboardAnuencia;
