
import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Typography,
  Divider,
} from '@material-ui/core';
import {
  Dashboard,
  Chat,
  People,
  
  
  SupervisorAccount,
  WhatsApp,
  Assessment,
  Settings,
  Security,
  AttachMoney,
  Assignment,
  
  Description,
  PersonAdd,
  Business,
  ExpandLess,
  ExpandMore,
} from '@material-ui/icons';



import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import { usePermissions } from '@/hooks/usePermissions';
import { AreaPermissions } from '@/types/Permissions';

const useStyles = makeStyles((theme) => ({
  menuItem: {
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1),
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      '& .MuiListItemIcon-root': {
        color: 'white',
      },
      '& .MuiListItemText-root': {
        color: 'white',
      },
    },
  },
  activeMenuItem: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
    '& .MuiListItemText-root': {
      color: 'white',
    },
  },
  areaHeader: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  nestedItem: {
    paddingLeft: theme.spacing(4),
  },
  permissionChip: {
    height: 20,
    fontSize: '0.7rem',
  },
}));

interface MenuItem {
  id: keyof AreaPermissions['modules'];
  label: string;
  icon: React.ReactElement;
  path: string;
  permission: 'visualizar' | 'criar' | 'editar' | 'excluir';
}

interface AreaMenu {
  area: 'cliente' | 'empresarial' | 'colaborador';
  label: string;
  icon: React.ReactElement;
  items: MenuItem[];
}

const NavigationMenu: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();
  const { hasAreaAccess, hasModulePermission } = usePermissions();
  const [expandedAreas, setExpandedAreas] = React.useState<string[]>(['colaborador']);

  const menuAreas: AreaMenu[] = [
    {
      area: 'cliente',
      label: 'Área Cliente',
      icon: <PersonAdd />,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Cliente',
          icon: <Dashboard />,
          path: '/area-cliente/dashboard',
          permission: 'visualizar',
        },
        {
          id: 'chat',
          label: 'Atendimento',
          icon: <Chat />,
          path: '/area-cliente/chat',
          permission: 'visualizar',
        },
        {
          id: 'servicos',
          label: 'Serviços',
          icon: <Assignment />,
          path: '/area-cliente/servicos',
          permission: 'visualizar',
        },
        {
          id: 'atendimento',
          label: 'Suporte',
          icon: <PersonAdd />,
          path: '/area-cliente/suporte',
          permission: 'visualizar',
        },
        {
          id: 'documentos',
          label: 'Documentos',
          icon: <Description />,
          path: '/area-cliente/documentos',
          permission: 'visualizar',
        },
      ],
    },
  
    {
      area: 'colaborador',
      label: 'Área Colaborador',
      icon: <People />,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <Dashboard />,
          path: '/colaboradores',
          permission: 'visualizar',
        },
        {
          id: 'chat',
          label: 'Chat Interno',
          icon: <Chat />,
          path: '/colaboradores/chat',
          permission: 'visualizar',
        },
        {
          id: 'crm',
          label: 'CRM',
          icon: <People />,
          path: '/colaboradores/crm',
          permission: 'visualizar',
        },
        {
          id: 'ia',
          label: 'IA Assistant',
          icon: <PersonAdd />,
          path: '/colaboradores/ia',
          permission: 'visualizar',
        },
        {
          id: 'feed',
          label: 'Feed Social',
          icon: <PersonAdd />,
          path: '/colaboradores/feed',
          permission: 'visualizar',
        },
        {
          id: 'usuarios',
          label: 'Gestão de Usuários',
          icon: <SupervisorAccount />,
          path: '/colaboradores/usuarios',
          permission: 'visualizar',
        },
        {
          id: 'whatsapp',
          label: 'WhatsApp',
          icon: <WhatsApp />,
          path: '/colaboradores/whatsapp',
          permission: 'visualizar',
        },
        {
          id: 'relatorios',
          label: 'Relatórios',
          icon: <Assessment />,
          path: '/colaboradores/relatorios',
          permission: 'visualizar',
        },
        {
          id: 'configuracoes',
          label: 'Configurações',
          icon: <Settings />,
          path: '/colaboradores/configuracoes',
          permission: 'visualizar',
        },
        {
          id: 'permissoes',
          label: 'Permissões',
          icon: <Security />,
          path: '/colaboradores/permissoes',
          permission: 'visualizar',
        },
      ],
    },
  ];

  const handleAreaToggle = (area: string) => {
    setExpandedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isCurrentPath = (path: string): boolean => {
    return router.pathname === path || router.pathname.startsWith(path);
  };

  return (
    <List component="nav">
      {menuAreas.map((areaMenu) => {
        const hasAccess = hasAreaAccess(areaMenu.area);
        const isExpanded = expandedAreas.includes(areaMenu.area);
        
        if (!hasAccess) return null;

        const accessibleItems = areaMenu.items.filter(item =>
          hasModulePermission(areaMenu.area, item.id, item.permission)
        );

        if (accessibleItems.length === 0) return null;

        return (
          <React.Fragment key={areaMenu.area}>
            <ListItem
              button
              onClick={() => handleAreaToggle(areaMenu.area)}
              className={classes.menuItem}
            >
              <ListItemIcon>
                {areaMenu.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {areaMenu.label}
                    <Chip
                      label={accessibleItems.length}
                      size="small"
                      className={classes.permissionChip}
                      color="primary"
                    />
                  </div>
                }
              />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {accessibleItems.map((item) => (
                  <ListItem
                    button
                    key={item.id}
                    className={`${classes.menuItem} ${classes.nestedItem} ${
                      isCurrentPath(item.path) ? classes.activeMenuItem : ''
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
            
            <Divider style={{ margin: '8px 0' }} />
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default NavigationMenu;
