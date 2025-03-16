import { PushNotifications } from '@capacitor/push-notifications';
import { setToken } from '../redux/slices/deviceSlice';
import api from './api';
import store from '../redux/store';

export const initPushNotifications = async (): Promise<string> => {
  // Check if running in browser
  if (typeof PushNotifications === 'undefined') {
    const message = 'Push notifications not available in browser';
    store.dispatch(setToken(message));
    return message;
  }

  return new Promise(async (resolve, reject) => {
    try {
      console.log('Checking push notification permissions...');
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        console.log('Requesting push notification permissions...');
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('Push notification permissions not granted:', permStatus.receive);
        reject('Push notification permissions not granted');
        return;
      }

      console.log('Registering push notifications...');
      await PushNotifications.register();

      // Add listeners for various push notification events
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);
        try {
          await api.post('/api/device-token/', { token: token.value });
          store.dispatch(setToken(token.value));
          resolve(token.value);
        } catch (error) {
          const message = 'Failed to register token with backend';
          store.dispatch(setToken(message));
          reject(message);
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
        store.dispatch(setToken(`Registration error: ${JSON.stringify(error)}`));
      });

      // Handle notifications when app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      // Handle notification when app is in background or closed
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        // Handle navigation or other actions based on notification
        /* if (notification.notification.data) {
          const data = notification.notification.data;
        } */
      });

    } catch (error) {
      const message = `Push notification initialization failed: ${error instanceof Error ? error.message : String(error)}`;
      store.dispatch(setToken(message));
      reject(message);
    }
  });
};
