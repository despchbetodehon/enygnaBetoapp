import React, { useState, useContext } from 'react';
import { 
  Button, 
  TextField, 
  Box, 
  Collapse, 
  Typography, 
  Checkbox, 
  FormControlLabel,


  CircularProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Mail, Lock, ExpandMore, ExpandLess } from '@material-ui/icons';
import AutenticacaoContext from '@/data/contexts/AutenticacaoContext';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    margin: '8px 0',
  },
  expandButton: {
    margin: '8px',
    borderRadius: '25px',
    fontWeight: 'bold',
    textTransform: 'none',
    padding: '12px 24px',
    background: 'linear-gradient(45deg, #2d5a3d 30%, #4a7c59 90%)',
    color: '#fff',
    fontFamily: '"Playfair Display", "Georgia", serif',
    '&:hover': {
      background: 'linear-gradient(45deg, #4a7c59 30%, #5d8f6c 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(45, 90, 61, 0.4)',
    },
  },
  formContainer: {
    background: 'rgba(45, 90, 61, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    margin: '8px',
  },
  textField: {
    marginBottom: '12px',
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.5)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4a7c59',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      '&.Mui-focused': {
        color: '#4a7c59',
      },
    },
  },
  loginButton: {
    background: 'linear-gradient(45deg, #2d5a3d 30%, #4a7c59 90%)',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: '20px',
    margin: '8px 0',
    fontFamily: '"Playfair Display", "Georgia", serif',
    '&:hover': {
      background: 'linear-gradient(45deg, #4a7c59 30%, #5d8f6c 90%)',
    },
  },
  cancelButton: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: '"Playfair Display", "Georgia", serif',
  },
  checkbox: {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-checked': {
      color: '#4a7c59',
    },
  },
  checkboxLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontSize: '0.9rem',
  },
  forgotPassword: {
    color: '#4a7c59',
    fontSize: '0.85rem',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontFamily: '"Playfair Display", "Georgia", serif',
    '&:hover': {
      color: '#5d8f6c',
    },
  },
}));

export default function LoginEmailSenha() {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarSenha, setLembrarSenha] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const { loginEmailSenha } = useContext(AutenticacaoContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      setErro('Email e senha são obrigatórios');
      return;
    }

    // Normalizar email - adicionar @gmail.com se não tiver @
    let emailNormalizado = email.trim().toLowerCase();
    if (!emailNormalizado.includes('@')) {
      emailNormalizado = `${emailNormalizado}@gmail.com`;
      console.log('📧 Email normalizado:', emailNormalizado);
    }

    // Validação de senha (mínimo 4 caracteres)
    if (senha.length < 4) {
      setErro('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      console.log('🔐 Tentando fazer login com:', emailNormalizado);

      await loginEmailSenha(emailNormalizado, senha, lembrarSenha, manterConectado);

      // setSuccessMessage('Login realizado com sucesso! Redirecionando...');

      // Aguardar um pouco antes do redirecionamento
      // setTimeout(() => {
      //   router.push('/colaboradores');
      // }, 1500);

    } catch (error: any) {
      console.error('❌ Erro no login:', error);

      // Mensagens de erro mais específicas
      let mensagemErro = 'Erro ao fazer login. Verifique suas credenciais.';

      if (error.message) {
        if (error.message.includes('cadastrado')) {
          mensagemErro = 'Usuário não cadastrado. Entre em contato com o administrador.';
        } else if (error.message.includes('incorretos') || error.message.includes('inválidas')) {
          mensagemErro = 'Email ou senha incorretos. Verifique e tente novamente.';
        } else if (error.message.includes('desativado')) {
          mensagemErro = 'Sua conta foi desativada. Entre em contato com o administrador.';
        } else if (error.message.includes('banco de dados') || error.message.includes('conexão')) {
          mensagemErro = 'Problema de conexão. Tente novamente em alguns instantes.';
        } else {
          mensagemErro = error.message;
        }
      }

      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setExpanded(false);

    // Só limpar campos se não for para lembrar
    if (!lembrarSenha) {
      setEmail('');
      setSenha('');
    }

    setErro('');
  };

  const handleForgotPassword = () => {
    alert('Entre em contato conosco pelo WhatsApp para recuperar sua senha.');
  };

  React.useEffect(() => {
    const credenciaisSalvas = localStorage.getItem('lembrarCredenciais');
    if (credenciaisSalvas) {
      try {
        const { email: emailSalvo, senha: senhaSalva } = JSON.parse(credenciaisSalvas);
        setEmail(emailSalvo || '');
        setSenha(senhaSalva || '');
        setLembrarSenha(true);
      } catch (error) {
        console.error('Erro ao carregar credenciais salvas:', error);
        localStorage.removeItem('lembrarCredenciais');
      }
    }

    const manterConectadoSalvo = localStorage.getItem('manterConectado');
    if (manterConectadoSalvo === 'true') {
      setManterConectado(true);
    }
  }, []);

  return (
    <Box className={classes.container}>
      <Button
        fullWidth
        startIcon={<Mail />}
        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        className={classes.expandButton}
        onClick={() => setExpanded(!expanded)}
      >
        Login com Email
      </Button>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box className={classes.formContainer}>
          {erro && (
      <Alert severity="error" style={{ marginBottom: '12px', background: 'rgba(244, 67, 54, 0.1)' }}>
        {erro}
      </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              label="Email ou Usuário"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu usuário (ex: beto)"
              className={classes.textField}
              size="small"
              InputProps={{
                startAdornment: <Mail style={{ marginRight: 8, color: 'rgba(255, 255, 255, 0.5)' }} />
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={classes.textField}
              size="small"
              InputProps={{
                startAdornment: <Lock style={{ marginRight: 8, color: 'rgba(255, 255, 255, 0.5)' }} />
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={lembrarSenha}
                  onChange={(e) => setLembrarSenha(e.target.checked)}
                  className={classes.checkbox}
                  size="small"
                />
              }
              label="Lembrar senha"
              className={classes.checkboxLabel}
              style={{ marginBottom: '4px' }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={manterConectado}
                  onChange={(e) => setManterConectado(e.target.checked)}
                  className={classes.checkbox}
                  size="small"
                />
              }
              label="Manter conectado"
              className={classes.checkboxLabel}
              style={{ marginBottom: '8px' }}
            />

            <Box display="flex" alignItems="center" style={{ gap: 1 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.loginButton}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Lock />}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Button
                fullWidth
                className={classes.cancelButton}
                onClick={handleCancel}
              >
                Cancelar
              </Button>

              <Typography
                variant="caption"
                className={classes.forgotPassword}
                onClick={handleForgotPassword}
                style={{ textAlign: 'center', marginTop: '8px' }}
              >
                Esqueceu a senha?
              </Typography>
            </Box>
          </form>
        </Box>
      </Collapse>
    </Box>
  );
}