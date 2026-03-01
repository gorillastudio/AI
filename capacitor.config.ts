import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gorillaz.answerkey',
  appName: 'Answer Key App',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    hostname: 'localhost'
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com']
    }
  }
};

export default config;
