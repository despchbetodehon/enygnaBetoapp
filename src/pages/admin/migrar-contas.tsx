import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField,
  CircularProgress,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VpnKey from '@material-ui/icons/VpnKey';
import Security from '@material-ui/icons/Security';
import CheckCircle from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import Info from '@material-ui/icons/Info';
import PersonAdd from '@material-ui/icons/PersonAdd';

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: 800,
    margin: '40px auto',
    padding: theme.spacing(3),
  },
  card: {
    marginBottom: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  resultado: {
    marginTop: theme.spacing(3),
  },
  warning: {
    marginBottom: theme.spacing(3),
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: theme.spacing(2),
  },
  statItem: {
    textAlign: 'center',
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
}));

export default function MigrarContas() {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState('');
  
  // Estados para criação de usuário
  const [loadingCriar, setLoadingCriar] = useState(false);
  const [resultadoCriar, setResultadoCriar] = useState<any>(null);
  const [erroCriar, setErroCriar] = useState('');
  const [novoUsuario, setNovoUsuario] = useState({
    email: '',
    nome: '',
    senha: '',
    permissao: 'Visualizador',
    imagemUrl: '/betologo.jpeg',
    ativo: true,
  });

  const handleMigrar = async () => {
    setLoading(true);
    setErro('');
    setResultado(null);

    try {
      const response = await fetch('/api/migrar-contas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ executar: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao migrar contas');
      }

      setResultado(data);
    } catch (error: any) {
      setErro(error.message || 'Erro ao processar migração');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarUsuario = async () => {
    setLoadingCriar(true);
    setErroCriar('');
    setResultadoCriar(null);

    try {
      if (!novoUsuario.email || !novoUsuario.nome || !novoUsuario.senha) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      const response = await fetch('/api/migrar-contas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          criarUsuario: true,
          usuario: novoUsuario 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      setResultadoCriar(data);
      // Limpar formulário após sucesso
      setNovoUsuario({
        email: '',
        nome: '',
        senha: '',
        permissao: 'Visualizador',
        imagemUrl: '/betologo.jpeg',
        ativo: true,
      });
    } catch (error: any) {
      setErroCriar(error.message || 'Erro ao criar usuário');
    } finally {
      setLoadingCriar(false);
    }
  };

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            <PersonAdd style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Criar Novo Usuário
          </Typography>

          <Typography variant="body2" gutterBottom>
            Crie um novo usuário com senha criptografada (salt + hash SHA-256)
          </Typography>

          <Divider style={{ margin: '20px 0' }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                className={classes.formField}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome *"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                className={classes.formField}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senha *"
                type="password"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                className={classes.formField}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className={classes.formField}>
                <InputLabel>Permissão</InputLabel>
                <Select
                  value={novoUsuario.permissao}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, permissao: e.target.value as string })}
                >
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Editor">Editor</MenuItem>
                  <MenuItem value="Visualizador">Visualizador</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL da Imagem"
                value={novoUsuario.imagemUrl}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, imagemUrl: e.target.value })}
                className={classes.formField}
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleCriarUsuario}
            disabled={loadingCriar}
            startIcon={loadingCriar ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            {loadingCriar ? 'Criando...' : 'Criar Usuário'}
          </Button>

          {erroCriar && (
            <Box className={classes.resultado} style={{ backgroundColor: '#f8d7da', padding: '16px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
              <Typography variant="body2">
                <ErrorIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
                {erroCriar}
              </Typography>
            </Box>
          )}

          {resultadoCriar && (
            <Box className={classes.resultado} style={{ backgroundColor: '#d4edda', padding: '16px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <Typography variant="body2">
                <CheckCircle style={{ marginRight: 8, verticalAlign: 'middle', color: '#155724' }} />
                ✅ Usuário criado com sucesso! Email: {resultadoCriar.email}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            <Security style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Migração de Contas de Usuários
          </Typography>

          <Box className={classes.warning} style={{ backgroundColor: '#fff3cd', padding: '16px', borderRadius: '8px', border: '1px solid #ffc107' }}>
            <Typography variant="body2">
              <strong>⚠️ ATENÇÃO:</strong> Esta operação irá migrar todas as senhas de texto plano 
              para hash SHA-256. Execute apenas uma vez e tenha certeza do que está fazendo!
            </Typography>
          </Box>

          <Divider style={{ margin: '20px 0' }} />

          <Typography variant="h6" gutterBottom>
            O que esta migração faz:
          </Typography>

          <List>
            <ListItem>
              <Info color="primary" style={{ marginRight: 8 }} />
              <ListItemText 
                primary="Converte senhas em texto plano para hash SHA-256"
              />
            </ListItem>
            <ListItem>
              <Info color="primary" style={{ marginRight: 8 }} />
              <ListItemText 
                primary="Remove a senha em texto plano após conversão"
              />
            </ListItem>
            <ListItem>
              <Info color="primary" style={{ marginRight: 8 }} />
              <ListItemText 
                primary="Define consentimento LGPD padrão se necessário"
              />
            </ListItem>
            <ListItem>
              <Info color="primary" style={{ marginRight: 8 }} />
              <ListItemText 
                primary="Atualiza a data de última modificação"
              />
            </ListItem>
          </List>

          <Divider style={{ margin: '20px 0' }} />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleMigrar}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <VpnKey />}
          >
            {loading ? 'Migrando...' : 'Iniciar Migração Agora'}
          </Button>

          {erro && (
            <Box className={classes.resultado} style={{ backgroundColor: '#f8d7da', padding: '16px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
              <Typography variant="body2">
                <ErrorIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
                {erro}
              </Typography>
            </Box>
          )}

          {resultado && (
            <Box className={classes.resultado}>
              <Box style={{ 
                backgroundColor: resultado.sucesso ? '#d4edda' : '#f8d7da', 
                padding: '16px', 
                borderRadius: '8px', 
                border: resultado.sucesso ? '1px solid #c3e6cb' : '1px solid #f5c6cb' 
              }}>
                <Typography variant="h6" gutterBottom>
                  {resultado.sucesso ? '✅ Migração Concluída!' : '❌ Erro na Migração'}
                </Typography>

                <div className={classes.stats}>
                  <div className={classes.statItem}>
                    <Typography variant="h4" color="primary">
                      {resultado.migrados}
                    </Typography>
                    <Typography variant="caption">
                      Migrados
                    </Typography>
                  </div>

                  <div className={classes.statItem}>
                    <Typography variant="h4" style={{ color: '#4caf50' }}>
                      {resultado.jaConvertidos}
                    </Typography>
                    <Typography variant="caption">
                      Já Convertidos
                    </Typography>
                  </div>

                  <div className={classes.statItem}>
                    <Typography variant="h4" color="error">
                      {resultado.erros}
                    </Typography>
                    <Typography variant="caption">
                      Erros
                    </Typography>
                  </div>

                  <div className={classes.statItem}>
                    <Typography variant="h4">
                      {resultado.total}
                    </Typography>
                    <Typography variant="caption">
                      Total
                    </Typography>
                  </div>
                </div>

                {/* Updated section for detailed migration status */}
                <Typography variant="body1" gutterBottom>
                  Total de usuários: {resultado.total}
                </Typography>
                <Typography variant="body1" gutterBottom style={{ color: '#4caf50' }}>
                  ✅ Migrados agora: {resultado.migrados}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  ✔️ Já convertidos: {resultado.jaConvertidos}
                </Typography>
                <Typography variant="body1" gutterBottom color="error">
                  ❌ Erros: {resultado.erros}
                </Typography>

                {resultado.migrados > 0 && (
                  <Box style={{ backgroundColor: '#d4edda', padding: '12px', borderRadius: '4px', marginTop: '16px' }}>
                    <Typography variant="body2" style={{ color: '#155724' }}>
                      ✅ Migração concluída! {resultado.migrados} usuário(s) agora podem fazer login com segurança.
                    </Typography>
                  </Box>
                )}

                {resultado.jaConvertidos === resultado.total && resultado.migrados === 0 && (
                  <Box style={{ backgroundColor: '#d1ecf1', padding: '12px', borderRadius: '4px', marginTop: '16px' }}>
                    <Typography variant="body2" style={{ color: '#0c5460' }}>
                      ℹ️ Todos os usuários já estão migrados para o sistema seguro com salt e hash.
                    </Typography>
                  </Box>
                )}
                {/* End of updated section */}

                {resultado.errosDetalhados && resultado.errosDetalhados.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Detalhes dos Erros:
                    </Typography>
                    <List dense>
                      {resultado.errosDetalhados.map((err: any, idx: number) => (
                        <ListItem key={idx}>
                          <ErrorIcon fontSize="small" color="error" style={{ marginRight: 8 }} />
                          <ListItemText 
                            primary={err.email}
                            secondary={err.erro}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Instruções Pós-Migração
          </Typography>

          <List>
            <ListItem>
              <CheckCircle color="primary" style={{ marginRight: 8 }} />
              <ListItemText 
                primary="Verifique se todos os usuários foram migrados"
                secondary="Confira os números acima"
              />
            </ListItem>
            <ListItem>
              <CheckCircle color="primary" style={{ marginRight: 8 }} />
              <ListItemText 
                primary="Teste o login com alguns usuários"
                secondary="Certifique-se que o login está funcionando"
              />
            </ListItem>
            <ListItem>
              <CheckCircle color="primary" style={{ marginRight: 8 }} />
              <ListItemText 
                primary="Remova esta página após a migração"
                secondary="Por segurança, delete src/pages/admin/migrar-contas.tsx"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  );
}