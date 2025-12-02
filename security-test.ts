/**
 * TESTE DE SEGURANÇA - ANÁLISE ESTÁTICA
 * Este script analisa o código em busca de vulnerabilidades
 *
 * Para executar: npx tsx security-test.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

class SecurityTester {
  private issues: SecurityIssue[] = [];
  private scannedFiles = 0;

  async run() {
    console.log('🔒 Iniciando teste de segurança...\n');

    await this.testEnvironmentVariables();
    await this.testFirebaseRules();
    await this.testAuthentication();
    await this.testInputValidation();
    await this.testCryptography();
    await this.testAPIEndpoints();
    await this.testDependencies();
    await this.testFilePermissions();
    await this.testSQLInjection();
    await this.testXSS();
    await this.testCSRF();
    await this.testRateLimiting();

    this.generateReport();
  }

  // 1. Testar variáveis de ambiente expostas
  async testEnvironmentVariables() {
    console.log('🔍 Testando variáveis de ambiente...');

    const files = this.getAllFiles('src', ['.ts', '.tsx', '.js']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Procurar chaves hardcoded
      const patterns = [
        /['"]?api[_-]?key['"]?\s*[:=]\s*['"]\w{20,}['"]/gi,
        /['"]?secret['"]?\s*[:=]\s*['"]\w{20,}['"]/gi,
        /['"]?password['"]?\s*[:=]\s*['"]\w+['"]/gi,
        /AIza[0-9A-Za-z-_]{35}/g, // Firebase API Key
      ];

      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          this.addIssue({
            severity: 'critical',
            type: 'Exposed Credentials',
            file,
            description: `Possível credencial exposta no código: ${matches[0].substring(0, 50)}...`,
            recommendation: 'Mova credenciais para variáveis de ambiente (.env.local)'
          });
        }
      });
    }
  }

  // 2. Testar regras do Firebase
  async testFirebaseRules() {
    console.log('🔍 Testando regras do Firebase...');

    const firestoreRules = 'regrasfirebase.md';
    const storageRules = 'regrasstorege.md';

    if (fs.existsSync(firestoreRules)) {
      const content = fs.readFileSync(firestoreRules, 'utf8');

      if (content.includes('allow read: if true')) {
        this.addIssue({
          severity: 'high',
          type: 'Permissive Firebase Rules',
          file: firestoreRules,
          description: 'Regras permitem leitura pública sem autenticação',
          recommendation: 'Adicionar verificação de autenticação: allow read: if isAuthenticated()'
        });
      }

      if (!content.includes('isAuthenticated()')) {
        this.addIssue({
          severity: 'medium',
          type: 'Missing Auth Check',
          file: firestoreRules,
          description: 'Falta validação de autenticação em algumas regras',
          recommendation: 'Implementar função isAuthenticated() em todas as regras'
        });
      }
    }
  }

  // 3. Testar autenticação
  async testAuthentication() {
    console.log('🔍 Testando implementação de autenticação...');

    const authFile = 'src/logic/firebase/auth/Autenticacao.ts';
    if (fs.existsSync(authFile)) {
      const content = fs.readFileSync(authFile, 'utf8');

      // Verificar se senhas são hasheadas
      if (content.includes('senha') && !content.includes('hash')) {
        this.addIssue({
          severity: 'critical',
          type: 'Plain Text Password',
          file: authFile,
          description: 'Senhas podem estar sendo armazenadas em texto plano',
          recommendation: 'Usar bcrypt ou SHA-256 para hash de senhas'
        });
      }

      // Verificar rate limiting no login
      if (!content.includes('delay') && !content.includes('setTimeout')) {
        this.addIssue({
          severity: 'high',
          type: 'Brute Force Vulnerability',
          file: authFile,
          description: 'Sem proteção contra ataques de força bruta',
          recommendation: 'Implementar delay após tentativas falhadas'
        });
      }
    }
  }

  // 4. Testar validação de input
  async testInputValidation() {
    console.log('🔍 Testando validação de entrada...');

    const files = this.getAllFiles('src/pages/api', ['.ts']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Verificar sanitização de input
      if (content.includes('req.body') && !content.includes('sanitize')) {
        this.addIssue({
          severity: 'high',
          type: 'Missing Input Validation',
          file,
          description: 'Entrada de usuário não validada/sanitizada',
          recommendation: 'Usar biblioteca de sanitização como validator.js'
        });
      }

      // Verificar SQL injection (mesmo usando NoSQL)
      if (content.includes('query') && content.includes('${')) {
        this.addIssue({
          severity: 'critical',
          type: 'Injection Vulnerability',
          file,
          description: 'Possível vulnerabilidade de injeção com template strings',
          recommendation: 'Usar queries parametrizadas'
        });
      }
    }
  }

  // 5. Testar criptografia
  async testCryptography() {
    console.log('🔍 Testando implementação de criptografia...');

    const cryptoFile = 'src/utils/crypto.ts';
    if (fs.existsSync(cryptoFile)) {
      const content = fs.readFileSync(cryptoFile, 'utf8');

      if (content.includes('default-key')) {
        this.addIssue({
          severity: 'critical',
          type: 'Weak Encryption Key',
          file: cryptoFile,
          description: 'Chave de criptografia padrão detectada',
          recommendation: 'Gerar chave aleatória forte e armazenar em variável de ambiente'
        });
      }

      if (!content.includes('AES-GCM') && !content.includes('AES-256')) {
        this.addIssue({
          severity: 'medium',
          type: 'Weak Encryption',
          file: cryptoFile,
          description: 'Algoritmo de criptografia pode ser fraco',
          recommendation: 'Usar AES-256-GCM para criptografia'
        });
      }
    }
  }

  // 6. Testar endpoints de API
  async testAPIEndpoints() {
    console.log('🔍 Testando endpoints de API...');

    const apiFiles = this.getAllFiles('src/pages/api', ['.ts']);

    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf8');

      // Verificar CORS
      if (!content.includes('Access-Control') && !file.includes('health')) {
        this.addIssue({
          severity: 'low',
          type: 'Missing CORS Headers',
          file,
          description: 'Headers CORS não configurados',
          recommendation: 'Adicionar headers CORS apropriados'
        });
      }

      // Verificar tratamento de erros
      if (!content.includes('try') && !content.includes('catch')) {
        this.addIssue({
          severity: 'medium',
          type: 'Poor Error Handling',
          file,
          description: 'Sem tratamento de erros adequado',
          recommendation: 'Implementar try-catch e não expor detalhes internos'
        });
      }
    }
  }

  // 7. Testar dependências
  async testDependencies() {
    console.log('🔍 Testando dependências...');

    const packageJson = 'package.json';
    if (fs.existsSync(packageJson)) {
      const content = JSON.parse(fs.readFileSync(packageJson, 'utf8'));

      // Verificar versões desatualizadas
      const deps = { ...content.dependencies, ...content.devDependencies };

      Object.entries(deps).forEach(([pkg, version]) => {
        if (typeof version === 'string' && version.startsWith('^')) {
          this.addIssue({
            severity: 'low',
            type: 'Dependency Version',
            file: packageJson,
            description: `Dependência ${pkg} com versão flexível pode introduzir vulnerabilidades`,
            recommendation: 'Considere fixar versões críticas'
          });
        }
      });
    }
  }

  // 8. Testar permissões de arquivo
  async testFilePermissions() {
    console.log('🔍 Testando permissões de arquivo...');

    const sensitiveFiles = ['.env.local', '.env', 'firebase-adminsdk.json'];

    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const mode = (stats.mode & parseInt('777', 8)).toString(8);

        if (mode !== '600' && mode !== '400') {
          this.addIssue({
            severity: 'high',
            type: 'Insecure File Permissions',
            file,
            description: `Arquivo sensível com permissões ${mode}`,
            recommendation: 'Definir permissões para 600 (apenas proprietário)'
          });
        }
      }
    });
  }

  // 9. Testar injeção SQL/NoSQL
  async testSQLInjection() {
    console.log('🔍 Testando vulnerabilidades de injeção...');

    const files = this.getAllFiles('src', ['.ts', '.tsx']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Procurar concatenação direta em queries
      if (content.match(/where\([^)]*\+[^)]*\)/gi)) {
        this.addIssue({
          severity: 'critical',
          type: 'Injection Vulnerability',
          file,
          description: 'Concatenação de strings em query detectada',
          recommendation: 'Usar queries parametrizadas'
        });
      }
    }
  }

  // 10. Testar XSS
  async testXSS() {
    console.log('🔍 Testando vulnerabilidades XSS...');

    const files = this.getAllFiles('src', ['.tsx']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');

      // Procurar dangerouslySetInnerHTML
      if (content.includes('dangerouslySetInnerHTML')) {
        this.addIssue({
          severity: 'high',
          type: 'XSS Vulnerability',
          file,
          description: 'Uso de dangerouslySetInnerHTML detectado',
          recommendation: 'Sanitizar HTML antes de renderizar ou usar alternativa segura'
        });
      }

      // Verificar uso de eval
      if (content.includes('eval(')) {
        this.addIssue({
          severity: 'critical',
          type: 'Code Injection',
          file,
          description: 'Uso de eval() detectado',
          recommendation: 'Remover eval() - nunca execute código não confiável'
        });
      }
    }
  }

  // 11. Testar CSRF
  async testCSRF() {
    console.log('🔍 Testando proteção CSRF...');

    const csrfFile = 'src/utils/csrf.ts';
    if (!fs.existsSync(csrfFile)) {
      this.addIssue({
        severity: 'high',
        type: 'Missing CSRF Protection',
        file: 'src/pages/api',
        description: 'Sem implementação de proteção CSRF',
        recommendation: 'Implementar tokens CSRF para formulários'
      });
    }
  }

  // 12. Testar rate limiting
  async testRateLimiting() {
    console.log('🔍 Testando rate limiting...');

    const middlewareFile = 'src/middleware.ts';
    if (fs.existsSync(middlewareFile)) {
      const content = fs.readFileSync(middlewareFile, 'utf8');

      if (!content.includes('rate') && !content.includes('limit')) {
        this.addIssue({
          severity: 'high',
          type: 'Missing Rate Limiting',
          file: middlewareFile,
          description: 'Sem proteção contra ataques DDoS',
          recommendation: 'Implementar rate limiting no middleware'
        });
      }
    }
  }

  // Helpers
  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    const scan = (directory: string) => {
      if (!fs.existsSync(directory)) return;

      const items = fs.readdirSync(directory);

      items.forEach(item => {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
          this.scannedFiles++;
        }
      });
    };

    scan(dir);
    return files;
  }

  private addIssue(issue: SecurityIssue) {
    this.issues.push(issue);
  }

  private generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE SEGURANÇA');
    console.log('='.repeat(80));

    console.log(`\n📁 Arquivos escaneados: ${this.scannedFiles}`);
    console.log(`🔍 Problemas encontrados: ${this.issues.length}\n`);

    const bySeverity = {
      critical: this.issues.filter(i => i.severity === 'critical'),
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low')
    };

    const emoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };

    Object.entries(bySeverity).forEach(([severity, issues]) => {
      if (issues.length > 0) {
        console.log(`\n${emoji[severity as keyof typeof emoji]} ${severity.toUpperCase()} (${issues.length})\n`);

        issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. [${issue.type}] ${issue.file}`);
          console.log(`     ${issue.description}`);
          console.log(`     ✓ ${issue.recommendation}\n`);
        });
      }
    });

    // Score de segurança
    const totalPoints = this.issues.length * 10;
    const criticalPoints = bySeverity.critical.length * 40;
    const highPoints = bySeverity.high.length * 20;
    const mediumPoints = bySeverity.medium.length * 10;
    const lowPoints = bySeverity.low.length * 5;

    const securityScore = Math.max(0, 100 - (criticalPoints + highPoints + mediumPoints + lowPoints));

    console.log('\n' + '='.repeat(80));
    console.log(`🎯 PONTUAÇÃO DE SEGURANÇA: ${securityScore}/100`);
    console.log('='.repeat(80));

    if (securityScore >= 90) {
      console.log('\n✅ Excelente! Seu app está bem protegido.\n');
    } else if (securityScore >= 70) {
      console.log('\n⚠️  Bom, mas precisa de melhorias.\n');
    } else if (securityScore >= 50) {
      console.log('\n⚠️  Atenção! Várias vulnerabilidades detectadas.\n');
    } else {
      console.log('\n🚨 CRÍTICO! Corrija as vulnerabilidades imediatamente!\n');
    }

    // Salvar relatório JSON
    const report = {
      timestamp: new Date().toISOString(),
      scannedFiles: this.scannedFiles,
      totalIssues: this.issues.length,
      score: securityScore,
      issues: this.issues
    };

    fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));
    console.log('💾 Relatório completo salvo em: security-report.json\n');
  }
}

// Executar teste
const tester = new SecurityTester();
tester.run().catch(console.error);