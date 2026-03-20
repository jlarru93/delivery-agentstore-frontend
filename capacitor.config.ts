// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pe.piwi.agent',
  appName: 'POS PIWI',
  webDir: 'dist/delivery-agentStore-frontend',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#398E3C'
    }
  }
};

export default config;