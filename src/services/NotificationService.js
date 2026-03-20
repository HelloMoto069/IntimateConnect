import {requestPermission, getToken, onMessage, saveFCMToken} from '@api/firebase/messaging';

class NotificationService {
  static async initialize(userId) {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const token = await getToken();
      if (token && userId) {
        await saveFCMToken(userId, token);
      }

      this.setupListeners();
    } catch (error) {
      console.error('Notification init error:', error);
    }
  }

  static setupListeners() {
    onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage);
    });
  }
}

export default NotificationService;
