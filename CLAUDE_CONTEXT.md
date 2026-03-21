# IntimateConnect — Claude Developer Context Document

> **Purpose**: This document gives Claude (or any AI assistant) full context to work on this project in any future session, even with zero prior conversation history. Read this BEFORE making any changes.

---

## CRITICAL RULES — READ FIRST

1. **Plain JavaScript ONLY** — No TypeScript. No `.ts` or `.tsx` files. Ever.
2. **React Native CLI 0.73.6** — NOT Expo. Never add Expo dependencies.
3. **No Redux** — State management is Context API + custom hooks.
4. **Offline-first** — Content is bundled as JSON. Firestore is for user-specific data only.
5. **Babel aliases** — Always use `@components/...`, `@hooks/...`, `@utils/...` etc. Never relative `../../..` paths.
6. **reanimated plugin MUST be last** in babel.config.js plugins array.
7. **Windows MAX_PATH fix** — Native Android builds MUST use junction symlink `C:\IC` → project path. JS bundling can use original path.
8. **react-native-svg must stay at v14.1.0** — v15+ is incompatible with RN 0.73.6.
9. **Encryption** — Personal notes, journal entries, and mood notes are AES-encrypted with user UID as key. Never store plaintext.
10. **Firestore paths** — User subcollections use `users/{uid}/collectionName` (3 segments = valid). NEVER use 4-segment paths in `.collection()`.

---

## What This App Is

IntimateConnect is a couples' sexual wellness & education Android app. It has:
- **112 positions** with SVG stick-figure illustrations, difficulty ratings, step-by-step guides
- **Couples games**: Truth or Dare, Would You Rather, Quiz, Mini Games (dice, 36 questions)
- **Health encyclopedia**: 35 articles, 15 guided practices, 90 glossary terms
- **Partner system**: 6-char code pairing, shared favorites, want-to-try list, activity feed
- **Personal tracker**: Encrypted journal, kegel timer, wellness goals, 11 achievement badges
- **Security**: Age gate (18+), 4-digit PIN lock, biometrics, disguise mode, AES encryption

---

## Project Location

```
C:\Users\Pc\Desktop\IntimateConnect\
```

---

## Tech Stack (exact versions matter)

```
react: 18.2.0
react-native: 0.73.6 (CLI, NOT Expo)
@react-native-firebase/*: 19.3.0
@react-navigation/native: 6.1.18
@react-navigation/stack: 6.4.1
@react-navigation/bottom-tabs: 6.6.1
react-native-reanimated: 3.16.7
react-native-svg: 14.1.0
react-native-mmkv: 2.12.2
react-native-encrypted-storage: 4.0.3
crypto-js: 4.2.0
react-native-linear-gradient: 2.8.3
react-native-haptic-feedback: 2.3.4
react-native-biometrics: 3.0.1
react-native-gesture-handler: 2.16.2
react-native-safe-area-context: 4.8.2
react-native-screens: 3.29.0
react-native-modal: 13.0.1
react-native-toast-message: 2.3.3
```

---

## Babel Aliases (babel.config.js)

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

---

## App Architecture

### Provider Nesting Order (App.js)
```
ErrorBoundary
  GestureHandlerRootView
    ThemeProvider          → useTheme()
      AuthProvider         → useAuth()
        CoupleProvider     → useCouple() via CoupleContext
          ContentProvider  → useContent() [wraps usePositions + useGames + useHealth]
            TrackerProvider → useTrackerContext() [wraps useTracker]
              NavigationContainer
                RootNavigator
```

**IMPORTANT**: This nesting order matters. TrackerProvider depends on ContentProvider (reads health.moodHistory). ContentProvider is independent. AuthProvider must wrap everything that needs user state.

### How to Access Data in Screens

```javascript
// Positions, games, health
import {useContent} from '@context/ContentContext';
const {positions, health, games, toggleFavorite, searchPositions} = useContent();

// Health specifically
const {health} = useContent();
health.articles        // array of 35 articles
health.searchArticles(query)
health.getArticleById(id)

// Tracker (journal, kegels, goals, badges)
import {useTrackerContext} from '@context/TrackerContext';
const {journalEntries, addJournalEntry, kegelSessions, goals, earnedBadges} = useTrackerContext();

// Couple/partner
import {CoupleContext} from '@context/CoupleContext';
// or via useCouple hook

// Theme
import {useTheme} from '@context/ThemeContext';
const {theme, isDark, toggleTheme} = useTheme();

// Auth
import {useAuth} from '@context/AuthContext';
const {user, userProfile, isAuthenticated, logout} = useAuth();
```

---

## Navigation Structure

### RootNavigator (conditional rendering based on auth state)
```
if isLoading          → SplashScreen
if !isAgeVerified     → AgeVerificationScreen
if !isOnboardingComplete → OnboardingScreen
if !isAuthenticated   → AuthNavigator (Login, SignUp)
if !isPinSet          → SetupPinScreen
if isAppLocked        → AppLockScreen
else                  → MainTabNavigator
```

### MainTabNavigator (5 bottom tabs)
```
Explore  🔥 → ExploreNavigator
Games    🎮 → GamesNavigator
Health   💊 → HealthNavigator
Partner  💕 → PartnerNavigator
Me       👤 → ProfileNavigator
```

### Sub-navigators and their screens:

**ExploreNavigator** (Stack):
- ExploreScreen → hub with grid/list toggle, filters
- PositionDetailScreen → full detail + animated SVG + step-by-step
- PositionOfTheDayScreen → daily featured position
- CategoryBrowseScreen → filter by category
- SearchScreen → full-text search with scoring
- FavoritesScreen → saved favorites

**GamesNavigator** (Stack):
- GamesScreen → game hub with cards
- TruthOrDareScreen → 4 spice levels
- WouldYouRatherScreen → 4 spice levels
- QuizScreen → couples quiz
- MiniGamesScreen → dice roller, 36 questions, mood match

**HealthNavigator** (Stack):
- HealthScreen → hub with categories, daily tip, recent articles
- ArticleDetailScreen → dual mode (category list OR full article detail)
- GuidesScreen → guided practices list with category filters
- GuidePlayerScreen → step-by-step with countdown timer
- GlossaryScreen → A-Z index, search, bottom sheet term detail
- WellnessCheckInScreen → mood picker + encrypted notes

**PartnerNavigator** (Stack):
- PartnerScreen → connect/disconnect hub, partner code, stats
- SharedFavoritesScreen → mutual favorite positions
- WantToTryScreen → wish list
- ActivityScreen → activity feed
- PositionDetailScreen → shared (same component as Explore)

**ProfileNavigator** (Stack):
- ProfileScreen → dashboard with stats, badge preview
- JournalScreen → encrypted journal list
- JournalEditScreen → create/edit entry
- KegelScreen → exercise tracker
- KegelTimerScreen → workout timer with SVG ring
- GoalsScreen → wellness goals
- BadgesScreen → 11 achievements
- SettingsScreen → theme, disguise, notifications, account
- ChangePinScreen → update PIN

---

## File Map (every file with purpose)

### src/api/ (5 files)
| File | Purpose |
|------|---------|
| encryption.js | AES encrypt/decrypt utilities |
| firebase/auth.js | signUp, signIn, signOut, resetPassword, getUserProfile, subscribeToUserProfile, partnerCode CRUD, linkPartners, deleteAccount |
| firebase/firestore.js | getDocument, setDocument, updateDocument, deleteDocument, addDocument, queryCollection, subscribeToDocument, subscribeToQuery, batchWrite, serverTimestamp |
| firebase/messaging.js | requestPermission, getToken, onMessage, onBackgroundMessage, subscribeToTopic, saveFCMToken |
| firebase/storage.js | File upload/download for profile photos |

### src/context/ (5 files)
| File | Hook | Purpose |
|------|------|---------|
| ThemeContext.js | useTheme() | Dark/light theme, color tokens, typography |
| AuthContext.js | useAuth() | Auth state, age gate, PIN, biometrics, user profile |
| CoupleContext.js | (wraps useCouple) | Partner pairing, shared data |
| ContentContext.js | useContent() | Aggregates usePositions + useGames + useHealth |
| TrackerContext.js | useTrackerContext() | Wraps useTracker, passes health counts for badge logic |

### src/hooks/ (13 files)
| File | Key Exports | Pattern |
|------|------------|---------|
| usePositions.js | positions, filteredPositions, positionOfTheDay, favorites, toggleFavorite, setRating, markAsTried, savePersonalNote, searchPositions, filterByCategory | Loads positions.json, djb2Hash for POTD, search scoring, MMKV + Firestore sync |
| useGames.js | games data, history, favorites, level prefs | Loads game JSON, MMKV persistence |
| useHealth.js | articles, guides, glossary, bookmarks, readingProgress, moodHistory, searchArticles, searchGlossary | Loads health JSONs, djb2Hash for daily article, MMKV + Firestore sync, AES mood notes |
| useTracker.js | journalEntries, kegelSessions, goals, earnedBadges, add/update/delete functions | Firestore subscriptions on users/{uid}/journal,kegels,goals,badges. AES-encrypted journal content |
| useCouple.js | coupleData, partnerProfile, partnerCode, connectByCode, disconnect, wantToTry, activity | Firestore couples/{coupleId}, partnerCodes lookup, real-time sync |
| useHaptic.js | light, medium, heavy, success, error, selection | Haptic feedback triggers |
| useOfflineSync.js | checkConnectivity, syncNow, addPendingOp | Firestore ping, MMKV queue |
| useAuth.js | (re-export of AuthContext hook) | |
| useAppLock.js | App lock logic | PIN check, biometric, lockout |
| useEncryption.js | Encryption operations | |
| useFirestore.js | Firestore operations wrapper | |
| usePartner.js | Partner-specific logic | |
| useSettings.js | Settings management | Theme, notifications, disguise |

### src/components/ (41 components in 6 groups)

**common/ (14)**: GradientButton, GlassCard, EncryptedInput, PinInput, AnimatedToggle, BottomSheet, SkeletonLoader, EmptyState, SearchBar, FilterChips, Toast (showToast, toastConfig), SyncStatusBar, ErrorBoundary

**positions/ (8)**: PositionCard, PositionSVG, AnimatedPositionSVG, HumanFigure, DifficultyStars, IntimacyMeter, StepByStepGuide, PositionFilters

**games/ (3)**: GameCard, DiceRoller, QuizCard

**health/ (3)**: ArticleCard, GuideStepCard, MoodSelector

**partner/ (8)**: PartnerCodeCard, CodeEntryCard, PartnerInfoCard, CoupleStatsCard, QuickActionGrid, WantToTryItem, ActivityItem, DisconnectButton

**tracker/ (5)**: TrackerDashboard, JournalEntryCard, KegelTimerRing, GoalCard, BadgeCard

### src/screens/ (37 screens)
- auth/ (7): SplashScreen, AgeVerificationScreen, OnboardingScreen, LoginScreen, SignUpScreen, SetupPinScreen, AppLockScreen
- main/explore/ (6): ExploreScreen, PositionDetailScreen, PositionOfTheDayScreen, CategoryBrowseScreen, SearchScreen, FavoritesScreen
- main/games/ (5): GamesScreen, TruthOrDareScreen, WouldYouRatherScreen, QuizScreen, MiniGamesScreen
- main/health/ (6): HealthScreen, ArticleDetailScreen, GuidesScreen, GuidePlayerScreen, GlossaryScreen, WellnessCheckInScreen
- main/partner/ (4): PartnerScreen, SharedFavoritesScreen, WantToTryScreen, ActivityScreen
- main/profile/ (9): ProfileScreen, JournalScreen, JournalEditScreen, KegelScreen, KegelTimerScreen, GoalsScreen, BadgesScreen, SettingsScreen, ChangePinScreen

### src/navigation/ (8 files)
RootNavigator, MainTabNavigator, AuthNavigator, ExploreNavigator, GamesNavigator, HealthNavigator, PartnerNavigator, ProfileNavigator

### src/services/ (2 files)
NotificationService.js, OfflineSyncService.js

### src/utils/ (6 files)
constants.js, dateUtils.js, encryptionUtils.js, helpers.js, logger.js, validators.js

### src/data/ (10 files)
positions.json (112 positions), posePrimitives.js, poseTemplates.js, positionPoses.js, games/gameContent.json, games/truthOrDare.json, games/wouldYouRather.json, health/articles.json (35), health/guides.json (15), health/glossary.json (90 terms)

---

## Design System (from constants.js)

### Colors
```
Dark theme:  primary=#E94560, secondary=#533483, accent=#FF6B6B, bg=#0F0F1A, surface=#1A1A2E
Light theme: primary=#D63031, secondary=#6C5CE7, accent=#FF7675, bg=#FFF5F5, surface=#FFFFFF
```

### Gradients
```
primary: [primary, secondary]
warm: [accent, primary]
cool: [secondary, darker]
gold: [#FFD700, #FF8C00]
```

### Typography: hero(32/800), h1(26/700), h2(22/700), h3(18/600), body(16/400), bodySmall(14/400), caption(12/400)
### Spacing: xs=4, sm=8, md=16, lg=24, xl=32, xxl=48
### Border Radius: sm=8, md=12, lg=16, xl=24, full=9999
### Animation: spring{damping:15, stiffness:150}, springFast{damping:20, stiffness:300}, timing{300ms}

---

## SVG Illustration System

### How It Works
Every position has a programmatic SVG illustration (no images). The system:
1. **posePrimitives.js** — Defines body segments (head radius, torso length, limb lengths), forward kinematics function `computeJoints(pose)`, interpolation function, and neutral standing pose
2. **poseTemplates.js** — 15 base templates: lyingFaceToFace, lyingRearEntry, proneRear, sideBySide, sittingFaceToFace, sittingRearEntry, tantricSeated, onTopFaceToFace, onTopReverse, standingFaceToFace, standingRear, standingLifted, edgeFurniture, kneeling, acrobatic
3. **positionPoses.js** — Maps each position ID to a template + angle overrides. `getPoseForPosition(id)` returns `{personA: pose, personB: pose}`. Results are cached.

### Pose Config Shape
```javascript
{ x, y, bodyAngle, torsoAngle, headTilt,
  leftArm: {shoulder, elbow}, rightArm: {shoulder, elbow},
  leftLeg: {hip, knee}, rightLeg: {hip, knee} }
```

### Components
- **HumanFigure** — Renders one silhouette: bezier torso with waist curve, ellipse head, tapered limb paths, joint circles. Color + opacity props.
- **PositionSVG** — Static: 2 HumanFigures in SVG viewBox 200x200. Person A = red (#E94560), Person B = purple (#7C5CFC). Sizes: small(80x80), medium(160x160), large(280x220).
- **AnimatedPositionSVG** — Animated: JS setTimeout loop interpolates between howTo step poses with ease-out cubic. Step dots for manual navigation. Auto-play mode cycles steps.

### Adding a New Position's SVG
In positionPoses.js, add:
```javascript
pos_XXX: {t: 'templateName', a: {overrides for personA}, b: {overrides for personB}},
```

---

## Firestore Data Model

```
users/{uid}                          ← user profile document
  ├── positionData/preferences       ← favorites, ratings, tried, encrypted notes
  ├── healthData/preferences         ← bookmarks, reading progress, guide completions
  ├── journal/{entryId}              ← encrypted journal entries
  ├── kegels/{sessionId}             ← kegel exercise records
  ├── goals/{goalId}                 ← wellness goals
  └── badges/{badgeId}               ← earned badges

couples/{coupleId}                   ← couple document (partnerA, partnerB, connectedAt)
  └── activity/{activityId}          ← activity feed entries

partnerCodes/{code}                  ← partner code → uid lookup
appConfig/ping                       ← connectivity check
```

### Firestore Rules (must be published in Firebase Console)
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

---

## Storage Keys (MMKV + EncryptedStorage)

| Key | Where | What |
|-----|-------|------|
| @age_verified | MMKV | bool |
| @onboarding_complete | MMKV | bool |
| @pin_hash | EncryptedStorage | hashed PIN |
| @biometric_enabled | MMKV | bool |
| @theme_mode | MMKV | 'dark'/'light' |
| @user_token | EncryptedStorage | auth token |
| @fcm_token | EncryptedStorage | FCM token |
| @potd_{date} | MMKV | cached POTD id |
| @recent_searches | MMKV | JSON array |
| @game_history, @game_favorites, @36q_progress, @quiz_high_score, @game_level_preference | MMKV | game state |
| @health_bookmarks, @health_reading_progress, @health_guide_completions, @health_mood_history | MMKV | health state |
| @couple_data, @couple_want_to_try, @couple_activity, @couple_shared_favorites | MMKV | couple cache |
| @tracker_journal, @tracker_kegels, @tracker_goals, @tracker_badges | MMKV | tracker cache |
| @disguise_mode | MMKV | bool |
| @pending_sync_ops | MMKV | offline queue |

---

## Key Algorithms

### djb2Hash (daily rotation)
```javascript
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}
// Usage: djb2Hash('2026-03-21') % positions.length → index
```

### Search Scoring
```
Exact title match: 100
Title startsWith: 50
Title includes: 30
Tag exact match: 40
Tag includes: 20
Category match: 15
Summary/description includes: 10
Section heading match: 15
Body text match: 5
```

### Partner Code Flow
1. User A generates 6-char code → stored in `partnerCodes/{code}` with uid
2. User B enters code → looks up `partnerCodes/{code}` → gets partner uid
3. Creates `couples/{coupleId}` document with both uids
4. Updates both users' profiles with coupleId + partnerId
5. Real-time Firestore subscriptions sync shared data

---

## Build Commands

### Bundle JS (from original path)
```bash
cd C:\Users\Pc\Desktop\IntimateConnect
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

### Create Junction (required for native build)
```cmd
mklink /J C:\IC "C:\Users\Pc\Desktop\IntimateConnect"
```

### Build APK (from junction path)
```cmd
cd C:\IC\android
gradlew.bat assembleDebug
:: or for release:
gradlew.bat assembleRelease
```

### APK Output
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

### Remove Junction (cleanup, doesn't delete files)
```cmd
rmdir C:\IC
```

---

## Firebase Setup Checklist

1. Firebase Console → Create project "IntimateConnect"
2. Add Android app: package `com.intimateconnect`
3. Download `google-services.json` → `android/app/`
4. Enable Authentication → Email/Password
5. Create Firestore Database → production mode → asia-south1
6. Publish Firestore rules (see above)
7. Publish Storage rules (for profile photos)

---

## Patterns to Follow When Adding Features

### Adding a New Screen
1. Create screen file in appropriate `src/screens/main/{tab}/` folder
2. Add screen name to `SCREEN_NAMES` in constants.js
3. Import and add to the appropriate navigator in `src/navigation/`
4. Access data via `useContent()`, `useTrackerContext()`, `useAuth()`, or `useTheme()`

### Adding a New Hook
1. Create in `src/hooks/`
2. Follow existing pattern: load data → MMKV cache → Firestore subscription → optimistic updates
3. If it needs to be shared globally, add to appropriate Context provider

### Adding New Position Data
1. Add position object to `src/data/positions.json` (increment ID from pos_112)
2. Add SVG pose mapping in `src/data/positionPoses.js`
3. If new category, add color to CATEGORY_COLORS in PositionCard.js and to POSITION_CATEGORIES in constants.js

### Adding New Articles/Guides/Glossary
- Articles: append to `src/data/health/articles.json` (increment from art_035)
- Guides: append to `src/data/health/guides.json` (increment from guide_015)
- Glossary: append to `src/data/health/glossary.json` (increment from term_090)

### Component Pattern
```javascript
import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS} from '@utils/constants';

const MyComponent = ({prop1, prop2}) => {
  const {theme} = useTheme();
  // ... logic
  return (
    <View style={[styles.container, {backgroundColor: theme.colors.surface}]}>
      <Text style={{color: theme.colors.text}}>{prop1}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
});

export default memo(MyComponent);
```

---

## Known Issues & Gotchas

1. **Windows MAX_PATH**: reanimated CMake fails without `C:\IC` junction. Always build from junction.
2. **Firestore collection paths**: Must be odd segments (3, 5, etc). `users/{uid}/journal` = 3 ✓. `users/{uid}/trackerData/journal` = 4 ✗.
3. **react-native-svg v14 only**: v15+ breaks with RN 0.73.6.
4. **reanimated plugin**: Must be LAST in babel.config.js plugins.
5. **Hermes engine**: Default for RN 0.73. Some JS features may behave differently.
6. **MMKV stringify**: All MMKV values must be JSON.stringify'd before storing, JSON.parse'd on read.
7. **Encrypted notes**: Use `encryptData(text, uid)` / `decryptData(encrypted, uid)` from encryptionUtils.
8. **Position of the Day**: Deterministic per date via djb2Hash. Same date = same position globally.
9. **Offline queue**: OfflineSyncService stores failed Firestore operations in MMKV, retries on reconnection.
10. **Toast**: Use `showToast('success'|'error'|'info', title, message)` from `@components/common/Toast`.

---

## User Preferences (from past sessions)

- User speaks Hindi/Urdu mixed with English
- Prefers direct implementation over lengthy explanations
- Wants build verification (JS bundle + APK) after changes
- Uses Windows 11, Git Bash terminal
- Firebase project is set up with Firestore + Auth enabled
- Release keystore exists at `android/app/intimateconnect-release.keystore`
