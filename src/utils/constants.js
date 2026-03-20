import {Dimensions} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export {SCREEN_WIDTH, SCREEN_HEIGHT};

// ─── Color Palette ───────────────────────────────────────
export const COLORS = {
  dark: {
    primary: '#E94560',
    secondary: '#533483',
    accent: '#FF6B6B',
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceLight: '#16213E',
    text: '#FFFFFF',
    textSecondary: '#A0A0B0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
  light: {
    primary: '#D63031',
    secondary: '#6C5CE7',
    accent: '#FF7675',
    background: '#FFF5F5',
    surface: '#FFFFFF',
    surfaceLight: '#FFF0F0',
    text: '#2D3436',
    textSecondary: '#636E72',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
};

export const GRADIENTS = {
  dark: {
    primary: ['#E94560', '#533483'],
    warm: ['#FF6B6B', '#E94560'],
    cool: ['#533483', '#0F3460'],
    gold: ['#FFD700', '#FF8C00'],
  },
  light: {
    primary: ['#D63031', '#6C5CE7'],
    warm: ['#FF7675', '#D63031'],
    cool: ['#6C5CE7', '#3742fa'],
    gold: ['#FFD700', '#FF8C00'],
  },
};

// ─── Typography ──────────────────────────────────────────
export const TYPOGRAPHY = {
  hero: {fontSize: 32, fontWeight: '800', letterSpacing: -0.5},
  h1: {fontSize: 26, fontWeight: '700'},
  h2: {fontSize: 22, fontWeight: '700'},
  h3: {fontSize: 18, fontWeight: '600'},
  body: {fontSize: 16, fontWeight: '400', lineHeight: 24},
  bodySmall: {fontSize: 14, fontWeight: '400', lineHeight: 20},
  caption: {fontSize: 12, fontWeight: '400'},
  button: {fontSize: 16, fontWeight: '600', letterSpacing: 0.5},
};

// ─── Spacing ─────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius ───────────────────────────────────────
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ─── Shadows ─────────────────────────────────────────────
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── Animation Config ────────────────────────────────────
export const ANIMATION_CONFIG = {
  spring: {damping: 15, stiffness: 150, mass: 1},
  springFast: {damping: 20, stiffness: 300, mass: 0.8},
  timing: {duration: 300},
  timingFast: {duration: 150},
};

// ─── Screen Names ────────────────────────────────────────
export const SCREEN_NAMES = {
  SPLASH: 'Splash',
  AGE_GATE: 'AgeGate',
  ONBOARDING: 'Onboarding',
  AUTH: 'Auth',
  LOGIN: 'Login',
  SIGN_UP: 'SignUp',
  SETUP_PIN: 'SetupPin',
  APP_LOCK: 'AppLock',
  MAIN: 'Main',
  EXPLORE: 'Explore',
  GAMES: 'Games',
  HEALTH: 'Health',
  PARTNER: 'Partner',
  PROFILE: 'Profile',
  // Position screens
  POSITION_DETAIL: 'PositionDetail',
  POSITION_OF_THE_DAY: 'PositionOfTheDay',
  CATEGORY_BROWSE: 'CategoryBrowse',
  SEARCH: 'Search',
  FAVORITES: 'Favorites',
  // Game screens
  GAME_TRUTH_OR_DARE: 'GameTruthOrDare',
  GAME_WOULD_YOU_RATHER: 'GameWouldYouRather',
  GAME_QUIZ: 'GameQuiz',
  GAME_MINI: 'GameMini',
  // Health screens
  HEALTH_ARTICLE_DETAIL: 'HealthArticleDetail',
  HEALTH_GUIDES: 'HealthGuides',
  HEALTH_GUIDE_PLAYER: 'HealthGuidePlayer',
  HEALTH_GLOSSARY: 'HealthGlossary',
  HEALTH_CHECKIN: 'HealthCheckIn',
};

// ─── Storage Keys ────────────────────────────────────────
export const STORAGE_KEYS = {
  AGE_VERIFIED: '@age_verified',
  ONBOARDING_COMPLETE: '@onboarding_complete',
  PIN_HASH: '@pin_hash',
  BIOMETRIC_ENABLED: '@biometric_enabled',
  THEME_MODE: '@theme_mode',
  USER_TOKEN: '@user_token',
  FCM_TOKEN: '@fcm_token',
  POTD_CACHE_PREFIX: '@potd_',
  RECENT_SEARCHES: '@recent_searches',
  GAME_HISTORY: '@game_history',
  GAME_FAVORITES: '@game_favorites',
  THIRTY_SIX_PROGRESS: '@36q_progress',
  QUIZ_HIGH_SCORE: '@quiz_high_score',
  GAME_LEVEL_PREF: '@game_level_preference',
  HEALTH_BOOKMARKS: '@health_bookmarks',
  HEALTH_READING_PROGRESS: '@health_reading_progress',
  HEALTH_GUIDE_COMPLETIONS: '@health_guide_completions',
  HEALTH_MOOD_HISTORY: '@health_mood_history',
};

// ─── Firebase Collections ────────────────────────────────
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  COUPLES: 'couples',
  CONTENT: 'content',
  POSITIONS: 'positions',
  HEALTH: 'health',
  GUIDES: 'guides',
  GAMES: 'games',
  APP_CONFIG: 'appConfig',
};

// ─── App Constants ───────────────────────────────────────
// ─── Position Categories ────────────────────────────────
export const POSITION_CATEGORIES = [
  {id: 'beginner', label: 'Beginner Friendly', icon: '🌱'},
  {id: 'intermediate', label: 'Intermediate', icon: '🔥'},
  {id: 'advanced', label: 'Advanced', icon: '💪'},
  {id: 'romantic', label: 'Romantic/Slow', icon: '💕'},
  {id: 'passionate', label: 'Passionate', icon: '🔥'},
  {id: 'standing', label: 'Standing', icon: '🧍'},
  {id: 'sitting', label: 'Sitting', icon: '🪑'},
  {id: 'lying-down', label: 'Lying Down', icon: '🛏️'},
  {id: 'side-by-side', label: 'Side-by-Side', icon: '🤝'},
  {id: 'face-to-face', label: 'Face-to-Face', icon: '👀'},
  {id: 'rear-entry', label: 'Rear Entry', icon: '🔄'},
  {id: 'flexibility', label: 'Flexibility Required', icon: '🤸'},
  {id: 'quickie', label: 'Quickies', icon: '⚡'},
  {id: 'tantric', label: 'Tantric/Spiritual', icon: '🧘'},
  {id: 'pregnancy-safe', label: 'Pregnancy Safe', icon: '🤰'},
];

// ─── Position Sort Options ──────────────────────────────
export const SORT_OPTIONS = [
  {id: 'name_asc', label: 'Name (A-Z)', field: 'name', direction: 'asc'},
  {id: 'name_desc', label: 'Name (Z-A)', field: 'name', direction: 'desc'},
  {id: 'difficulty_asc', label: 'Easiest First', field: 'difficulty', direction: 'asc'},
  {id: 'difficulty_desc', label: 'Hardest First', field: 'difficulty', direction: 'desc'},
  {id: 'intimacy_desc', label: 'Most Intimate', field: 'intimacyLevel', direction: 'desc'},
  {id: 'intimacy_asc', label: 'Least Intimate', field: 'intimacyLevel', direction: 'asc'},
];

// ─── Game Levels ────────────────────────────────────────
export const GAME_LEVELS = [
  {id: 'mild', label: 'Mild', color: '#4CAF50'},
  {id: 'medium', label: 'Medium', color: '#FF9800'},
  {id: 'spicy', label: 'Spicy', color: '#FF5722'},
  {id: 'extreme', label: 'Extreme', color: '#F44336'},
];

// ─── Game Categories ────────────────────────────────────
export const GAME_CATEGORIES = [
  {id: 'truth-or-dare', label: 'Truth or Dare', icon: '🎭', gradient: 'warm', description: 'Reveal secrets or take on daring challenges together'},
  {id: 'would-you-rather', label: 'Would You Rather', icon: '🤔', gradient: 'cool', description: 'Explore preferences and spark deep conversations'},
  {id: 'intimacy-quiz', label: 'Intimacy Quiz', icon: '🧠', gradient: 'primary', description: 'Test your knowledge about love, health & connection'},
  {id: 'desire-dice', label: 'Desire Dice', icon: '🎲', gradient: 'gold', description: 'Roll for spontaneous actions and body part combos'},
  {id: '36-questions', label: '36 Questions', icon: '💬', gradient: 'cool', description: 'Deepen your bond with questions designed to build closeness'},
  {id: 'mood-match', label: 'Mood Match', icon: '🎨', gradient: 'warm', description: 'Discover if you and your partner are in sync tonight'},
];

// ─── Health Categories ─────────────────────────────────
export const HEALTH_CATEGORIES = [
  {id: 'anatomy-pleasure', label: 'Anatomy & Pleasure', icon: '🧬', gradient: 'warm'},
  {id: 'communication', label: 'Communication', icon: '💬', gradient: 'cool'},
  {id: 'consent-boundaries', label: 'Consent & Boundaries', icon: '🤝', gradient: 'primary'},
  {id: 'health-safety', label: 'Health & Safety', icon: '🛡️', gradient: 'cool'},
  {id: 'emotional-intimacy', label: 'Emotional Intimacy', icon: '💕', gradient: 'warm'},
  {id: 'common-concerns', label: 'Common Concerns', icon: '❓', gradient: 'primary'},
  {id: 'wellness-practices', label: 'Wellness Practices', icon: '🧘', gradient: 'gold'},
];

// ─── Guide Categories ──────────────────────────────────
export const GUIDE_CATEGORIES = [
  {id: 'sensate-focus', label: 'Sensate Focus', icon: '✋'},
  {id: 'mindful-intimacy', label: 'Mindful Intimacy', icon: '🧘'},
  {id: 'communication-exercises', label: 'Communication', icon: '💬'},
  {id: 'breathing', label: 'Breathing', icon: '🌬️'},
  {id: 'kegel', label: 'Kegel Exercises', icon: '💪'},
];

// ─── Wellness Moods ────────────────────────────────────
export const WELLNESS_MOODS = [
  {id: 'great', emoji: '😊', label: 'Great', color: '#4CAF50'},
  {id: 'good', emoji: '🙂', label: 'Good', color: '#8BC34A'},
  {id: 'okay', emoji: '😐', label: 'Okay', color: '#FF9800'},
  {id: 'low', emoji: '😔', label: 'Low', color: '#FF5722'},
  {id: 'stressed', emoji: '😰', label: 'Stressed', color: '#F44336'},
  {id: 'anxious', emoji: '😟', label: 'Anxious', color: '#9C27B0'},
  {id: 'loved', emoji: '🥰', label: 'Loved', color: '#E91E63'},
  {id: 'connected', emoji: '💞', label: 'Connected', color: '#E94560'},
  {id: 'playful', emoji: '😏', label: 'Playful', color: '#FF6B6B'},
  {id: 'tired', emoji: '😴', label: 'Tired', color: '#607D8B'},
];

export const MIN_AGE = 18;
export const PIN_LENGTH = 4;
export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCKOUT_SECONDS = 30;
export const PARTNER_CODE_LENGTH = 6;
