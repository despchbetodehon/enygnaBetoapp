import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.enygma.betoapp',      // Mude para o seu ID único
  appName: 'Despachante Beto',      // Nome do app (pode ser qualquer um)
 webDir: '.next',                     // <-- Usa a pasta gerada por `npm run export`
  server: {
    androidScheme: 'https'          // Mantém https (opcional)
  }
};

export default config;
