
export function generateCSRFToken(): string {
  if (typeof window === 'undefined') return '';
  
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  sessionStorage.setItem('_csrf', token);
  return token;
}

export function validateCSRFToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedToken = sessionStorage.getItem('_csrf');
  return storedToken === token && token.length === 64;
}

export function getCSRFTokenFromCookie(): string {
  if (typeof document === 'undefined') return '';
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_csrf') {
      return value;
    }
  }
  return '';
}
