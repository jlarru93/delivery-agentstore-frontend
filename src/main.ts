import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {Amplify} from 'aws-amplify';

if (environment.production) {
  enableProdMode();
}
Amplify.configure({
  Auth: {
    region: environment.region,
    userPoolId: environment.awsConfig.cognito.userPoolId,
    userPoolWebClientId: environment.userPoolWebClientId,
    cookieStorage: environment.awsConfig.cognito.cookieStorage
  }
});
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      });
      console.log('FCM SW registrado:', reg.scope);
    } catch (e) {
      console.error('Error registrando FCM SW', e);
    }
  });
}