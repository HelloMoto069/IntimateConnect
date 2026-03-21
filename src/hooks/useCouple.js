import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {STORAGE_KEYS, FIREBASE_COLLECTIONS} from '@utils/constants';
import {fastStore} from '@utils/encryptionUtils';
import {
  batchWrite,
  serverTimestamp,
  addDocument,
} from '@api/firebase/firestore';
import {
  getPartnerByCode,
  createPartnerCodeDoc,
  deletePartnerCodeDoc,
  getUserProfile,
  updateUserProfile,
} from '@api/firebase/auth';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {generateId, generatePartnerCode} from '@utils/helpers';

// ─── Load cached data from MMKV ─────────────────────────
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

export const useCouple = () => {
  // ─── State ──────────────────────────────────────────────
  const [coupleData, setCoupleData] = useState(() =>
    loadCached(STORAGE_KEYS.COUPLE_DATA, null),
  );
  const [wantToTryList, setWantToTryList] = useState(() =>
    loadCached(STORAGE_KEYS.COUPLE_WANT_TO_TRY, []),
  );
  const [activityFeed, setActivityFeed] = useState(() =>
    loadCached(STORAGE_KEYS.COUPLE_ACTIVITY, []),
  );
  const [sharedFavorites, setSharedFavorites] = useState(() =>
    loadCached(STORAGE_KEYS.COUPLE_SHARED_FAVORITES, []),
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);

  const coupleUnsubRef = useRef(null);
  const activityUnsubRef = useRef(null);
  const myFavUnsubRef = useRef(null);
  const partnerFavUnsubRef = useRef(null);
  const lastActivityDocRef = useRef(null);

  const currentUser = auth().currentUser;

  // ─── Derived state ────────────────────────────────────
  const isConnected = !!coupleData?.connectedAt;
  const coupleId = coupleData?.coupleId || null;

  const partner = useMemo(() => {
    if (!coupleData || !currentUser) return null;
    const isA = coupleData.partnerA === currentUser.uid;
    return {
      uid: isA ? coupleData.partnerB : coupleData.partnerA,
      displayName: isA ? coupleData.partnerBName : coupleData.partnerAName,
      connectedAt: coupleData.connectedAt,
    };
  }, [coupleData, currentUser]);

  const partnerCode = useMemo(() => {
    // Read from user profile — available via auth context but we read cached
    try {
      const raw = fastStore.get(STORAGE_KEYS.COUPLE_DATA + '_code');
      return raw || null;
    } catch {
      return null;
    }
  }, [coupleData]); // re-derive when couple data changes

  // ─── Tried / untried split ────────────────────────────
  const triedTogetherList = useMemo(
    () => wantToTryList.filter(item => item.tried),
    [wantToTryList],
  );

  const untried = useMemo(
    () => wantToTryList.filter(item => !item.tried),
    [wantToTryList],
  );

  // ─── Couple stats ─────────────────────────────────────
  const coupleStats = useMemo(() => {
    const stats = coupleData?.stats || {};
    const daysConnected = coupleData?.connectedAt
      ? Math.floor(
          (Date.now() - new Date(coupleData.connectedAt.toDate?.() || coupleData.connectedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0;
    return {
      gamesPlayed: stats.gamesPlayed || 0,
      positionsExplored: stats.positionsExplored || 0,
      daysConnected,
    };
  }, [coupleData]);

  // ─── Load partner code from profile ───────────────────
  useEffect(() => {
    if (!currentUser) return;
    getUserProfile(currentUser.uid).then(profile => {
      if (profile?.partnerCode) {
        try {
          fastStore.set(STORAGE_KEYS.COUPLE_DATA + '_code', profile.partnerCode);
        } catch {}
      }
    });
  }, [currentUser]);

  // ─── Subscribe to couple document ─────────────────────
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // We need the user's coupleId from their profile
    const userUnsub = firestore()
      .collection(FIREBASE_COLLECTIONS.USERS)
      .doc(currentUser.uid)
      .onSnapshot(
        userDoc => {
          const profile = userDoc.exists ? userDoc.data() : null;
          const userCoupleId = profile?.coupleId;

          // Clean up previous couple subscription
          if (coupleUnsubRef.current) {
            coupleUnsubRef.current();
            coupleUnsubRef.current = null;
          }

          if (!userCoupleId) {
            setCoupleData(null);
            setWantToTryList([]);
            saveCached(STORAGE_KEYS.COUPLE_DATA, null);
            saveCached(STORAGE_KEYS.COUPLE_WANT_TO_TRY, []);
            setIsLoading(false);
            return;
          }

          // Subscribe to couple doc
          coupleUnsubRef.current = firestore()
            .collection(FIREBASE_COLLECTIONS.COUPLES)
            .doc(userCoupleId)
            .onSnapshot(
              coupleDoc => {
                if (coupleDoc.exists) {
                  const data = {...coupleDoc.data(), coupleId: userCoupleId};
                  setCoupleData(data);
                  setWantToTryList(data.wantToTry || []);
                  saveCached(STORAGE_KEYS.COUPLE_DATA, data);
                  saveCached(STORAGE_KEYS.COUPLE_WANT_TO_TRY, data.wantToTry || []);
                } else {
                  setCoupleData(null);
                  setWantToTryList([]);
                  saveCached(STORAGE_KEYS.COUPLE_DATA, null);
                  saveCached(STORAGE_KEYS.COUPLE_WANT_TO_TRY, []);
                }
                setIsLoading(false);
              },
              error => {
                console.error('Couple doc subscription error:', error);
                setIsLoading(false);
              },
            );
        },
        error => {
          console.error('User profile subscription error:', error);
          setIsLoading(false);
        },
      );

    return () => {
      userUnsub();
      if (coupleUnsubRef.current) coupleUnsubRef.current();
    };
  }, [currentUser?.uid]);

  // ─── Subscribe to activity feed ───────────────────────
  useEffect(() => {
    if (!coupleId) {
      setActivityFeed([]);
      saveCached(STORAGE_KEYS.COUPLE_ACTIVITY, []);
      return;
    }

    const unsub = firestore()
      .collection(FIREBASE_COLLECTIONS.COUPLES)
      .doc(coupleId)
      .collection('activity')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(
        snapshot => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setActivityFeed(items);
          saveCached(STORAGE_KEYS.COUPLE_ACTIVITY, items);
          setHasMoreActivity(snapshot.docs.length >= 20);
          if (snapshot.docs.length > 0) {
            lastActivityDocRef.current = snapshot.docs[snapshot.docs.length - 1];
          }
        },
        error => {
          console.error('Activity feed subscription error:', error);
        },
      );

    activityUnsubRef.current = unsub;
    return () => {
      if (activityUnsubRef.current) activityUnsubRef.current();
    };
  }, [coupleId]);

  // ─── Subscribe to shared favorites ────────────────────
  useEffect(() => {
    if (!isConnected || !partner?.uid || !currentUser) {
      setSharedFavorites([]);
      return;
    }

    let myFavs = [];
    let partnerFavs = [];

    const computeShared = () => {
      const mySet = new Set(myFavs);
      const shared = partnerFavs.filter(id => mySet.has(id));
      setSharedFavorites(shared);
      saveCached(STORAGE_KEYS.COUPLE_SHARED_FAVORITES, shared);
    };

    // Subscribe to my favorites
    myFavUnsubRef.current = firestore()
      .collection(FIREBASE_COLLECTIONS.USERS)
      .doc(currentUser.uid)
      .collection('positionData')
      .where('isFavorite', '==', true)
      .onSnapshot(snapshot => {
        myFavs = snapshot.docs.map(doc => doc.id);
        computeShared();
      });

    // Subscribe to partner's favorites
    partnerFavUnsubRef.current = firestore()
      .collection(FIREBASE_COLLECTIONS.USERS)
      .doc(partner.uid)
      .collection('positionData')
      .where('isFavorite', '==', true)
      .onSnapshot(snapshot => {
        partnerFavs = snapshot.docs.map(doc => doc.id);
        computeShared();
      });

    return () => {
      if (myFavUnsubRef.current) myFavUnsubRef.current();
      if (partnerFavUnsubRef.current) partnerFavUnsubRef.current();
    };
  }, [isConnected, partner?.uid, currentUser?.uid]);

  // ─── Connect by code ──────────────────────────────────
  const connectByCode = useCallback(
    async code => {
      if (!currentUser) return {success: false, error: 'Not authenticated'};
      const upperCode = code.toUpperCase().trim();

      if (upperCode.length !== 6) {
        return {success: false, error: 'Code must be 6 characters'};
      }

      setIsConnecting(true);
      try {
        // Look up partner code
        const partnerData = await getPartnerByCode(upperCode);
        if (!partnerData) {
          return {success: false, error: 'Invalid partner code'};
        }

        if (partnerData.uid === currentUser.uid) {
          return {success: false, error: "You can't connect with yourself"};
        }

        // Check if partner already has a couple
        const partnerProfile = await getUserProfile(partnerData.uid);
        if (partnerProfile?.coupleId) {
          return {success: false, error: 'This person is already connected'};
        }

        // Check if current user already has a couple
        const myProfile = await getUserProfile(currentUser.uid);
        if (myProfile?.coupleId) {
          return {success: false, error: "You're already connected to someone"};
        }

        const newCoupleId = generateId();

        // Atomic batch: create couple + update both users
        await batchWrite([
          {
            type: 'set',
            collection: FIREBASE_COLLECTIONS.COUPLES,
            docId: newCoupleId,
            data: {
              partnerA: currentUser.uid,
              partnerB: partnerData.uid,
              partnerAName: myProfile?.displayName || currentUser.displayName || 'You',
              partnerBName: partnerData.displayName || 'Partner',
              connectedAt: serverTimestamp(),
              wantToTry: [],
              stats: {gamesPlayed: 0, positionsExplored: 0},
              lastActivity: serverTimestamp(),
            },
          },
          {
            type: 'update',
            collection: FIREBASE_COLLECTIONS.USERS,
            docId: currentUser.uid,
            data: {partnerId: partnerData.uid, coupleId: newCoupleId},
          },
          {
            type: 'update',
            collection: FIREBASE_COLLECTIONS.USERS,
            docId: partnerData.uid,
            data: {partnerId: currentUser.uid, coupleId: newCoupleId},
          },
        ]);

        // Add connection activity
        await addDocument(
          `${FIREBASE_COLLECTIONS.COUPLES}/${newCoupleId}/activity`,
          {
            type: 'connected',
            description: 'Couple connected!',
            actorUid: currentUser.uid,
            actorName: myProfile?.displayName || 'User',
            metadata: {},
            createdAt: serverTimestamp(),
          },
        );

        return {success: true};
      } catch (error) {
        console.error('Connect error:', error);
        return {success: false, error: 'Connection failed. Try again.'};
      } finally {
        setIsConnecting(false);
      }
    },
    [currentUser],
  );

  // ─── Disconnect ───────────────────────────────────────
  const disconnect = useCallback(async () => {
    if (!currentUser || !coupleId || !partner) return;

    try {
      await batchWrite([
        {
          type: 'delete',
          collection: FIREBASE_COLLECTIONS.COUPLES,
          docId: coupleId,
        },
        {
          type: 'update',
          collection: FIREBASE_COLLECTIONS.USERS,
          docId: currentUser.uid,
          data: {partnerId: null, coupleId: null},
        },
        {
          type: 'update',
          collection: FIREBASE_COLLECTIONS.USERS,
          docId: partner.uid,
          data: {partnerId: null, coupleId: null},
        },
      ]);

      // Clear local cache
      setCoupleData(null);
      setWantToTryList([]);
      setActivityFeed([]);
      setSharedFavorites([]);
      saveCached(STORAGE_KEYS.COUPLE_DATA, null);
      saveCached(STORAGE_KEYS.COUPLE_WANT_TO_TRY, []);
      saveCached(STORAGE_KEYS.COUPLE_ACTIVITY, []);
      saveCached(STORAGE_KEYS.COUPLE_SHARED_FAVORITES, []);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [currentUser, coupleId, partner]);

  // ─── Regenerate partner code ──────────────────────────
  const regenerateCode = useCallback(async () => {
    if (!currentUser) return null;

    try {
      const profile = await getUserProfile(currentUser.uid);
      const oldCode = profile?.partnerCode;

      const newCode = generatePartnerCode();

      // Delete old code doc, create new one, update user profile
      if (oldCode) {
        await deletePartnerCodeDoc(oldCode);
      }
      await createPartnerCodeDoc(newCode, currentUser.uid, profile?.displayName || '');
      await updateUserProfile({partnerCode: newCode});

      fastStore.set(STORAGE_KEYS.COUPLE_DATA + '_code', newCode);
      return newCode;
    } catch (error) {
      console.error('Regenerate code error:', error);
      return null;
    }
  }, [currentUser]);

  // ─── Want-to-try actions ──────────────────────────────
  const addToWantToTry = useCallback(
    async positionId => {
      if (!coupleId || !currentUser) return;

      const newItem = {
        id: generateId(),
        positionId,
        addedBy: currentUser.uid,
        addedAt: new Date().toISOString(),
        tried: false,
        triedAt: null,
      };

      // Optimistic update
      setWantToTryList(prev => [...prev, newItem]);

      try {
        await firestore()
          .collection(FIREBASE_COLLECTIONS.COUPLES)
          .doc(coupleId)
          .update({
            wantToTry: firestore.FieldValue.arrayUnion(newItem),
            lastActivity: serverTimestamp(),
          });

        // Add activity
        await addDocument(
          `${FIREBASE_COLLECTIONS.COUPLES}/${coupleId}/activity`,
          {
            type: 'want_to_try_added',
            description: 'Added a position to try',
            actorUid: currentUser.uid,
            actorName: coupleData?.partnerA === currentUser.uid
              ? coupleData?.partnerAName
              : coupleData?.partnerBName,
            metadata: {positionId},
            createdAt: serverTimestamp(),
          },
        );
      } catch (error) {
        console.error('Add to want-to-try error:', error);
        // Revert optimistic update
        setWantToTryList(prev => prev.filter(item => item.id !== newItem.id));
      }
    },
    [coupleId, currentUser, coupleData],
  );

  const removeFromWantToTry = useCallback(
    async itemId => {
      if (!coupleId) return;

      const item = wantToTryList.find(i => i.id === itemId);
      if (!item) return;

      // Optimistic update
      setWantToTryList(prev => prev.filter(i => i.id !== itemId));

      try {
        await firestore()
          .collection(FIREBASE_COLLECTIONS.COUPLES)
          .doc(coupleId)
          .update({
            wantToTry: firestore.FieldValue.arrayRemove(item),
          });
      } catch (error) {
        console.error('Remove from want-to-try error:', error);
        setWantToTryList(prev => [...prev, item]);
      }
    },
    [coupleId, wantToTryList],
  );

  const markAsTried = useCallback(
    async itemId => {
      if (!coupleId || !currentUser) return;

      const itemIndex = wantToTryList.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return;

      const oldItem = wantToTryList[itemIndex];
      const updatedItem = {
        ...oldItem,
        tried: true,
        triedAt: new Date().toISOString(),
      };

      // Optimistic update
      setWantToTryList(prev =>
        prev.map(i => (i.id === itemId ? updatedItem : i)),
      );

      try {
        // Replace old item with updated in array — need to rewrite entire array
        const newList = wantToTryList.map(i =>
          i.id === itemId ? updatedItem : i,
        );
        await firestore()
          .collection(FIREBASE_COLLECTIONS.COUPLES)
          .doc(coupleId)
          .update({
            wantToTry: newList,
            lastActivity: serverTimestamp(),
          });

        // Add activity
        await addDocument(
          `${FIREBASE_COLLECTIONS.COUPLES}/${coupleId}/activity`,
          {
            type: 'want_to_try_completed',
            description: 'Tried a position together',
            actorUid: currentUser.uid,
            actorName: coupleData?.partnerA === currentUser.uid
              ? coupleData?.partnerAName
              : coupleData?.partnerBName,
            metadata: {positionId: oldItem.positionId},
            createdAt: serverTimestamp(),
          },
        );
      } catch (error) {
        console.error('Mark as tried error:', error);
        setWantToTryList(prev =>
          prev.map(i => (i.id === itemId ? oldItem : i)),
        );
      }
    },
    [coupleId, currentUser, wantToTryList, coupleData],
  );

  // ─── Activity actions ─────────────────────────────────
  const addActivity = useCallback(
    async (type, description, metadata = {}) => {
      if (!coupleId || !currentUser) return;

      try {
        await addDocument(
          `${FIREBASE_COLLECTIONS.COUPLES}/${coupleId}/activity`,
          {
            type,
            description,
            actorUid: currentUser.uid,
            actorName: coupleData?.partnerA === currentUser.uid
              ? coupleData?.partnerAName
              : coupleData?.partnerBName,
            metadata,
            createdAt: serverTimestamp(),
          },
        );

        await firestore()
          .collection(FIREBASE_COLLECTIONS.COUPLES)
          .doc(coupleId)
          .update({lastActivity: serverTimestamp()});
      } catch (error) {
        console.error('Add activity error:', error);
      }
    },
    [coupleId, currentUser, coupleData],
  );

  const loadMoreActivity = useCallback(async () => {
    if (!coupleId || !hasMoreActivity || !lastActivityDocRef.current) return;

    try {
      const snapshot = await firestore()
        .collection(FIREBASE_COLLECTIONS.COUPLES)
        .doc(coupleId)
        .collection('activity')
        .orderBy('createdAt', 'desc')
        .startAfter(lastActivityDocRef.current)
        .limit(20)
        .get();

      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setActivityFeed(prev => [...prev, ...newItems]);
      setHasMoreActivity(snapshot.docs.length >= 20);
      if (snapshot.docs.length > 0) {
        lastActivityDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }
    } catch (error) {
      console.error('Load more activity error:', error);
    }
  }, [coupleId, hasMoreActivity]);

  // ─── Refresh shared favorites ─────────────────────────
  const refreshSharedFavorites = useCallback(async () => {
    if (!partner?.uid || !currentUser) return;

    try {
      const [mySnap, partnerSnap] = await Promise.all([
        firestore()
          .collection(FIREBASE_COLLECTIONS.USERS)
          .doc(currentUser.uid)
          .collection('positionData')
          .where('isFavorite', '==', true)
          .get(),
        firestore()
          .collection(FIREBASE_COLLECTIONS.USERS)
          .doc(partner.uid)
          .collection('positionData')
          .where('isFavorite', '==', true)
          .get(),
      ]);

      const myFavs = new Set(mySnap.docs.map(d => d.id));
      const shared = partnerSnap.docs
        .map(d => d.id)
        .filter(id => myFavs.has(id));

      setSharedFavorites(shared);
      saveCached(STORAGE_KEYS.COUPLE_SHARED_FAVORITES, shared);
    } catch (error) {
      console.error('Refresh shared favorites error:', error);
    }
  }, [partner?.uid, currentUser]);

  // ─── Return ───────────────────────────────────────────
  return {
    // Connection state
    isConnected,
    isConnecting,
    coupleId,
    partner,
    partnerCode,

    // Connection actions
    connectByCode,
    disconnect,
    regenerateCode,

    // Shared favorites
    sharedFavorites,
    refreshSharedFavorites,

    // Want-to-try
    wantToTryList: untried,
    triedTogetherList,
    addToWantToTry,
    removeFromWantToTry,
    markAsTried,

    // Activity
    activityFeed,
    addActivity,
    loadMoreActivity,
    hasMoreActivity,

    // Stats
    coupleStats,

    // Loading
    isLoading,
  };
};
