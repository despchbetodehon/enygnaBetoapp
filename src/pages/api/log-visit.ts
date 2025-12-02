import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/logic/firebase/config/app'; // Firebase já configurado
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface LogData {
  ip: string;
  ua: string;
  url: string;
  headers: any;
  isMalicious: boolean;
  quantumScore: number;
  threatLevel: string;
  reason: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = req.headers;
  const userAgent = headers['user-agent'] || '';
  const ip = headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '0.0.0.0';
  const reason = JSON.parse(req.body || '{}')?.reason || 'unknown';

  // 🧠 Neuroanálise simplificada + heurísticas de ameaça
  const isMalicious = detectThreat(userAgent, headers);
  const quantumScore = generateQuantumScore(userAgent, ip, reason);
  const threatLevel = quantumScore > 80 ? 'ALTA' : quantumScore > 50 ? 'MÉDIA' : 'BAIXA';

  const log: LogData = {
    ip,
    ua: userAgent,
    url: req.url || '',
    headers,
    isMalicious,
    quantumScore,
    threatLevel,
    reason
  };

  try {
    await addDoc(collection(db, 'logs_visitas_suspeitas'), {
      ...log,
      createdAt: serverTimestamp()
    });
    res.status(200).json({ success: true, threatLevel });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
}

// 🧠 Detecta ameaças usando lógica de padrão comportamental
function detectThreat(ua: string, headers: any): boolean {
  const suspiciousUA = /curl|wget|python|scrapy|httpclient|java/i.test(ua);
  const weirdHeaders = Object.keys(headers).some((key) =>
    /(sqlmap|xss|injection|scanner)/i.test(key)
  );
  const noAcceptHeader = !headers['accept'];
  return suspiciousUA || weirdHeaders || noAcceptHeader;
}

// 🧬 Gera uma pontuação simulando análise quântica
function generateQuantumScore(ua: string, ip: string, reason: string): number {
  let score = 0;
  if (/bot|crawl|spider/i.test(ua)) score += 40;
  if (/\.ru|\.cn|tor|vpn/i.test(ip)) score += 30;
  if (reason.includes('honeypot')) score += 50;
  score += ua.length % 37;
  return Math.min(score, 100);
}
