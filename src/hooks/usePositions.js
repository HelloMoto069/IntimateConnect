import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {STORAGE_KEYS, POSITION_CATEGORIES} from '@utils/constants';
import {fastStore, encryptData, decryptData} from '@utils/encryptionUtils';
import {setDocument, getDocument} from '@api/firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import positionsData from '@data/positions.json';

// ─── djb2 Hash for Position of the Day ──────────────────
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// ─── Search scoring ─────────────────────────────────────
function scorePosition(position, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const name = position.name.toLowerCase();
  const alts = (position.alternateNames || []).map(n => n.toLowerCase());

  // Exact name match
  if (name === q) return 100;

  // Name starts with query
  if (name.startsWith(q)) score += 50;
  // Name contains query
  else if (name.includes(q)) score += 30;

  // Alternate name matches
  for (const alt of alts) {
    if (alt === q) {score += 80; break;}
    if (alt.startsWith(q)) {score += 40; break;}
    if (alt.includes(q)) {score += 20; break;}
  }

  // Category matches
  for (const cat of position.category || []) {
    if (cat.toLowerCase().includes(q)) {score += 15; break;}
  }

  // bestFor matches
  for (const tag of position.bestFor || []) {
    if (tag.toLowerCase().includes(q)) {score += 10; break;}
  }

  // Description contains
  if (position.description?.toLowerCase().includes(q)) score += 5;

  return score;
}

export const usePositions = () => {
  const [userPositionData, setUserPositionData] = useState({});
  const [filters, setFilters] = useState({
    categories: [],
    difficultyMin: 1,
    difficultyMax: 5,
    intimacyMin: 1,
    intimacyMax: 5,
  });
  const [sortConfig, setSortConfig] = useState({field: 'name', direction: 'asc'});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  // All positions from bundled JSON
  const allPositions = useMemo(() => positionsData, []);

  // ─── Unique categories from data ────────────────────────
  const categories = useMemo(() => {
    const catSet = new Set();
    allPositions.forEach(p => {
      (p.category || []).forEach(c => catSet.add(c));
    });
    return POSITION_CATEGORIES.filter(c => catSet.has(c.id));
  }, [allPositions]);

  // ─── Position of the Day ────────────────────────────────
  const positionOfTheDay = useMemo(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    const cacheKey = STORAGE_KEYS.POTD_CACHE_PREFIX + dateStr;

    try {
      const cached = fastStore.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const found = allPositions.find(p => p.id === parsed.id);
        if (found) return found;
      }
    } catch {}

    const index = djb2Hash(dateStr) % allPositions.length;
    const potd = allPositions[index];

    try {
      fastStore.set(cacheKey, JSON.stringify({id: potd.id}));
    } catch {}

    return potd;
  }, [allPositions]);

  // ─── Load user position data from Firestore ─────────────
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    // Subscribe to user's position data subcollection
    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('positionData')
      .onSnapshot(
        snapshot => {
          const data = {};
          snapshot.docs.forEach(doc => {
            data[doc.id] = doc.data();
          });
          setUserPositionData(data);
          setIsLoading(false);
        },
        error => {
          console.error('Error loading position data:', error);
          setIsLoading(false);
        },
      );

    unsubscribeRef.current = unsubscribe;
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // ─── Favorites ──────────────────────────────────────────
  const favorites = useMemo(() => {
    return Object.entries(userPositionData)
      .filter(([, data]) => data.isFavorite)
      .map(([id]) => id);
  }, [userPositionData]);

  const favoritePositions = useMemo(() => {
    return allPositions.filter(p => favorites.includes(p.id));
  }, [allPositions, favorites]);

  // ─── Filtered positions ─────────────────────────────────
  const filteredPositions = useMemo(() => {
    let result = [...allPositions];

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(p =>
        filters.categories.some(cat => (p.category || []).includes(cat)),
      );
    }

    // Difficulty range
    result = result.filter(
      p =>
        p.difficulty >= filters.difficultyMin &&
        p.difficulty <= filters.difficultyMax,
    );

    // Intimacy range
    result = result.filter(
      p =>
        p.intimacyLevel >= filters.intimacyMin &&
        p.intimacyLevel <= filters.intimacyMax,
    );

    // Search
    if (searchQuery.trim()) {
      result = result
        .map(p => ({position: p, score: scorePosition(p, searchQuery)}))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.position);
    } else {
      // Sort (only when not searching — search results are sorted by relevance)
      const {field, direction} = sortConfig;
      result.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allPositions, filters, sortConfig, searchQuery]);

  // ─── Get position by ID ─────────────────────────────────
  const getPositionById = useCallback(
    id => allPositions.find(p => p.id === id) || null,
    [allPositions],
  );

  // ─── Get user data for a position ───────────────────────
  const getUserPositionData = useCallback(
    positionId => {
      return userPositionData[positionId] || {
        isFavorite: false,
        hasTried: false,
        userRating: 0,
        personalNotes: '',
        triedDate: null,
      };
    },
    [userPositionData],
  );

  // ─── Firestore sync helper ──────────────────────────────
  const syncToFirestore = useCallback(async (positionId, data) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      await setDocument(
        `users/${currentUser.uid}/positionData`,
        positionId,
        data,
      );
    } catch (error) {
      console.error('Error syncing position data:', error);
    }
  }, []);

  // ─── Toggle favorite ───────────────────────────────────
  const toggleFavorite = useCallback(
    async positionId => {
      const current = userPositionData[positionId] || {};
      const newValue = !current.isFavorite;

      // Optimistic update
      setUserPositionData(prev => ({
        ...prev,
        [positionId]: {...(prev[positionId] || {}), isFavorite: newValue},
      }));

      await syncToFirestore(positionId, {
        isFavorite: newValue,
      });
    },
    [userPositionData, syncToFirestore],
  );

  // ─── Set rating ─────────────────────────────────────────
  const setRating = useCallback(
    async (positionId, rating) => {
      setUserPositionData(prev => ({
        ...prev,
        [positionId]: {...(prev[positionId] || {}), userRating: rating},
      }));

      await syncToFirestore(positionId, {userRating: rating});
    },
    [syncToFirestore],
  );

  // ─── Mark as tried ──────────────────────────────────────
  const markAsTried = useCallback(
    async positionId => {
      const now = new Date().toISOString();

      setUserPositionData(prev => ({
        ...prev,
        [positionId]: {
          ...(prev[positionId] || {}),
          hasTried: true,
          triedDate: now,
        },
      }));

      await syncToFirestore(positionId, {
        hasTried: true,
        triedDate: now,
      });
    },
    [syncToFirestore],
  );

  // ─── Save personal note (encrypted) ────────────────────
  const savePersonalNote = useCallback(
    async (positionId, note) => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const encryptedNote = note ? encryptData(note, currentUser.uid) : '';

      setUserPositionData(prev => ({
        ...prev,
        [positionId]: {
          ...(prev[positionId] || {}),
          personalNotes: encryptedNote,
        },
      }));

      await syncToFirestore(positionId, {personalNotes: encryptedNote});
    },
    [syncToFirestore],
  );

  // ─── Get decrypted note ─────────────────────────────────
  const getDecryptedNote = useCallback(
    positionId => {
      const currentUser = auth().currentUser;
      if (!currentUser) return '';

      const encrypted = userPositionData[positionId]?.personalNotes;
      if (!encrypted) return '';

      return decryptData(encrypted, currentUser.uid) || '';
    },
    [userPositionData],
  );

  // ─── Search positions ──────────────────────────────────
  const searchPositions = useCallback(query => {
    setSearchQuery(query);
  }, []);

  // ─── Filter by category ─────────────────────────────────
  const filterByCategory = useCallback(categoryOrCategories => {
    const cats = Array.isArray(categoryOrCategories)
      ? categoryOrCategories
      : categoryOrCategories
        ? [categoryOrCategories]
        : [];
    setFilters(prev => ({...prev, categories: cats}));
  }, []);

  // ─── Filter by difficulty ───────────────────────────────
  const filterByDifficulty = useCallback((min, max) => {
    setFilters(prev => ({...prev, difficultyMin: min, difficultyMax: max}));
  }, []);

  // ─── Filter by intimacy ─────────────────────────────────
  const filterByIntimacy = useCallback((min, max) => {
    setFilters(prev => ({...prev, intimacyMin: min, intimacyMax: max}));
  }, []);

  // ─── Sort positions ─────────────────────────────────────
  const sortPositions = useCallback((field, direction = 'asc') => {
    setSortConfig({field, direction});
  }, []);

  // ─── Apply full filter set at once ──────────────────────
  const applyFilters = useCallback(newFilters => {
    setFilters(prev => ({...prev, ...newFilters}));
  }, []);

  // ─── Reset all filters ─────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters({
      categories: [],
      difficultyMin: 1,
      difficultyMax: 5,
      intimacyMin: 1,
      intimacyMax: 5,
    });
    setSortConfig({field: 'name', direction: 'asc'});
    setSearchQuery('');
  }, []);

  // ─── Recent searches (MMKV) ─────────────────────────────
  const getRecentSearches = useCallback(() => {
    try {
      const raw = fastStore.get(STORAGE_KEYS.RECENT_SEARCHES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const addRecentSearch = useCallback(query => {
    if (!query.trim()) return;
    try {
      const current = (() => {
        const raw = fastStore.get(STORAGE_KEYS.RECENT_SEARCHES);
        return raw ? JSON.parse(raw) : [];
      })();
      const updated = [query, ...current.filter(s => s !== query)].slice(0, 10);
      fastStore.set(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch {}
  }, []);

  const clearRecentSearches = useCallback(() => {
    fastStore.remove(STORAGE_KEYS.RECENT_SEARCHES);
  }, []);

  return {
    // Data
    positions: allPositions,
    filteredPositions,
    categories,
    positionOfTheDay,
    favorites,
    favoritePositions,
    isLoading,

    // Getters
    getPositionById,
    getUserPositionData,
    getDecryptedNote,

    // Actions
    toggleFavorite,
    setRating,
    markAsTried,
    savePersonalNote,

    // Filtering / Sorting / Search
    filters,
    sortConfig,
    searchQuery,
    searchPositions,
    filterByCategory,
    filterByDifficulty,
    filterByIntimacy,
    sortPositions,
    applyFilters,
    resetFilters,

    // Recent searches
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
};
