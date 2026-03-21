import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {STORAGE_KEYS, BADGE_DEFINITIONS} from '@utils/constants';
import {fastStore, encryptData, decryptData} from '@utils/encryptionUtils';
import {setDocument, addDocument} from '@api/firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {generateId} from '@utils/helpers';
import logger from '@utils/logger';

// ─── MMKV helpers ───────────────────────────────────────
function loadCached(key, fallback) {
  try {
    const raw = fastStore.get(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveCached(key, data) {
  try {
    fastStore.set(key, JSON.stringify(data));
  } catch {}
}

// ─── Streak calculator ──────────────────────────────────
function calculateStreak(entries, dateField) {
  const dates = [
    ...new Set(entries.map(e => (e[dateField] || '').split('T')[0])),
  ]
    .filter(Boolean)
    .sort()
    .reverse();

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = today;

  for (const date of dates) {
    if (date === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (date < checkDate) {
      break;
    }
  }
  return streak;
}

// ─── Firestore helpers ──────────────────────────────────
const userRef = uid => firestore().collection('users').doc(uid);
const userPath = uid => `users/${uid}`;

export const useTracker = (moodHistoryLength = 0, completedGuidesCount = 0) => {
  const currentUser = auth().currentUser;
  const uid = currentUser?.uid;

  // ─── State ──────────────────────────────────────────
  const [journalEntries, setJournalEntries] = useState(() =>
    loadCached(STORAGE_KEYS.TRACKER_JOURNAL, []),
  );
  const [kegelSessions, setKegelSessions] = useState(() =>
    loadCached(STORAGE_KEYS.TRACKER_KEGELS, []),
  );
  const [goals, setGoals] = useState(() =>
    loadCached(STORAGE_KEYS.TRACKER_GOALS, []),
  );
  const [earnedBadges, setEarnedBadges] = useState(() =>
    loadCached(STORAGE_KEYS.TRACKER_BADGES, []),
  );
  const [isLoading, setIsLoading] = useState(true);

  const journalUnsubRef = useRef(null);
  const kegelUnsubRef = useRef(null);
  const goalsUnsubRef = useRef(null);
  const badgesUnsubRef = useRef(null);

  // ─── Decrypt journal entries on load ──────────────────
  const decryptJournalEntries = useCallback(
    entries => {
      if (!uid) return entries;
      return entries.map(entry => {
        if (entry.encryptedContent && !entry._decrypted) {
          try {
            return {
              ...entry,
              content: decryptData(entry.encryptedContent, uid),
              _decrypted: true,
            };
          } catch {
            return {...entry, content: '[Unable to decrypt]', _decrypted: true};
          }
        }
        return entry;
      });
    },
    [uid],
  );

  // ─── Firestore subscriptions ──────────────────────────
  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    const uDoc = userRef(uid);

    // Journal
    journalUnsubRef.current = uDoc
      .collection('journal')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(
        snap => {
          const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
          const decrypted = decryptJournalEntries(items);
          setJournalEntries(decrypted);
          saveCached(STORAGE_KEYS.TRACKER_JOURNAL, items); // save encrypted
          setIsLoading(false);
        },
        () => setIsLoading(false),
      );

    // Kegels
    kegelUnsubRef.current = uDoc
      .collection('kegels')
      .orderBy('completedAt', 'desc')
      .limit(200)
      .onSnapshot(snap => {
        const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setKegelSessions(items);
        saveCached(STORAGE_KEYS.TRACKER_KEGELS, items);
      });

    // Goals
    goalsUnsubRef.current = uDoc
      .collection('goals')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setGoals(items);
        saveCached(STORAGE_KEYS.TRACKER_GOALS, items);
      });

    // Badges
    badgesUnsubRef.current = uDoc
      .collection('badges')
      .onSnapshot(snap => {
        const items = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setEarnedBadges(items);
        saveCached(STORAGE_KEYS.TRACKER_BADGES, items);
      });

    return () => {
      journalUnsubRef.current?.();
      kegelUnsubRef.current?.();
      goalsUnsubRef.current?.();
      badgesUnsubRef.current?.();
    };
  }, [uid, decryptJournalEntries]);

  // ─── Derived state ────────────────────────────────────
  const journalCount = journalEntries.length;

  const recentJournalEntries = useMemo(
    () => journalEntries.slice(0, 5),
    [journalEntries],
  );

  const kegelStats = useMemo(() => {
    const totalSessions = kegelSessions.length;
    const totalMinutes = Math.round(
      kegelSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60,
    );
    const currentStreak = calculateStreak(kegelSessions, 'completedAt');

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekSessions = kegelSessions.filter(
      s => new Date(s.completedAt) >= weekStart,
    ).length;

    return {totalSessions, totalMinutes, currentStreak, thisWeekSessions};
  }, [kegelSessions]);

  const goalStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.isCompleted).length;
    const inProgress = total - completed;
    return {total, completed, inProgress};
  }, [goals]);

  const badgeCount = earnedBadges.length;

  // ─── Badge computation ────────────────────────────────
  const checkAndAwardBadges = useCallback(async () => {
    if (!uid) return;

    const earnedIds = new Set(earnedBadges.map(b => b.badgeId));
    const journalStreak = calculateStreak(journalEntries, 'createdAt');
    const kegelStreak = calculateStreak(kegelSessions, 'completedAt');
    const completedGoals = goals.filter(g => g.isCompleted).length;

    const criteria = {
      first_journal: journalEntries.length >= 1,
      journal_10: journalEntries.length >= 10,
      journal_streak_7: journalStreak >= 7,
      first_kegel: kegelSessions.length >= 1,
      kegel_10: kegelSessions.length >= 10,
      kegel_streak_7: kegelStreak >= 7,
      first_goal: goals.length >= 1,
      goal_crusher: completedGoals >= 5,
      mood_master: moodHistoryLength >= 30,
      guide_graduate: completedGuidesCount >= 5,
    };

    // well_rounded: badges from 3+ categories
    const earnedCats = new Set();
    earnedBadges.forEach(b => {
      const def = BADGE_DEFINITIONS.find(d => d.id === b.badgeId);
      if (def) earnedCats.add(def.category);
    });

    const newBadges = [];

    for (const [badgeId, met] of Object.entries(criteria)) {
      if (met && !earnedIds.has(badgeId)) {
        newBadges.push(badgeId);
        const def = BADGE_DEFINITIONS.find(d => d.id === badgeId);
        if (def) earnedCats.add(def.category);
      }
    }

    // Check well_rounded after new badges added
    if (earnedCats.size >= 3 && !earnedIds.has('well_rounded')) {
      newBadges.push('well_rounded');
    }

    if (newBadges.length === 0) return;

    const basePath = userPath(uid);
    const now = new Date().toISOString();

    for (const badgeId of newBadges) {
      const badgeDoc = {badgeId, earnedAt: now};
      try {
        await setDocument(`${basePath}/badges`, badgeId, badgeDoc, true);
      } catch (error) {
        logger.error('Award badge error:', error);
      }
    }

    // Optimistic update
    const newEarned = [
      ...earnedBadges,
      ...newBadges.map(id => ({badgeId: id, earnedAt: now})),
    ];
    setEarnedBadges(newEarned);
    saveCached(STORAGE_KEYS.TRACKER_BADGES, newEarned);
  }, [
    uid,
    earnedBadges,
    journalEntries,
    kegelSessions,
    goals,
    moodHistoryLength,
    completedGuidesCount,
  ]);

  // ─── Journal actions ──────────────────────────────────
  const addJournalEntry = useCallback(
    async (title, content, moodTag = null, tags = []) => {
      if (!uid) return null;

      const id = generateId();
      const now = new Date().toISOString();
      const encrypted = encryptData(content, uid);

      const entry = {
        id,
        title,
        encryptedContent: encrypted,
        moodTag,
        tags,
        createdAt: now,
        updatedAt: now,
      };

      // Optimistic
      const decrypted = {...entry, content, _decrypted: true};
      setJournalEntries(prev => [decrypted, ...prev]);

      try {
        await setDocument(`${userPath(uid)}/journal`, id, entry, true);
        await checkAndAwardBadges();
      } catch (error) {
        logger.error('Add journal entry error:', error);
        setJournalEntries(prev => prev.filter(e => e.id !== id));
      }

      return id;
    },
    [uid, checkAndAwardBadges],
  );

  const updateJournalEntry = useCallback(
    async (entryId, updates) => {
      if (!uid) return;

      const now = new Date().toISOString();
      const firestoreUpdates = {...updates, updatedAt: now};

      if (updates.content) {
        firestoreUpdates.encryptedContent = encryptData(updates.content, uid);
        delete firestoreUpdates.content;
        delete firestoreUpdates._decrypted;
      }

      // Optimistic
      setJournalEntries(prev =>
        prev.map(e =>
          e.id === entryId ? {...e, ...updates, updatedAt: now} : e,
        ),
      );

      try {
        await setDocument(
          `${userPath(uid)}/journal`,
          entryId,
          firestoreUpdates,
          true,
        );
      } catch (error) {
        logger.error('Update journal entry error:', error);
      }
    },
    [uid],
  );

  const deleteJournalEntry = useCallback(
    async entryId => {
      if (!uid) return;

      const prev = journalEntries;
      setJournalEntries(entries => entries.filter(e => e.id !== entryId));

      try {
        await firestore()
          .doc(`${userPath(uid)}/journal/${entryId}`)
          .delete();
      } catch (error) {
        logger.error('Delete journal entry error:', error);
        setJournalEntries(prev);
      }
    },
    [uid, journalEntries],
  );

  const getDecryptedEntry = useCallback(
    entryId => {
      return journalEntries.find(e => e.id === entryId) || null;
    },
    [journalEntries],
  );

  // ─── Kegel actions ────────────────────────────────────
  const addKegelSession = useCallback(
    async (durationSeconds, reps, intensity, linkedGuideId = null) => {
      if (!uid) return null;

      const id = generateId();
      const session = {
        id,
        durationSeconds,
        reps,
        intensity,
        completedAt: new Date().toISOString(),
        linkedGuideId,
      };

      setKegelSessions(prev => [session, ...prev]);

      try {
        await setDocument(`${userPath(uid)}/kegels`, id, session, true);
        await checkAndAwardBadges();
      } catch (error) {
        logger.error('Add kegel session error:', error);
        setKegelSessions(prev => prev.filter(s => s.id !== id));
      }

      return id;
    },
    [uid, checkAndAwardBadges],
  );

  // ─── Goal actions ─────────────────────────────────────
  const addGoal = useCallback(
    async (title, category, targetDate) => {
      if (!uid) return null;

      const id = generateId();
      const goal = {
        id,
        title,
        category,
        targetDate,
        progress: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      setGoals(prev => [goal, ...prev]);

      try {
        await setDocument(`${userPath(uid)}/goals`, id, goal, true);
        await checkAndAwardBadges();
      } catch (error) {
        logger.error('Add goal error:', error);
        setGoals(prev => prev.filter(g => g.id !== id));
      }

      return id;
    },
    [uid, checkAndAwardBadges],
  );

  const updateGoalProgress = useCallback(
    async (goalId, progress) => {
      if (!uid) return;

      setGoals(prev =>
        prev.map(g => (g.id === goalId ? {...g, progress} : g)),
      );

      try {
        await setDocument(
          `${userPath(uid)}/goals`,
          goalId,
          {progress},
          true,
        );
      } catch (error) {
        logger.error('Update goal progress error:', error);
      }
    },
    [uid],
  );

  const completeGoal = useCallback(
    async goalId => {
      if (!uid) return;

      const now = new Date().toISOString();
      setGoals(prev =>
        prev.map(g =>
          g.id === goalId
            ? {...g, isCompleted: true, progress: 100, completedAt: now}
            : g,
        ),
      );

      try {
        await setDocument(
          `${userPath(uid)}/goals`,
          goalId,
          {isCompleted: true, progress: 100, completedAt: now},
          true,
        );
        await checkAndAwardBadges();
      } catch (error) {
        logger.error('Complete goal error:', error);
      }
    },
    [uid, checkAndAwardBadges],
  );

  const deleteGoal = useCallback(
    async goalId => {
      if (!uid) return;

      const prev = goals;
      setGoals(g => g.filter(goal => goal.id !== goalId));

      try {
        await firestore()
          .doc(`${userPath(uid)}/goals/${goalId}`)
          .delete();
      } catch (error) {
        logger.error('Delete goal error:', error);
        setGoals(prev);
      }
    },
    [uid, goals],
  );

  // ─── Return ───────────────────────────────────────────
  return {
    // State
    journalEntries,
    kegelSessions,
    goals,
    earnedBadges,
    isLoading,

    // Derived
    journalCount,
    recentJournalEntries,
    kegelStats,
    goalStats,
    badgeCount,

    // Journal actions
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getDecryptedEntry,

    // Kegel actions
    addKegelSession,

    // Goal actions
    addGoal,
    updateGoalProgress,
    completeGoal,
    deleteGoal,

    // Badges
    checkAndAwardBadges,
  };
};
