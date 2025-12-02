
import { UserPermissions, PermissionProfile, UserWithPermissions, ModulePermission, AreaPermissions } from '@/types/Permissions';
import Usuario from '../usuario/Usuario';

export class PermissionManager {
  private static instance: PermissionManager;
  private permissionProfiles: Map<string, PermissionProfile> = new Map();
  private userPermissions: Map<string, UserPermissions> = new Map();

  private constructor() {
    this.initializeDefaultProfiles();
  }

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  private createModulePermission(visualizar = false, criar = false, editar = false, excluir = false): ModulePermission {
    return { visualizar, criar, editar, excluir };
  }

  private createAreaPermissions(ativo = false, moduleOverrides: Partial<Record<keyof AreaPermissions['modules'], ModulePermission>> = {}): AreaPermissions {
    const defaultModule = this.createModulePermission();
    return {
      ativo,
      modules: {
        dashboard: moduleOverrides.dashboard || defaultModule,
        chat: moduleOverrides.chat || defaultModule,
        crm: moduleOverrides.crm || defaultModule,
        ia: moduleOverrides.ia || defaultModule,
        feed: moduleOverrides.feed || defaultModule,
        usuarios: moduleOverrides.usuarios || defaultModule,
        whatsapp: moduleOverrides.whatsapp || defaultModule,
        relatorios: moduleOverrides.relatorios || defaultModule,
        configuracoes: moduleOverrides.configuracoes || defaultModule,
        permissoes: moduleOverrides.permissoes || defaultModule,
        financeiro: moduleOverrides.financeiro || defaultModule,
        servicos: moduleOverrides.servicos || defaultModule,
        atendimento: moduleOverrides.atendimento || defaultModule,
        documentos: moduleOverrides.documentos || defaultModule,
      }
    };
  }

  private initializeDefaultProfiles(): void {
    // Perfil Administrador - Acesso total
    const adminPermissions: UserPermissions = {
      areaCliente: this.createAreaPermissions(true, {
        dashboard: this.createModulePermission(true, true, true, true),
        chat: this.createModulePermission(true, true, true, true),
        crm: this.createModulePermission(true, true, true, true),
        ia: this.createModulePermission(true, true, true, true),
        feed: this.createModulePermission(true, true, true, true),
        usuarios: this.createModulePermission(true, true, true, true),
        whatsapp: this.createModulePermission(true, true, true, true),
        relatorios: this.createModulePermission(true, true, true, true),
        configuracoes: this.createModulePermission(true, true, true, true),
        permissoes: this.createModulePermission(true, true, true, true),
        financeiro: this.createModulePermission(true, true, true, true),
        servicos: this.createModulePermission(true, true, true, true),
        atendimento: this.createModulePermission(true, true, true, true),
        documentos: this.createModulePermission(true, true, true, true),
      }),
      areaEmpresarial: this.createAreaPermissions(true, {
        dashboard: this.createModulePermission(true, true, true, true),
        chat: this.createModulePermission(true, true, true, true),
        crm: this.createModulePermission(true, true, true, true),
        ia: this.createModulePermission(true, true, true, true),
        feed: this.createModulePermission(true, true, true, true),
        usuarios: this.createModulePermission(true, true, true, true),
        whatsapp: this.createModulePermission(true, true, true, true),
        relatorios: this.createModulePermission(true, true, true, true),
        configuracoes: this.createModulePermission(true, true, true, true),
        permissoes: this.createModulePermission(true, true, true, true),
        financeiro: this.createModulePermission(true, true, true, true),
        servicos: this.createModulePermission(true, true, true, true),
        atendimento: this.createModulePermission(true, true, true, true),
        documentos: this.createModulePermission(true, true, true, true),
      }),
      areaColaborador: this.createAreaPermissions(true, {
        dashboard: this.createModulePermission(true, true, true, true),
        chat: this.createModulePermission(true, true, true, true),
        crm: this.createModulePermission(true, true, true, true),
        ia: this.createModulePermission(true, true, true, true),
        feed: this.createModulePermission(true, true, true, true),
        usuarios: this.createModulePermission(true, true, true, true),
        whatsapp: this.createModulePermission(true, true, true, true),
        relatorios: this.createModulePermission(true, true, true, true),
        configuracoes: this.createModulePermission(true, true, true, true),
        permissoes: this.createModulePermission(true, true, true, true),
        financeiro: this.createModulePermission(true, true, true, true),
        servicos: this.createModulePermission(true, true, true, true),
        atendimento: this.createModulePermission(true, true, true, true),
        documentos: this.createModulePermission(true, true, true, true),
      }),
      sistemaAdmin: {
        ativo: true,
        gerenciarUsuarios: true,
        gerenciarPermissoes: true,
        configuracaoSistema: true,
        logs: true,
      }
    };

    // Perfil Cliente - Apenas área cliente
    const clientePermissions: UserPermissions = {
      areaCliente: this.createAreaPermissions(true, {
        dashboard: this.createModulePermission(true, false, false, false),
        chat: this.createModulePermission(true, true, false, false),
        servicos: this.createModulePermission(true, true, false, false),
        atendimento: this.createModulePermission(true, true, false, false),
        documentos: this.createModulePermission(true, false, false, false),
        whatsapp: this.createModulePermission(true, true, false, false),
        relatorios: this.createModulePermission(true, false, false, false),
      }),
      areaEmpresarial: this.createAreaPermissions(false),
      areaColaborador: this.createAreaPermissions(false),
      sistemaAdmin: {
        ativo: false,
        gerenciarUsuarios: false,
        gerenciarPermissoes: false,
        configuracaoSistema: false,
        logs: false,
      }
    };

    // Perfil Empresa - Apenas área empresarial
    const empresaPermissions: UserPermissions = {
      areaCliente: this.createAreaPermissions(false),
      areaEmpresarial: this.createAreaPermissions(true, {
        dashboard: this.createModulePermission(true, true, true, false),
        chat: this.createModulePermission(true, true, true, false),
        crm: this.createModulePermission(true, true, true, false),
        servicos: this.createModulePermission(true, true, false, false),
        financeiro: this.createModulePermission(true, false, false, false),
        relatorios: this.createModulePermission(true, false, false, false),
        documentos: this.createModulePermission(true, true, true, false),
        whatsapp: this.createModulePermission(true, true, true, false),
        atendimento: this.createModulePermission(true, true, true, false),
      }),
      areaColaborador: this.createAreaPermissions(false),
      sistemaAdmin: {
        ativo: false,
        gerenciarUsuarios: false,
        gerenciarPermissoes: false,
        configuracaoSistema: false,
        logs: false,
      }
    };

    // Perfil Colaborador - Acesso completo à área colaborador
    const colaboradorPermissions: UserPermissions = {
      areaCliente: this.createAreaPermissions(false),
      areaEmpresarial: this.createAreaPermissions(false),
      areaColaborador: this.createAreaPermissions(true, {
        dashboard: this.createModulePermission(true, true, true, false),
        chat: this.createModulePermission(true, true, true, false),
        crm: this.createModulePermission(true, true, true, false),
        ia: this.createModulePermission(true, true, false, false),
        feed: this.createModulePermission(true, true, true, false),
        usuarios: this.createModulePermission(true, false, false, false),
        whatsapp: this.createModulePermission(true, true, true, false),
        relatorios: this.createModulePermission(true, false, false, false),
        atendimento: this.createModulePermission(true, true, true, false),
        documentos: this.createModulePermission(true, true, true, false),
      }),
      sistemaAdmin: {
        ativo: false,
        gerenciarUsuarios: false,
        gerenciarPermissoes: false,
        configuracaoSistema: false,
        logs: false,
      }
    };

    // Registrar perfis padrão
    this.permissionProfiles.set('administrador', {
      id: 'administrador',
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      icon: null,
      color: '#f44336',
      permissions: adminPermissions,
      isCustom: false,
    });

    this.permissionProfiles.set('cliente', {
      id: 'cliente',
      nome: 'Cliente',
      descricao: 'Acesso apenas à área cliente',
      icon: null,
      color: '#4caf50',
      permissions: clientePermissions,
      isCustom: false,
    });

    this.permissionProfiles.set('empresa', {
      id: 'empresa',
      nome: 'Empresa',
      descricao: 'Acesso apenas à área empresarial',
      icon: null,
      color: '#2196f3',
      permissions: empresaPermissions,
      isCustom: false,
    });

    this.permissionProfiles.set('colaborador', {
      id: 'colaborador',
      nome: 'Colaborador',
      descricao: 'Acesso à área colaborador',
      icon: null,
      color: '#ff9800',
      permissions: colaboradorPermissions,
      isCustom: false,
    });
  }

  public getUserPermissions(userId: string, profileId?: string): UserPermissions | null {
    if (this.userPermissions.has(userId)) {
      return this.userPermissions.get(userId)!;
    }

    // Mapear perfis antigos para novos
    const mappedProfileId = this.mapOldProfile(profileId);
    
    if (mappedProfileId && this.permissionProfiles.has(mappedProfileId)) {
      return this.permissionProfiles.get(mappedProfileId)!.permissions;
    }

    // Se não encontrou o perfil, usar cliente como padrão
    if (this.permissionProfiles.has('cliente')) {
      return this.permissionProfiles.get('cliente')!.permissions;
    }

    return null;
  }

  private mapOldProfile(profileId?: string): string {
    if (!profileId) return 'cliente';
    
    // Mapear perfis antigos para novos
    const profileMap: { [key: string]: string } = {
      'Administrador': 'administrador',
      'Admin': 'administrador',
      'administrador': 'administrador',
      'Cliente': 'cliente',
      'cliente': 'cliente',
      'Empresa': 'empresa',
      'empresa': 'empresa',
      'Colaborador': 'colaborador',
      'colaborador': 'colaborador',
      'Visualizador': 'cliente',
      'Editor': 'colaborador',
      'Gerente': 'empresa',
      'Area Cliente': 'cliente',
      'Area Empresarial': 'empresa',
      'Área Cliente': 'cliente',
      'Área Empresarial': 'empresa'
    };

    return profileMap[profileId] || 'cliente';
  }

  public hasAreaAccess(userId: string, area: 'cliente' | 'empresarial' | 'colaborador', profileId?: string): boolean {
    const mappedProfileId = this.mapOldProfile(profileId);
    const permissions = this.getUserPermissions(userId, mappedProfileId);
    if (!permissions) return false;

    switch (area) {
      case 'cliente':
        return permissions.areaCliente.ativo;
      case 'empresarial':
        return permissions.areaEmpresarial.ativo;
      case 'colaborador':
        return permissions.areaColaborador.ativo;
      default:
        return false;
    }
  }

  public hasModulePermission(
    userId: string, 
    area: 'cliente' | 'empresarial' | 'colaborador', 
    module: keyof AreaPermissions['modules'], 
    permission: keyof ModulePermission,
    profileId?: string
  ): boolean {
    const mappedProfileId = this.mapOldProfile(profileId);
    const permissions = this.getUserPermissions(userId, mappedProfileId);
    if (!permissions) return false;

    let areaPermissions: AreaPermissions;
    switch (area) {
      case 'cliente':
        areaPermissions = permissions.areaCliente;
        break;
      case 'empresarial':
        areaPermissions = permissions.areaEmpresarial;
        break;
      case 'colaborador':
        areaPermissions = permissions.areaColaborador;
        break;
      default:
        return false;
    }

    if (!areaPermissions.ativo) return false;

    return areaPermissions.modules[module][permission];
  }

  public getPermissionProfiles(): PermissionProfile[] {
    return Array.from(this.permissionProfiles.values());
  }

  public createCustomProfile(profile: Omit<PermissionProfile, 'id' | 'isCustom'>): string {
    const id = `custom_${Date.now()}`;
    const customProfile: PermissionProfile = {
      ...profile,
      id,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.permissionProfiles.set(id, customProfile);
    return id;
  }

  public updatePermissionProfile(profileId: string, updates: Partial<PermissionProfile>): boolean {
    const profile = this.permissionProfiles.get(profileId);
    if (!profile || !profile.isCustom) return false;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date(),
    };

    this.permissionProfiles.set(profileId, updatedProfile);
    return true;
  }

  public deletePermissionProfile(profileId: string): boolean {
    const profile = this.permissionProfiles.get(profileId);
    if (!profile || !profile.isCustom) return false;

    return this.permissionProfiles.delete(profileId);
  }
}

export default PermissionManager;
