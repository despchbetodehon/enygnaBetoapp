import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';


import {
  Security,
  ExpandMore,
  People,
  Business,
  PersonAdd,
  Settings,
  Dashboard,
  Chat,
  CreditCard,
  Assessment,
  WhatsApp,


  SupervisorAccount,
  Add,
  Edit,
  Delete,
  Visibility,
  AttachMoney,
  Assignment,

  Description,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { UserPermissions, PermissionProfile, ModulePermission, AreaPermissions } from '@/types/Permissions';
import PermissionManager from '@/logic/core/permissions/PermissionManager';
import { Tabs, Tab } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 1200,
    },
  },
  tabPanel: {
    padding: theme.spacing(2, 0),
  },
  areaCard: {
    marginBottom: theme.spacing(2),
    border: '2px solid transparent',
    '&.active': {
      borderColor: theme.palette.primary.main,
    },
  },
  moduleCard: {
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
  },
  permissionChips: {
    display: 'flex',
    gap: theme.spacing(0.5),
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
  areaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  moduleIcon: {
    marginRight: theme.spacing(1),
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`permission-tabpanel-${index}`}
      aria-labelledby={`permission-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface PermissionManagerProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  userProfile?: string;
}

const PermissionManagerComponent: React.FC<PermissionManagerProps> = ({
  open,
  onClose,
  userId,
  userProfile,
}) => {
  const classes = useStyles();
  const permissionManager = PermissionManager.getInstance();

  const [tabValue, setTabValue] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [profiles, setProfiles] = useState<PermissionProfile[]>([]);
  const [isCustomProfile, setIsCustomProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');

  const moduleIcons: Record<keyof AreaPermissions['modules'], React.ReactElement> = {
    dashboard: <Dashboard />,
    chat: <Chat />,
    crm: <People />,
    ia: <AttachMoney />,
    feed: <AttachMoney />,
    usuarios: <SupervisorAccount />,
    whatsapp: <WhatsApp />,
    relatorios: <Assessment />,
    configuracoes: <Settings />,
    permissoes: <Security />,
    financeiro: <AttachMoney />,
    servicos: <Assignment />,
    atendimento: <Assignment />,
    documentos: <Description />,
  };

  const moduleLabels: Record<keyof AreaPermissions['modules'], string> = {
    dashboard: 'Dashboard',
    chat: 'Chat',
    crm: 'CRM',
    ia: 'Inteligência Artificial',
    feed: 'Feed Social',
    usuarios: 'Usuários',
    whatsapp: 'WhatsApp',
    relatorios: 'Relatórios',
    configuracoes: 'Configurações',
    permissoes: 'Permissões',
    financeiro: 'Financeiro',
    servicos: 'Serviços',
    atendimento: 'Atendimento',
    documentos: 'Documentos',
  };

  const permissionLabels: Record<keyof ModulePermission, { label: string; color: string }> = {
    visualizar: { label: 'Visualizar', color: '#2196f3' },
    criar: { label: 'Criar', color: '#4caf50' },
    editar: { label: 'Editar', color: '#ff9800' },
    excluir: { label: 'Excluir', color: '#f44336' },
  };

  useEffect(() => {
    if (open) {
      setProfiles(permissionManager.getPermissionProfiles());
      if (userProfile) {
        setSelectedProfile(userProfile);
        const userPermissions = permissionManager.getUserPermissions(userId || '', userProfile);
        setPermissions(userPermissions);
      }
    }
  }, [open, userId, userProfile]);

  const handleProfileChange = (profileId: string) => {
    setSelectedProfile(profileId);
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setPermissions({ ...profile.permissions });
      setIsCustomProfile(profile.isCustom);
      if (profile.isCustom) {
        setProfileName(profile.nome);
        setProfileDescription(profile.descricao);
      }
    }
  };

  const handleAreaToggle = (area: keyof UserPermissions) => {
    if (!permissions || area === 'sistemaAdmin') return;

    setPermissions(prev => ({
      ...prev!,
      [area]: {
        ...prev![area],
        ativo: !prev![area].ativo,
      },
    }));
  };

  const handleModulePermissionToggle = (
    area: keyof Pick<UserPermissions, 'areaCliente' | 'areaEmpresarial' | 'areaColaborador'>,
    module: keyof AreaPermissions['modules'],
    permission: keyof ModulePermission
  ) => {
    if (!permissions) return;

    setPermissions(prev => ({
      ...prev!,
      [area]: {
        ...prev![area],
        modules: {
          ...prev![area].modules,
          [module]: {
            ...prev![area].modules[module],
            [permission]: !prev![area].modules[module][permission],
          },
        },
      },
    }));
  };

  const handleSave = () => {
    if (isCustomProfile && permissions) {
      if (selectedProfile.startsWith('custom_')) {
        permissionManager.updatePermissionProfile(selectedProfile, {
          nome: profileName,
          descricao: profileDescription,
          permissions,
        });
      } else {
        const newProfileId = permissionManager.createCustomProfile({
          nome: profileName || 'Perfil Personalizado',
          descricao: profileDescription || 'Perfil criado pelo usuário',
          icon: null,
          color: '#9c27b0',
          permissions,
        });
        setSelectedProfile(newProfileId);
      }
    }
    onClose();
  };

  const createNewCustomProfile = () => {
    setIsCustomProfile(true);
    setProfileName('Novo Perfil');
    setProfileDescription('Perfil personalizado');
    setSelectedProfile('new_custom');

    // Criar permissões vazias
    const emptyPermissions: UserPermissions = {
      areaCliente: {
        ativo: false,
        modules: Object.keys(moduleLabels).reduce((acc, key) => {
          acc[key as keyof AreaPermissions['modules']] = {
            visualizar: false,
            criar: false,
            editar: false,
            excluir: false,
          };
          return acc;
        }, {} as AreaPermissions['modules']),
      },
      areaEmpresarial: {
        ativo: false,
        modules: Object.keys(moduleLabels).reduce((acc, key) => {
          acc[key as keyof AreaPermissions['modules']] = {
            visualizar: false,
            criar: false,
            editar: false,
            excluir: false,
          };
          return acc;
        }, {} as AreaPermissions['modules']),
      },
      areaColaborador: {
        ativo: false,
        modules: Object.keys(moduleLabels).reduce((acc, key) => {
          acc[key as keyof AreaPermissions['modules']] = {
            visualizar: false,
            criar: false,
            editar: false,
            excluir: false,
          };
          return acc;
        }, {} as AreaPermissions['modules']),
      },
      sistemaAdmin: {
        ativo: false,
        gerenciarUsuarios: false,
        gerenciarPermissoes: false,
        configuracaoSistema: false,
        logs: false,
      },
    };

    setPermissions(emptyPermissions);
  };

  const renderAreaPermissions = (
    areaKey: keyof Pick<UserPermissions, 'areaCliente' | 'areaEmpresarial' | 'areaColaborador'>,
    areaName: string,
    areaIcon: React.ReactElement
  ) => {
    if (!permissions) return null;

    const area = permissions[areaKey];

    return (
      <Card className={`${classes.areaCard} ${area.ativo ? 'active' : ''}`}>
        <CardContent>
          <div className={classes.areaHeader}>
            {areaIcon}
            <Typography variant="h6">{areaName}</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={area.ativo}
                  onChange={() => handleAreaToggle(areaKey)}
                  color="primary"
                />
              }
              label={area.ativo ? 'Ativo' : 'Inativo'}
            />
          </div>

          {area.ativo && (
            <Grid container spacing={2}>
              {Object.entries(area.modules).map(([moduleKey, modulePermissions]) => (
                <Grid item xs={12} md={6} lg={4} key={moduleKey}>
                  <Card className={classes.moduleCard}>
                    <CardContent>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <span className={classes.moduleIcon}>
                          {moduleIcons[moduleKey as keyof AreaPermissions['modules']]}
                        </span>
                        <Typography variant="subtitle2">
                          {moduleLabels[moduleKey as keyof AreaPermissions['modules']]}
                        </Typography>
                      </div>

                      <div className={classes.permissionChips}>
                        {Object.entries(modulePermissions).map(([permKey, hasPermission]) => (
                          <Chip
                            key={permKey}
                            label={permissionLabels[permKey as keyof ModulePermission].label}
                            size="small"
                            clickable
                            style={{
                              backgroundColor: hasPermission 
                                ? permissionLabels[permKey as keyof ModulePermission].color 
                                : '#e0e0e0',
                              color: hasPermission ? 'white' : '#666',
                            }}
                            onClick={() => handleModulePermissionToggle(
                              areaKey,
                              moduleKey as keyof AreaPermissions['modules'],
                              permKey as keyof ModulePermission
                            )}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialog}>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Security />
          <Typography variant="h6">Gerenciador de Permissões</Typography>
        </div>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} style={{ marginBottom: 16 }}>
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel>Perfil de Permissão</InputLabel>
              <Select
                value={selectedProfile}
                onChange={(e) => handleProfileChange(e.target.value as string)}
              >
                {profiles.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Chip
                        size="small"
                        label={profile.isCustom ? 'Personalizado' : 'Padrão'}
                        style={{ backgroundColor: profile.color, color: 'white' }}
                      />
                      {profile.nome}
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={createNewCustomProfile}
            >
              Novo Perfil
            </Button>
          </Grid>
        </Grid>

        {isCustomProfile && (
          <Grid container spacing={2} style={{ marginBottom: 16 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Perfil"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descrição"
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        )}

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Área Cliente" icon={<PersonAdd />} />
          <Tab label="Área Empresarial" icon={<Business />} />
          <Tab label="Área Colaborador" icon={<People />} />
          <Tab label="Sistema Admin" icon={<Settings />} />
        </Tabs>

        <div className={classes.tabPanel}>
          <TabPanel value={tabValue} index={0}>
            {renderAreaPermissions('areaCliente', 'Área Cliente', <PersonAdd />)}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {renderAreaPermissions('areaEmpresarial', 'Área Empresarial', <Business />)}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderAreaPermissions('areaColaborador', 'Área Colaborador', <People />)}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {permissions && (
              <Card className={classes.areaCard}>
                <CardContent>
                  <div className={classes.areaHeader}>
                    <Settings />
                    <Typography variant="h6">Administração do Sistema</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={permissions.sistemaAdmin.ativo}
                          onChange={() => setPermissions(prev => ({
                            ...prev!,
                            sistemaAdmin: {
                              ...prev!.sistemaAdmin,
                              ativo: !prev!.sistemaAdmin.ativo,
                            },
                          }))}
                          color="primary"
                        />
                      }
                      label={permissions.sistemaAdmin.ativo ? 'Ativo' : 'Inativo'}
                    />
                  </div>

                  {permissions.sistemaAdmin.ativo && (
                    <Grid container spacing={2}>
                      {Object.entries(permissions.sistemaAdmin).map(([key, value]) => {
                        if (key === 'ativo') return null;
                        return (
                          <Grid item xs={12} md={6} key={key}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={value}
                                  onChange={() => setPermissions(prev => ({
                                    ...prev!,
                                    sistemaAdmin: {
                                      ...prev!.sistemaAdmin,
                                      [key]: !value,
                                    },
                                  }))}
                                  color="primary"
                                />
                              }
                              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            )}
          </TabPanel>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Salvar Permissões
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionManagerComponent;