
import { useContext, useMemo } from 'react';
import AutenticacaoContext from '@/data/contexts/AutenticacaoContext';
import PermissionManager from '@/logic/core/permissions/PermissionManager';
import { AreaPermissions, ModulePermission } from '@/types/Permissions';

export const usePermissions = () => {
  const { usuario } = useContext(AutenticacaoContext);
  const permissionManager = PermissionManager.getInstance();

  const userPermissions = useMemo(() => {
    if (!usuario?.uid && !usuario?.email) return null;
    
    const profileId = (usuario as any).permissionProfile || usuario.permissao || 'cliente';
    const userId = usuario.uid || usuario.email || '';
    return permissionManager.getUserPermissions(userId, profileId);
  }, [usuario, permissionManager]);

  const hasAreaAccess = (area: 'cliente' | 'empresarial' | 'colaborador'): boolean => {
    if (!usuario?.uid && !usuario?.email) return false;
    
    const profileId = (usuario as any).permissionProfile || usuario.permissao || 'cliente';
    const userId = usuario.uid || usuario.email || '';
    return permissionManager.hasAreaAccess(userId, area, profileId);
  };

  const hasModulePermission = (
    area: 'cliente' | 'empresarial' | 'colaborador',
    module: keyof AreaPermissions['modules'],
    permission: keyof ModulePermission
  ): boolean => {
    if (!usuario?.uid && !usuario?.email) return false;
    
    const profileId = (usuario as any).permissionProfile || usuario.permissao || 'cliente';
    const userId = usuario.uid || usuario.email || '';
    return permissionManager.hasModulePermission(userId, area, module, permission, profileId);
  };

  const isAdmin = (): boolean => {
    return userPermissions?.sistemaAdmin.ativo || false;
  };

  const canManageUsers = (): boolean => {
    return userPermissions?.sistemaAdmin.gerenciarUsuarios || false;
  };

  const canManagePermissions = (): boolean => {
    return userPermissions?.sistemaAdmin.gerenciarPermissoes || false;
  };

  return {
    userPermissions,
    hasAreaAccess,
    hasModulePermission,
    isAdmin,
    canManageUsers,
    canManagePermissions,
  };
};

export default usePermissions;
