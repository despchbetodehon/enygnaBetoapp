import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Store para rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS = 100;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW = 300000; // 5 minutos

export function middleware(request: NextRequest) {
  // Garantir Content-Type para rotas de API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const response = NextResponse.next();
      response.headers.set('Content-Type', 'application/json');
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    } catch (error) {
      console.error('❌ Erro no middleware:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Obter IP de forma segura
  // Vercel sempre usa proxy, então confiar no x-forwarded-for em produção
  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const forwarded = request.headers.get('x-forwarded-for');

  let ip: string;
  if (isVercel && forwarded) {
    // Vercel passa o IP real no primeiro item do x-forwarded-for
    ip = forwarded.split(',')[0].trim();
  } else {
    ip = request.ip || '127.0.0.1';
  }

  const now = Date.now();

  // Rate limiting geral
  if (!rateLimitStore.has(ip) || now > rateLimitStore.get(ip)!.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const current = rateLimitStore.get(ip)!;
    if (current.count >= MAX_REQUESTS) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    current.count++;
  }

  // Proteção extra contra brute force em login
  if (request.nextUrl.pathname.includes('/api/auth/login')) {
    if (!loginAttempts.has(ip) || now > loginAttempts.get(ip)!.resetTime) {
      loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_WINDOW });
    } else {
      const current = loginAttempts.get(ip)!;
      if (current.count >= MAX_LOGIN_ATTEMPTS) {
        return new NextResponse('Too Many Login Attempts', { status: 429 });
      }
      current.count++;
    }
  }

  // Adicionar header CSRF token para requisições GET
  const response = NextResponse.next();

  if (request.method === 'GET') {
    const csrfToken = generateCSRFToken();
    response.cookies.set('_csrf', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Validar CSRF token em requisições POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfToken = request.cookies.get('_csrf')?.value;
    const headerToken = request.headers.get('x-csrf-token');

    // Excluir rotas públicas e de autenticação da validação CSRF
    const publicRoutes = [
      '/api/hello',
      '/api/health',
      '/api/log-visit',
      '/api/auth/verify-password',
      '/api/auth/update-claims',
      '/api/auth/set-custom-claims',
      '/api/migrar-contas',
      '/api/export/'
    ];
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.includes(route));

    // Só validar CSRF se não for rota pública
    if (!isPublicRoute && csrfToken !== headerToken) {
      console.warn('🚨 CSRF Token inválido:', {
        path: request.nextUrl.pathname,
        hasCookie: !!csrfToken,
        hasHeader: !!headerToken,
        ip
      });
      return new NextResponse('Invalid CSRF Token', { status: 403 });
    }
  }

  // Block suspeitos
  if (request.nextUrl.pathname.includes('..') ||
      request.nextUrl.pathname.includes('<script') ||
      request.nextUrl.pathname.includes('etc/passwd')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Security headers conforme LGPD e boas práticas
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebasestorage.googleapis.com https://firestore.googleapis.com https://*.googleapis.com;"
  );

  // HSTS - Force HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Limpar dados antigos periodicamente
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([ip, data]) => {
    if (now > data.resetTime + RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(ip);
    }
  });
  Array.from(loginAttempts.entries()).forEach(([ip, data]) => {
    if (now > data.resetTime + LOGIN_WINDOW) {
      loginAttempts.delete(ip);
    }
  });
}, 300000); // Limpar a cada 5 minutos

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};