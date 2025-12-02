import React, { useState, useEffect, useRef } from 'react';
import {
  Typography, Paper, Grid, CircularProgress, Box, Chip,
  FormControl, InputLabel, Select, MenuItem, Avatar, List, ListItem, ListItemText,
  Divider, LinearProgress, Tabs, Tab, Button, Card
} from '@material-ui/core';
import { makeStyles, createTheme, ThemeProvider } from '@material-ui/core/styles';
import { collection, getFirestore, getDocs } from 'firebase/firestore';
import { app } from '@/logic/firebase/config/app';
import {
  TrendingUp, LocationOn, AttachMoney, Person, Assessment,
  Timeline, Map as MapIcon, Whatshot as AutoAwesome, ShowChart
} from '@material-ui/icons';
import { Timestamp } from 'firebase/firestore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import MapaLeaflet from '@/components/analytics/MapaLeaflet';
import ListaFluxoCidades from '@/components/analytics/ListaFluxoCidades';
import FunilVendasAutomatico from '@/components/analytics/FunilVendasAutomatico';

// Importando Leaflet CSS
import 'leaflet/dist/leaflet.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const db = getFirestore(app);

const theme = createTheme({
  palette: {
    type: 'light',
    primary: { main: '#1a4d3a' },
    secondary: { main: '#4caf50' },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    background: '#f5f7fa',
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
    color: '#fff',
    padding: theme.spacing(3),
    borderRadius: '16px',
    marginBottom: theme.spacing(3),
  },
  metricCard: {
    padding: theme.spacing(3),
    borderRadius: '12px',
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    },
  },
  metricNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    marginTop: theme.spacing(1),
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  chartCard: {
    padding: theme.spacing(3),
    borderRadius: '12px',
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1a4d3a',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  mapContainer: {
    width: '100%',
    height: '400px',
    background: '#0a0e27',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
  },
  topItem: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: theme.spacing(2),
    borderRadius: '12px',
    marginBottom: theme.spacing(2),
  },
}));

interface DocumentoAnalise {
  id: string;

  nomecomprador: string;
  valordevenda: string;
  municipiocomprador: string;


  cepcomprador: string;

  cpfcomprador?: string;
  nomeempresa?: string;
  cnpjempresa?: string;
  dataCriacao: string | Timestamp;
  produtosSelecionados?: string | string[];
  tipo?: string;
  placa?: string;
  renavam?: string;
}

interface MetricasGerais {
  totalDocumentos: number;
  totalReceita: number;
  ticketMedio: number;
  crescimentoMensal: number;
  clientesUnicos: number;
  cidadesAtendidas: number;
}

interface CidadeMetrica {
  cidade: string;
  receita: number;
  documentos: number;
}

interface TendenciaTemporal {
  periodo: string;
  quantidade: number;
  receita: number;
}

interface AIInsight {
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

interface CidadeCoordenadas {
  cidade: string;
  latitude: number;
  longitude: number;
  estado: string;
}

interface CidadeFluxo {
  nome: string;
  documentos: number;
  receita: number;
  horaPico: string;
  tendencia: 'up' | 'down' | 'stable';
  crescimento: number;
  potencialMarketing: number;
}

const AnaliseDados = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [periodoAnalise, setPeriodoAnalise] = useState('mes');
  const [documentos, setDocumentos] = useState<DocumentoAnalise[]>([]);
  const [metricas, setMetricas] = useState<MetricasGerais>({
    totalDocumentos: 0,
    totalReceita: 0,
    ticketMedio: 0,
    crescimentoMensal: 0,
    clientesUnicos: 0,
    cidadesAtendidas: 0,
  });
  const [topCidades, setTopCidades] = useState<CidadeMetrica[]>([]);
  const [tendencias, setTendencias] = useState<TendenciaTemporal[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [cidadesPlotadas, setCidadesPlotadas] = useState(0);
  const [cidadesCoordenadas, setCidadesCoordenadas] = useState<CidadeCoordenadas[]>([]);
  const [cidadesFluxo, setCidadesFluxo] = useState<CidadeFluxo[]>([]);
  const [estrategiasMarketing, setEstrategiasMarketing] = useState<Record<string, string>>({});

  const [documentosPeriodo, setDocumentosPeriodo] = useState<DocumentoAnalise[]>([]); // Novo estado para documentos filtrados por período

  const formatDate = (date: string | Timestamp): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return new Date(date);
  };

  const convertStringToNumber = (value: string): number => {
    if (!value || typeof value !== 'string') return 0;
    let cleanedValue = value.replace(/R\$\s*/g, '').trim();
    const hasComma = cleanedValue.includes(',');
    const hasDot = cleanedValue.includes('.');

    if (hasComma && hasDot) {
      cleanedValue = cleanedValue.replace(/\./g, '').replace(',', '.');
    } else if (hasComma && !hasDot) {
      cleanedValue = cleanedValue.replace(',', '.');
    }

    const numberValue = parseFloat(cleanedValue);
    return isNaN(numberValue) ? 0 : numberValue;
  };

  useEffect(() => {
    carregarDados();
  }, [periodoAnalise]);

  const carregarDados = async () => {
    setLoading(true);
    console.log('🔄 Iniciando carregamento de dados...');
    try {
      const colecaoRef = collection(db, 'Betodespachanteintrncaodevendaoficialdigital');
      console.log('📡 Buscando documentos do Firebase...');
      const snapshot = await getDocs(colecaoRef);

      let todosDocumentos: DocumentoAnalise[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<DocumentoAnalise, 'id'>;
        todosDocumentos.push({ id: doc.id, ...data });
      });

      console.log(`📊 Total de documentos no Firebase: ${todosDocumentos.length}`);

      const dataLimite = calcularDataLimite(periodoAnalise);
      const documentosFiltrados = todosDocumentos.filter(doc => {
        const dataDoc = formatDate(doc.dataCriacao);
        return dataDoc >= dataLimite;
      });

      console.log(`📅 Documentos no período "${periodoAnalise}": ${documentosFiltrados.length}`);

      setDocumentos(documentosFiltrados); // Mantém todos os documentos para outras análises se necessário
      setDocumentosPeriodo(documentosFiltrados); // Define os documentos filtrados para as análises do período
      await analisarDados(documentosFiltrados);

      if (documentosFiltrados.length > 0) {
        await gerarInsightsComIA(documentosFiltrados);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido');

      setDocumentos([]);
      setDocumentosPeriodo([]);
      setMetricas({
        totalDocumentos: 0,
        totalReceita: 0,
        ticketMedio: 0,
        crescimentoMensal: 0,
        clientesUnicos: 0,
        cidadesAtendidas: 0,
      });
      setTopCidades([]);
      setTendencias([]);
    }
    setLoading(false);
  };

  const calcularDataLimite = (periodo: string): Date => {
    const hoje = new Date();
    const diaAtual = hoje.getDate();
    
    switch (periodo) {
      case 'dia': 
        return new Date(hoje.setDate(hoje.getDate() - 1));
      
      case 'semana': 
        return new Date(hoje.setDate(hoje.getDate() - 7));
      
      case 'mes': 
        // Período mensal: do dia 5 do mês anterior ao dia 5 do mês atual
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        
        if (diaAtual >= 5) {
          // Se já passou do dia 5, pega do dia 5 do mês passado
          return new Date(anoAtual, mesAtual - 1, 5, 0, 0, 0, 0);
        } else {
          // Se ainda não chegou no dia 5, pega do dia 5 de 2 meses atrás
          return new Date(anoAtual, mesAtual - 2, 5, 0, 0, 0, 0);
        }
      
      case 'trimestre': 
        return new Date(hoje.setMonth(hoje.getMonth() - 3));
      
      case 'ano': 
        return new Date(hoje.setFullYear(hoje.getFullYear() - 1));
      
      default: 
        // Default também usa a lógica mensal do dia 5
        const mesDefault = hoje.getMonth();
        const anoDefault = hoje.getFullYear();
        if (diaAtual >= 5) {
          return new Date(anoDefault, mesDefault - 1, 5, 0, 0, 0, 0);
        } else {
          return new Date(anoDefault, mesDefault - 2, 5, 0, 0, 0, 0);
        }
    }
  };

  const gerarHashDocumento = (doc: DocumentoAnalise): string => {
    const dadosChave = [

      doc.nomecomprador?.toLowerCase().trim(),

      doc.cpfcomprador?.replace(/\D/g, ''),
      doc.placa?.toUpperCase().trim(),
      doc.renavam?.trim(),
    ].filter(Boolean).join('|');

    return dadosChave;
  };

  const deduplicarDocumentos = (docs: DocumentoAnalise[]): DocumentoAnalise[] => {
    const hashMap = new Map<string, DocumentoAnalise>();

    docs.forEach(doc => {
      const hash = gerarHashDocumento(doc);

      if (!hash || hash === '') {
        hashMap.set(doc.id, doc);
        return;
      }

      if (!hashMap.has(hash)) {
        hashMap.set(hash, doc);
      } else {
        const docExistente = hashMap.get(hash)!;
        const dataExistente = formatDate(docExistente.dataCriacao);
        const dataAtual = formatDate(doc.dataCriacao);

        if (dataAtual > dataExistente) {
          hashMap.set(hash, doc);
        }
      }
    });

    return Array.from(hashMap.values());
  };

  const analisarDados = async (docs: DocumentoAnalise[]) => {
    const docsUnicos = deduplicarDocumentos(docs);

    console.log(`📊 Documentos antes da deduplicação: ${docs.length}`);
    console.log(`✅ Documentos após deduplicação: ${docsUnicos.length}`);
    console.log(`🗑️ Documentos duplicados removidos: ${docs.length - docsUnicos.length}`);

    // Calcular métricas usando APENAS documentos do período (docsUnicos já são os filtrados)
    const totalReceita = docsUnicos.reduce((sum, doc) => {
      const valorProduto = calcularValorPorProduto(doc.produtosSelecionados || (doc as any).tipo);
      return sum + valorProduto;
    }, 0);

    const clientesUnicosSet = new Set(docsUnicos.map(doc => doc.nomeempresa || doc.nomecomprador).filter(Boolean));
    const cidadesSet = new Set([
      ...docsUnicos.map(doc => doc.municipiocomprador).filter(Boolean),
    ]);

    setMetricas({
      totalDocumentos: docsUnicos.length,
      totalReceita: totalReceita,
      ticketMedio: docsUnicos.length > 0 ? totalReceita / docsUnicos.length : 0,
      crescimentoMensal: calcularCrescimento(docsUnicos),
      clientesUnicos: clientesUnicosSet.size,
      cidadesAtendidas: cidadesSet.size,
    });

    await analisarCidades(docsUnicos);
    analisarTendencias(docsUnicos);
  };

  const cacheCoordenadasRef = useRef<Map<string, { lat: number; lon: number; cidade: string; estado: string } | null>>(new Map());

  const coordenadasSC: { [key: string]: { lat: number; lon: number } } = {
    'Florianópolis': { lat: -27.5954, lon: -48.5480 },
    'Joinville': { lat: -26.3045, lon: -48.8487 },
    'Blumenau': { lat: -26.9194, lon: -49.0661 },
    'São José': { lat: -27.5969, lon: -48.6334 },
    'Criciúma': { lat: -28.6773, lon: -49.3694 },
    'Chapecó': { lat: -27.1004, lon: -52.6156 },
    'Itajaí': { lat: -26.9078, lon: -48.6619 },
    'Jaraguá do Sul': { lat: -26.4867, lon: -49.0778 },
    'Lages': { lat: -27.8157, lon: -50.3261 },
    'Palhoça': { lat: -27.6453, lon: -48.6702 },
    'Tubarão': { lat: -28.4669, lon: -49.0069 },
    'Braço do Norte': { lat: -28.2756, lon: -49.1644 },
    'Içara': { lat: -28.7144, lon: -49.3019 },
    'Jaguaruna': { lat: -28.6147, lon: -49.0256 },
    'Orleans': { lat: -28.3594, lon: -49.2919 },
    'Araranguá': { lat: -28.9358, lon: -49.4953 },
    'Capivari de Baixo': { lat: -28.4453, lon: -48.9642 },
    'Nova Veneza': { lat: -28.6383, lon: -49.4989 },
    'Urussanga': { lat: -28.5211, lon: -49.3194 },
    'Cocal do Sul': { lat: -28.5978, lon: -49.3269 },
    'Laguna': { lat: -28.4800, lon: -48.7792 },
  };

  const buscarCidadePorCNPJ = async (cnpj: string): Promise<{ lat: number; lon: number; cidade: string; estado: string } | null> => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Verificar cache primeiro
    const cacheKey = `cnpj_${cnpjLimpo}`;
    if (cacheCoordenadasRef.current.has(cacheKey)) {
      const cached = cacheCoordenadasRef.current.get(cacheKey);
      if (cached) {
        console.log(`📦 CNPJ ${cnpjLimpo} encontrado no cache: ${cached.cidade}`);
      }
      return cached || null;
    }

    if (cnpjLimpo.length !== 14) {
      console.warn(`❌ CNPJ inválido: ${cnpjLimpo}`);
      cacheCoordenadasRef.current.set(cacheKey, null);
      return null;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`🔍 Buscando CNPJ ${cnpjLimpo} para localizar cidade...`);

      const response = await fetch(`/api/cnpj?cnpj=${cnpjLimpo}`);
      
      if (!response.ok) {
        console.warn(`⚠️ Erro ao buscar CNPJ ${cnpjLimpo}: ${response.status}`);
        cacheCoordenadasRef.current.set(cacheKey, null);
        return null;
      }

      const data = await response.json();

      if (!data.endereco || !data.endereco.city || !data.endereco.state) {
        console.warn(`⚠️ CNPJ ${cnpjLimpo} sem endereço completo`);
        cacheCoordenadasRef.current.set(cacheKey, null);
        return null;
      }

      const cidadeNormalizada = normalizarNomeCidade(data.endereco.city);
      const estado = data.endereco.state.toUpperCase();

      // Verificar se é cidade de Santa Catarina
      if (estado !== 'SC') {
        console.warn(`⚠️ CNPJ ${cnpjLimpo} não é de Santa Catarina: ${estado}`);
        cacheCoordenadasRef.current.set(cacheKey, null);
        return null;
      }

      // Buscar coordenadas precisas
      const coords = coordenadasSC[cidadeNormalizada] || coordenadasSC[data.endereco.city];
      
      if (!coords) {
        console.warn(`⚠️ Coordenadas não encontradas para ${cidadeNormalizada}`);
        const resultado = {
          lat: -27.5954,
          lon: -48.5480,
          cidade: cidadeNormalizada,
          estado: 'SC'
        };
        cacheCoordenadasRef.current.set(cacheKey, resultado);
        return resultado;
      }

      const resultado = {
        lat: coords.lat,
        lon: coords.lon,
        cidade: cidadeNormalizada,
        estado: 'SC'
      };

      console.log(`✅ CNPJ ${cnpjLimpo} mapeado para ${cidadeNormalizada}: ${coords.lat}, ${coords.lon}`);
      cacheCoordenadasRef.current.set(cacheKey, resultado);
      return resultado;

    } catch (error: any) {
      console.error(`❌ Erro ao buscar CNPJ ${cnpjLimpo}:`, error.message);
      cacheCoordenadasRef.current.set(cacheKey, null);
      return null;
    }
  };

  const buscarCoordenadasPorCEP = async (cep: string): Promise<{ lat: number; lon: number; cidade: string; estado: string } | null> => {
    const cepLimpo = cep.replace(/\D/g, '');

    // Verificar cache primeiro
    if (cacheCoordenadasRef.current.has(cepLimpo)) {
      const cached = cacheCoordenadasRef.current.get(cepLimpo);
      if (cached) {
        console.log(`📦 CEP ${cepLimpo} encontrado no cache: ${cached.cidade}`);
      }
      return cached || null;
    }

    // Validação agressiva do CEP
    if (!validarCEP(cepLimpo)) {
      console.warn(`❌ CEP inválido rejeitado: ${cepLimpo}`);
      cacheCoordenadasRef.current.set(cepLimpo, null);
      return null;
    }

    try {
      // Delay para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 150));

      console.log(`🔍 Buscando CEP ${cepLimpo} no ViaCEP...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`❌ Erro HTTP ${response.status} ao buscar CEP ${cepLimpo}`);
        cacheCoordenadasRef.current.set(cepLimpo, null);
        return null;
      }

      const data = await response.json();

      if (data.erro || !data.localidade || !data.uf) {
        console.warn(`⚠️ CEP ${cepLimpo} não encontrado ou inválido no ViaCEP`);
        cacheCoordenadasRef.current.set(cepLimpo, null);
        return null;
      }

      // Normalizar nome da cidade
      const cidadeNormalizada = normalizarNomeCidade(data.localidade);

      // Verificar se é cidade de Santa Catarina
      if (data.uf !== 'SC') {
        console.warn(`⚠️ CEP ${cepLimpo} não é de Santa Catarina: ${data.uf}`);
        cacheCoordenadasRef.current.set(cepLimpo, null);
        return null;
      }

      // Buscar coordenadas precisas
      const coords = coordenadasSC[cidadeNormalizada] || coordenadasSC[data.localidade];
      
      if (!coords) {
        console.warn(`⚠️ Coordenadas não encontradas para ${cidadeNormalizada}`);
        // Usar coordenadas padrão de SC como fallback
        const resultado = {
          lat: -27.5954,
          lon: -48.5480,
          cidade: cidadeNormalizada,
          estado: 'SC'
        };
        cacheCoordenadasRef.current.set(cepLimpo, resultado);
        return resultado;
      }

      const resultado = {
        lat: coords.lat,
        lon: coords.lon,
        cidade: cidadeNormalizada,
        estado: 'SC'
      };

      console.log(`✅ CEP ${cepLimpo} mapeado para ${cidadeNormalizada}: ${coords.lat}, ${coords.lon}`);
      cacheCoordenadasRef.current.set(cepLimpo, resultado);
      return resultado;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`⏱️ Timeout ao buscar CEP ${cepLimpo}`);
      } else {
        console.error(`❌ Erro ao buscar CEP ${cepLimpo}:`, error.message);
      }
      cacheCoordenadasRef.current.set(cepLimpo, null);
      return null;
    }
  };

  const normalizarNomeCidade = (nome: string): string => {
    let nomeNormalizado = nome
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    // Casos especiais: substituir números por extenso ANTES de remover caracteres especiais
    if (nomeNormalizado.includes('13 DE MAIO') || nomeNormalizado.includes('TREZE DE MAIO')) {
      nomeNormalizado = 'TREZE DE MAIO';
    }
    
    return nomeNormalizado.replace(/\s+/g, ' ');
  };

  const validarCEP = (cep: string): boolean => {
    if (!cep) return false;
    const cepLimpo = cep.replace(/\D/g, '');
    
    // CEP deve ter exatamente 8 dígitos
    if (cepLimpo.length !== 8) return false;
    
    // Não aceitar CEPs com todos os dígitos iguais
    if (/^(\d)\1{7}$/.test(cepLimpo)) return false;
    
    // CEP não pode começar com 00
    if (cepLimpo.startsWith('00')) return false;
    
    // Verificar se está na faixa de CEPs de Santa Catarina (88000-000 a 89999-999)
    const primeirosDigitos = parseInt(cepLimpo.substring(0, 2));
    if (primeirosDigitos < 88 || primeirosDigitos > 89) return false;
    
    return true;
  };

  const analisarCidades = async (docs: DocumentoAnalise[]) => {
    const cidadesMap = new Map<string, CidadeMetrica>();
    const coordenadasMap = new Map<string, CidadeCoordenadas>();
    const cepsPorCidade = new Map<string, Set<string>>();
    const cnpjsPorCidade = new Map<string, Set<string>>();

    console.log(`📊 Iniciando análise de ${docs.length} documentos`);

    // Primeira passagem: agrupar documentos por cidade usando CNPJ ou CEP
    for (const doc of docs) {
      let cidadeNome: string | null = null;
      let coords: { lat: number; lon: number; cidade: string; estado: string } | null = null;

      // PRIORIDADE 1: Usar CNPJ da empresa se disponível
      if (doc.cnpjempresa) {
        const cnpjLimpo = doc.cnpjempresa.replace(/\D/g, '');
        if (cnpjLimpo.length === 14) {
          coords = await buscarCidadePorCNPJ(cnpjLimpo);
          if (coords) {
            cidadeNome = coords.cidade;
            console.log(`🏢 Cidade identificada via CNPJ: ${cidadeNome}`);
            
            // Armazenar CNPJ por cidade
            if (!cnpjsPorCidade.has(cidadeNome)) {
              cnpjsPorCidade.set(cidadeNome, new Set());
            }
            cnpjsPorCidade.get(cidadeNome)!.add(cnpjLimpo);
          }
        }
      }

      // PRIORIDADE 2: Usar CEP do comprador se CNPJ não funcionou
      if (!cidadeNome && doc.cepcomprador) {
        const cepComprador = doc.cepcomprador.replace(/\D/g, '');
        const cepValido = validarCEP(cepComprador);

        if (cepValido) {
          coords = await buscarCoordenadasPorCEP(cepComprador);
          if (coords) {
            cidadeNome = coords.cidade;
            console.log(`📍 Cidade identificada via CEP: ${cidadeNome}`);
            
            // Armazenar CEP por cidade
            if (!cepsPorCidade.has(cidadeNome)) {
              cepsPorCidade.set(cidadeNome, new Set());
            }
            cepsPorCidade.get(cidadeNome)!.add(cepComprador);
          }
        } else {
          console.warn(`❌ CEP inválido: ${doc.cepcomprador}`);
        }
      }

      // FALLBACK: Usar municipiocomprador se fornecido
      if (!cidadeNome && doc.municipiocomprador) {
        cidadeNome = normalizarNomeCidade(doc.municipiocomprador.trim());
        console.log(`📋 Cidade usada do campo municipiocomprador: ${cidadeNome}`);
      }

      // Se conseguimos identificar a cidade
      if (cidadeNome) {
        // Atualizar métricas da cidade
        const metricaAtual = cidadesMap.get(cidadeNome) || {
          cidade: cidadeNome,
          receita: 0,
          documentos: 0,
        };

        metricaAtual.documentos += 1;
        const valorProduto = calcularValorPorProduto(doc.produtosSelecionados || (doc as any).tipo);
        metricaAtual.receita += valorProduto;
        cidadesMap.set(cidadeNome, metricaAtual);

        // Armazenar coordenadas se encontradas
        if (coords && !coordenadasMap.has(cidadeNome)) {
          coordenadasMap.set(cidadeNome, {
            cidade: cidadeNome,
            latitude: coords.lat,
            longitude: coords.lon,
            estado: coords.estado
          });
        }

        // Verificar se já temos coordenadas locais
        if (!coordenadasMap.has(cidadeNome) && coordenadasSC[cidadeNome]) {
          coordenadasMap.set(cidadeNome, {
            cidade: cidadeNome,
            latitude: coordenadasSC[cidadeNome].lat,
            longitude: coordenadasSC[cidadeNome].lon,
            estado: 'SC'
          });
        }
      }

      // Delay entre documentos para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`✅ Cidades válidas após filtro: ${cidadesMap.size}`);
    console.log(`📍 CEPs únicos por cidade:`, Array.from(cepsPorCidade.entries()).map(([c, ceps]) => `${c}: ${ceps.size}`));
    console.log(`🏢 CNPJs únicos por cidade:`, Array.from(cnpjsPorCidade.entries()).map(([c, cnpjs]) => `${c}: ${cnpjs.size}`));

    // Ordenar e limitar resultados
    const cidadesOrdenadas = Array.from(cidadesMap.values())
      .filter(cidade => {
        // Filtro adicional: apenas cidades com pelo menos 2 documentos
        const temDadosSuficientes = cidade.cidade && 
                                    cidade.cidade.length > 0 && 
                                    cidade.documentos >= 1;
        
        if (!temDadosSuficientes) {
          console.warn(`⚠️ Cidade ${cidade.cidade} removida: dados insuficientes`);
        }
        
        return temDadosSuficientes;
      })
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 20); // Top 20 cidades

    console.log(`🏆 Top ${cidadesOrdenadas.length} cidades após análise completa`);
    console.log('📊 Ranking:', cidadesOrdenadas.map((c, i) => 
      `${i + 1}. ${c.cidade}: ${c.documentos} docs, ${formatCurrency(c.receita)}`
    ));

    setTopCidades(cidadesOrdenadas);
    setCidadesPlotadas(cidadesOrdenadas.length);
    setCidadesCoordenadas(Array.from(coordenadasMap.values()));

    // Gerar dados de fluxo para as cidades
    const fluxoCidades = cidadesOrdenadas.map(cidade => ({
      nome: cidade.cidade,
      documentos: cidade.documentos,
      receita: cidade.receita,
      horaPico: calcularHoraPico(docs, cidade.cidade),
      tendencia: calcularTendencia(docs, cidade.cidade),
      crescimento: calcularCrescimentoCidade(docs, cidade.cidade),
      potencialMarketing: calcularPotencialMarketing(cidade.documentos, cidade.receita),
    }));
    
    setCidadesFluxo(fluxoCidades);

    console.log(`✨ Análise de cidades concluída: ${cidadesOrdenadas.length} cidades válidas`);
  };

  const calcularHoraPico = (docs: DocumentoAnalise[], cidade: string): string => {
    const docsCidade = docs.filter(d => d.municipiocomprador === cidade || d.municipiocomprador === cidade);
    const horas = docsCidade.map(d => {
      const data = formatDate(d.dataCriacao);
      return data.getHours();
    });

    const horaMaisFrequente = horas.sort((a,b) =>
      horas.filter(v => v === a).length - horas.filter(v => v === b).length
    ).pop();

    return `${horaMaisFrequente || 14}:00`;
  };

  const calcularTendencia = (docs: DocumentoAnalise[], cidade: string): 'up' | 'down' | 'stable' => {
    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);

    const docsRecentes = docs.filter(d => {
      const data = formatDate(d.dataCriacao);
      return (d.municipiocomprador === cidade || d.municipiocomprador === cidade) && data >= mesPassado;
    }).length;

    const docsAntigos = docs.filter(d => {
      const data = formatDate(d.dataCriacao);
      return (d.municipiocomprador === cidade || d.municipiocomprador === cidade) && data < mesPassado;
    }).length;

    if (docsRecentes > docsAntigos * 1.1) return 'up';
    if (docsRecentes < docsAntigos * 0.9) return 'down';
    return 'stable';
  };

  const calcularCrescimentoCidade = (docs: DocumentoAnalise[], cidade: string): number => {
    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);

    const docsRecentes = docs.filter(d => {
      const data = formatDate(d.dataCriacao);
      return (d.municipiocomprador === cidade || d.municipiocomprador === cidade) && data >= mesPassado;
    }).length;

    const docsAntigos = docs.filter(d => {
      const data = formatDate(d.dataCriacao);
      return (d.municipiocomprador === cidade || d.municipiocomprador === cidade) && data < mesPassado;
    }).length;

    if (docsAntigos === 0) return 100;
    return ((docsRecentes - docsAntigos) / docsAntigos) * 100;
  };

  const calcularPotencialMarketing = (documentos: number, receita: number): number => {
    const volumeScore = Math.min(100, (documentos / 100) * 50);
    const ticketScore = Math.min(50, (receita / documentos / 100) * 50);
    return Math.round(volumeScore + ticketScore);
  };

  const analisarTendencias = (docs: DocumentoAnalise[]) => {
    const tendenciasMap = new Map<string, { periodo: string; quantidade: number; receita: number; timestamp: number }>();

    docs.forEach((doc) => {
      const data = formatDate(doc.dataCriacao);
      const periodo = formatarPeriodo(data, periodoAnalise);

      const tendenciaAtual = tendenciasMap.get(periodo) || {
        periodo: periodo,
        quantidade: 0,
        receita: 0,
        timestamp: data.getTime(),
      };

      tendenciaAtual.quantidade += 1;
      const valorProduto = calcularValorPorProduto(doc.produtosSelecionados || (doc as any).tipo);
      tendenciaAtual.receita += valorProduto;
      tendenciasMap.set(periodo, tendenciaAtual);
    });

    // Ordena por timestamp para garantir ordem cronológica correta
    const tendenciasOrdenadas = Array.from(tendenciasMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ periodo, quantidade, receita }) => ({ periodo, quantidade, receita }));

    setTendencias(tendenciasOrdenadas);
  };

  const formatarPeriodo = (data: Date, tipoPeriodo: string): string => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');

    switch (tipoPeriodo) {
      case 'dia':
        // Agrupa por hora do dia
        return `${dia}/${mes} ${hora}:00`;
      case 'semana':
        // Agrupa por dia da semana
        return `${dia}/${mes}`;
      case 'mes':
        // Agrupa por dia do mês
        return `${dia}/${mes}`;
      case 'trimestre':
        // Agrupa por semana
        return `${mes}/S${Math.ceil(data.getDate() / 7)}`;
      case 'ano':
        // Agrupa por mês
        return `${mes}/${ano}`;
      default:
        return `${dia}/${mes}`;
    }
  };

  const calcularCrescimento = (docs: DocumentoAnalise[]): number => {
    if (docs.length < 2) return 0;

    const hoje = new Date();
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const doisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);

    const docsMesAtual = docs.filter(doc => formatDate(doc.dataCriacao) >= mesPassado);
    const docsMesAnterior = docs.filter(doc => {
      const dataDoc = formatDate(doc.dataCriacao);
      return dataDoc >= doisMesesAtras && dataDoc < mesPassado;
    });

    if (docsMesAnterior.length === 0) return 100;
    return ((docsMesAtual.length - docsMesAnterior.length) / docsMesAnterior.length) * 100;
  };

  const gerarInsightsComIA = async (docs: DocumentoAnalise[]) => {
    try {
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) return;

      const dadosParaIA = {
        totalDocumentos: docs.length,
        totalReceita: docs.reduce((sum, doc) => sum + convertStringToNumber(doc.valordevenda || '0'), 0),
        cidadesMaisAtivas: topCidades.slice(0, 3),
        crescimento: metricas.crescimentoMensal,
      };

      const prompt = `Analise estes dados de vendas e gere 3 insights práticos em JSON:
${JSON.stringify(dadosParaIA)}

Retorne APENAS:
[
  {
    "titulo": "Título curto",
    "descricao": "Descrição objetiva com ação recomendada",
    "prioridade": "alta|media|baixa"
  }
]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          setAiInsights(JSON.parse(jsonMatch[0]));
        }
      }
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    }
  };

  const gerarEstrategiaMarketing = async (cidade: string): Promise<string> => {
    try {
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) return 'Chave API não configurada';

      const cidadeData = topCidades.find(c => c.cidade === cidade);
      if (!cidadeData) return 'Dados não encontrados';

      const prompt = `Você é um especialista em marketing digital e CRM para despachantes automotivos.

Analise os dados da cidade de ${cidade}:
- ${cidadeData.documentos} documentos processados
- R$ ${cidadeData.receita.toLocaleString('pt-BR')} em receita
- Ticket médio: R$ ${(cidadeData.receita / cidadeData.documentos).toFixed(2)}

Gere uma estratégia de marketing COMPLETA e PRÁTICA com:
1. **Ações de curto prazo (próximos 7 dias)**
2. **Campanhas específicas para esta região**
3. **Horários ideais para contato**
4. **Mensagens personalizadas para WhatsApp e email**
5. **Investimento sugerido em marketing digital**
6. **KPIs para acompanhar**

Seja DIRETO, PRÁTICO e ACIONÁVEL. Foco em RESULTADOS IMEDIATOS.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro ao gerar estratégia';
      }
      return 'Erro na API';
    } catch (error) {
      console.error('Erro ao gerar estratégia:', error);
      return 'Erro ao processar';
    }
  };

  const handleEnviarWhatsApp = (lead: any) => {
    const mensagem = `Olá ${lead.nome}! 👋\n\nSomos do Despachante Beto Dehon e identificamos que você pode estar precisando de nossos serviços de ${lead.servico}.\n\nTemos uma proposta especial para você! 🎯\n\nPodemos conversar?`;
    const url = `https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const handleEnviarEmail = (lead: any) => {
    const assunto = `Proposta Especial - ${lead.servico}`;
    const corpo = `Prezado(a) ${lead.nome},\n\nIdentificamos que você pode estar interessado em nossos serviços de ${lead.servico}.\n\nTemos uma proposta personalizada que pode te ajudar!\n\nAtenciosamente,\nDespachante Beto Dehon`;
    window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  };

  const gerarAnaliseCidadesEstrategicas = async () => {
    try {
      setLoading(true);

      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) {
        alert('API Key da Gemini não configurada');
        return;
      }

      const cidadesEstrategicas = ['Criciúma', 'Tubarão', 'Jaguaruna', '13 de Maio'];
      
      // Filtrar documentos usando CNPJ ou CEP para identificar cidade
      const docsCidades: DocumentoAnalise[] = [];
      
      for (const doc of documentosPeriodo) {
        let cidadeDoc: string | null = null;

        // PRIORIDADE 1: Usar CNPJ da empresa
        if (doc.cnpjempresa) {
          const cnpjLimpo = doc.cnpjempresa.replace(/\D/g, '');
          if (cnpjLimpo.length === 14) {
            const coords = await buscarCidadePorCNPJ(cnpjLimpo);
            if (coords) {
              cidadeDoc = coords.cidade;
            }
          }
        }

        // PRIORIDADE 2: Usar CEP do comprador
        if (!cidadeDoc && doc.cepcomprador) {
          const cepComprador = doc.cepcomprador.replace(/\D/g, '');
          if (validarCEP(cepComprador)) {
            const coords = await buscarCoordenadasPorCEP(cepComprador);
            if (coords) {
              cidadeDoc = coords.cidade;
            }
          }
        }

        // FALLBACK: municipiocomprador
        if (!cidadeDoc && doc.municipiocomprador) {
          cidadeDoc = normalizarNomeCidade(doc.municipiocomprador);
        }

        // Verificar se a cidade está na lista estratégica
        if (cidadeDoc) {
          const pertenceAListaEstrategica = cidadesEstrategicas.some(cidade => {
            const cidadeNormalizada = normalizarNomeCidade(cidade);
            return cidadeDoc === cidadeNormalizada || 
                   cidadeDoc!.includes(cidadeNormalizada) || 
                   cidadeNormalizada.includes(cidadeDoc!);
          });

          if (pertenceAListaEstrategica) {
            docsCidades.push(doc);
          }
        }

        // Delay entre documentos
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      if (docsCidades.length === 0) {
        alert('Nenhum documento encontrado para as cidades estratégicas (Criciúma, Tubarão, Jaguaruna, 13 de Maio)');
        setLoading(false);
        return;
      }

      // Agrupar dados por cidade
      const dadosPorCidade: { [key: string]: { documentos: number; receita: number; clientes: Set<string>; cepUsados: Set<string>; cnpjUsados: Set<string> } } = {};
      
      cidadesEstrategicas.forEach(cidade => {
        dadosPorCidade[cidade] = { 
          documentos: 0, 
          receita: 0, 
          clientes: new Set(),
          cepUsados: new Set(),
          cnpjUsados: new Set()
        };
      });

      docsCidades.forEach(doc => {
        const cidade = cidadesEstrategicas.find(c => 
          doc.municipiocomprador?.toLowerCase().includes(c.toLowerCase())
        );
        if (cidade) {
          dadosPorCidade[cidade].documentos += 1;
          dadosPorCidade[cidade].receita += calcularValorPorProduto(doc.produtosSelecionados || (doc as any).tipo);
          
          if (doc.nomecomprador || doc.nomeempresa) {
            dadosPorCidade[cidade].clientes.add(doc.nomecomprador || doc.nomeempresa || '');
          }
          
          if (doc.cepcomprador) {
            dadosPorCidade[cidade].cepUsados.add(doc.cepcomprador);
          }
          
          if (doc.cnpjempresa) {
            dadosPorCidade[cidade].cnpjUsados.add(doc.cnpjempresa);
          }
        }
      });

      const analiseDetalhada = cidadesEstrategicas.map(cidade => ({
        cidade,
        documentos: dadosPorCidade[cidade].documentos,
        receita: dadosPorCidade[cidade].receita,
        clientesUnicos: dadosPorCidade[cidade].clientes.size,
        ticketMedio: dadosPorCidade[cidade].documentos > 0 
          ? dadosPorCidade[cidade].receita / dadosPorCidade[cidade].documentos 
          : 0,
        cepsUnicos: dadosPorCidade[cidade].cepUsados.size,
        cnpjsUnicos: dadosPorCidade[cidade].cnpjUsados.size
      }));

      const prompt = `Você é um consultor especialista em marketing digital e expansão de mercado para despachantes automotivos em Santa Catarina.

**MISSÃO**: Criar um plano de marketing COMPLETO e DETALHADO para as 4 cidades estratégicas abaixo.

**DADOS DAS CIDADES**:
${analiseDetalhada.map(c => `
📍 **${c.cidade}**
- Documentos processados: ${c.documentos}
- Receita total: R$ ${c.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Clientes únicos: ${c.clientesUnicos}
- Ticket médio: R$ ${c.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- CEPs diferentes: ${c.cepsUnicos} (indica dispersão geográfica na cidade)
- Empresas (CNPJ): ${c.cnpjsUnicos}
`).join('\n')}

**PERÍODO ANALISADO**: ${periodoAnalise.toUpperCase()}

**TOTAL CONSOLIDADO**:
- Documentos: ${docsCidades.length}
- Receita total: R$ ${analiseDetalhada.reduce((sum, c) => sum + c.receita, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Ticket médio geral: R$ ${(analiseDetalhada.reduce((sum, c) => sum + c.receita, 0) / docsCidades.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

**CRIE UM RELATÓRIO COMPLETO COM**:

## 1. RESUMO EXECUTIVO
- Visão geral do mercado nas 4 cidades
- Principais oportunidades identificadas
- Desafios e pontos de atenção

## 2. ANÁLISE DETALHADA POR CIDADE
Para cada cidade, inclua:
- Perfil do mercado local
- Potencial de crescimento
- Concorrência estimada
- Demografia e características econômicas
- Sazonalidade e períodos de alta demanda

## 3. ESTRATÉGIAS DE MARKETING ESPECÍFICAS
Para cada cidade, crie:
- **Canais prioritários** (Google Ads, Facebook/Instagram, WhatsApp, etc.)
- **Mensagens-chave** adaptadas ao público local
- **Investimento sugerido** (valor mensal recomendado)
- **Palavras-chave** para SEO e Google Ads
- **Parcerias locais** sugeridas (autoescolas, revendas, etc.)

## 4. PLANO DE AÇÃO 30 DIAS
Cronograma detalhado semana a semana com:
- Ações de marketing a executar
- Investimentos necessários
- Metas de conversão
- KPIs para acompanhar

## 5. CAMPANHAS CRIATIVAS
Crie 3 campanhas específicas por cidade com:
- Título da campanha
- Público-alvo
- Mensagem principal
- Call-to-action
- Canais de divulgação
- Orçamento estimado

## 6. PROJEÇÃO DE RESULTADOS
- ROI esperado por cidade
- Crescimento projetado em 3, 6 e 12 meses
- Número estimado de novos clientes
- Aumento de receita projetado

## 7. FERRAMENTAS E RECURSOS
- Ferramentas de automação recomendadas
- Templates de mensagens WhatsApp
- Scripts para atendimento
- Materiais gráficos necessários

## 8. MÉTRICAS DE SUCESSO
- KPIs principais a acompanhar
- Frequência de análise
- Ajustes necessários conforme resultados

Seja ESPECÍFICO, PRÁTICO e ACIONÁVEL. Use dados reais e recomendações que possam ser implementadas IMEDIATAMENTE.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 8192
            }
          })
        }
      );

      if (!response.ok) throw new Error('Erro ao gerar análise');

      const result = await response.json();
      const analise = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Criar janela de impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Bloqueador de pop-ups ativo. Por favor, permita pop-ups para visualizar a análise.');
        return;
      }

      const htmlAnalise = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Análise Estratégica - 4 Cidades SC</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.7;
              color: #2c3e50;
              background: white;
            }
            .cover-page {
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              page-break-after: always;
              padding: 40px;
            }
            .cover-page h1 {
              font-size: 48pt;
              margin-bottom: 20px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .cover-page .subtitle {
              font-size: 20pt;
              opacity: 0.95;
              margin-bottom: 40px;
              font-weight: 300;
            }
            .cover-page .cidades {
              font-size: 28pt;
              font-weight: bold;
              margin: 30px 0;
              padding: 20px 40px;
              background: rgba(255,255,255,0.15);
              border-radius: 12px;
              backdrop-filter: blur(10px);
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 40px 0;
              width: 80%;
            }
            .metric-card {
              background: rgba(255,255,255,0.2);
              padding: 20px;
              border-radius: 12px;
              backdrop-filter: blur(10px);
            }
            .metric-label {
              font-size: 12pt;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .metric-value {
              font-size: 32pt;
              font-weight: bold;
            }
            .content {
              padding: 30px;
              max-width: 210mm;
              margin: 0 auto;
            }
            h1 {
              color: #667eea;
              font-size: 28pt;
              border-bottom: 4px solid #667eea;
              padding-bottom: 12px;
              margin: 40px 0 25px 0;
              page-break-after: avoid;
            }
            h2 {
              color: #764ba2;
              font-size: 20pt;
              margin: 30px 0 18px 0;
              page-break-after: avoid;
              padding-left: 12px;
              border-left: 4px solid #f093fb;
            }
            h3 {
              color: #4a7c59;
              font-size: 16pt;
              margin: 25px 0 12px 0;
            }
            p {
              margin-bottom: 14px;
              text-align: justify;
            }
            ul, ol {
              margin: 18px 0 18px 30px;
            }
            li {
              margin-bottom: 10px;
            }
            strong {
              color: #667eea;
              font-weight: 700;
            }
            .cidade-section {
              background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
              padding: 25px;
              margin: 25px 0;
              border-radius: 12px;
              border-left: 6px solid #667eea;
              page-break-inside: avoid;
            }
            .action-box {
              background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
              border-left: 5px solid #4caf50;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .footer {
              margin-top: 50px;
              padding: 25px;
              border-top: 3px solid #667eea;
              text-align: center;
              font-size: 10pt;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 11pt;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e0e0e0;
            }
            @media print {
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="cover-page">
            <div style="font-size: 80pt; margin-bottom: 30px;">📊</div>
            <h1>Análise Estratégica de Marketing</h1>
            <p class="subtitle">Plano Completo para Expansão Regional</p>
            <div class="cidades">
              Criciúma • Tubarão • Jaguaruna • 13 de Maio
            </div>
            <div class="metrics-grid">
              ${analiseDetalhada.map(c => `
                <div class="metric-card">
                  <div class="metric-label">${c.cidade}</div>
                  <div class="metric-value">${c.documentos}</div>
                  <div class="metric-label">documentos</div>
                </div>
              `).join('')}
            </div>
            <p style="margin-top: 60px; font-size: 14pt;">
              ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div class="content">
            <h1>📈 Resumo das Cidades Analisadas</h1>
            <table>
              <thead>
                <tr>
                  <th>Cidade</th>
                  <th>Documentos</th>
                  <th>Receita Total</th>
                  <th>Clientes</th>
                  <th>Empresas</th>
                  <th>CEPs</th>
                  <th>Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                ${analiseDetalhada.map(c => `
                  <tr>
                    <td><strong>${c.cidade}</strong></td>
                    <td>${c.documentos}</td>
                    <td>${formatCurrency(c.receita)}</td>
                    <td>${c.clientesUnicos}</td>
                    <td>${c.cnpjsUnicos}</td>
                    <td>${c.cepsUnicos}</td>
                    <td>${formatCurrency(c.ticketMedio)}</td>
                  </tr>
                `).join('')}
                <tr style="background: linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%); color: white; font-weight: bold;">
                  <td>TOTAL</td>
                  <td>${docsCidades.length}</td>
                  <td>${formatCurrency(analiseDetalhada.reduce((sum, c) => sum + c.receita, 0))}</td>
                  <td colspan="3" style="text-align: center;">-</td>
                  <td>${formatCurrency(analiseDetalhada.reduce((sum, c) => sum + c.receita, 0) / docsCidades.length)}</td>
                </tr>
              </tbody>
            </table>

            <div class="page-break"></div>

            ${analise.replace(/```/g, '').split('\n').map((line: string) => {
              if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
              if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
              if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
              if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
              if (line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
              if (line.match(/^\d+\./)) return `<li>${line}</li>`;
              if (line.includes('**')) {
                return `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
              }
              return line ? `<p>${line}</p>` : '';
            }).join('')}
          </div>

          <div class="footer">
            <p><strong>Despachante Beto Dehon</strong></p>
            <p>Análise gerada em ${new Date().toLocaleString('pt-BR')}</p>
            <p style="margin-top: 10px; font-style: italic;">Documento confidencial - Uso exclusivo interno</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlAnalise);
      printWindow.document.close();

    } catch (error) {
      console.error('Erro ao gerar análise de cidades:', error);
      alert('Erro ao gerar análise. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioCompleto = async () => {
    try {
      setLoading(true);

      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) {
        alert('API Key da Gemini não configurada');
        return;
      }

      // Preparar dados para análise
      const dadosAnalise = {
        periodo: periodoAnalise,
        metricas: metricas,
        topCidades: topCidades.slice(0, 10),
        tendencias: tendencias,
        receitaPorProduto: calcularReceitaPorProdutos(),
        cidadesFluxo: cidadesFluxo.slice(0, 10),
        crescimento: metricas.crescimentoMensal,
        ticketMedio: metricas.ticketMedio
      };

      const prompt = `Você é um consultor especialista em marketing e vendas para despachantes automotivos.

Com base nos dados abaixo, crie um RELATÓRIO EXECUTIVO COMPLETO e PROFISSIONAL incluindo:

1. **RESUMO EXECUTIVO** - Análise geral do período
2. **ANÁLISE DETALHADA DE DESEMPENHO** - Métricas principais e insights
3. **ANÁLISE GEOGRÁFICA** - Cidades com maior potencial
4. **ESTRATÉGIAS DE CRESCIMENTO** - 5 ações práticas e imediatas
5. **TUTORIAL DE MARKETING** - Passo a passo para aumentar receita
6. **PLANO DE AÇÃO 30 DIAS** - Cronograma detalhado
7. **PREVISÃO DE RESULTADOS** - Projeções baseadas em dados

DADOS:
${JSON.stringify(dadosAnalise, null, 2)}

Formato: Use Markdown profissional com títulos, subtítulos, listas e ênfases.
Seja PRÁTICO, DIRETO e ACIONÁVEL.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 4096
            }
          })
        }
      );

      if (!response.ok) throw new Error('Erro ao gerar relatório');

      const result = await response.json();
      const relatorio = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Gerar gráficos como imagens para o PDF
      const chartCidades = document.createElement('canvas');
      chartCidades.width = 800;
      chartCidades.height = 400;
      const ctxCidades = chartCidades.getContext('2d');

      new ChartJS(ctxCidades!, {
        type: 'bar',
        data: dadosGraficoCidades,
        options: {
          responsive: false,
          plugins: {
            legend: { display: false },
            title: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      const chartTendencias = document.createElement('canvas');
      chartTendencias.width = 800;
      chartTendencias.height = 400;
      const ctxTendencias = chartTendencias.getContext('2d');

      new ChartJS(ctxTendencias!, {
        type: 'line',
        data: dadosGraficoTendencias,
        options: {
          responsive: false,
          plugins: {
            legend: { display: true, position: 'top' }
          }
        }
      });

      // Aguardar renderização dos gráficos
      await new Promise(resolve => setTimeout(resolve, 500));

      const imgCidades = chartCidades.toDataURL('image/png');
      const imgTendencias = chartTendencias.toDataURL('image/png');

      // Criar janela de impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Bloqueador de pop-ups ativo. Por favor, permita pop-ups para imprimir.');
        return;
      }

      const htmlRelatorio = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório Executivo - Dashboard Analítico</title>
          <style>
            @page {
              size: A4;
              margin: 12mm 15mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.7;
              color: #2c3e50;
              background: white;
              padding: 0;
            }
            .cover-page {
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #0a3d2e 0%, #1a4d3a 50%, #2d5a3d 100%);
              color: white;
              text-align: center;
              page-break-after: always;
              padding: 40px;
            }
            .cover-page h1 {
              font-size: 42pt;
              margin-bottom: 20px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              border: none;
            }
            .cover-page .subtitle {
              font-size: 18pt;
              opacity: 0.95;
              margin-bottom: 40px;
              font-weight: 300;
            }
            .cover-page .period {
              font-size: 24pt;
              font-weight: bold;
              margin: 20px 0;
              padding: 15px 30px;
              background: rgba(255,255,255,0.15);
              border-radius: 8px;
              backdrop-filter: blur(10px);
            }
            .cover-page .date {
              font-size: 14pt;
              margin-top: 40px;
              opacity: 0.85;
            }
            .cover-page .logo {
              width: 120px;
              height: 120px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 48pt;
              margin-bottom: 30px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            }
            .executive-summary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin: 30px 0;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .executive-summary h2 {
              color: white;
              border-bottom: 2px solid rgba(255,255,255,0.3);
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 30px 0;
            }
            .metric-card {
              background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
              border-left: 5px solid #1a4d3a;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              transition: transform 0.2s;
            }
            .metric-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            }
            .metric-icon {
              font-size: 32pt;
              margin-bottom: 10px;
            }
            .metric-label {
              font-size: 9pt;
              color: #666;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .metric-value {
              font-size: 22pt;
              font-weight: bold;
              color: #1a4d3a;
              margin-top: 8px;
            }
            .content {
              margin-top: 20px;
              padding: 0 20px;
            }
            h1 {
              color: #1a4d3a;
              font-size: 22pt;
              border-bottom: 4px solid #1a4d3a;
              padding-bottom: 12px;
              margin: 40px 0 25px 0;
              page-break-after: avoid;
              position: relative;
            }
            h1::before {
              content: '';
              position: absolute;
              bottom: -4px;
              left: 0;
              width: 60px;
              height: 4px;
              background: #4caf50;
            }
            h2 {
              color: #2d5a3d;
              font-size: 17pt;
              margin: 30px 0 18px 0;
              page-break-after: avoid;
              padding-left: 12px;
              border-left: 4px solid #4caf50;
            }
            h3 {
              color: #4a7c59;
              font-size: 14pt;
              margin: 25px 0 12px 0;
              page-break-after: avoid;
            }
            p {
              margin-bottom: 14px;
              text-align: justify;
              line-height: 1.8;
            }
            ul, ol {
              margin: 18px 0 18px 30px;
            }
            li {
              margin-bottom: 10px;
              line-height: 1.7;
            }
            strong {
              color: #1a4d3a;
              font-weight: 700;
            }
            .chart-container {
              margin: 30px 0;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
              text-align: center;
              page-break-inside: avoid;
            }
            .chart-container h3 {
              margin-bottom: 20px;
              color: #1a4d3a;
            }
            .chart-container img {
              max-width: 100%;
              height: auto;
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .table-wrapper {
              margin: 25px 0;
              overflow-x: auto;
              page-break-inside: avoid;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin: 15px 0;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            th {
              background: linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%);
              color: white;
              padding: 14px 12px;
              text-align: left;
              font-size: 10pt;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 9.5pt;
              background: white;
            }
            tr:nth-child(even) td {
              background: #f9fafb;
            }
            tr:hover td {
              background: #e8f5e9;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .highlight {
              background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
              border-left: 5px solid #ffa500;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(255, 165, 0, 0.1);
            }
            .action-box {
              background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
              border-left: 5px solid #4caf50;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
            }
            .warning-box {
              background: linear-gradient(135deg, #ffebee 0%, #fff5f5 100%);
              border-left: 5px solid #f44336;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1);
            }
            .footer {
              margin-top: 50px;
              padding: 25px 20px;
              border-top: 3px solid #1a4d3a;
              text-align: center;
              font-size: 9pt;
              color: #666;
              background: #f5f7fa;
            }
            .footer strong {
              font-size: 11pt;
              display: block;
              margin-bottom: 10px;
            }
            .page-break {
              page-break-before: always;
            }
            .toc {
              margin: 30px 0;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .toc h2 {
              border-left: none;
              padding-left: 0;
              margin-bottom: 15px;
            }
            .toc ul {
              list-style: none;
              margin: 0;
            }
            .toc li {
              padding: 8px 0;
              border-bottom: 1px dotted #ddd;
            }
            .watermark {
              position: fixed;
              bottom: 10mm;
              right: 10mm;
              opacity: 0.1;
              font-size: 8pt;
              color: #999;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="watermark">Confidencial - Despachante Beto Dehon</div>

          <div class="cover-page">
            <div class="logo">📊</div>
            <h1>Relatório Executivo</h1>
            <p class="subtitle">Dashboard Analítico de Desempenho</p>
            <div class="period">Período: ${periodoAnalise.toUpperCase()}</div>
            <p class="date">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin-top: 60px; font-size: 16pt; font-weight: 300;">
              Despachante Beto Dehon<br/>
              <span style="font-size: 12pt; opacity: 0.8;">Santa Catarina - Brasil</span>
            </p>
          </div>

          <div style="padding: 20px;">
            <div class="toc">
              <h2>📑 Índice</h2>
              <ul>
                <li>1. Resumo Executivo das Métricas</li>
                <li>2. Análise Geográfica por Cidade</li>
                <li>3. Distribuição de Receita por Produto</li>
                <li>4. Análise de Tendências</li>
                <li>5. Insights e Estratégias da IA</li>
                <li>6. Plano de Ação e Recomendações</li>
              </ul>
            </div>

            <div class="executive-summary page-break">
              <h2>📈 Resumo Executivo das Métricas</h2>
              <p style="color: white; opacity: 0.95; margin-top: 15px;">
                Análise consolidada do período selecionado com os principais indicadores de desempenho do negócio.
              </p>
            </div>
          <div class="header">
            <h1>📊 Relatório Executivo - Dashboard Analítico</h1>
            <p>Despachante Beto Dehon | Período: ${periodoAnalise.toUpperCase()} | ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">📄</div>
              <div class="metric-label">Total de Documentos</div>
              <div class="metric-value">${metricas.totalDocumentos}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">💰</div>
              <div class="metric-label">Receita Total</div>
              <div class="metric-value">${formatCurrency(metricas.totalReceita)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">💳</div>
              <div class="metric-label">Ticket Médio</div>
              <div class="metric-value">${formatCurrency(metricas.ticketMedio)}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">👥</div>
              <div class="metric-label">Clientes Únicos</div>
              <div class="metric-value">${metricas.clientesUnicos}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🏙️</div>
              <div class="metric-label">Cidades Atendidas</div>
              <div class="metric-value">${metricas.cidadesAtendidas}</div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">${metricas.crescimentoMensal >= 0 ? '📈' : '📉'}</div>
              <div class="metric-label">Crescimento</div>
              <div class="metric-value" style="color: ${metricas.crescimentoMensal >= 0 ? '#4caf50' : '#f44336'}">${metricas.crescimentoMensal.toFixed(1)}%</div>
            </div>
          </div>

          <div class="chart-container">
            <h3>📊 Evolução de Receita e Volume ao Longo do Tempo</h3>
            <img src="${imgTendencias}" alt="Gráfico de Tendências" />
          </div>

          <div class="page-break"></div>

          <div class="action-box">
            <h2>🎯 Análise Geográfica - Cidades Estratégicas</h2>
            <p>As cidades listadas abaixo representam os principais mercados atendidos no período analisado. Utilize estas informações para direcionar campanhas de marketing e expandir a presença regional.</p>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Cidade</th>
                  <th>Documentos</th>
                  <th>Receita Total</th>
                  <th>Ticket Médio</th>
                  <th>% da Receita</th>
                </tr>
              </thead>
              <tbody>
                ${topCidades.slice(0, 10).map((cidade, index) => {
                  const percentual = ((cidade.receita / metricas.totalReceita) * 100).toFixed(1);
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                  return `
                  <tr>
                    <td><strong>${medal} ${index + 1}º</strong></td>
                    <td><strong>${cidade.cidade}</strong></td>
                    <td>${cidade.documentos} docs</td>
                    <td><strong>${formatCurrency(cidade.receita)}</strong></td>
                    <td>${formatCurrency(cidade.receita / cidade.documentos)}</td>
                    <td>${percentual}%</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="chart-container">
            <h3>📍 Distribuição de Receita por Cidade</h3>
            <img src="${imgCidades}" alt="Gráfico de Cidades" />
          </div>

          <div class="page-break"></div>

          <div class="highlight">
            <h2>💼 Análise de Produtos e Serviços</h2>
            <p><strong>Insight:</strong> A diversificação de produtos impacta diretamente no ticket médio e na satisfação do cliente. Produtos combinados (bundles) demonstram maior valor percebido.</p>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Categoria de Produto</th>
                  <th>Quantidade</th>
                  <th>Receita Total</th>
                  <th>Ticket Médio</th>
                  <th>% do Total</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(calcularReceitaPorProdutos())
                  .sort((a, b) => b[1].receita - a[1].receita)
                  .map(([categoria, dados], index) => {
                    const percentual = ((dados.receita / metricas.totalReceita) * 100).toFixed(1);
                    const ticketMedioProduto = dados.receita / dados.quantidade;
                    const destaque = index === 0 ? 'style="background: #e8f5e9;"' : '';
                    return `
                    <tr ${destaque}>
                      <td><strong>${categoria.replace(/^\d+\.\s*/, '')}</strong></td>
                      <td>${dados.quantidade} vendas</td>
                      <td><strong>${formatCurrency(dados.receita)}</strong></td>
                      <td>${formatCurrency(ticketMedioProduto)}</td>
                      <td><strong>${percentual}%</strong></td>
                    </tr>
                  `;
                  }).join('')}
              </tbody>
            </table>
          </div>

          ${Object.entries(calcularReceitaPorProdutos()).length > 0 ? `
            <div class="action-box">
              <h3>💡 Recomendação Estratégica</h3>
              <p><strong>Foco em Upselling:</strong> Identifique clientes que adquiriram produtos básicos e ofereça upgrades para pacotes completos. Isso pode aumentar o ticket médio em até 50%.</p>
              <ul>
                <li>Crie campanhas específicas para clientes do produto base</li>
                <li>Desenvolva pacotes promocionais com desconto progressivo</li>
                <li>Implemente programa de fidelidade para incentivar upgrades</li>
              </ul>
            </div>
          ` : ''}

          <div class="page-break"></div>

          <div class="content">
            ${relatorio.replace(/```/g, '').split('\n').map((line: string) => {
              if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
              if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
              if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
              if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
              if (line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
              if (line.match(/^\d+\./)) return `<li>${line}</li>`;
              if (line.includes('**')) {
                return `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
              }
              return line ? `<p>${line}</p>` : '';
            }).join('')}
          </div>

          <div class="footer">
            <p><strong>Despachante Beto Dehon</strong> | WhatsApp: (48) 3255-0606</p>
            <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
            <p style="margin-top: 10px; font-style: italic;">Este relatório é confidencial e destinado exclusivamente ao uso interno.</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlRelatorio);
      printWindow.document.close();

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const normalizarTexto = (texto: string): string => {
    return texto
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const corrigirErrosPortugues = (texto: string): string => {
    const correcoesComuns: { [key: string]: string } = {
      'COMUNICACAO': 'COMUNICACAO',
      'COMUNICAÇAO': 'COMUNICACAO',
      'COMUNICASAO': 'COMUNICACAO',
      'ASSINATURA': 'ASSINATURA',
      'ACINATURA': 'ASSINATURA',
      'ASIGNATURA': 'ASSINATURA',
      'ATPV': 'ATPV',
      'ATP': 'ATPV',
      'ATIPV': 'ATPV',
    };

    let textoCorrigido = texto;
    Object.keys(correcoesComuns).forEach(erro => {
      const regex = new RegExp(erro, 'gi');
      textoCorrigido = textoCorrigido.replace(regex, correcoesComuns[erro]);
    });

    return textoCorrigido;
  };

  const extrairProdutos = (produtoSelecionado: any): string[] => {
    let texto = '';

    if (Array.isArray(produtoSelecionado)) {
      texto = produtoSelecionado.join(' ');
    } else if (typeof produtoSelecionado === 'string') {
      texto = produtoSelecionado;
    } else if (!produtoSelecionado || produtoSelecionado === '' || produtoSelecionado === null || produtoSelecionado === undefined) {
      return [];
    } else {
      return [];
    }

    texto = normalizarTexto(texto);
    texto = corrigirErrosPortugues(texto);

    const produtos = new Set<string>();

    if (texto.includes('ATPV')) produtos.add('ATPV');
    if (texto.includes('ASSINATURA')) produtos.add('ASSINATURA');
    if (texto.includes('COMUNICACAO')) produtos.add('COMUNICACAO');

    return Array.from(produtos);
  };

  const categorizarProduto = (produtoSelecionado: any): { categoria: string; valor: number } => {
    const produtos = extrairProdutos(produtoSelecionado);

    if (produtos.length === 0) {
      return { categoria: '1. ATPV Base', valor: 20 };
    }

    const temAtpv = produtos.includes('ATPV');
    const temAssinatura = produtos.includes('ASSINATURA');
    const temComunicacao = produtos.includes('COMUNICACAO');

    if (temAtpv && temAssinatura && temComunicacao) {
      return { categoria: '4. ATPV + Assinatura + Comunicação', valor: 46 };
    }

    if (temAtpv && temComunicacao && !temAssinatura) {
      return { categoria: '3. ATPV + Comunicação', valor: 37 };
    }

    if (temAtpv && temAssinatura && !temComunicacao) {
      return { categoria: '2. ATPV + Assinatura', valor: 29 };
    }

    if (temAtpv && !temAssinatura && !temComunicacao) {
      return { categoria: '1. ATPV Base', valor: 20 };
    }

    return { categoria: '1. ATPV Base', valor: 20 };
  };

  const calcularValorPorProduto = (produtoSelecionado: any): number => {
    return categorizarProduto(produtoSelecionado).valor;
  };

  const calcularReceitaPorProdutos = (): { [key: string]: { quantidade: number; receita: number } } => {
    const resultado: { [key: string]: { quantidade: number; receita: number } } = {};

    // Usar documentosPeriodo que já está filtrado pelo período selecionado
    const docsParaAnalise = documentosPeriodo.length > 0 ? documentosPeriodo : documentos;
    
    docsParaAnalise.forEach((doc: any) => {
      const produtoSelecionado = doc.produtosSelecionados || doc.tipo || '';
      const { categoria, valor } = categorizarProduto(produtoSelecionado);

      if (!resultado[categoria]) {
        resultado[categoria] = { quantidade: 0, receita: 0 };
      }

      resultado[categoria].quantidade += 1;
      resultado[categoria].receita += valor;
    });

    return resultado;
  };

  const dadosGraficoTendencias = {
    labels: tendencias.map(t => t.periodo),
    datasets: [
      {
        label: 'Receita (R$)',
        data: tendencias.map(t => t.receita),
        borderColor: '#1a4d3a',
        backgroundColor: 'rgba(26, 77, 58, 0.2)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#4caf50',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Quantidade',
        data: tendencias.map(t => t.quantidade),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#2196f3',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const opcoesGraficoTendencias = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            weight: 'bold' as const
          },
          color: '#333',
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 0) {
              label += formatCurrency(context.parsed.y);
            } else {
              label += context.parsed.y + ' docs';
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Receita (R$)',
          color: '#1a4d3a',
          font: { size: 12, weight: 'bold' as const },
        },
        ticks: {
          callback: function(value: any) {
            return 'R$ ' + (value / 1000).toFixed(0) + 'k';
          },
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Quantidade',
          color: '#2196f3',
          font: { size: 12, weight: 'bold' as const },
        },
        ticks: {
          color: '#666',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: '#666',
          font: { size: periodoAnalise === 'dia' ? 9 : 11 },
          maxRotation: periodoAnalise === 'dia' ? 45 : 0,
          minRotation: periodoAnalise === 'dia' ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: periodoAnalise === 'dia' ? 24 : periodoAnalise === 'mes' ? 31 : 12,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const dadosGraficoCidades = {
    labels: topCidades.map(c => c.cidade),
    datasets: [{
      label: 'Receita',
      data: topCidades.map(c => c.receita),
      backgroundColor: topCidades.map((_, i) => `rgba(26, 77, 58, ${1 - (i * 0.08)})`),
    }],
  };

  const dadosGraficoDistribuicao = {
    labels: topCidades.slice(0, 5).map(c => c.cidade),
    datasets: [{
      data: topCidades.slice(0, 5).map(c => c.receita),
      backgroundColor: ['#1a4d3a', '#2d5a3d', '#4caf50', '#81c784', '#a5d6a7'],
    }],
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <Paper style={{
          background: 'linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 100%)',
          color: '#fff',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16
        }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="h5" style={{ fontWeight: 600 }}>
                Dashboard de Análises - SC
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={gerarRelatorioCompleto}
                disabled={loading || documentosPeriodo.length === 0}
                style={{
                  background: 'white',
                  color: '#1a4d3a',
                  fontWeight: 600,
                  marginRight: 12,
                  textTransform: 'none'
                }}
                startIcon={<Assessment />}
              >
                🖨️ Relatório Completo
              </Button>
              <Button
                variant="contained"
                onClick={gerarAnaliseCidadesEstrategicas}
                disabled={loading || documentosPeriodo.length === 0}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
                startIcon={<MapIcon />}
              >
                📊 Análise 4 Cidades
              </Button>
            </Grid>
            <Grid item>
              <FormControl variant="outlined" size="small" style={{ minWidth: 150, background: 'white', borderRadius: 8 }}>
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodoAnalise}
                  onChange={(e) => setPeriodoAnalise(e.target.value as string)}
                  label="Período"
                >
                  <MenuItem value="dia">Dia</MenuItem>
                  <MenuItem value="semana">Semana</MenuItem>
                  <MenuItem value="mes">Mês</MenuItem>
                  <MenuItem value="trimestre">Trimestre</MenuItem>
                  <MenuItem value="ano">Ano</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        ) : documentosPeriodo.length === 0 ? (
          <Paper className={classes.chartCard}>
            <Box textAlign="center" py={8}>
              <Assessment style={{ fontSize: 80, color: '#ccc', marginBottom: 16 }} />
              <Typography variant="h5" gutterBottom color="textSecondary">
                Nenhum documento encontrado
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Não há dados para o período selecionado
              </Typography>
            </Box>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2} style={{ marginBottom: 16 }}>
              <Grid item xs={6} sm={4} md={2}>
                <Card style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <Assessment style={{ color: '#1a4d3a', fontSize: 20 }} />
                  <Typography style={{ fontSize: '0.7rem', color: '#666', marginTop: 4 }}>Documentos</Typography>
                  <Typography style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a4d3a' }}>
                    {metricas.totalDocumentos}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <Card style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <AttachMoney style={{ color: '#4caf50', fontSize: 20 }} />
                  <Typography style={{ fontSize: '0.7rem', color: '#666', marginTop: 4 }}>Receita Total</Typography>
                  <Typography style={{ fontSize: metricas.totalReceita > 999999 ? '1.2rem' : '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                    {formatCurrency(metricas.totalReceita)}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <Card style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <TrendingUp style={{ color: '#2196f3', fontSize: 20 }} />
                  <Typography style={{ fontSize: '0.7rem', color: '#666', marginTop: 4 }}>Ticket Médio</Typography>
                  <Typography style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                    {formatCurrency(metricas.ticketMedio)}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <Card style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <Person style={{ color: '#ff9800', fontSize: 20 }} />
                  <Typography style={{ fontSize: '0.7rem', color: '#666', marginTop: 4 }}>Clientes</Typography>
                  <Typography style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                    {metricas.clientesUnicos}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <Card style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <LocationOn style={{ color: '#9c27b0', fontSize: 20 }} />
                  <Typography style={{ fontSize: '0.7rem', color: '#666', marginTop: 4 }}>Cidades SC</Typography>
                  <Typography style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9c27b0' }}>
                    {metricas.cidadesAtendidas}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <Card style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <Timeline style={{ color: metricas.crescimentoMensal >= 0 ? '#4caf50' : '#f44336', fontSize: 20 }} />
                  <Typography style={{ fontSize: '0.7rem', color: '#666', marginTop: 4 }}>Crescimento</Typography>
                  <Typography style={{ fontSize: '1.5rem', fontWeight: 'bold', color: metricas.crescimentoMensal >= 0 ? '#4caf50' : '#f44336' }}>
                    {metricas.crescimentoMensal.toFixed(1)}%
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Paper style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <Typography style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: 12, color: '#1a4d3a' }}>
                <AttachMoney style={{ fontSize: 20, verticalAlign: 'middle' }} /> Receita por Produto
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(calcularReceitaPorProdutos())
                  .sort((a, b) => {
                    const catA = parseInt(a[0].charAt(0));
                    const catB = parseInt(b[0].charAt(0));
                    return catA - catB;
                  })
                  .map(([categoria, dados], index) => {
                    const cores = [
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    ];

                    return (
                      <Grid item xs={6} sm={3} key={categoria}>
                        <Card style={{
                          padding: 12,
                          background: cores[index] || cores[0],
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          textAlign: 'center'
                        }}>
                          <Typography style={{ fontSize: '0.65rem', opacity: 0.9, marginBottom: 4 }}>
                            {categoria.replace(/^\d+\.\s*/, '')}
                          </Typography>
                          <Typography style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 2 }}>
                            {formatCurrency(dados.receita)}
                          </Typography>
                          <Typography style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                            {dados.quantidade} doc{dados.quantidade !== 1 ? 's' : ''}
                          </Typography>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>
            </Paper>

            {aiInsights.length > 0 && (
              <Grid container spacing={2} style={{ marginBottom: 24 }}>
                {aiInsights.map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper className={classes.insightCard}>
                      <Box display="flex" alignItems="center" style={{gap:1}} mb={1}>
                        <AutoAwesome />
                        <Chip
                          label={insight.prioridade.toUpperCase()}
                          size="small"
                          style={{
                            background: 'rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>{insight.titulo}</Typography>
                      <Typography variant="body2">{insight.descricao}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            <Grid container spacing={2} style={{ marginBottom: 16 }}>
              <Grid item xs={12} md={5}>
                <Typography style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: 8, color: '#1a4d3a' }}>
                  <MapIcon style={{ fontSize: 20, verticalAlign: 'middle' }} /> Mapa Interativo
                </Typography>
                <Box style={{ height: 500 }}>
                  <MapaLeaflet dados={cidadesFluxo} />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <ListaFluxoCidades
                  cidades={cidadesFluxo}
                  onGerarEstrategia={gerarEstrategiaMarketing}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper style={{ padding: 16, borderRadius: 12, height: '500px', overflowY: 'auto' }}>
                  <Typography style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: 12, color: '#1a4d3a' }}>
                    <TrendingUp style={{ fontSize: 20, verticalAlign: 'middle' }} /> Insights em Tempo Real
                  </Typography>
                  {cidadesFluxo.slice(0, 5).map((cidade, index) => (
                    <Card key={cidade.nome} style={{
                      marginBottom: 12,
                      padding: 12,
                      background: `linear-gradient(135deg, ${index % 2 === 0 ? '#667eea' : '#f093fb'} 0%, ${index % 2 === 0 ? '#764ba2' : '#f5576c'} 100%)`,
                      color: '#fff'
                    }}>
                      <Typography style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 6 }}>
                        {index + 1}. {cidade.nome}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" style={{ marginBottom: 4 }}>
                        <Typography style={{ fontSize: '0.75rem' }}>
                          📊 {cidade.documentos} docs
                        </Typography>
                        <Typography style={{ fontSize: '0.75rem' }}>
                          💰 {formatCurrency(cidade.receita)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" style={{ marginBottom: 4 }}>
                        <Typography style={{ fontSize: '0.75rem' }}>
                          🕐 Pico: {cidade.horaPico}
                        </Typography>
                        <Typography style={{ fontSize: '0.75rem' }}>
                          {cidade.tendencia === 'up' ? '📈' : cidade.tendencia === 'down' ? '📉' : '➡️'} {cidade.crescimento.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={cidade.potencialMarketing}
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.3)',
                          marginTop: 8
                        }}
                      />
                      <Typography style={{ fontSize: '0.7rem', marginTop: 4, textAlign: 'right' }}>
                        Potencial: {cidade.potencialMarketing}%
                      </Typography>
                    </Card>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Box style={{ marginBottom: 24 }}>
              <Typography className={classes.sectionTitle} style={{ marginBottom: 16 }}>
                <AttachMoney style={{ fontSize: 20, verticalAlign: 'middle' }} /> CRM Automático - Funil de Vendas Inteligente
              </Typography>
              <FunilVendasAutomatico
                documentos={documentosPeriodo} // Passa os documentos filtrados por período
                onEnviarWhatsApp={handleEnviarWhatsApp}
                onEnviarEmail={handleEnviarEmail}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Paper className={classes.chartCard}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography className={classes.sectionTitle}>
                      <ShowChart /> Evolução de Receita e Volume
                    </Typography>
                    <Box>
                      <Chip
                        label={`${tendencias.length} períodos`}
                        size="small"
                        style={{
                          background: tendencias.length > 0 ? '#e8f5e9' : '#ffebee',
                          color: tendencias.length > 0 ? '#1a4d3a' : '#c62828',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Box>
                  {tendencias.length > 0 ? (
                    <Line data={dadosGraficoTendencias} options={opcoesGraficoTendencias} />
                  ) : (
                    <Box textAlign="center" py={6}>
                      <Timeline style={{ fontSize: 60, color: '#ccc', marginBottom: 16 }} />
                      <Typography variant="h6" gutterBottom color="textSecondary">
                        Sem dados de tendência
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Não há documentos no período selecionado para gerar o gráfico
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper className={classes.chartCard}>
                  <Typography className={classes.sectionTitle}>
                    <LocationOn /> Top 5 Cidades
                  </Typography>
                  {topCidades.length > 0 ? (
                    <Doughnut data={dadosGraficoDistribuicao} options={{ responsive: true, maintainAspectRatio: true }} />
                  ) : (
                    <Box textAlign="center" py={6}>
                      <MapIcon style={{ fontSize: 60, color: '#ccc', marginBottom: 16 }} />
                      <Typography variant="h6" gutterBottom color="textSecondary">
                        Sem dados de cidades
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Verifique se há documentos com campo "municipiocomprador" preenchido
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper className={classes.chartCard}>
                  <Typography className={classes.sectionTitle}>
                    <MapIcon /> Receita por Cidade
                  </Typography>
                  <Bar data={dadosGraficoCidades} options={{ responsive: true, maintainAspectRatio: true }} />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper className={classes.chartCard}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography className={classes.sectionTitle}>
                      <LocationOn /> Ranking de Cidades ({cidadesPlotadas})
                    </Typography>
                    <Chip
                      label={`${cidadesCoordenadas.length} com coordenadas`}
                      size="small"
                      style={{ background: '#e3f2fd', color: '#1976d2', fontWeight: 600 }}
                    />
                  </Box>
                  <List>
                    {topCidades.map((cidade, index) => {
                      const coordenadas = cidadesCoordenadas.find(c => c.cidade === cidade.cidade);
                      return (
                        <React.Fragment key={cidade.cidade}>
                          <ListItem className={classes.topItem}>
                            <Box display="flex" alignItems="center" style={{gap:1}} flex={1}>
                              <Avatar style={{ background: '#1a4d3a', width: 36, height: 36 }}>
                                {index + 1}
                              </Avatar>
                              <div>
                                <Typography variant="body1" style={{ fontWeight: 600 }}>
                                  {cidade.cidade}
                                  {coordenadas && (
                                    <Chip
                                      label={`${coordenadas.latitude.toFixed(4)}, ${coordenadas.longitude.toFixed(4)}`}
                                      size="small"
                                      style={{
                                        marginLeft: 8,
                                        background: '#f1f8e9',
                                        color: '#558b2f',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {cidade.documentos} documentos
                                  {coordenadas && ` • ${coordenadas.estado}`}
                                </Typography>
                              </div>
                            </Box>
                            <Typography variant="h6" style={{ color: '#4caf50', fontWeight: 600 }}>
                              {formatCurrency(cidade.receita)}
                            </Typography>
                          </ListItem>
                          {index < topCidades.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default AnaliseDados;
