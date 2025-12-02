// ✅ Este é o conteúdo do arquivo src/pages/trap/honeypot.tsx
import { useEffect } from 'react';

export default function Honeypot() {
  useEffect(() => {
    fetch('/api/log-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: 'honeypot' }),
    });
  }, []);
  
  return <h1>Acesso negado. Este incidente será registrado.</h1>;
}
