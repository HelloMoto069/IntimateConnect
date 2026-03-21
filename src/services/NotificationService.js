import {requestPermission, getToken, onMessage, saveFCMToken} from '@api/firebase/messaging';
import {fastStore} from '@utils/encryptionUtils';
import {STORAGE_KEYS, DISGUISE_CONFIG} from '@utils/constants';

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
      // Apply disguise mode to notification content
      const isDisguised = fastStore.getBoolean(STORAGE_KEYS.DISGUISE_MODE);
      if (isDisguised && remoteMessage.notification) {
        remoteMessage.notification.title = DISGUISE_CONFIG.notificationTitle;
        remoteMessage.notification.body = DISGUISE_CONFIG.notificationBody;
      }

      // Foreground notification received — can be displayed via local notification
      console.log('Foreground notification:', remoteMessage.notification?.title);
    });
  }
}

export default NotificationService;
