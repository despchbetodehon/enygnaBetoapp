
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_SESSION_KEY || 'default-key-change-me';

export async function encrypt(text: string): Promise<string> {
  if (typeof window === 'undefined') return text;
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      'AES-GCM',
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  } catch {
    return text;
  }
}

export async function decrypt(encrypted: string): Promise<string> {
  if (typeof window === 'undefined') return encrypted;
  
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      'AES-GCM',
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return decoder.decode(decrypted);
  } catch {
    return encrypted;
  }
}
