# IntimateConnect — Complete Project Documentation

## Overview
**IntimateConnect** is a couples' sexual wellness & education app built with React Native CLI. It provides position guides with SVG illustrations, couples games, health articles, partner connectivity, and personal wellness tracking — all with end-to-end encryption for sensitive data.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native CLI | 0.73.6 |
| Language | JavaScript (plain, no TypeScript) | ES2020+ |
| JS Engine | Hermes | Built-in |
| Backend | Firebase v19 (@react-native-firebase) | 19.3.0 |
| Auth | Firebase Authentication | Email/Password |
| Database | Cloud Firestore | Real-time sync |
| Push | Firebase Cloud Messaging | FCM |
| Storage | Firebase Storage | Profile photos |
| Navigation | React Navigation v6 | Stack + Bottom Tabs |
| Animation | react-native-reanimated | 3.16.7 |
| SVG | react-native-svg | 14.1.0 |
| Local Storage | react-native-mmkv (fast) | 2.12.2 |
| Secure Storage | react-native-encrypted-storage | 4.0.3 |
| Encryption | crypto-js (AES) | 4.2.0 |
| UI Gradient | react-native-linear-gradient | 2.8.3 |
| Haptics | react-native-haptic-feedback | 2.3.4 |
| Biometrics | react-native-biometrics | 3.0.1 |

---

## Architecture Patterns

### State Management
- **Context API + Custom Hooks** (no Redux)
- 5 Context Providers nested in App.js:
  ```
  ThemeProvider → AuthProvider → CoupleProvider → ContentProvider → TrackerProvider
  ```
- Each provider wraps a custom hook that contains all business logic

### Data Strategy
- **Offline-first**: All content bundled as JSON files
- **Firestore**: User-specific data (favorites, ratings, notes, couple data)
- **MMKV (fastStore)**: Non-sensitive cached data (theme, flags, reading progress)
- **EncryptedStorage (secureStore)**: Sensitive data (PIN hash, tokens)
- **AES Encryption**: Personal notes and journal entries encrypted with user UID as key

### Module Resolution (Babel Aliases)
```
@api        → ./src/api
@assets     → ./src/assets
@components → ./src/components
@context    → ./src/context
@hooks      → ./src/hooks
@navigation → ./src/navigation
@screens    → ./src/screens
@services   → ./src/services
@utils      → ./src/utils
@data       → ./src/data
```

### Build Configuration
- **Package**: `com.intimateconnect`
- **Version**: 1.0 (versionCode: 1)
- **Signing**: Release keystore at `android/app/intimateconnect-release.keystore`
- **Windows Build Fix**: Junction symlink `C:\IC` → project path (required for CMake MAX_PATH issue with reanimated)
- **Two-step build**: Bundle JS from original path + native build from junction path

---

## Directory Structure

```
IntimateConnect/
├── index.js                          # Entry point
├── App.js                            # Root component (providers + navigation)
├── app.json                          # App name: IntimateConnect
├── package.json
├── babel.config.js                   # Aliases + reanimated plugin
├── android/
│   └── app/
│       ├── build.gradle              # Package, signing, dependencies
│       ├── intimateconnect-release.keystore
│       └── google-services.json      # Firebase config (user must add)
└── src/
    ├── api/
    │   ├── encryption.js
    │   └── firebase/
    │       ├── auth.js               # Auth + user profile + partner codes
    │       ├── firestore.js          # CRUD + subscriptions + batch writes
    │       ├── messaging.js          # FCM tokens + topics + listeners
    │       └── storage.js            # File upload/download
    ├── assets/
    │   ├── animations/               # (empty - for future Lottie files)
    │   ├── fonts/                    # (empty - for custom fonts)
    │   ├── icons/                    # (empty - for icon assets)
    │   ├── illustrations/            # (empty - for illustration assets)
    │   └── images/                   # (empty - for image assets)
    ├── components/
    │   ├── common/                   # 14 shared UI components
    │   ├── games/                    # 3 game-specific components
    │   ├── health/                   # 3 health-specific components
    │   ├── partner/                  # 8 partner-specific components
    │   ├── positions/                # 8 position-specific components (incl. SVG)
    │   └── tracker/                  # 5 tracker-specific components
    ├── context/                      # 5 context providers
    ├── data/
    │   ├── positions.json            # 112 positions (105 original + 7 kamasutra)
    │   ├── posePrimitives.js         # SVG body model + forward kinematics
    │   ├── poseTemplates.js          # 15 base pose templates
    │   ├── positionPoses.js          # 112 position → pose mappings
    │   ├── games/
    │   │   ├── gameContent.json      # Game configurations
    │   │   ├── truthOrDare.json      # Truth or Dare content (4 levels)
    │   │   └── wouldYouRather.json   # Would You Rather content (4 levels)
    │   └── health/
    │       ├── articles.json         # 35 educational articles (7 categories)
    │       ├── guides.json           # 15 guided wellness practices (5 categories)
    │       └── glossary.json         # 90 sexual health terms
    ├── hooks/                        # 13 custom hooks
    ├── navigation/                   # 8 navigator files
    ├── screens/
    │   ├── auth/                     # 7 auth screens
    │   └── main/
    │       ├── explore/              # 6 position screens
    │       ├── games/                # 5 game screens
    │       ├── health/               # 6 health screens
    │       ├── partner/              # 4 partner screens
    │       └── profile/              # 9 profile/settings screens
    ├── services/
    │   ├── NotificationService.js    # FCM initialization + listeners
    │   └── OfflineSyncService.js     # Offline queue + sync
    └── utils/
        ├── constants.js              # All app constants + config
        ├── dateUtils.js              # Date formatting helpers
        ├── encryptionUtils.js        # MMKV + EncryptedStorage + AES
        ├── helpers.js                # Responsive sizing + utilities
        ├── logger.js                 # Tagged console logger
        └── validators.js             # Input validation
```

**Total: 131 JS files + 10 JSON data files**

---

## Navigation Flow

```
App Launch
  → SplashScreen (loading)
  → AgeVerificationScreen (18+ gate)
  → OnboardingScreen (first-time intro)
  → AuthNavigator
      ├── LoginScreen
      └── SignUpScreen
  → SetupPinScreen (create 4-digit PIN)
  → AppLockScreen (unlock with PIN/biometrics)
  → MainTabNavigator (5 tabs)
      ├── Explore Tab (ExploreNavigator)
      │     ├── ExploreScreen (hub: grid/list, filters, categories)
      │     ├── PositionDetailScreen (full detail + animated SVG)
      │     ├── PositionOfTheDayScreen (daily featured)
      │     ├── CategoryBrowseScreen (by category)
      │     ├── SearchScreen (full-text search with scoring)
      │     └── FavoritesScreen (saved positions)
      │
      ├── Games Tab (GamesNavigator)
      │     ├── GamesScreen (hub: game cards)
      │     ├── TruthOrDareScreen (4 spice levels)
      │     ├── WouldYouRatherScreen (4 spice levels)
      │     ├── QuizScreen (couples knowledge quiz)
      │     └── MiniGamesScreen (dice roller, 36 questions, etc.)
      │
      ├── Health Tab (HealthNavigator)
      │     ├── HealthScreen (hub: categories, daily tip, recent)
      │     ├── ArticleDetailScreen (dual: list mode + detail mode)
      │     ├── GuidesScreen (guided practices with filters)
      │     ├── GuidePlayerScreen (step-by-step with timer)
      │     ├── GlossaryScreen (A-Z index + search + bottom sheet)
      │     └── WellnessCheckInScreen (mood picker + encrypted notes)
      │
      ├── Partner Tab (PartnerNavigator)
      │     ├── PartnerScreen (hub: connect/disconnect, stats)
      │     ├── SharedFavoritesScreen (mutual favorites)
      │     ├── WantToTryScreen (wish list)
      │     ├── ActivityScreen (activity feed)
      │     └── PositionDetailScreen (shared)
      │
      └── Profile Tab (ProfileNavigator)
            ├── ProfileScreen (dashboard: stats, badges)
            ├── JournalScreen (encrypted journal list)
            ├── JournalEditScreen (create/edit entries)
            ├── KegelScreen (exercise tracker)
            ├── KegelTimerScreen (workout timer with ring)
            ├── GoalsScreen (wellness goals)
            ├── BadgesScreen (11 achievement badges)
            ├── SettingsScreen (theme, disguise, notifications)
            └── ChangePinScreen (update PIN)
```

---

## Screen Names (SCREEN_NAMES constant)

| Key | Value | Navigator |
|-----|-------|-----------|
| SPLASH | 'Splash' | Root |
| AGE_GATE | 'AgeGate' | Root |
| ONBOARDING | 'Onboarding' | Root |
| AUTH | 'Auth' | Root |
| LOGIN | 'Login' | Auth |
| SIGN_UP | 'SignUp' | Auth |
| SETUP_PIN | 'SetupPin' | Root |
| APP_LOCK | 'AppLock' | Root |
| MAIN | 'Main' | Root |
| EXPLORE | 'Explore' | MainTab |
| GAMES | 'Games' | MainTab |
| HEALTH | 'Health' | MainTab |
| PARTNER | 'Partner' | MainTab |
| PROFILE | 'Profile' | MainTab |
| POSITION_DETAIL | 'PositionDetail' | Explore |
| POSITION_OF_THE_DAY | 'PositionOfTheDay' | Explore |
| CATEGORY_BROWSE | 'CategoryBrowse' | Explore |
| SEARCH | 'Search' | Explore |
| FAVORITES | 'Favorites' | Explore |
| GAME_TRUTH_OR_DARE | 'GameTruthOrDare' | Games |
| GAME_WOULD_YOU_RATHER | 'GameWouldYouRather' | Games |
| GAME_QUIZ | 'GameQuiz' | Games |
| GAME_MINI | 'GameMini' | Games |
| HEALTH_ARTICLE_DETAIL | 'HealthArticleDetail' | Health |
| HEALTH_GUIDES | 'HealthGuides' | Health |
| HEALTH_GUIDE_PLAYER | 'HealthGuidePlayer' | Health |
| HEALTH_GLOSSARY | 'HealthGlossary' | Health |
| HEALTH_CHECKIN | 'HealthCheckIn' | Health |
| PARTNER_SHARED_FAVORITES | 'PartnerSharedFavorites' | Partner |
| PARTNER_WANT_TO_TRY | 'PartnerWantToTry' | Partner |
| PARTNER_ACTIVITY | 'PartnerActivity' | Partner |
| TRACKER_JOURNAL | 'TrackerJournal' | Profile |
| TRACKER_JOURNAL_EDIT | 'TrackerJournalEdit' | Profile |
| TRACKER_KEGEL | 'TrackerKegel' | Profile |
| TRACKER_KEGEL_TIMER | 'TrackerKegelTimer' | Profile |
| TRACKER_GOALS | 'TrackerGoals' | Profile |
| TRACKER_BADGES | 'TrackerBadges' | Profile |
| SETTINGS | 'Settings' | Profile |
| CHANGE_PIN | 'ChangePin' | Profile |

---

## Context Providers & Hooks

### ThemeContext (`useTheme`)
- **State**: `theme`, `isDark`
- **Actions**: `toggleTheme()`, `setTheme(mode)`
- **Theme object**: colors (18 color tokens), gradients (4 gradient arrays), typography, spacing, borderRadius

### AuthContext (`useAuth`)
- **State**: `user`, `userProfile`, `isLoading`, `isAuthenticated`, `isAgeVerified`, `isOnboardingComplete`, `isPinSet`, `isAppLocked`
- **Actions**: `verifyAge()`, `completeOnboarding()`, `signUp(email, pass, name)`, `signIn(email, pass)`, `logout()`, `setPin(pin)`, `checkPin(pin)`, `unlockApp()`, `lockApp()`

### CoupleContext (`useCouple`)
- **State**: `coupleData`, `partnerProfile`, `partnerCode`, `isConnected`, `wantToTryList`, `sharedFavorites`, `activityFeed`, `isLoading`
- **Actions**: `connectByCode(code)`, `disconnect()`, `regenerateCode()`, `addToWantToTry(positionId)`, `removeFromWantToTry(positionId)`, `markAsTried(positionId)`, `addActivity(type, data)`, `loadMoreActivity()`, `refreshSharedFavorites()`

### ContentContext (`useContent`)
- Aggregates three hooks: `usePositions()`, `useGames()`, `useHealth()`
- **Position data**: `positions`, `filteredPositions`, `categories`, `positionOfTheDay`, `favorites`, `favoritePositions`
- **Position actions**: `getPositionById()`, `getUserPositionData()`, `getDecryptedNote()`, `toggleFavorite()`, `setRating()`, `markAsTried()`, `savePersonalNote()`
- **Filtering**: `searchPositions()`, `filterByCategory()`, `filterByDifficulty()`, `filterByIntimacy()`, `sortPositions()`, `applyFilters()`, `resetFilters()`
- **Search**: `getRecentSearches()`, `addRecentSearch()`, `clearRecentSearches()`
- **Games**: `games` (useGames hook output)
- **Health**: `health` (useHealth hook output — articles, guides, glossary, mood)

### TrackerContext (`useTrackerContext`)
- **State**: `journalEntries`, `kegelSessions`, `goals`, `earnedBadges`, `isLoading`
- **Computed**: `journalStreak`, `kegelStreak`, `totalKegelMinutes`, `completedGoalsCount`, `activeGoals`, `weeklyStats`, `allBadges`
- **Journal**: `addJournalEntry(title, content, moodTag, tags)`, `updateJournalEntry(id, updates)`, `deleteJournalEntry(id)`, `getDecryptedEntry(id)`
- **Kegels**: `addKegelSession(duration, reps, intensity, guideId)`
- **Goals**: `addGoal(title, category, targetDate)`, `updateGoalProgress(id, progress)`, `completeGoal(id)`, `deleteGoal(id)`
- **Badges**: `checkAndAwardBadges()` (auto-awards based on activity)

---

## Custom Hooks Detail

### usePositions()
- Loads bundled `positions.json` (112 positions)
- **djb2Hash** for daily Position of the Day rotation
- **Search scoring**: title match (100/50/30 pts), tags (40/20), category (15), description (10)
- MMKV persistence for favorites, ratings, tried status
- Firestore real-time sync on `users/{uid}/positionData/preferences`
- AES-encrypted personal notes per position

### useGames()
- Loads bundled game content JSON files
- Manages game history, favorites, level preferences
- 36 Questions progress tracking
- Quiz high score persistence

### useHealth()
- Loads bundled articles (35), guides (15), glossary (90 terms)
- **djb2Hash** for daily featured article rotation
- **Search scoring**: title (100/50/30), tags (40/20), category (15), summary (10), headings (15), body (5)
- Bookmarks, reading progress, guide completions in MMKV
- Firestore sync on `users/{uid}/healthData/preferences`
- Mood history with AES-encrypted notes

### useTracker(moodHistoryLength, completedGuidesCount)
- Firestore subscriptions on `users/{uid}/journal`, `users/{uid}/kegels`, `users/{uid}/goals`, `users/{uid}/badges`
- Journal entries encrypted with AES (encryptedContent field)
- Streak calculation for journal and kegel consistency
- Badge system (11 badges) with auto-award logic

### useCouple()
- Partner code system (6-char alphanumeric codes)
- Firestore `partnerCodes` collection for code lookup
- Firestore `couples/{coupleId}` for shared data
- Real-time sync for want-to-try list and activity feed
- Shared favorites computed from both partners' data

### useHaptic()
- Wraps `react-native-haptic-feedback`
- Exports: `trigger`, `light`, `medium`, `heavy`, `success`, `error`, `selection`

### useOfflineSync()
- Connectivity check via Firestore ping
- Pending operations queue in MMKV
- Auto-sync on reconnection

---

## Component Library

### Common Components (14)
| Component | Purpose |
|-----------|---------|
| GradientButton | Primary CTA with linear gradient + press animation |
| GlassCard | Glassmorphism card with blur + border |
| EncryptedInput | TextInput with encryption indicator |
| PinInput | 4-digit PIN entry with masked dots |
| AnimatedToggle | Animated switch toggle |
| BottomSheet | Modal bottom sheet with drag handle |
| SkeletonLoader | Loading placeholder animation |
| EmptyState | Empty list illustration + message |
| SearchBar | Search input with icon + clear button |
| FilterChips | Horizontal scrollable filter pills |
| Toast | Toast notification system (success/error/info) |
| SyncStatusBar | Offline/syncing status indicator |
| ErrorBoundary | Error catching with fallback UI |

### Position Components (8)
| Component | Purpose |
|-----------|---------|
| PositionCard | Grid/list card with SVG illustration |
| PositionSVG | Static 2-figure SVG composition |
| AnimatedPositionSVG | Animated SVG with step transitions |
| HumanFigure | Single human silhouette SVG renderer |
| DifficultyStars | 1-5 star difficulty display |
| IntimacyMeter | Intimacy level bar indicator |
| StepByStepGuide | How-to steps with expandable content |
| PositionFilters | Filter controls (category, difficulty, sort) |

### Game Components (3)
| Component | Purpose |
|-----------|---------|
| GameCard | Game selection card with gradient |
| DiceRoller | Animated dice with random result |
| QuizCard | Quiz question card with options |

### Health Components (3)
| Component | Purpose |
|-----------|---------|
| ArticleCard | Article preview with progress bar |
| GuideStepCard | Guide step with timer controls |
| MoodSelector | 2-row emoji mood grid with selection animation |

### Partner Components (8)
| Component | Purpose |
|-----------|---------|
| PartnerCodeCard | Display own partner code |
| CodeEntryCard | Enter partner's code to connect |
| PartnerInfoCard | Connected partner info display |
| CoupleStatsCard | Shared statistics dashboard |
| QuickActionGrid | Quick action buttons grid |
| WantToTryItem | Want-to-try list item with actions |
| ActivityItem | Activity feed item |
| DisconnectButton | Partner disconnect with confirmation |

### Tracker Components (5)
| Component | Purpose |
|-----------|---------|
| TrackerDashboard | Stats overview with streaks |
| JournalEntryCard | Journal entry preview card |
| KegelTimerRing | Circular timer with SVG ring |
| GoalCard | Goal progress card |
| BadgeCard | Achievement badge display |

---

## SVG Illustration System

### Architecture
Positions use programmatic SVG stick-figure silhouettes (not images):
1. **posePrimitives.js** — Body model (12 joints per figure), forward kinematics, interpolation
2. **poseTemplates.js** — 15 base pose templates mapped to position categories
3. **positionPoses.js** — 112 position-to-template mappings with unique angle overrides

### Body Model
Each figure has: head, shoulder center, left/right shoulder, left/right elbow, left/right hand, hip center, left/right hip, left/right knee, left/right foot

### Pose Config Schema
```javascript
{
  x, y,                    // Base position (hip center)
  bodyAngle,               // Overall body rotation
  torsoAngle,              // Torso tilt from vertical
  headTilt,                // Head tilt relative to torso
  leftArm: { shoulder, elbow },
  rightArm: { shoulder, elbow },
  leftLeg: { hip, knee },
  rightLeg: { hip, knee },
}
```

### Templates (15)
lyingFaceToFace, lyingRearEntry, proneRear, sideBySide, sittingFaceToFace, sittingRearEntry, tantricSeated, onTopFaceToFace, onTopReverse, standingFaceToFace, standingRear, standingLifted, edgeFurniture, kneeling, acrobatic

### Rendering
- **HumanFigure** — Renders filled silhouette using SVG Path (bezier torso with waist curve), Ellipse (head), tapered limb paths, joint circles
- **PositionSVG** — Composes 2 figures (Person A = warm red, Person B = cool purple) with radial glow background
- **AnimatedPositionSVG** — JS-driven animation interpolating between howTo step poses with ease-out cubic timing

### Sizes
- small: 80x80 (PositionCard grid)
- medium: 160x160 (PositionCard list)
- large: 280x220 (detail screen hero)

---

## Data Schemas

### Position (positions.json)
```json
{
  "id": "pos_001",
  "name": "The Lotus",
  "alternateNames": ["Padmasana", "Sitting Embrace"],
  "category": ["face-to-face", "sitting", "romantic", "tantric"],
  "difficulty": 3,
  "intimacyLevel": 5,
  "flexibilityRequired": 3,
  "staminaRequired": 3,
  "description": "...",
  "howTo": [
    {"step": 1, "text": "..."},
    {"step": 2, "text": "..."},
    {"step": 3, "text": "..."}
  ],
  "tips": ["...", "..."],
  "physicalNotes": "...",
  "bestFor": ["deep connection", "slow pace"],
  "relatedPositions": ["pos_002", "pos_015"]
}
```
**Total: 112 positions** (pos_001 to pos_112, includes 7 Kamasutra positions pos_106-112)

### Article (articles.json)
```json
{
  "id": "art_001",
  "title": "...",
  "category": "anatomy-pleasure",
  "icon": "emoji",
  "summary": "...",
  "readTimeMinutes": 7,
  "sections": [{"heading": "...", "body": "..."}],
  "keyTakeaways": ["..."],
  "didYouKnow": "...",
  "relatedArticles": ["art_002"],
  "tags": ["anatomy", "pleasure"]
}
```
**Categories**: anatomy-pleasure, communication, consent-boundaries, emotional-intimacy, health-safety, common-concerns, wellness-practices

### Guide (guides.json)
```json
{
  "id": "guide_001",
  "title": "...",
  "category": "sensate-focus",
  "icon": "emoji",
  "duration": "15 min",
  "difficulty": "beginner",
  "description": "...",
  "steps": [{"step": 1, "title": "...", "description": "...", "durationSeconds": 120, "tip": "..."}],
  "benefits": ["..."],
  "relatedGuides": ["guide_002"]
}
```
**Categories**: sensate-focus, breathing, mindful-intimacy, communication-exercises, kegel

### Glossary Term (glossary.json)
```json
{
  "id": "term_001",
  "term": "Abstinence",
  "definition": "...",
  "category": "health",
  "relatedTerms": ["term_012"]
}
```
**Categories**: anatomy, health, psychology, practices, communication

---

## Firebase Structure

### Firestore Collections
```
users/{uid}/
  ├── (user profile doc: displayName, email, partnerCode, partnerId, coupleId, createdAt)
  ├── positionData/
  │     └── preferences (favorites, ratings, triedPositions, personalNotes)
  ├── healthData/
  │     └── preferences (bookmarks, readingProgress, guideCompletions)
  ├── journal/{entryId}     (encrypted journal entries)
  ├── kegels/{sessionId}    (kegel exercise sessions)
  ├── goals/{goalId}        (wellness goals)
  └── badges/{badgeId}      (earned achievement badges)

couples/{coupleId}/
  ├── (couple doc: partnerA, partnerB, connectedAt)
  └── activity/{activityId} (activity feed entries)

partnerCodes/{code}
  └── (code doc: uid, displayName, createdAt)

appConfig/
  └── ping (connectivity check doc)
```

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /couples/{coupleId}/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /partnerCodes/{code} {
      allow read, write: if request.auth != null;
    }
    match /appConfig/{doc} {
      allow read: if request.auth != null;
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /content/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## Storage Keys (MMKV + EncryptedStorage)

| Key | Storage | Purpose |
|-----|---------|---------|
| @age_verified | MMKV | Age verification flag |
| @onboarding_complete | MMKV | Onboarding completion flag |
| @pin_hash | EncryptedStorage | Hashed PIN |
| @biometric_enabled | MMKV | Biometric preference |
| @theme_mode | MMKV | dark/light theme |
| @user_token | EncryptedStorage | Auth token |
| @fcm_token | EncryptedStorage | FCM push token |
| @potd_{date} | MMKV | Position of the Day cache |
| @recent_searches | MMKV | Search history |
| @game_history | MMKV | Game play history |
| @game_favorites | MMKV | Favorite games |
| @36q_progress | MMKV | 36 Questions game progress |
| @quiz_high_score | MMKV | Quiz high score |
| @game_level_preference | MMKV | Preferred game spice level |
| @health_bookmarks | MMKV | Bookmarked articles |
| @health_reading_progress | MMKV | Article reading % per article |
| @health_guide_completions | MMKV | Completed guides list |
| @health_mood_history | MMKV | Mood check-in history (encrypted notes) |
| @couple_data | MMKV | Cached couple data |
| @couple_want_to_try | MMKV | Want-to-try list cache |
| @couple_activity | MMKV | Activity feed cache |
| @couple_shared_favorites | MMKV | Shared favorites cache |
| @tracker_journal | MMKV | Journal entries cache (encrypted) |
| @tracker_kegels | MMKV | Kegel sessions cache |
| @tracker_goals | MMKV | Goals cache |
| @tracker_badges | MMKV | Badges cache |
| @disguise_mode | MMKV | Disguise mode enabled |
| @pending_sync_ops | MMKV | Offline sync queue |

---

## Position Categories (16)

| Category | Color | Icon |
|----------|-------|------|
| beginner | #4CAF50 | 🌱 |
| intermediate | #FF9800 | ⚡ |
| advanced | #F44336 | 🔥 |
| romantic | #E91E63 | 💕 |
| passionate | #FF5722 | 🌶️ |
| standing | #2196F3 | 🧍 |
| sitting | #9C27B0 | 🪑 |
| lying-down | #3F51B5 | 🛏️ |
| side-by-side | #00BCD4 | ↔️ |
| face-to-face | #E94560 | 👫 |
| rear-entry | #FF7043 | 🔄 |
| flexibility | #8BC34A | 🤸 |
| quickie | #FFC107 | ⏱️ |
| tantric | #7C4DFF | 🕉️ |
| pregnancy-safe | #26A69A | 🤰 |
| kamasutra | #FF6B35 | 🪷 |

---

## Badge System (11 badges)

| Badge ID | Name | Requirement |
|----------|------|-------------|
| first_try | First Steps | Mark first position as tried |
| explorer_10 | Explorer | Try 10 different positions |
| explorer_25 | Adventurer | Try 25 different positions |
| journal_7 | Reflective | 7-day journal streak |
| kegel_master | Kegel Master | Complete 30 kegel sessions |
| bookworm | Bookworm | Read 10 health articles |
| guide_complete | Guide Graduate | Complete 5 wellness guides |
| mood_tracker | Self-Aware | Log mood for 14 days |
| goal_setter | Goal Setter | Complete 3 wellness goals |
| couple_connected | Better Together | Connect with a partner |
| well_rounded | Well Rounded | Earn 5 other badges |

---

## Security Features

1. **Age Gate**: 18+ verification required before app access
2. **PIN Lock**: 4-digit PIN with max 5 attempts and 30-second lockout
3. **Biometric**: Optional fingerprint/face unlock
4. **AES Encryption**: Personal notes and journal entries encrypted with user UID
5. **Encrypted Storage**: PIN hash and auth tokens in secure storage
6. **Disguise Mode**: Notifications display generic text
7. **Firestore Rules**: User data isolated by UID
8. **No plaintext secrets**: All sensitive data encrypted at rest

---

## Build Commands

### JS Bundle
```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

### Debug APK
```bash
# Create junction (Windows MAX_PATH fix for reanimated CMake)
mklink /J C:\IC "C:\Users\Pc\Desktop\IntimateConnect"

# Build from junction
cd C:\IC\android
gradlew.bat assembleDebug
```

### Release APK
```bash
cd C:\IC\android
gradlew.bat assembleRelease
```

### APK Location
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

---

## Firebase Setup (Required)

1. Create Firebase project at console.firebase.google.com
2. Add Android app with package `com.intimateconnect`
3. Download `google-services.json` → place in `android/app/`
4. Enable **Authentication** (Email/Password)
5. Create **Firestore Database** (production mode, asia-south1)
6. Publish Firestore rules (see above)
7. Publish Storage rules (see above)

---

## Key Algorithms

### djb2Hash (Position of the Day / Daily Featured Article)
Used to deterministically select a daily position/article based on date string:
```javascript
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned
}
const index = djb2Hash(dateString) % items.length;
```

### Search Scoring
Weighted scoring for intelligent search results:
- Exact title match: 100 pts
- Title starts with query: 50 pts
- Title contains query: 30 pts
- Tag exact match: 40 pts
- Tag contains query: 20 pts
- Category match: 15 pts
- Description/summary contains: 10 pts
- Body/section heading: 15 pts
- Body text: 5 pts

### Partner Code System
- 6-character alphanumeric code generated per user
- Stored in `partnerCodes/{code}` Firestore collection
- Code lookup → find partner UID → create couple document
- Both users' profiles updated with coupleId and partnerId

---

## Known Issues & Notes

- **Windows MAX_PATH**: CMake builds for reanimated fail without junction symlink. Always build from `C:\IC` junction.
- **No TypeScript**: Entire codebase is plain JavaScript by design.
- **No Expo**: Pure React Native CLI — no Expo dependencies.
- **Hermes enabled**: JS engine is Hermes (default for RN 0.73).
- **react-native-svg v14.1.0**: v15+ incompatible with RN 0.73.6.
- **Placeholder assets**: `src/assets/` subdirectories are empty — ready for future image/font assets.
- **Offline queue**: Pending Firestore operations stored in MMKV, synced on reconnection.
