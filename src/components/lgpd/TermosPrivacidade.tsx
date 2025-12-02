
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box
} from '@material-ui/core';

interface TermosPrivacidadeProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermosPrivacidade({ open, onAccept, onDecline }: TermosPrivacidadeProps) {
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouColeta, setAceitouColeta] = useState(false);

  const handleAccept = () => {
    if (aceitouTermos && aceitouColeta) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Política de Privacidade e Proteção de Dados
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            1. Coleta de Dados Pessoais
          </Typography>
          <Typography variant="body2" paragraph>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e 
            legislação estadual de Santa Catarina, coletamos os seguintes dados:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Nome completo</li>
              <li>CPF/CNPJ</li>
              <li>Endereço de e-mail</li>
              <li>Telefone</li>
              <li>Documentos veiculares</li>
              <li>Endereço residencial/comercial</li>
            </ul>
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            2. Finalidade do Tratamento
          </Typography>
          <Typography variant="body2" paragraph>
            Os dados são utilizados exclusivamente para:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Prestação de serviços de despachante</li>
              <li>Comunicação sobre andamento de processos</li>
              <li>Cumprimento de obrigações legais</li>
              <li>Melhoria dos nossos serviços</li>
            </ul>
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            3. Seus Direitos (Art. 18 LGPD)
          </Typography>
          <Typography variant="body2" paragraph>
            Você tem direito a:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Confirmar a existência de tratamento</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar anonimização, bloqueio ou eliminação</li>
              <li>Revogar consentimento</li>
              <li>Portabilidade dos dados</li>
            </ul>
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            4. Segurança dos Dados
          </Typography>
          <Typography variant="body2" paragraph>
            Implementamos medidas técnicas e administrativas para proteger seus dados:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento e auditoria de acessos</li>
              <li>Backup regular de dados</li>
            </ul>
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            5. Compartilhamento de Dados
          </Typography>
          <Typography variant="body2" paragraph>
            Seus dados podem ser compartilhados apenas com:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>DETRAN/SC e órgãos reguladores</li>
              <li>Cartórios e instituições públicas</li>
              <li>Prestadores de serviço sob contrato de confidencialidade</li>
            </ul>
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            6. Retenção de Dados
          </Typography>
          <Typography variant="body2" paragraph>
            Seus dados serão mantidos pelo período necessário para:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Cumprimento da finalidade do serviço</li>
              <li>Obrigações legais (mínimo 5 anos - Código Civil)</li>
              <li>Exercício de direitos em processos judiciais</li>
            </ul>
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            7. Contato - Encarregado de Dados (DPO)
          </Typography>
          <Typography variant="body2" paragraph>
            Para exercer seus direitos ou esclarecer dúvidas:
          </Typography>
          <Typography variant="body2">
            <strong>E-mail:</strong> privacidade@betodehon.com.br<br />
            <strong>Telefone:</strong> (48) 3255-0606
          </Typography>
        </Box>

        <Box mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                color="primary"
              />
            }
            label="Li e aceito a Política de Privacidade e Proteção de Dados"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={aceitouColeta}
                onChange={(e) => setAceitouColeta(e.target.checked)}
                color="primary"
              />
            }
            label="Autorizo a coleta e tratamento dos meus dados pessoais para as finalidades descritas"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onDecline} color="secondary">
          Recusar
        </Button>
        <Button 
          onClick={handleAccept} 
          color="primary" 
          variant="contained"
          disabled={!aceitouTermos || !aceitouColeta}
        >
          Aceitar e Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
