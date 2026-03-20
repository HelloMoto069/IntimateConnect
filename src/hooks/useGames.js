import {useState, useCallback, useMemo, useRef} from 'react';
import {STORAGE_KEYS} from '@utils/constants';
import {fastStore} from '@utils/encryptionUtils';
import {setDocument, getDocument} from '@api/firebase/firestore';
import auth from '@react-native-firebase/auth';
import truthOrDareData from '@data/games/truthOrDare.json';
import wouldYouRatherData from '@data/games/wouldYouRather.json';
import gameContentData from '@data/games/gameContent.json';

// ─── Fisher-Yates Shuffle ───────────────────────────────
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Main Hook ──────────────────────────────────────────
export function useGames() {
  // ── Seen tracking (prevents repeats per session) ──
  const seenCards = useRef({});

  // ── Level preference ──
  const [levelPreference, setLevelPreferenceState] = useState(() => {
    try {
      return fastStore.getString(STORAGE_KEYS.GAME_LEVEL_PREF) || 'mild';
    } catch {
      return 'mild';
    }
  });

  // ── Game history ──
  const [gameHistory, setGameHistory] = useState(() => {
    try {
      const stored = fastStore.getString(STORAGE_KEYS.GAME_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ── Favorite prompts ──
  const [favoritePrompts, setFavoritePrompts] = useState(() => {
    try {
      const stored = fastStore.getString(STORAGE_KEYS.GAME_FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ── Quiz state ──
  const [quizState, setQuizState] = useState({
    currentIndex: 0,
    score: 0,
    answers: [],
    isComplete: false,
  });

  const [quizHighScore, setQuizHighScore] = useState(() => {
    try {
      const stored = fastStore.getString(STORAGE_KEYS.QUIZ_HIGH_SCORE);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // ── 36 Questions state ──
  const [thirtySixState, setThirtySixState] = useState(() => {
    try {
      const stored = fastStore.getString(STORAGE_KEYS.THIRTY_SIX_PROGRESS);
      return stored ? JSON.parse(stored) : {set: 1, question: 1};
    } catch {
      return {set: 1, question: 1};
    }
  });

  // ── Mood Match state ──
  const [moodState, setMoodState] = useState({
    phase: 'partnerA', // partnerA | partnerB | reveal
    partnerACards: [],
    partnerBCards: [],
  });

  // ── Dice state ──
  const [diceResult, setDiceResult] = useState(null);

  // ─── Level Preference ─────────────────────────────────
  const setLevelPreference = useCallback(level => {
    setLevelPreferenceState(level);
    try {
      fastStore.set(STORAGE_KEYS.GAME_LEVEL_PREF, level);
    } catch {}
  }, []);

  // ─── Game History ─────────────────────────────────────
  const addGameSession = useCallback(
    (gameId, data = {}) => {
      const session = {
        gameId,
        playedAt: new Date().toISOString(),
        ...data,
      };
      const updated = [session, ...gameHistory].slice(0, 50);
      setGameHistory(updated);
      try {
        fastStore.set(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(updated));
      } catch {}

      // Sync to Firestore
      const user = auth().currentUser;
      if (user) {
        const docId = `game_${Date.now()}`;
        setDocument(`users/${user.uid}/gameData`, docId, session).catch(
          () => {},
        );
      }
    },
    [gameHistory],
  );

  const getLastPlayed = useCallback(
    gameId => {
      const session = gameHistory.find(h => h.gameId === gameId);
      return session ? session.playedAt : null;
    },
    [gameHistory],
  );

  // ─── Favorite Prompts ─────────────────────────────────
  const toggleFavoritePrompt = useCallback(
    promptId => {
      const updated = favoritePrompts.includes(promptId)
        ? favoritePrompts.filter(id => id !== promptId)
        : [...favoritePrompts, promptId];
      setFavoritePrompts(updated);
      try {
        fastStore.set(STORAGE_KEYS.GAME_FAVORITES, JSON.stringify(updated));
      } catch {}
    },
    [favoritePrompts],
  );

  const isPromptFavorite = useCallback(
    promptId => favoritePrompts.includes(promptId),
    [favoritePrompts],
  );

  // ─── Card Selection (prevents repeats) ────────────────
  const getRandomCard = useCallback(
    (gameId, level) => {
      let pool = [];
      if (gameId === 'truth-or-dare') {
        pool = level
          ? truthOrDareData.filter(c => c.level === level)
          : truthOrDareData;
      } else if (gameId === 'would-you-rather') {
        pool = level
          ? wouldYouRatherData.filter(c => c.level === level)
          : wouldYouRatherData;
      }

      if (pool.length === 0) return null;

      const key = `${gameId}_${level || 'all'}`;
      if (!seenCards.current[key]) {
        seenCards.current[key] = new Set();
      }
      const seen = seenCards.current[key];

      // Reset if seen 80%+ of pool
      if (seen.size >= pool.length * 0.8) {
        seen.clear();
      }

      const unseen = pool.filter(c => !seen.has(c.id));
      const pick = unseen.length > 0 ? unseen : pool;
      const card = pick[Math.floor(Math.random() * pick.length)];
      seen.add(card.id);

      return card;
    },
    [],
  );

  const getFilteredCards = useCallback((gameId, level, type) => {
    let pool = [];
    if (gameId === 'truth-or-dare') {
      pool = truthOrDareData;
      if (level) pool = pool.filter(c => c.level === level);
      if (type) pool = pool.filter(c => c.type === type);
    } else if (gameId === 'would-you-rather') {
      pool = wouldYouRatherData;
      if (level) pool = pool.filter(c => c.level === level);
    }
    return shuffle(pool);
  }, []);

  // ─── Dice ─────────────────────────────────────────────
  const rollDice = useCallback(() => {
    const {diceActions, diceBodyParts} = gameContentData;
    const action = diceActions[Math.floor(Math.random() * diceActions.length)];
    const bodyPart =
      diceBodyParts[Math.floor(Math.random() * diceBodyParts.length)];
    const result = {action, bodyPart};
    setDiceResult(result);
    return result;
  }, []);

  // ─── Quiz ─────────────────────────────────────────────
  const quizQuestions = useMemo(
    () => shuffle(gameContentData.quizQuestions).slice(0, 20),
    [],
  );

  const submitQuizAnswer = useCallback(
    answerIndex => {
      const question = quizQuestions[quizState.currentIndex];
      if (!question) return null;

      const isCorrect = answerIndex === question.correctIndex;
      const newScore = isCorrect ? quizState.score + 1 : quizState.score;
      const isLast = quizState.currentIndex >= quizQuestions.length - 1;

      const updated = {
        ...quizState,
        score: newScore,
        answers: [
          ...quizState.answers,
          {questionId: question.id, answerIndex, isCorrect},
        ],
        currentIndex: isLast
          ? quizState.currentIndex
          : quizState.currentIndex + 1,
        isComplete: isLast,
      };
      setQuizState(updated);

      if (isLast && newScore > quizHighScore) {
        setQuizHighScore(newScore);
        try {
          fastStore.set(STORAGE_KEYS.QUIZ_HIGH_SCORE, String(newScore));
        } catch {}
      }

      if (isLast) {
        addGameSession('intimacy-quiz', {
          score: newScore,
          total: quizQuestions.length,
        });
      }

      return {isCorrect, explanation: question.explanation, isLast};
    },
    [quizState, quizQuestions, quizHighScore, addGameSession],
  );

  const resetQuiz = useCallback(() => {
    setQuizState({currentIndex: 0, score: 0, answers: [], isComplete: false});
  }, []);

  // ─── 36 Questions ─────────────────────────────────────
  const thirtySixQuestions = useMemo(
    () => gameContentData.thirtySixQuestions,
    [],
  );

  const getCurrentThirtySixQuestion = useCallback(() => {
    return thirtySixQuestions.find(
      q => q.set === thirtySixState.set && q.order === thirtySixState.question,
    );
  }, [thirtySixQuestions, thirtySixState]);

  const advance36Question = useCallback(() => {
    let newState;
    if (thirtySixState.question < 12) {
      newState = {...thirtySixState, question: thirtySixState.question + 1};
    } else if (thirtySixState.set < 3) {
      newState = {set: thirtySixState.set + 1, question: 1};
    } else {
      // Completed all 36
      addGameSession('36-questions', {completed: true});
      newState = {set: 3, question: 12};
    }
    setThirtySixState(newState);
    try {
      fastStore.set(
        STORAGE_KEYS.THIRTY_SIX_PROGRESS,
        JSON.stringify(newState),
      );
    } catch {}
    return newState;
  }, [thirtySixState, addGameSession]);

  const prev36Question = useCallback(() => {
    let newState;
    if (thirtySixState.question > 1) {
      newState = {...thirtySixState, question: thirtySixState.question - 1};
    } else if (thirtySixState.set > 1) {
      newState = {set: thirtySixState.set - 1, question: 12};
    } else {
      return thirtySixState;
    }
    setThirtySixState(newState);
    try {
      fastStore.set(
        STORAGE_KEYS.THIRTY_SIX_PROGRESS,
        JSON.stringify(newState),
      );
    } catch {}
    return newState;
  }, [thirtySixState]);

  const reset36Progress = useCallback(() => {
    const initial = {set: 1, question: 1};
    setThirtySixState(initial);
    try {
      fastStore.set(
        STORAGE_KEYS.THIRTY_SIX_PROGRESS,
        JSON.stringify(initial),
      );
    } catch {}
  }, []);

  // ─── Mood Match ───────────────────────────────────────
  const moodCards = useMemo(() => gameContentData.moodCards, []);

  const selectMoodCards = useCallback(
    (partner, cardIds) => {
      if (partner === 'A') {
        setMoodState(prev => ({
          ...prev,
          partnerACards: cardIds,
          phase: 'partnerB',
        }));
      } else {
        setMoodState(prev => ({
          ...prev,
          partnerBCards: cardIds,
          phase: 'reveal',
        }));
        addGameSession('mood-match', {partnerACards: moodState.partnerACards, partnerBCards: cardIds});
      }
    },
    [moodState.partnerACards, addGameSession],
  );

  const getMoodMatchResults = useCallback(() => {
    const matches = moodState.partnerACards.filter(id =>
      moodState.partnerBCards.includes(id),
    );
    return {
      partnerA: moodState.partnerACards,
      partnerB: moodState.partnerBCards,
      matches,
      matchCount: matches.length,
    };
  }, [moodState]);

  const resetMoodMatch = useCallback(() => {
    setMoodState({phase: 'partnerA', partnerACards: [], partnerBCards: []});
  }, []);

  return {
    // Level
    levelPreference,
    setLevelPreference,
    // History
    gameHistory,
    getLastPlayed,
    addGameSession,
    // Favorites
    favoritePrompts,
    toggleFavoritePrompt,
    isPromptFavorite,
    // Cards
    getRandomCard,
    getFilteredCards,
    // Dice
    rollDice,
    diceResult,
    // Quiz
    quizQuestions,
    quizState,
    quizHighScore,
    submitQuizAnswer,
    resetQuiz,
    // 36 Questions
    thirtySixQuestions,
    thirtySixState,
    getCurrentThirtySixQuestion,
    advance36Question,
    prev36Question,
    reset36Progress,
    // Mood Match
    moodCards,
    moodState,
    selectMoodCards,
    getMoodMatchResults,
    resetMoodMatch,
  };
}
