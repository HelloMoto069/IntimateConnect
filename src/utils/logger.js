const logger = {
  log: (...args) => __DEV__ && console.log('[IC]', ...args),
  warn: (...args) => __DEV__ && console.warn('[IC]', ...args),
  error: (...args) => __DEV__ && console.error('[IC]', ...args),
  info: (...args) => __DEV__ && console.log('[IC:info]', ...args),
};

export default logger;
