
/**
 * TESTE DE PENETRAÇÃO - SIMULADOR DE ATAQUES
 * Este script simula ataques comuns para testar as defesas do app
 * 
 * Para executar: npx tsx penetration-test.ts
 */

interface AttackResult {
  attack: string;
  success: boolean;
  details: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

class PenetrationTester {
  private results: AttackResult[] = [];
  private baseUrl = 'http://localhost:5000';

  async runAllTests() {
    console.log('⚔️  INICIANDO TESTE DE PENETRAÇÃO\n');
    console.log('⚠️  ATENÇÃO: Este é um teste autorizado no seu próprio sistema\n');
    
    await this.testSQLInjection();
    await this.testXSSInjection();
    await this.testCSRF();
    await this.testBruteForce();
    await this.testPathTraversal();
    await this.testCommandInjection();
    await this.testRateLimitBypass();
    await this.testSessionHijacking();
    
    this.generateReport();
  }

  // 1. SQL Injection
  async testSQLInjection() {
    console.log('🔍 Testando SQL Injection...');
    
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE usuarios--",
      "admin'--",
      "1' UNION SELECT * FROM usuarios--"
    ];
    
    for (const payload of payloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/usuarios?email=${encodeURIComponent(payload)}`);
        
        if (response.ok) {
          this.addResult({
            attack: 'SQL Injection',
            success: true,
            details: `Payload "${payload}" não foi bloqueado`,
            severity: 'critical'
          });
        }
      } catch (error) {
        // Esperado - endpoint protegido
      }
    }
  }

  // 2. XSS Injection
  async testXSSInjection() {
    console.log('🔍 Testando XSS Injection...');
    
    const payloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")'
    ];
    
    for (const payload of payloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload })
        });
        
        const text = await response.text();
        
        if (text.includes('<script>') || text.includes('onerror=')) {
          this.addResult({
            attack: 'XSS Injection',
            success: true,
            details: `Payload XSS não sanitizado: ${payload}`,
            severity: 'high'
          });
        }
      } catch (error) {
        // Endpoint pode não existir
      }
    }
  }

  // 3. CSRF Attack
  async testCSRF() {
    console.log('🔍 Testando CSRF...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test' })
      });
      
      if (response.status !== 403) {
        this.addResult({
          attack: 'CSRF',
          success: true,
          details: 'Endpoint aceita requisições sem token CSRF',
          severity: 'high'
        });
      }
    } catch (error) {
      // Esperado
    }
  }

  // 4. Brute Force
  async testBruteForce() {
    console.log('🔍 Testando Brute Force...');
    
    const attempts = 20;
    let successCount = 0;
    
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@test.com',
            senha: `senha${i}`
          })
        });
        
        if (response.status !== 429) { // 429 = Too Many Requests
          successCount++;
        }
      } catch (error) {
        // Esperado
      }
      
      await this.sleep(100);
    }
    
    if (successCount > 10) {
      this.addResult({
        attack: 'Brute Force',
        success: true,
        details: `${successCount}/${attempts} tentativas não foram bloqueadas`,
        severity: 'high'
      });
    }
  }

  // 5. Path Traversal
  async testPathTraversal() {
    console.log('🔍 Testando Path Traversal...');
    
    const payloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd'
    ];
    
    for (const payload of payloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/files/${encodeURIComponent(payload)}`);
        
        if (response.ok) {
          this.addResult({
            attack: 'Path Traversal',
            success: true,
            details: `Acesso a arquivo sensível possível: ${payload}`,
            severity: 'critical'
          });
        }
      } catch (error) {
        // Esperado
      }
    }
  }

  // 6. Command Injection
  async testCommandInjection() {
    console.log('🔍 Testando Command Injection...');
    
    const payloads = [
      '; ls -la',
      '| cat /etc/passwd',
      '`whoami`',
      '$(rm -rf /)'
    ];
    
    for (const payload of payloads) {
      try {
        const response = await fetch(`${this.baseUrl}/api/exec`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd: payload })
        });
        
        if (response.ok) {
          this.addResult({
            attack: 'Command Injection',
            success: true,
            details: `Comando shell não sanitizado: ${payload}`,
            severity: 'critical'
          });
        }
      } catch (error) {
        // Esperado
      }
    }
  }

  // 7. Rate Limit Bypass
  async testRateLimitBypass() {
    console.log('🔍 Testando bypass de Rate Limit...');
    
    const headers = [
      { 'X-Forwarded-For': '192.168.1.1' },
      { 'X-Real-IP': '10.0.0.1' },
      { 'X-Client-IP': '172.16.0.1' }
    ];
    
    for (const header of headers) {
      let successCount = 0;
      
      // Remove undefined properties
      const cleanHeader: Record<string, string> = {};
      for (const [key, value] of Object.entries(header)) {
        if (value !== undefined) {
          cleanHeader[key] = value;
        }
      }
      
      for (let i = 0; i < 10; i++) {
        try {
          const response = await fetch(`${this.baseUrl}/api/test`, { 
            headers: cleanHeader
          });
          if (response.status !== 429) successCount++;
        } catch (error) {
          // Esperado
        }
      }
      
      if (successCount > 5) {
        this.addResult({
          attack: 'Rate Limit Bypass',
          success: true,
          details: `Header ${Object.keys(cleanHeader)[0]} permite bypass`,
          severity: 'medium'
        });
      }
    }
  }

  // 8. Session Hijacking
  async testSessionHijacking() {
    console.log('🔍 Testando Session Hijacking...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/session`, {
        headers: {
          'Cookie': 'session=hacked_session_token'
        }
      });
      
      if (response.ok) {
        this.addResult({
          attack: 'Session Hijacking',
          success: true,
          details: 'Sessão falsa aceita sem validação',
          severity: 'critical'
        });
      }
    } catch (error) {
      // Esperado
    }
  }

  private addResult(result: AttackResult) {
    this.results.push(result);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE TESTE DE PENETRAÇÃO');
    console.log('='.repeat(80));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.length - successful.length;
    
    console.log(`\n✅ Defesas efetivas: ${failed}`);
    console.log(`❌ Vulnerabilidades encontradas: ${successful.length}\n`);
    
    if (successful.length > 0) {
      console.log('🚨 VULNERABILIDADES CRÍTICAS:\n');
      
      successful.forEach((result, index) => {
        const emoji = result.severity === 'critical' ? '🔴' : 
                     result.severity === 'high' ? '🟠' : '🟡';
        
        console.log(`${emoji} ${index + 1}. ${result.attack}`);
        console.log(`   ${result.details}\n`);
      });
    } else {
      console.log('✅ Parabéns! Nenhuma vulnerabilidade crítica encontrada!\n');
    }
    
    console.log('='.repeat(80) + '\n');
  }
}

// Executar teste
const tester = new PenetrationTester();
tester.runAllTests().catch(console.error);
