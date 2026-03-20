import {Dimensions, Platform, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const isIOS = () => Platform.OS === 'ios';
export const isAndroid = () => Platform.OS === 'android';

export const wp = percentage => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

export const hp = percentage => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

export const normalize = size => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const generateId = () => {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
};

export const generatePartnerCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const capitalizeFirst = str => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

export const getInitials = name => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = (fn, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
