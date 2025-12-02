
interface SecurityEvent {
  type: 'login_fail' | 'rate_limit' | 'suspicious_activity' | 'csrf_fail';
  ip: string;
  timestamp: number;
  details?: any;
}

const events: SecurityEvent[] = [];
const MAX_EVENTS = 1000;

export function logSecurityEvent(event: SecurityEvent): void {
  events.push(event);
  
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
  
  // Detectar padrões suspeitos
  detectPatterns(event);
}

function detectPatterns(event: SecurityEvent): void {
  const recentEvents = events.filter(e => 
    e.ip === event.ip && 
    e.timestamp > Date.now() - 300000 // 5 minutos
  );
  
  // Múltiplas falhas de login
  if (event.type === 'login_fail' && recentEvents.length > 5) {
    blockIP(event.ip);
  }
  
  // Rate limiting excessivo
  if (event.type === 'rate_limit' && recentEvents.length > 10) {
    blockIP(event.ip);
  }
}

function blockIP(ip: string): void {
  // Registrar no Firestore via API route
  if (typeof window !== 'undefined') {
    fetch('/api/security/block-ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, timestamp: Date.now() })
    }).catch(() => {});
  }
}

export function getSecurityEvents(): SecurityEvent[] {
  return [...events];
}
