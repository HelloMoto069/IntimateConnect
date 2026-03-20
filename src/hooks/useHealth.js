import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {STORAGE_KEYS, HEALTH_CATEGORIES, GUIDE_CATEGORIES} from '@utils/constants';
import {fastStore, encryptData, decryptData} from '@utils/encryptionUtils';
import {setDocument} from '@api/firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import articlesData from '@data/health/articles.json';
import guidesData from '@data/health/guides.json';
import glossaryData from '@data/health/glossary.json';

// ─── djb2 Hash for Featured Article ────────────────────
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// ─── Article Search Scoring ─────────────────────────────
function scoreArticle(article, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const title = article.title.toLowerCase();

  if (title === q) return 100;
  if (title.startsWith(q)) score += 50;
  else if (title.includes(q)) score += 30;

  // Tags
  for (const tag of article.tags || []) {
    if (tag.toLowerCase() === q) {score += 40; break;}
    if (tag.toLowerCase().includes(q)) {score += 20; break;}
  }

  // Category
  if (article.category?.toLowerCase().includes(q)) score += 15;

  // Summary
  if (article.summary?.toLowerCase().includes(q)) score += 10;

  // Section headings
  for (const section of article.sections || []) {
    if (section.heading?.toLowerCase().includes(q)) {score += 15; break;}
  }

  // Section body
  for (const section of article.sections || []) {
    if (section.body?.toLowerCase().includes(q)) {score += 5; break;}
  }

  return score;
}

// ─── Glossary Search Scoring ────────────────────────────
function scoreGlossaryTerm(term, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const word = term.term.toLowerCase();

  if (word === q) return 100;
  if (word.startsWith(q)) score += 60;
  else if (word.includes(q)) score += 30;

  if (term.definition?.toLowerCase().includes(q)) score += 10;
  if (term.category?.toLowerCase().includes(q)) score += 5;

  return score;
}

export const useHealth = () => {
  // ─── State ────────────────────────────────────────────
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [readingProgress, setReadingProgress] = useState({});
  const [completedGuides, setCompletedGuides] = useState({});
  const [moodHistory, setMoodHistory] = useState([]);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState(null);
  const [guideCategoryFilter, setGuideCategoryFilter] = useState(null);
  const [glossarySearchQuery, setGlossarySearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  // ─── Load All Data ────────────────────────────────────
  const articles = useMemo(() => articlesData, []);
  const guides = useMemo(() => guidesData, []);
  const glossaryTerms = useMemo(() => glossaryData, []);

  // ─── Featured Article (daily rotation) ────────────────
  const featuredArticle = useMemo(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    const index = djb2Hash('health-' + dateStr) % articles.length;
    return articles[index];
  }, [articles]);

  const dailyTip = useMemo(() => {
    return featuredArticle?.didYouKnow || null;
  }, [featuredArticle]);

  // ─── Load persisted data from MMKV ────────────────────
  useEffect(() => {
    try {
      const bm = fastStore.get(STORAGE_KEYS.HEALTH_BOOKMARKS);
      if (bm) setBookmarkedArticles(JSON.parse(bm));

      const rp = fastStore.get(STORAGE_KEYS.HEALTH_READING_PROGRESS);
      if (rp) setReadingProgress(JSON.parse(rp));

      const gc = fastStore.get(STORAGE_KEYS.HEALTH_GUIDE_COMPLETIONS);
      if (gc) setCompletedGuides(JSON.parse(gc));

      const mh = fastStore.get(STORAGE_KEYS.HEALTH_MOOD_HISTORY);
      if (mh) {
        const parsed = JSON.parse(mh);
        // Decrypt mood notes
        const currentUser = auth().currentUser;
        if (currentUser) {
          const decrypted = parsed.map(entry => ({
            ...entry,
            note: entry.encryptedNote
              ? decryptData(entry.encryptedNote, currentUser.uid) || ''
              : '',
          }));
          setMoodHistory(decrypted);
        } else {
          setMoodHistory(parsed.map(e => ({...e, note: ''})));
        }
      }
    } catch (e) {
      console.error('Error loading health data:', e);
    }
    setIsLoading(false);
  }, []);

  // ─── Firestore sync ───────────────────────────────────
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('healthData')
      .doc('preferences')
      .onSnapshot(
        snapshot => {
          if (snapshot.exists) {
            const data = snapshot.data();
            if (data.bookmarks) {
              setBookmarkedArticles(data.bookmarks);
              fastStore.set(STORAGE_KEYS.HEALTH_BOOKMARKS, JSON.stringify(data.bookmarks));
            }
            if (data.readingProgress) {
              setReadingProgress(data.readingProgress);
              fastStore.set(STORAGE_KEYS.HEALTH_READING_PROGRESS, JSON.stringify(data.readingProgress));
            }
            if (data.guideCompletions) {
              setCompletedGuides(data.guideCompletions);
              fastStore.set(STORAGE_KEYS.HEALTH_GUIDE_COMPLETIONS, JSON.stringify(data.guideCompletions));
            }
          }
        },
        error => {
          console.error('Error syncing health data:', error);
        },
      );

    unsubscribeRef.current = unsubscribe;
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // ─── Firestore sync helper ────────────────────────────
  const syncHealthToFirestore = useCallback(async data => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
    try {
      await setDocument(
        `users/${currentUser.uid}/healthData`,
        'preferences',
        data,
      );
    } catch (error) {
      console.error('Error syncing health data:', error);
    }
  }, []);

  // ═══════════════════════════════════════════════════════
  // ARTICLES
  // ═══════════════════════════════════════════════════════

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Category filter
    if (articleCategoryFilter) {
      result = result.filter(a => a.category === articleCategoryFilter);
    }

    // Search
    if (articleSearchQuery.trim()) {
      result = result
        .map(a => ({article: a, score: scoreArticle(a, articleSearchQuery)}))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.article);
    }

    return result;
  }, [articles, articleCategoryFilter, articleSearchQuery]);

  const getArticleById = useCallback(
    id => articles.find(a => a.id === id) || null,
    [articles],
  );

  const getArticlesByCategory = useCallback(
    categoryId => articles.filter(a => a.category === categoryId),
    [articles],
  );

  const getRelatedArticles = useCallback(
    articleId => {
      const article = articles.find(a => a.id === articleId);
      if (!article?.relatedArticles) return [];
      return article.relatedArticles
        .map(id => articles.find(a => a.id === id))
        .filter(Boolean);
    },
    [articles],
  );

  // ─── Bookmarks ────────────────────────────────────────
  const toggleBookmark = useCallback(
    async articleId => {
      setBookmarkedArticles(prev => {
        const isBookmarked = prev.includes(articleId);
        const updated = isBookmarked
          ? prev.filter(id => id !== articleId)
          : [...prev, articleId];

        fastStore.set(STORAGE_KEYS.HEALTH_BOOKMARKS, JSON.stringify(updated));
        syncHealthToFirestore({bookmarks: updated});
        return updated;
      });
    },
    [syncHealthToFirestore],
  );

  const isBookmarked = useCallback(
    articleId => bookmarkedArticles.includes(articleId),
    [bookmarkedArticles],
  );

  // ─── Reading Progress ─────────────────────────────────
  const updateReadingProgress = useCallback(
    async (articleId, percent) => {
      setReadingProgress(prev => {
        const updated = {
          ...prev,
          [articleId]: {
            percent: Math.max(prev[articleId]?.percent || 0, percent),
            lastReadAt: new Date().toISOString(),
          },
        };

        fastStore.set(STORAGE_KEYS.HEALTH_READING_PROGRESS, JSON.stringify(updated));
        syncHealthToFirestore({readingProgress: updated});
        return updated;
      });
    },
    [syncHealthToFirestore],
  );

  const completedArticles = useMemo(() => {
    return Object.entries(readingProgress)
      .filter(([, data]) => data.percent >= 100)
      .map(([id]) => id);
  }, [readingProgress]);

  // ─── Article Search/Filter ────────────────────────────
  const searchArticles = useCallback(query => {
    setArticleSearchQuery(query);
  }, []);

  const filterArticlesByCategory = useCallback(categoryId => {
    setArticleCategoryFilter(categoryId);
  }, []);

  // ═══════════════════════════════════════════════════════
  // GUIDES
  // ═══════════════════════════════════════════════════════

  const filteredGuides = useMemo(() => {
    if (!guideCategoryFilter) return guides;
    return guides.filter(g => g.category === guideCategoryFilter);
  }, [guides, guideCategoryFilter]);

  const getGuideById = useCallback(
    id => guides.find(g => g.id === id) || null,
    [guides],
  );

  const markGuideCompleted = useCallback(
    async guideId => {
      setCompletedGuides(prev => {
        const existing = prev[guideId] || {timesCompleted: 0};
        const updated = {
          ...prev,
          [guideId]: {
            completedAt: new Date().toISOString(),
            timesCompleted: existing.timesCompleted + 1,
          },
        };

        fastStore.set(STORAGE_KEYS.HEALTH_GUIDE_COMPLETIONS, JSON.stringify(updated));
        syncHealthToFirestore({guideCompletions: updated});
        return updated;
      });
    },
    [syncHealthToFirestore],
  );

  const isGuideCompleted = useCallback(
    guideId => !!completedGuides[guideId],
    [completedGuides],
  );

  const filterGuidesByCategory = useCallback(categoryId => {
    setGuideCategoryFilter(categoryId);
  }, []);

  // ═══════════════════════════════════════════════════════
  // GLOSSARY
  // ═══════════════════════════════════════════════════════

  const filteredGlossary = useMemo(() => {
    if (!glossarySearchQuery.trim()) return glossaryTerms;
    return glossaryTerms
      .map(t => ({term: t, score: scoreGlossaryTerm(t, glossarySearchQuery)}))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.term);
  }, [glossaryTerms, glossarySearchQuery]);

  const alphabetIndex = useMemo(() => {
    const letters = new Set();
    glossaryTerms.forEach(t => {
      const first = t.term.charAt(0).toUpperCase();
      letters.add(first);
    });
    return [...letters].sort();
  }, [glossaryTerms]);

  const getTermsByLetter = useCallback(
    letter => {
      return glossaryTerms.filter(
        t => t.term.charAt(0).toUpperCase() === letter.toUpperCase(),
      );
    },
    [glossaryTerms],
  );

  const getTermById = useCallback(
    id => glossaryTerms.find(t => t.id === id) || null,
    [glossaryTerms],
  );

  const searchGlossary = useCallback(query => {
    setGlossarySearchQuery(query);
  }, []);

  // ═══════════════════════════════════════════════════════
  // WELLNESS CHECK-IN (MOOD)
  // ═══════════════════════════════════════════════════════

  const todaysMood = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return moodHistory.find(e => e.date === today) || null;
  }, [moodHistory]);

  const addMoodEntry = useCallback(
    async (moodId, note = '') => {
      const currentUser = auth().currentUser;
      const today = new Date().toISOString().split('T')[0];
      const encryptedNote = note && currentUser
        ? encryptData(note, currentUser.uid)
        : '';

      const entry = {
        date: today,
        moodId,
        encryptedNote,
        timestamp: new Date().toISOString(),
      };

      setMoodHistory(prev => {
        // Replace existing entry for today, or prepend
        const filtered = prev.filter(e => e.date !== today);
        const updated = [{...entry, note}, ...filtered].slice(0, 90);

        // Persist to MMKV (with encrypted notes)
        const forStorage = updated.map(({note: _, ...rest}) => rest);
        fastStore.set(STORAGE_KEYS.HEALTH_MOOD_HISTORY, JSON.stringify(forStorage));

        return updated;
      });

      // Sync to Firestore
      if (currentUser) {
        try {
          await setDocument(
            `users/${currentUser.uid}/moodData`,
            today,
            entry,
          );
        } catch (error) {
          console.error('Error syncing mood data:', error);
        }
      }
    },
    [],
  );

  const getMoodHistory = useCallback(
    (days = 30) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      return moodHistory.filter(e => e.date >= cutoffStr);
    },
    [moodHistory],
  );

  // ═══════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════

  return {
    // Articles
    articles,
    filteredArticles,
    articleCategories: HEALTH_CATEGORIES,
    featuredArticle,
    dailyTip,
    getArticleById,
    getArticlesByCategory,
    getRelatedArticles,
    bookmarkedArticles,
    toggleBookmark,
    isBookmarked,
    readingProgress,
    updateReadingProgress,
    completedArticles,
    articleSearchQuery,
    searchArticles,
    articleCategoryFilter,
    filterArticlesByCategory,

    // Guides
    guides,
    filteredGuides,
    guideCategories: GUIDE_CATEGORIES,
    getGuideById,
    completedGuides,
    markGuideCompleted,
    isGuideCompleted,
    guideCategoryFilter,
    filterGuidesByCategory,

    // Glossary
    glossaryTerms,
    filteredGlossary,
    glossarySearchQuery,
    searchGlossary,
    alphabetIndex,
    getTermsByLetter,
    getTermById,

    // Mood
    moodHistory,
    addMoodEntry,
    getMoodHistory,
    todaysMood,

    // Loading
    isLoading,
  };
};
