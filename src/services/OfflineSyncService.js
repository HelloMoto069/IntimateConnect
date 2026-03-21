import {STORAGE_KEYS} from '@utils/constants';
import {fastStore} from '@utils/encryptionUtils';
import {setDocument, updateDocument, deleteDocument} from '@api/firebase/firestore';
import logger from '@utils/logger';

class OfflineSyncService {
  static _processing = false;

  // ─── Queue Management ─────────────────────────────────
  static getQueue() {
    try {
      const raw = fastStore.get(STORAGE_KEYS.PENDING_SYNC_OPS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveQueue(queue) {
    try {
      fastStore.set(STORAGE_KEYS.PENDING_SYNC_OPS, JSON.stringify(queue));
    } catch {}
  }

  static addPendingOp(op) {
    const queue = this.getQueue();
    queue.push({
      ...op,
      id: op.id || Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    });
    this.saveQueue(queue);
    return queue.length;
  }

  static getPendingCount() {
    return this.getQueue().length;
  }

  // ─── Process Queue ────────────────────────────────────
  static async processPendingOps() {
    if (this._processing) return {processed: 0, failed: 0};
    this._processing = true;

    const queue = this.getQueue();
    if (queue.length === 0) {
      this._processing = false;
      return {processed: 0, failed: 0};
    }

    let processed = 0;
    let failed = 0;
    const remaining = [];

    for (const op of queue) {
      try {
        switch (op.type) {
          case 'set':
            await setDocument(op.collection, op.docId, op.data, true);
            break;
          case 'update':
            await updateDocument(op.collection, op.docId, op.data);
            break;
          case 'delete':
            await deleteDocument(op.collection, op.docId);
            break;
          default:
            logger.warn('Unknown sync op type:', op.type);
        }
        processed++;
      } catch (error) {
        logger.error('Sync op failed:', op.collection, op.docId, error.message);
        failed++;
        remaining.push(op);
      }
    }

    this.saveQueue(remaining);
    this._processing = false;

    logger.info(`Sync complete: ${processed} processed, ${failed} failed, ${remaining.length} remaining`);
    return {processed, failed};
  }

  // ─── Clear Queue ──────────────────────────────────────
  static clearQueue() {
    this.saveQueue([]);
  }
}

export default OfflineSyncService;
