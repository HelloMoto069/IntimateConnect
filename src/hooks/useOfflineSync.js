import {useState, useEffect, useCallback, useRef} from 'react';
import firestore from '@react-native-firebase/firestore';
import OfflineSyncService from '@services/OfflineSyncService';
import logger from '@utils/logger';

const SYNC_INTERVAL_MS = 30000; // 30 seconds

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(
    () => OfflineSyncService.getPendingCount(),
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const intervalRef = useRef(null);

  // ─── Detect connectivity via Firestore ping ───────────
  const checkConnectivity = useCallback(async () => {
    try {
      // Attempt a lightweight Firestore read to check connectivity
      await firestore().collection('appConfig').doc('ping').get({source: 'server'});
      setIsOnline(true);
      return true;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  // ─── Process pending sync ops ─────────────────────────
  const syncNow = useCallback(async () => {
    const count = OfflineSyncService.getPendingCount();
    if (count === 0) {
      setPendingSync(0);
      return;
    }

    setIsSyncing(true);
    const result = await OfflineSyncService.processPendingOps();
    setPendingSync(OfflineSyncService.getPendingCount());
    setIsSyncing(false);

    if (result.processed > 0) {
      setIsOnline(true);
    }
  }, []);

  // ─── Queue an operation ───────────────────────────────
  const addPendingOp = useCallback(op => {
    const count = OfflineSyncService.addPendingOp(op);
    setPendingSync(count);
  }, []);

  // ─── Auto-sync interval ───────────────────────────────
  useEffect(() => {
    // Initial connectivity check
    checkConnectivity();

    // Periodic sync attempt
    intervalRef.current = setInterval(async () => {
      const online = await checkConnectivity();
      if (online) {
        const count = OfflineSyncService.getPendingCount();
        if (count > 0) {
          await syncNow();
        }
      }
      setPendingSync(OfflineSyncService.getPendingCount());
    }, SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkConnectivity, syncNow]);

  return {
    isOnline,
    isSyncing,
    pendingSync,
    syncNow,
    addPendingOp,
  };
};
