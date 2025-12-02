
import React from 'react';
import { useRouter } from 'next/router';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, Typography, Button } from '@material-ui/core';
import { Lock } from '@material-ui/icons';
import { AreaPermissions, ModulePermission } from '@/types/Permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  area: 'cliente' | 'empresarial' | 'colaborador';
  module?: keyof AreaPermissions['modules'];
  permission?: keyof ModulePermission;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  area,
  module,
  permission = 'visualizar',
  fallback
}) => {
  const router = useRouter();
  const { hasAreaAccess, hasModulePermission } = usePermissions();

  // Verificar acesso à área
  if (!hasAreaAccess(area)) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Card style={{ margin: 20, textAlign: 'center' }}>
        <CardContent>
          <Lock style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
          <Typography variant="h5" gutterBottom>
            Acesso Negado
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Você não tem permissão para acessar a área{' '}
            {area === 'cliente' && 'Cliente'}
            {area === 'empresarial' && 'Empresarial'}
            {area === 'colaborador' && 'Colaborador'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/')}
            style={{ marginTop: 16 }}
          >
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verificar permissão específica do módulo se especificado
  if (module && !hasModulePermission(area, module, permission)) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Card style={{ margin: 20, textAlign: 'center' }}>
        <CardContent>
          <Lock style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
          <Typography variant="h5" gutterBottom>
            Permissão Insuficiente
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Você não tem permissão para {permission} neste módulo.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.back()}
            style={{ marginTop: 16 }}
          >
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
