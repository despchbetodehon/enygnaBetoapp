'use client';

import React, { memo, useState, lazy, Suspense, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFileAlt, FaTachometerAlt, FaPhone, FaChartPie, FaUserTie,
  FaStore, FaCrown, FaTrophy, FaGem, FaMagic, FaRocket, FaCog,
  FaCopy, FaChevronDown, FaWhatsapp, FaShieldAlt, FaAward, FaBusinessTime,
  FaCertificate, FaHandshake, FaLock, FaCheckCircle, FaArrowRight, FaExternalLinkAlt,
  FaBuilding, FaChartLine, FaUsers, FaClipboardCheck, FaStar, FaUserPlus, FaEdit, FaTrash
} from 'react-icons/fa';

// Componente de Gestão de Usuários
const GestaoUsuariosComponent = () => {
  const [usuariosList, setUsuariosList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedUserSection, setExpandedUserSection] = useState(false);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newUserData, setNewUserData] = useState<{
    nome: string;
    email: string;
    senha: string;
    permissao: 'Visualizador' | 'cliente' | 'empresa' | 'colaborador' | 'administrador' | 'Operador' | 'Administrador' | 'CEO' | 'EnygmaDeveloper';
  }>({
    nome: '',
    email: '',
    senha: '',
    permissao: 'Visualizador'
  });
  const [editUserData, setEditUserData] = useState<{
    id: string;
    nome: string;
    email: string;
    permissao: 'Visualizador' | 'cliente' | 'empresa' | 'colaborador' | 'administrador' | 'Operador' | 'Administrador' | 'CEO' | 'EnygmaDeveloper';
    ativo: boolean;
    senha: string;
  }>({
    id: '',
    nome: '',
    email: '',
    permissao: 'Visualizador',
    ativo: true,
    senha: ''
  });

  useEffect(() => {
    if (expandedUserSection) {
      carregarUsuarios();
    }
  }, [expandedUserSection]);

  const carregarUsuarios = async () => {
    setIsLoading(true);
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      const usuarios = await colecao.consultarTodos('usuarios');
      const usuariosFormatados = usuarios.map((usuario: any) => ({
        id: usuario.id || usuario.email,
        nome: usuario.nome || 'Nome não informado',
        email: usuario.email || 'Email não informado',
        permissao: usuario.permissao || 'Visualizador',
        ativo: usuario.ativo !== false,
        imagemUrl: usuario.imagemUrl || '/betologo.jpeg',
        dataCriacao: usuario.dataCriacao || new Date(),
      }));
      setUsuariosList(usuariosFormatados);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuariosList([]);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao carregar usuários.',
        type: 'error',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (usuario: any) => {
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      const novoStatus = !usuario.ativo;
      await colecao.salvar('usuarios', {
        ...usuario,
        ativo: novoStatus,
        dataAtualizacao: new Date(),
      }, usuario.email);
      setNotifications([{
        id: Date.now(),
        message: `Usuário ${usuario.nome} ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`,
        type: 'success',
      }]);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao alterar status do usuário.',
        type: 'error',
      }]);
    }
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>, usuario: any) => {
    setUserMenuAnchor(event.currentTarget);
    setSelectedUser(usuario);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleEditUser = (usuario: any) => {
    setEditUserData({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      permissao: usuario.permissao,
      ativo: usuario.ativo,
      senha: ''
    });
    setEditUserDialogOpen(true);
    handleUserMenuClose();
  };

  const handleDeleteUser = (usuario: any) => {
    setUserToDelete(usuario);
    setDeleteUserDialogOpen(true);
    handleUserMenuClose();
  };

  const handleNewUserSubmit = async () => {
    try {
      if (!newUserData.nome || !newUserData.email || !newUserData.senha) {
        setNotifications([{
          id: Date.now(),
          message: 'Preencha todos os campos obrigatórios.',
          type: 'error',
        }]);
        return;
      }

      console.log('🔐 Criando usuário seguro com criptografia salt+hash SHA-256:', newUserData.email);

      // SEMPRE usar a API segura - NUNCA salvar direto no Firestore
      const response = await fetch('/api/migrar-contas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          criarUsuario: true,
          usuario: {
            email: newUserData.email.trim().toLowerCase(),
            nome: newUserData.nome.trim(),
            senha: newUserData.senha,
            permissao: newUserData.permissao,
            imagemUrl: '/betologo.jpeg',
            ativo: true,
            consentimentoLGPD: true,
            aceitouTermos: true,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      console.log('✅ Usuário criado com segurança:', {
        email: data.email,
        temSalt: !!data.usuario?.salt,
        temHash: !!data.usuario?.senhaHash,
        lgpdCompliant: data.usuario?.lgpdCompliant
      });

      setNotifications([{
        id: Date.now(),
        message: `✅ ${newUserData.nome} criado com sucesso! 🔒 Senha criptografada com salt único + SHA-256. ✅ LGPD compliant.`,
        type: 'success',
      }]);
      
      setNewUserDialogOpen(false);
      setNewUserData({ nome: '', email: '', senha: '', permissao: 'Visualizador' });
      
      // Aguardar um pouco antes de recarregar para garantir que o Firestore foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      await carregarUsuarios();
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: error.message || 'Erro ao criar usuário. Verifique os dados.',
        type: 'error',
      }]);
    }
  };

  const handleEditUserSubmit = async () => {
    try {
      console.log('🔐 Atualizando usuário com sistema seguro...');

      // Se uma nova senha foi fornecida, usar a API segura
      if (editUserData.senha && editUserData.senha.trim() !== '') {
        const response = await fetch('/api/migrar-contas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            atualizarSenha: true,
            email: editUserData.email.trim().toLowerCase(),
            senha: editUserData.senha.trim(),
            dadosAdicionais: {
              nome: editUserData.nome.trim(),
              permissao: editUserData.permissao,
              ativo: editUserData.ativo
            }
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao atualizar senha');
        }

        console.log('✅ Senha atualizada com segurança:', {
          email: editUserData.email,
          temSalt: !!data.usuario?.salt,
          temHash: !!data.usuario?.senhaHash
        });

        setNotifications([{
          id: Date.now(),
          message: `✅ ${editUserData.nome} atualizado com sucesso! 🔒 Senha criptografada com salt único + SHA-256.`,
          type: 'success',
        }]);
      } else {
        // Se não mudou a senha, atualizar apenas os outros dados
        const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
        const colecao = new Colecao();
        
        await colecao.salvar('usuarios', {
          nome: editUserData.nome,
          email: editUserData.email,
          permissao: editUserData.permissao,
          ativo: editUserData.ativo,
          dataAtualizacao: new Date(),
        }, editUserData.email);

        setNotifications([{
          id: Date.now(),
          message: `Usuário ${editUserData.nome} atualizado com sucesso!`,
          type: 'success',
        }]);
      }
      
      setEditUserDialogOpen(false);
      
      // Aguardar um pouco antes de recarregar
      await new Promise(resolve => setTimeout(resolve, 500));
      await carregarUsuarios();
    } catch (error: any) {
      console.error('❌ Erro ao editar usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: error.message || 'Erro ao editar usuário.',
        type: 'error',
      }]);
    }
  };

  const confirmDeleteUser = async () => {
    try {
      const { default: Colecao } = await import('@/logic/firebase/db/Colecao');
      const colecao = new Colecao();
      await colecao.excluir('usuarios', userToDelete.email);
      setNotifications([{
        id: Date.now(),
        message: `Usuário ${userToDelete.nome} excluído com sucesso!`,
        type: 'success',
      }]);
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setNotifications([{
        id: Date.now(),
        message: 'Erro ao excluir usuário.',
        type: 'error',
      }]);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-blue-500 text-xl" />
              <div>
                <h3 className="font-bold text-blue-900">Área Colaborador</h3>
                <p className="text-sm text-blue-800">Gerencie usuários, permissões e acessos do sistema</p>
              </div>
            </div>
            <button
              onClick={() => {
                const fullUrl = window.location.origin + '/colaboradores';
                navigator.clipboard.writeText(fullUrl);
                alert('Link copiado!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <FaCopy /> Copiar Link
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setExpandedUserSection(!expandedUserSection)}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            <FaUsers className="text-4xl" />
            <div className="text-center">
              <div className="font-bold text-lg">Adicionar Usuários</div>
              <div className="text-xs opacity-90">Criar, editar e gerenciar usuários</div>
            </div>
            <FaChevronDown className={`text-xl transition-transform ${expandedUserSection ? 'rotate-180' : ''}`} />
          </button>

          <a
            href="/colaboradores"
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <FaShieldAlt className="text-4xl" />
            <div className="text-center">
              <div className="font-bold text-lg">Permissões</div>
              <div className="text-xs opacity-90">Controle de acessos e perfis</div>
            </div>
          </a>

          <a
            href="/colaboradores"
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <FaChartLine className="text-4xl" />
            <div className="text-center">
              <div className="font-bold text-lg">Dashboard Documentos</div>
              <div className="text-xs opacity-90">Visualização de documentos e dados</div>
            </div>
          </a>
        </div>

        {expandedUserSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                👥 Gestão de Usuários ({usuariosList?.length || 0})
              </Typography>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  onClick={carregarUsuarios}
                  disabled={isLoading}
                  style={{ borderRadius: 8 }}
                >
                  Recarregar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FaUserPlus />}
                  onClick={() => setNewUserDialogOpen(true)}
                  style={{ borderRadius: 8 }}
                >
                  Novo Usuário
                </Button>
              </div>
            </div>

            <TableContainer component={Paper} style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <Table>
                <TableHead style={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Usuário</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Permissão</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosList && usuariosList.length > 0 ? (
                    usuariosList.map((usuario, index) => (
                      <TableRow key={usuario.id || usuario.email || index} hover>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={usuario.imagemUrl || '/betologo.jpeg'} style={{ width: 40, height: 40, marginRight: 12 }}>
                              {usuario.nome?.charAt(0)?.toUpperCase() || '?'}
                            </Avatar>
                            <div>
                              <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                {usuario.nome || usuario.email || 'Nome não informado'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {usuario.id || usuario.email || 'N/A'}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{usuario.email || 'Email não informado'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={usuario.permissao || 'Visualizador'}
                            color={usuario.permissao === 'Administrador' ? 'secondary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={usuario.ativo !== false}
                                onChange={() => handleToggleUserStatus(usuario)}
                                color="primary"
                                size="small"
                              />
                            }
                            label={usuario.ativo !== false ? 'Ativo' : 'Inativo'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => handleUserMenuClick(e, usuario)} size="small">
                            <FaCog />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center', padding: '48px' }}>
                        <Typography variant="h6" color="textSecondary">
                          {isLoading ? 'Carregando usuários...' : 'Nenhum usuário encontrado'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-900 mb-1">Recursos Disponíveis</h3>
              <ul className="text-sm text-green-800 list-disc list-inside space-y-1">
                <li>Criação e edição de usuários</li>
                <li>Gestão de permissões e perfis de acesso</li>
                <li>Visualização de dashboards e documentos</li>
                <li>Controle de status de usuários (ativo/inativo)</li>
                <li>Sistema de permissões hierárquico</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={newUserDialogOpen} onClose={() => setNewUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
            <Add style={{ marginRight: 8 }} />
            Adicionar Novo Usuário
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            🔒 Senha será armazenada com salt aleatório e hash SHA-256 para máxima segurança
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={newUserData.nome}
              onChange={(e) => setNewUserData(prev => ({ ...prev, nome: e.target.value }))}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={newUserData.senha}
              onChange={(e) => setNewUserData(prev => ({ ...prev, senha: e.target.value }))}
              variant="outlined"
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>Permissão</InputLabel>
              <Select
                value={newUserData.permissao}
                onChange={(e) => setNewUserData(prev => ({ ...prev, permissao: e.target.value as typeof newUserData.permissao }))}
                label="Permissão"
              >
                <MenuItem value="Visualizador">Visualizador</MenuItem>
                <MenuItem value="Operador">Operador</MenuItem>
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="CEO">CEO</MenuItem>
                <MenuItem value="EnygmaDeveloper">EnygmaDeveloper</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewUserDialogOpen(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleNewUserSubmit} color="primary" variant="contained">Criar Usuário</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editUserDialogOpen} onClose={() => setEditUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={editUserData.nome}
              onChange={(e) => setEditUserData(prev => ({ ...prev, nome: e.target.value }))}
              variant="outlined"
            />
            <TextField fullWidth label="Email" value={editUserData.email} variant="outlined" disabled />
            <TextField
              fullWidth
              label="Nova Senha (deixe em branco para não alterar)"
              type="password"
              value={editUserData.senha}
              onChange={(e) => setEditUserData(prev => ({ ...prev, senha: e.target.value }))}
              variant="outlined"
              placeholder="Digite a nova senha ou deixe em branco"
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>Permissão</InputLabel>
              <Select
                value={editUserData.permissao}
                onChange={(e) => setEditUserData(prev => ({ ...prev, permissao: e.target.value as typeof editUserData.permissao }))}
                label="Permissão"
              >
                <MenuItem value="Visualizador">Visualizador</MenuItem>
                <MenuItem value="Operador">Operador</MenuItem>
                <MenuItem value="Administrador">Administrador</MenuItem>
                <MenuItem value="CEO">CEO</MenuItem>
                <MenuItem value="EnygmaDeveloper">EnygmaDeveloper</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={editUserData.ativo} onChange={(e) => setEditUserData(prev => ({ ...prev, ativo: e.target.checked }))} color="primary" />}
              label="Usuário Ativo"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialogOpen(false)} color="secondary">Cancelar</Button>
          <Button onClick={handleEditUserSubmit} color="primary" variant="contained">Salvar Alterações</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteUserDialogOpen} onClose={() => setDeleteUserDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserDialogOpen(false)} color="secondary">Cancelar</Button>
          <Button onClick={confirmDeleteUser} color="primary" variant="contained">Confirmar Exclusão</Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose}>
        <MenuItem onClick={() => handleEditUser(selectedUser)}><FaEdit style={{ marginRight: 8 }} /> Editar</MenuItem>
        <MenuItem onClick={() => handleDeleteUser(selectedUser)}><FaTrash style={{ marginRight: 8 }} /> Excluir</MenuItem>
      </Menu>

      <Snackbar
        open={notifications.length > 0}
        autoHideDuration={6000}
        onClose={() => setNotifications([])}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notifications[0]?.type || 'success'} onClose={() => setNotifications([])}>
          {notifications[0]?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Add } from '@material-ui/icons';
import ForcarAutenticacao from '@/components/autenticacao/ForcarAutenticacao';
import { CircularProgress } from '@material-ui/core';


// Lazy load dos componentes
const DashboardTubarao = lazy(() => import('./dashboard/index'));
const FormularioRequerimento = lazy(() => import('./requerimento/index'));
const DashboardDigital = lazy(() => import('./dashboard/digital/index'));
const RequerimentoDigital = lazy(() => import('./requerimento/digital/index'));
const ProcuracaoDigital = lazy(() => import('./procuracao/index'));
const ChamadosTI = lazy(() => import('./chamadosti/index'));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  
  return (
    <div
      role="tabpanel"
      id={`beto-tabpanel-${index}`}
      aria-labelledby={`beto-tab-${index}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <CircularProgress size={60} style={{ color: '#1976d2' }} />
            </div>
          }>
            {children}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  description?: string;
  badge?: string;
  component?: React.ReactNode;
}

interface MenuSection {
  section: string;
  headerGradient: string;
  icon: React.ReactElement;
  description: string;
  items: MenuItem[];
}

// Lazy load do componente Chat
const ChatInterno = lazy(() => import('@/components/chat/ChatInterno'));

const BetoMenu = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [expandedUserSection, setExpandedUserSection] = useState(false);

  const menuSections: MenuSection[] = [
    {
      section: 'Suporte TI',
      headerGradient: 'from-red-800 via-red-700 to-red-600',
      icon: <FaClipboardCheck className="text-xl md:text-2xl" />,
      description: 'Chamados e suporte técnico',
      items: [
        {
          id: 'chamadosti',
          label: 'Chamados TI',
          icon: <FaClipboardCheck />,
          description: 'Chat de suporte',
          badge: 'Novo',
          component: (
            <div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <h3 className="font-bold text-blue-900">Chamados TI</h3>
                      <p className="text-sm text-blue-800">Sistema de suporte técnico com chat público</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = window.location.origin + '/beto/chamadosti';
                      navigator.clipboard.writeText(fullUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FaCopy /> Copiar Link
                  </button>
                </div>
              </div>
              <ChamadosTI />
            </div>
          )
        },
      ]
    },
    {
      section: 'Gestão Empresarial',
      headerGradient: 'from-slate-800 via-slate-700 to-slate-600',
      icon: <FaBuilding className="text-xl md:text-2xl" />,
      description: 'Centro de controle executivo',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Tubarao',
          icon: <FaTachometerAlt />,
          description: 'Painel de controle',
          badge: 'Tubarão',
          component: (
            <div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <h3 className="font-bold text-blue-900">Dashboard Tubarão</h3>
                      <p className="text-sm text-blue-800">Acesse o painel de controle completo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = window.location.origin + '/beto/dashboard';
                      navigator.clipboard.writeText(fullUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FaCopy /> Copiar Link
                  </button>
                </div>
              </div>
              <DashboardTubarao />
            </div>
          )
        },
        {
          id: 'requerimento',
          label: 'Formulario Requerimento',
          icon: <FaPhone />,
          description: 'Formulario Requerimento',
          badge: 'Tubarão',
          component: (
            <div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <h3 className="font-bold text-blue-900">Formulário Requerimento</h3>
                      <p className="text-sm text-blue-800">Preencha o formulário de requerimento</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = window.location.origin + '/beto/requerimento';
                      navigator.clipboard.writeText(fullUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FaCopy /> Copiar Link
                  </button>
                </div>
              </div>
              <FormularioRequerimento />
            </div>
          )
        },
      ]
    },
    {
      section: 'Serviços Digital',
      headerGradient: 'from-cyan-800 via-cyan-700 to-cyan-700',
      icon: <FaFileAlt className="text-xl md:text-2xl" />,
      description: 'Documentação veicular',
      items: [
        {
          id: 'dashboard-digital',
          label: 'Dashboard Digital',
          icon: <FaFileAlt />,
          description: 'Painel Digital',
          badge: 'Digital',
          component: (
            <div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <h3 className="font-bold text-blue-900">Dashboard Digital</h3>
                      <p className="text-sm text-blue-800">Painel de controle digital</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = window.location.origin + '/beto/dashboard/digital';
                      navigator.clipboard.writeText(fullUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FaCopy /> Copiar Link
                  </button>
                </div>
              </div>
              <DashboardDigital />
            </div>
          )
        },
        {
          id: 'requerimento-digital',
          label: 'Requerimento Digital',
          icon: <FaHandshake />,
          description: 'Formulario de requerimento',
          badge: 'Digital',
          component: (
            <div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <h3 className="font-bold text-blue-900">Requerimento Digital</h3>
                      <p className="text-sm text-blue-800">Formulário de requerimento digital</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = window.location.origin + '/beto/requerimento/digital';
                      navigator.clipboard.writeText(fullUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FaCopy /> Copiar Link
                  </button>
                </div>
              </div>
              <RequerimentoDigital />
            </div>
          )
        },
        {
          id: 'procuracao',
          label: 'Procurão',
          icon: <FaCertificate />,
          description: 'Procuração digital',
          badge: 'Documento',
          component: (
            <div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <h3 className="font-bold text-blue-900">Procuração</h3>
                      <p className="text-sm text-blue-800">Procuração digital</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = window.location.origin + '/beto/procuracao';
                      navigator.clipboard.writeText(fullUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FaCopy /> Copiar Link
                  </button>
                </div>
              </div>
              <ProcuracaoDigital />
            </div>
          )
        },
      ]
    },
    {
      section: 'Chat Interno',
      headerGradient: 'from-indigo-800 via-indigo-700 to-indigo-600',
      icon: <FaWhatsapp className="text-xl md:text-2xl" />,
      description: 'Atendimento e suporte',
      items: [
        {
          id: 'chat-atendimento',
          label: 'Chat de Atendimento',
          icon: <FaWhatsapp />,
          description: 'Suporte em tempo real',
          badge: 'Lívia IA',
          component: (
            <div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl" />
                    <div>
                      <h3 className="font-bold text-blue-900">Chat de Atendimento</h3>
                      <p className="text-sm text-blue-800">Converse com a Lívia - assistente virtual inteligente</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const fullUrl = window.location.origin + '/chat';
                      navigator.clipboard.writeText(fullUrl);
                      alert('Link copiado!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <FaCopy /> Copiar Link
                  </button>
                </div>
              </div>
              <ChatInterno />
            </div>
          )
        },
      ]
    },
    {
      section: 'Área Colaborador',
      headerGradient: 'from-green-800 via-green-700 to-green-600',
      icon: <FaUsers className="text-xl md:text-2xl" />,
      description: 'Gestão de colaboradores e permissões',
      items: [
        {
          id: 'gestao-colaboradores',
          label: 'Adicionar Usuário',
          icon: <FaUsers />,
          description: 'Gerenciar usuários e permissões',
          badge: 'Admin',
          component: <GestaoUsuariosComponent />
        },
      ]
    },
    {
      section: 'Ferramentas Externas',
      headerGradient: 'from-purple-800 via-purple-700 to-purple-600',
      icon: <FaExternalLinkAlt className="text-xl md:text-2xl" />,
      description: 'Acesso rápido a plataformas',
      items: [
        {
          id: 'ferramentas-externas',
          label: 'Acessar Plataformas',
          icon: <FaRocket />,
          description: 'Links rápidos',
          badge: 'Externo',
          component: (
            <div className="p-6 md:p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                  Ferramentas Externas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <a
                      href="https://app.digisac.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <FaWhatsapp className="text-3xl" />
                      <div>
                        <div className="font-bold text-lg">Digisac</div>
                        <div className="text-xs opacity-90">Atendimento Digital</div>
                      </div>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://app.digisac.com');
                        alert('Link copiado!');
                      }}
                      className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-semibold transition-all"
                    >
                      <FaCopy className="inline mr-1" /> Copiar
                    </button>
                  </div>

                  <div className="relative">
                    <a
                      href="https://web.whatsapp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <FaWhatsapp className="text-3xl" />
                      <div>
                        <div className="font-bold text-lg">WhatsApp Web</div>
                        <div className="text-xs opacity-90">Mensagens</div>
                      </div>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://web.whatsapp.com');
                        alert('Link copiado!');
                      }}
                      className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-semibold transition-all"
                    >
                      <FaCopy className="inline mr-1" /> Copiar
                    </button>
                  </div>

                  <div className="relative">
                    <a
                      href="https://app.rdstation.com.br"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <FaChartLine className="text-3xl" />
                      <div>
                        <div className="font-bold text-lg">RD Station</div>
                        <div className="text-xs opacity-90">Marketing & CRM</div>
                      </div>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://app.rdstation.com.br');
                        alert('Link copiado!');
                      }}
                      className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-semibold transition-all"
                    >
                      <FaCopy className="inline mr-1" /> Copiar
                    </button>
                  </div>

                  <div className="relative">
                    <a
                      href="https://detranet.detran.sc.gov.br"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <FaShieldAlt className="text-3xl" />
                      <div>
                        <div className="font-bold text-lg">Detranet</div>
                        <div className="text-xs opacity-90">DETRAN SC</div>
                      </div>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://detranet.detran.sc.gov.br');
                        alert('Link copiado!');
                      }}
                      className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-semibold transition-all"
                    >
                      <FaCopy className="inline mr-1" /> Copiar
                    </button>
                  </div>

                  <div className="relative">
                    <a
                      href="/beto"
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <FaBuilding className="text-3xl" />
                      <div>
                        <div className="font-bold text-lg">Portal Beto</div>
                        <div className="text-xs opacity-90">Menu Principal</div>
                      </div>
                    </a>
                    <button
                      onClick={() => {
                        const fullUrl = window.location.origin + '/beto';
                        navigator.clipboard.writeText(fullUrl);
                        alert('Link copiado!');
                      }}
                      className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-semibold transition-all"
                    >
                      <FaCopy className="inline mr-1" /> Copiar
                    </button>
                  </div>

                  <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <FaCog className="text-3xl mx-auto mb-2" />
                      <div className="text-sm font-semibold">Mais em breve</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Acesso Rápido</h3>
                      <p className="text-sm text-blue-800">
                        Todas as ferramentas importantes em um só lugar. Clique nos botões acima para acessar as plataformas externas em uma nova aba.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        },
      ]
    }
  ];

  const handleTabChange = (sectionIndex: number) => {
    setActiveTab(sectionIndex);
    setActiveSubTab(0);
  };

  const handleSubTabChange = (itemIndex: number) => {
    setActiveSubTab(itemIndex);
  };

  return (
    <ForcarAutenticacao>
      <div className="h-screen overflow-hidden bg-white flex flex-col">
        <Head>
          <title>Beto Dehon | Portal Executivo de Gestão Empresarial</title>
          <meta name="description" content="Portal executivo completo para gestão empresarial e documentação veicular premium" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>

        {/* Tabs Principais */}
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex overflow-x-auto scrollbar-hide gap-0.5">
              {menuSections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => handleTabChange(index)}
                  className={`flex items-center gap-2 px-3 py-4 md:px-4 md:py-5 whitespace-nowrap border-b-4 transition-all duration-300 cursor-pointer select-none ${
                    activeTab === index
                      ? 'border-blue-600 text-blue-600 bg-blue-50 font-bold hover:bg-blue-100'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  style={{
                    minHeight: '80px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div className={`text-xl md:text-2xl ${activeTab === index ? 'scale-110' : 'scale-100'} transition-transform duration-300 pointer-events-none`}>
                    {section.icon}
                  </div>
                  <div className="text-left pointer-events-none">
                    <div className="text-xs md:text-sm font-bold">{section.section}</div>
                    <div className="text-[10px] md:text-xs opacity-70 hidden md:block">
                      {section.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-tabs (Itens da seção ativa) */}
        <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex overflow-x-auto scrollbar-hide gap-2 py-3 px-2">
              {menuSections[activeTab].items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSubTabChange(index)}
                  className={`flex items-center gap-2 px-4 py-3 md:px-5 md:py-4 rounded-lg whitespace-nowrap transition-all duration-300 cursor-pointer select-none ${
                    activeSubTab === index
                      ? 'bg-blue-600 text-white shadow-lg scale-105 hover:bg-blue-700 hover:shadow-xl'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md hover:scale-102 border-2 border-gray-200'
                  }`}
                  style={{
                    minHeight: '56px',
                    transform: activeSubTab === index ? 'scale(1.05)' : 'scale(1)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div className={`text-lg md:text-xl ${activeSubTab === index ? 'animate-pulse' : ''} pointer-events-none`}>
                    {item.icon}
                  </div>
                  <div className="text-xs md:text-sm font-bold pointer-events-none">{item.label}</div>
                  {item.badge && (
                    <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-bold pointer-events-none ${
                      activeSubTab === index
                        ? 'bg-white/30 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="w-full">
            {menuSections[activeTab].items.map((item, itemIndex) => (
              <TabPanel key={itemIndex} value={activeSubTab} index={itemIndex}>
                {item.component}
              </TabPanel>
            ))}
          </div>
        </div>
      </div>
    </ForcarAutenticacao>
  );
};

export default memo(BetoMenu);
