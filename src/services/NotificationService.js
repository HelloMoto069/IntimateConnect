import {requestPermission, getToken, onMessage, saveFCMToken} from '@api/firebase/messaging';
import {fastStore} from '@utils/encryptionUtils';
import {STORAGE_KEYS, DISGUISE_CONFIG} from '@utils/constants';
import {showToast} from '@components/common/Toast';
import logger from '@utils/logger';

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
      logger.error('Notification init error:', error);
    }
  }

  static setupListeners() {
    onMessage(async remoteMessage => {
      const isDisguised = fastStore.getBoolean(STORAGE_KEYS.DISGUISE_MODE);

      let title = remoteMessage.notification?.title || 'Notification';
      let body = remoteMessage.notification?.body || '';

      // Apply disguise mode
      if (isDisguised) {
        title = DISGUISE_CONFIG.notificationTitle;
        body = DISGUISE_CONFIG.notificationBody;
      }

      // Display as Toast in foreground
      showToast('info', title, body);
    });
  }
}

export default NotificationService;
