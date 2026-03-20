export const useOfflineSync = () => {
  return {
    isOnline: true,
    pendingSync: 0,
    startSync: () => {},
    stopSync: () => {},
  };
};
