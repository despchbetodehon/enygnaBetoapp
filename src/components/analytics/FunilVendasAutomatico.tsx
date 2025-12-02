import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Button,
  Divider,
} from '@material-ui/core';
import {
  ContactMail,
  Phone,
  Email,
  WhatsApp,
  TrendingUp,
  CheckCircle,
  Schedule,
  AttachMoney,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(3),
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  funilEtapa: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.15)',
      transform: 'translateX(4px)',
    },
  },
  leadCard: {
    background: '#fff',
    color: '#333',
    borderRadius: '12px',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  acaoButton: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    '&:hover': {
      background: 'rgba(255,255,255,0.3)',
    },
  },
}));

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  servico: string;
  valor: number;
  probabilidade: number;
  ultimoContato: string;
  proximaAcao: string;
  etapa: 'lead' | 'qualificado' | 'proposta' | 'negociacao' | 'fechamento';
}

interface FunilVendasAutomaticoProps {
  documentos: any[];
  onEnviarWhatsApp: (lead: Lead) => void;
  onEnviarEmail: (lead: Lead) => void;
}

const FunilVendasAutomatico: React.FC<FunilVendasAutomaticoProps> = ({
  documentos,
  onEnviarWhatsApp,
  onEnviarEmail,
}) => {
  const classes = useStyles();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metricas, setMetricas] = useState({
    taxaConversao: 0,
    valorTotal: 0,
    leadsAtivos: 0,
    proximosFechamentos: 0,
  });

  useEffect(() => {
    analisarDocumentosParaLeads();
  }, [documentos]);

  const analisarDocumentosParaLeads = () => {
    // Agrupa documentos por cnpjempresa (CPF/CNPJ do cliente) com deduplicação
    const clientesMap = new Map<string, any[]>();

    documentos.forEach((doc) => {
      const clienteDoc = doc.cnpjempresa;
      if (!clienteDoc) return;

      // Remove caracteres especiais para comparação
      const clienteKey = clienteDoc.replace(/\D/g, '');

      if (!clientesMap.has(clienteKey)) {
        clientesMap.set(clienteKey, []);
      }
      clientesMap.get(clienteKey)!.push(doc);
    });

    // Gera leads com base nos padrões sem duplicação
    const novasLeads: Lead[] = [];
    let valorTotalPipeline = 0;

    clientesMap.forEach((docs, clienteKey) => {
      const ultimoDoc = docs[docs.length - 1];
      const totalDocumentos = docs.length;

      // Nome do cliente (nomeempresa ou fallback)
      const nomeCliente = ultimoDoc.nomeempresa || ultimoDoc.nomecomprador || `Cliente ${clienteKey.slice(0, 6)}`;

      // Análise de probabilidade baseada em histórico
      let probabilidade = 50;
      if (totalDocumentos >= 3) probabilidade = 80;
      else if (totalDocumentos >= 2) probabilidade = 65;

      // Calcula valor médio dos serviços
      const valorMedio = docs.reduce((sum, d) => {
        const valor = typeof d.valordevenda === 'string' 
          ? parseFloat(d.valordevenda.replace(/[^\d,]/g, '').replace(',', '.')) || 0
          : (d.valordevenda || 0);
        return sum + valor;
      }, 0) / docs.length;

      const valorEstimado = valorMedio * 1.2;

      // Define etapa do funil baseado em histórico
      let etapa: Lead['etapa'] = 'lead';
      if (totalDocumentos >= 3) etapa = 'negociacao';
      else if (totalDocumentos >= 2) etapa = 'proposta';
      else if (totalDocumentos >= 1) etapa = 'qualificado';

      // Serviços mais utilizados
      const servicoPrincipal = ultimoDoc.produtosSelecionados?.[0] || 'Serviço';

      const lead: Lead = {
        id: `lead-${clienteKey}`,
        nome: nomeCliente,
        telefone: ultimoDoc.celtelcomprador || ultimoDoc.telefonecomprador || '(48) 3255-0606',
        email: ultimoDoc.emailcomprador || 'contato@betodespachante.com.br',
        servico: servicoPrincipal,
        valor: valorEstimado,
        probabilidade,
        ultimoContato: new Date(ultimoDoc.dataCriacao?.toDate?.() || Date.now()).toLocaleDateString('pt-BR'),
        proximaAcao: gerarProximaAcao(etapa, totalDocumentos),
        etapa,
      };

      novasLeads.push(lead);
      valorTotalPipeline += valorEstimado;
    });

    setLeads(novasLeads);

    // Calcula métricas
    const leadsProximos = novasLeads.filter(l => l.etapa === 'negociacao' || l.etapa === 'fechamento').length;
    setMetricas({
      taxaConversao: (leadsProximos / novasLeads.length) * 100 || 0,
      valorTotal: valorTotalPipeline,
      leadsAtivos: novasLeads.length,
      proximosFechamentos: leadsProximos,
    });
  };

  const gerarProximaAcao = (etapa: Lead['etapa'], historico: number): string => {
    const acoes = {
      lead: 'Enviar mensagem de boas-vindas via WhatsApp',
      qualificado: 'Ligar para entender necessidades específicas',
      proposta: 'Enviar proposta comercial personalizada',
      negociacao: 'Agendar reunião para fechar negócio',
      fechamento: 'Enviar contrato e confirmar dados bancários',
    };
    return acoes[etapa];
  };

  const getEtapaColor = (etapa: Lead['etapa']): string => {
    const colors = {
      lead: '#95a5a6',
      qualificado: '#3498db',
      proposta: '#f39c12',
      negociacao: '#e67e22',
      fechamento: '#27ae60',
    };
    return colors[etapa];
  };

  const etapas = [
    { nome: 'Leads', etapa: 'lead' as const },
    { nome: 'Qualificados', etapa: 'qualificado' as const },
    { nome: 'Proposta', etapa: 'proposta' as const },
    { nome: 'Negociação', etapa: 'negociacao' as const },
    { nome: 'Fechamento', etapa: 'fechamento' as const },
  ];

  return (
    <Box>
      {/* Métricas do Funil */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ padding: 16, background: '#667eea', color: '#fff' }}>
            <Typography variant="caption">Taxa de Conversão</Typography>
            <Typography variant="h4">{metricas.taxaConversao.toFixed(1)}%</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ padding: 16, background: '#764ba2', color: '#fff' }}>
            <Typography variant="caption">Valor Total Pipeline</Typography>
            <Typography variant="h5" style={{ fontSize: metricas.valorTotal > 999999 ? '1.2rem' : '1.5rem' }}>
              R$ {metricas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ padding: 16, background: '#f093fb', color: '#fff' }}>
            <Typography variant="caption">Leads Ativos</Typography>
            <Typography variant="h4">{metricas.leadsAtivos}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card style={{ padding: 16, background: '#27ae60', color: '#fff' }}>
            <Typography variant="caption">Próximos Fechamentos</Typography>
            <Typography variant="h4">{metricas.proximosFechamentos}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Funil Visual */}
      <Card className={classes.card}>
        <Typography variant="h5" style={{ fontWeight: 'bold', marginBottom: 24 }}>
          🎯 Funil de Vendas Automático - CRM Inteligente
        </Typography>

        {etapas.map((etapaInfo) => {
          const leadsEtapa = leads.filter((l) => l.etapa === etapaInfo.etapa);
          const valorEtapa = leadsEtapa.reduce((sum, l) => sum + l.valor, 0);

          return (
            <Box key={etapaInfo.etapa} className={classes.funilEtapa}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                  {etapaInfo.nome}
                </Typography>
                <Box>
                  <Chip
                    label={`${leadsEtapa.length} leads`}
                    style={{ background: getEtapaColor(etapaInfo.etapa), color: '#fff', marginRight: 8 }}
                  />
                  <Chip
                    label={`R$ ${valorEtapa.toLocaleString('pt-BR')}`}
                    style={{ background: 'rgba(255,255,255,0.3)', color: '#fff' }}
                  />
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={(leadsEtapa.length / leads.length) * 100 || 0}
                style={{ marginBottom: 16, height: 8, borderRadius: 4 }}
              />

              {leadsEtapa.slice(0, 3).map((lead) => (
                <Box key={lead.id} className={classes.leadCard}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                      <ContactMail style={{ fontSize: 18, verticalAlign: 'middle' }} /> {lead.nome}
                    </Typography>
                    <Chip
                      label={`${lead.probabilidade}% de conversão`}
                      size="small"
                      style={{ background: '#e8f5e9', color: '#27ae60' }}
                    />
                  </Box>

                  <Box display="flex" style={{ gap: '16px' }} mb={1}>
                    <Typography variant="caption">
                      <Phone style={{ fontSize: 14, verticalAlign: 'middle' }} /> {lead.telefone}
                    </Typography>
                    <Typography variant="caption">
                      <AttachMoney style={{ fontSize: 14, verticalAlign: 'middle' }} /> R$ {lead.valor.toLocaleString('pt-BR')}
                    </Typography>
                  </Box>

                  <Typography variant="caption" style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                    <Schedule style={{ fontSize: 14, verticalAlign: 'middle' }} /> Último contato: {lead.ultimoContato}
                  </Typography>

                  <Divider style={{ margin: '8px 0' }} />

                  <Typography variant="caption" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    ⚡ Próxima ação: {lead.proximaAcao}
                  </Typography>

                  <Box display="flex" style={{ gap: '8px' }}>
                    <Button
                      size="small"
                      variant="contained"
                      style={{ background: '#25D366', color: '#fff' }}
                      startIcon={<WhatsApp />}
                      onClick={() => onEnviarWhatsApp(lead)}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Email />}
                      onClick={() => onEnviarEmail(lead)}
                    >
                      E-mail
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          );
        })}
      </Card>
    </Box>
  );
};

export default FunilVendasAutomatico;