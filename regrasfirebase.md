rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function userExists() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/usuarios/$(request.auth.token.email));
    }

    function isAdmin() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/usuarios/$(request.auth.token.email)) &&
             get(/databases/$(database)/documents/usuarios/$(request.auth.token.email)).data.permissao in ['Administrador', 'administrador'];
    }

    function isActiveUser() {
      return userExists() &&
             get(/databases/$(database)/documents/usuarios/$(request.auth.token.email)).data.ativo == true &&
             get(/databases/$(database)/documents/usuarios/$(request.auth.token.email)).data.consentimentoLGPD == true;
    }

    function isColaborador() {
      return isAuthenticated() &&
             userExists() &&
             (get(/databases/$(database)/documents/usuarios/$(request.auth.token.email)).data.permissao in ['Colaborador', 'colaborador', 'Administrador', 'administrador']);
    }

    function isCEO() {
      return isAuthenticated() &&
             userExists() &&
             (get(/databases/$(database)/documents/usuarios/$(request.auth.token.email)).data.permissao in ['CEO', 'Administrador', 'administrador']);
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.token.email == userId;
    }

    function hasValidSize() {
      return request.resource.size < 1000000;
    }

    function hasValidSensitiveData() {
      return !('senha' in request.resource.data) &&
             !('senhaPlainText' in request.resource.data) &&
             !('password' in request.resource.data);
    }

    function hasLGPDCompliance() {
      return request.resource.data.consentimentoLGPD == true &&
             request.resource.data.dataConsentimento is timestamp &&
             request.resource.data.aceitouTermos == true;
    }

    function notTooFrequent() {
      return request.time > resource.data.ultimaAtualizacao + duration.value(1, 's');
    }

    function hasAuditFields() {
      return request.resource.data.keys().hasAll(['timestamp', 'userId']);
    }

    function isSafeData() {
      return hasValidSensitiveData() && hasValidSize();
    }

    // ===================================
    // USUÁRIOS - LGPD COMPLIANT
    // ===================================

    match /usuarios/{userId} {
      allow read: if isAuthenticated();
      allow create: if true;
      allow update: if isAdmin() || (isAuthenticated() && request.auth.token.email == userId);
      allow delete: if isAdmin();
    }

    // ===================================
    // REQUERIMENTOS - ACESSO PÚBLICO PARA CRIAÇÃO E LEITURA
    // ===================================

    match /Betodespachanteintrncaodevendaoficial/{docId} {
      allow read: if true;
      allow create: if true;
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    match /Betodespachanteintrncaodevendaoficialdigital/{docId} {
      allow read: if true;
      allow create: if true;
       allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    match /Betodespachanteanuencia/{docId} {
      allow read: if isAdmin() || isActiveUser();
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAuthenticated();
    }

    match /Betodespachante/transferencia/{docId} {
      allow read: if isAdmin() || isActiveUser();
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAuthenticated();
    }

    match /Betodespachanteprocuracaoeletronica/{docId} {
      allow read: if isAdmin() || isActiveUser();
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAuthenticated();
    }

    match /Betodespachanteprocuracao/{docId} {
      allow read: if isAdmin() || isActiveUser();
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAuthenticated();
    }

    match /Betodespachantetransferencia/{docId} {
      allow read: if isAdmin() || isActiveUser();
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // ===================================
    // COLEÇÕES ADMINISTRATIVAS
    // ===================================

    match /CodigosDeAcesso/{codigoId} {
      allow read: if true;
      allow create: if isAdmin() || isAuthenticated();
      allow update: if true;
      allow delete: if isAdmin() || isAuthenticated();
    }

    match /OrdensDeServicoBludata/{docId} {
      allow read: if true;
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    match /analises_cache/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    match /bancodecontato/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    // ===================================
    // CHAMADOS TI
    // ===================================

    match /chamadosTI/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    match /chamadosti/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    match /beto/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isColaborador();
      allow delete: if isAdmin() || isAuthenticated();

      match /chamadosti/{chamadoId} {
        allow read: if isAdmin() || isAuthenticated();
        allow create: if isAdmin() || isAuthenticated();
        allow update: if isAdmin() || isAuthenticated();
        allow delete: if isAdmin() || isAuthenticated();
      }
    }

    // ===================================
    // CHAT
    // ===================================

    match /chatPublico/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    match /chats/{chatId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();

      match /mensagens/{msgId} {
        allow read: if isAdmin() || isAuthenticated();
        allow create: if isAdmin() || isAuthenticated();
        allow update: if isAdmin() || isAuthenticated();
        allow delete: if isAdmin() || isAuthenticated();
      }
    }

    // ===================================
    // EMPRESAS
    // ===================================

    match /empresasProcuracao/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    // ===================================
    // AUDITORIA E LGPD
    // ===================================

    match /acessos_auditoria/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin();
    }

    match /solicitacoes_exclusao_lgpd/{docId} {
      allow read: if isAdmin() || isOwner(resource.data.email);
      allow create: if true;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /logs/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    // ===================================
    // COLEÇÕES DE DESENVOLVIMENTO
    // ===================================

    match /code/{docId} {
      allow read: if true;
      allow create: if isAdmin() || isAuthenticated();
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin() || isAuthenticated();
    }

    match /items/{docId} {
      allow read: if true;
      allow create: if true;
      allow update: if isAdmin() || isAuthenticated();
      allow delete: if isAdmin();
    }

    match /test/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow write: if isAdmin() || isAuthenticated();
    }

    // ===================================
    // SEGURANÇA - HONEYPOT E BLACKLIST
    // ===================================

    match /honeypot/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow write: if true;
    }

    match /blacklist_ips/{ip} {
      allow read: if isAdmin() || isAuthenticated();
      allow write: if isAdmin() || isAuthenticated();
    }

    match /anomalies/{docId} {
      allow read: if isAdmin() || isAuthenticated();
      allow write: if isAdmin() || isAuthenticated();
    }
  }
}