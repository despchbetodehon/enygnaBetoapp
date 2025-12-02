rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // ===================================
    // FUNÇÕES AUXILIARES DE SEGURANÇA
    // ===================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function userExists() {
      return isAuthenticated() &&
             firestore.exists(/databases/(default)/documents/usuarios/$(request.auth.token.email));
    }

    function isActiveUser() {
      return userExists() &&
             firestore.get(/databases/(default)/documents/usuarios/$(request.auth.token.email)).data.ativo == true &&
             firestore.get(/databases/(default)/documents/usuarios/$(request.auth.token.email)).data.consentimentoLGPD == true;
    }

    function isAdmin() {
      return isAuthenticated() &&
             userExists() &&
             (firestore.get(/databases/(default)/documents/usuarios/$(request.auth.token.email)).data.permissao == 'Administrador' ||
              firestore.get(/databases/(default)/documents/usuarios/$(request.auth.token.email)).data.permissao == 'administrador');
    }

    function isColaborador() {
      return isAuthenticated() &&
             userExists() &&
             (firestore.get(/databases/(default)/documents/usuarios/$(request.auth.token.email)).data.permissao == 'Colaborador' ||
              firestore.get(/databases/(default)/documents/usuarios/$(request.auth.token.email)).data.permissao == 'colaborador' ||
              isAdmin());
    }

    function isValidFileSize() {
      return request.resource.size < 10 * 1024 * 1024; // 10MB
    }

    function isValidFileType() {
      return request.resource.contentType.matches('image/.*') ||
             request.resource.contentType == 'application/pdf';
    }

    // ===================================
    // REGRAS DE ACESSO AOS ARQUIVOS
    // ===================================

    // PDFs - Acesso público para criar e ler
    match /pdfs/{allPaths=**} {
      allow read: if true;
      allow create: if true && isValidFileSize() && isValidFileType();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // Uploads - Acesso público para criar e ler
    match /uploads/{allPaths=**} {
      allow read: if true;
      allow get: if true;
      allow list: if true;
      allow create: if true && isValidFileSize() && isValidFileType();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // Regras específicas para uploads de requerimentos - ACESSO PÚBLICO
    match /requerimentos/{document=**} {
      allow read: if true;
      allow create: if true && isValidFileSize() && isValidFileType();
      allow update, delete: if isAuthenticated() || isAdmin();
    }

    // Regras para transferências - ACESSO PÚBLICO
    match /transferencias/{document=**} {
      allow read: if true;
      allow create: if true && isValidFileSize() && isValidFileType();
      allow update, delete: if isAuthenticated() || isAdmin();
    }

    // Regras para procurações - ACESSO PÚBLICO
    match /procuracoes/{document=**} {
      allow read: if true;
      allow create: if true && isValidFileSize() && isValidFileType();
      allow update, delete: if isAuthenticated() || isAdmin();
    }

    // Regras para documentos digitais - ACESSO PÚBLICO TOTAL
    match /digital/{document=**} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if true;
    }

    // Regras para anuências - ACESSO PÚBLICO
    match /anuencias/{document=**} {
      allow read: if true;
      allow create: if true && isValidFileSize() && isValidFileType();
      allow update, delete: if isAuthenticated() || isAdmin();
    }

    // Regras para recursos - ACESSO PÚBLICO
    match /recursos/{document=**} {
      allow read: if true;
      allow create: if true && isValidFileSize() && isValidFileType();
      allow update, delete: if isAuthenticated() || isAdmin();
    }

    // Imagens de perfil e outros arquivos protegidos
    match /profile_images/{userId}/{allPaths=**} {
      allow read: if true;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update, delete: if isAuthenticated() && request.auth.uid == userId;
    }

    // ===================================
    // REGRAS PARA CHAT PRIVADO
    // ===================================

    // Fotos do chat privado (apenas administradores)
    match /chat_photos/{userId}/{fileName} {
      allow read: if isActiveUser();
      allow write: if isAdmin() && request.auth.token.email == userId;
    }

    // Arquivos do chat privado (apenas administradores)
    match /chat_files/{userId}/{fileName} {
      allow read: if isActiveUser();
      allow write: if isAdmin() && request.auth.token.email == userId;
    }

    // Áudios do chat privado (apenas administradores)
    match /chat_audio/{userId}/{fileName} {
      allow read: if isActiveUser();
      allow write: if isAdmin() && request.auth.token.email == userId;
    }

    // ===================================
    // REGRAS PARA CHAT PÚBLICO (Chamados TI)
    // ===================================

    // Fotos do chat público
    match /chat_publico_photos/{userId}/{fileName} {
      allow read: if isAuthenticated() || isAdmin();
      allow write: if isAuthenticated() || isAdmin();
    }

    // Arquivos do chat público
    match /chat_publico_files/{userId}/{fileName} {
      allow read: if isAuthenticated() || isAdmin();
      allow write: if isAuthenticated() || isAdmin();
    }

    // Áudios do chat público
    match /chat_publico_audio/{userId}/{fileName} {
      allow read: if isAuthenticated() || isAdmin();
      allow write: if isAuthenticated() || isAdmin();
    }

    // Documentos privados (apenas para usuários autenticados)
    match /private/{userId}/{allPaths=**} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }

    // Regra padrão: bloquear tudo que não foi explicitamente permitido
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}