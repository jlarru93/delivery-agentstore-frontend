// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pe.piwi.agent',
  appName: 'Piwi Agent',
  webDir: 'dist/delivery-agentStore-frontend',  // ← este es el correcto
  server: {
    androidScheme: 'https'
  }
};

export default config;