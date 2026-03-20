import messaging from '@react-native-firebase/messaging';
import {updateDocument} from './firestore';
import {FIREBASE_COLLECTIONS} from '@utils/constants';

export const requestPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
};

export const getToken = async () => {
  const token = await messaging().getToken();
  return token;
};

export const onMessage = callback => {
  return messaging().onMessage(callback);
};

export const onBackgroundMessage = handler => {
  messaging().setBackgroundMessageHandler(handler);
};

export const subscribeToTopic = async topic => {
  await messaging().subscribeToTopic(topic);
};

export const unsubscribeFromTopic = async topic => {
  await messaging().unsubscribeFromTopic(topic);
};

export const saveFCMToken = async (userId, token) => {
  await updateDocument(FIREBASE_COLLECTIONS.USERS, userId, {fcmToken: token});
};
