
export interface ModulePermission {
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

export interface AreaPermissions {
  ativo: boolean;
  modules: {
    dashboard: ModulePermission;
    chat: ModulePermission;
    crm: ModulePermission;
    ia: ModulePermission;
    feed: ModulePermission;
    usuarios: ModulePermission;
    whatsapp: ModulePermission;
    relatorios: ModulePermission;
    configuracoes: ModulePermission;
    permissoes: ModulePermission;
    financeiro: ModulePermission;
    servicos: ModulePermission;
    atendimento: ModulePermission;
    documentos: ModulePermission;
  };
}

export interface UserPermissions {
  areaCliente: AreaPermissions;
  areaEmpresarial: AreaPermissions;
  areaColaborador: AreaPermissions;
  sistemaAdmin: {
    ativo: boolean;
    gerenciarUsuarios: boolean;
    gerenciarPermissoes: boolean;
    configuracaoSistema: boolean;
    logs: boolean;
  };
}

export interface PermissionProfile {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  color: string;
  permissions: UserPermissions;
  isCustom: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserWithPermissions {
  uid: string;
  email: string;
  nome: string;
  imagemUrl?: string;
  permissionProfile: string;
  customPermissions?: Partial<UserPermissions>;
  ativo: boolean;
  ultimoAcesso?: Date;
  dataCriacao?: Date;
}
