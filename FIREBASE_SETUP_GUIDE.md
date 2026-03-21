# IntimateConnect — Firebase Setup Guide

Yeh guide aapko step-by-step batayegi ki Firebase kaise setup karna hai IntimateConnect app ke liye.

---

## Table of Contents

1. [Firebase Console Setup](#1-firebase-console-setup)
2. [Android Configuration](#2-android-configuration)
3. [iOS Configuration](#3-ios-configuration)
4. [Firebase Services Enable Karna](#4-firebase-services-enable-karna)
5. [Firestore Database Setup](#5-firestore-database-setup)
6. [Firestore Security Rules](#6-firestore-security-rules)
7. [Firestore Data Structure](#7-firestore-data-structure)
8. [Cloud Messaging (Push Notifications)](#8-cloud-messaging-push-notifications)
9. [Cloud Storage Setup](#9-cloud-storage-setup)
10. [App Mein Firebase Functions](#10-app-mein-firebase-functions)
11. [Testing & Verification](#11-testing--verification)
12. [Common Errors & Solutions](#12-common-errors--solutions)

---

## 1. Firebase Console Setup

### Step 1: Firebase Project Create Karo

1. Jao [Firebase Console](https://console.firebase.google.com/)
2. **"Add Project"** click karo
3. Project name dalo: `IntimateConnect`
4. Google Analytics enable/disable (optional)
5. **"Create Project"** click karo

### Step 2: Android App Register Karo

1. Firebase Console mein project khole
2. **"Add app"** → Android icon click karo
3. Android package name dalo: `com.intimateconnect`
4. App nickname: `IntimateConnect Android`
5. **"Register app"** click karo

### Step 3: google-services.json Download Karo

1. Firebase Console se **`google-services.json`** download karo
2. Isko copy karo yahan:
   ```
   IntimateConnect/android/app/google-services.json
   ```
3. **IMPORTANT**: Yeh file `.gitignore` mein honi chahiye (sensitive credentials hain)

---

## 2. Android Configuration

### Yeh files already configured hain app mein:

**`android/build.gradle`** — Google Services plugin:
```groovy
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

**`android/app/build.gradle`** — Plugin apply:
```groovy
apply plugin: 'com.google.gms.google-services'
```

**`android/app/src/main/AndroidManifest.xml`** — Internet permission:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### Sirf yeh karna hai:
- `google-services.json` file `android/app/` mein paste karo
- Bas! Baaki sab already configured hai

---

## 3. iOS Configuration

### Step 1: Firebase Console mein iOS App Add Karo
1. Firebase Console → Project Settings → "Add app" → iOS
2. Bundle ID dalo: `com.intimateconnect`
3. **"Register app"** click karo

### Step 2: GoogleService-Info.plist Download Karo
1. Download karo `GoogleService-Info.plist`
2. Isko copy karo:
   ```
   IntimateConnect/ios/IntimateConnect/GoogleService-Info.plist
   ```

### Step 3: Pods Install Karo
```bash
cd ios && pod install && cd ..
```

### Step 4: Xcode Mein Verify Karo
1. Xcode mein `IntimateConnect.xcworkspace` kholo
2. Check karo `GoogleService-Info.plist` project mein added hai

---

## 4. Firebase Services Enable Karna

Firebase Console mein yeh **5 services** enable karo:

### A. Authentication
1. Firebase Console → **Authentication** → **"Get Started"**
2. **Sign-in method** tab mein:
   - **Email/Password** → Enable karo → Save
3. Bas yahi ek method chahiye

### B. Cloud Firestore
1. Firebase Console → **Firestore Database** → **"Create database"**
2. Location select karo (nearest region, e.g., `asia-south1` for India)
3. **"Start in production mode"** select karo
4. Security rules baad mein deploy karenge (Section 6 mein)

### C. Cloud Storage
1. Firebase Console → **Storage** → **"Get Started"**
2. Default bucket create hoga
3. Rules baad mein set karenge

### D. Cloud Messaging
1. Firebase Console → **Cloud Messaging**
2. Yeh automatically enabled hota hai project create karne par
3. Android ke liye kuch aur nahi karna

### E. Firebase Analytics (Optional)
1. Yeh by default enabled hota hai
2. Agar nahi chahiye to disable kar sakte ho

---

## 5. Firestore Database Setup

### Collections Banana Zaruri Nahi — App Automatically Banata Hai

App apne aap collections create karta hai jab user pehli baar data save karta hai. Lekin reference ke liye, yeh collections use hoti hain:

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles (name, email, partnerCode, preferences) |
| `users/{uid}/positionData` | User's position favorites, ratings, notes |
| `users/{uid}/healthData` | Health bookmarks, reading progress |
| `users/{uid}/moodData` | Mood check-in entries |
| `users/{uid}/trackerData/journal` | Encrypted journal entries |
| `users/{uid}/trackerData/kegels` | Kegel session logs |
| `users/{uid}/trackerData/goals` | Wellness goals |
| `users/{uid}/trackerData/badges` | Earned achievement badges |
| `partnerCodes` | Partner code → user ID lookup |
| `couples` | Couple relationship data |
| `couples/{id}/activity` | Couple activity timeline |
| `appConfig` | App configuration (optional) |

---

## 6. Firestore Security Rules

Firebase Console → **Firestore Database** → **Rules** tab mein yeh paste karo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users apna data read/write kar sakte hain
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Partner codes: koi bhi authenticated user read kar sakta hai, sirf owner write
    match /partnerCodes/{code} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
    }

    // Couples: dono partners read/write kar sakte hain
    match /couples/{coupleId} {
      allow create: if request.auth != null
        && (request.resource.data.partnerA == request.auth.uid
            || request.resource.data.partnerB == request.auth.uid);
      allow read, update, delete: if request.auth != null
        && (resource.data.partnerA == request.auth.uid
            || resource.data.partnerB == request.auth.uid);
    }

    // Couple activity subcollection
    match /couples/{coupleId}/activity/{activityId} {
      allow read, write: if request.auth != null;
    }

    // Content: sirf read for authenticated users
    match /content/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // App config: public read
    match /appConfig/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**"Publish"** click karo rules save karne ke liye.

---

## 7. Firestore Data Structure

### User Document (`users/{uid}`)
```json
{
  "uid": "abc123xyz",
  "email": "user@example.com",
  "displayName": "John",
  "partnerCode": "XYZ789",
  "partnerId": null,
  "coupleId": null,
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "disguiseMode": false
  },
  "fcmToken": "device_token_here",
  "createdAt": "2026-03-21T..."
}
```

### User Subcollections

**`users/{uid}/positionData/{positionId}`**
```json
{
  "isFavorite": true,
  "rating": 4,
  "isTried": true,
  "encryptedNote": "<AES encrypted note>"
}
```

**`users/{uid}/healthData/preferences`**
```json
{
  "bookmarks": ["art_001", "art_005"],
  "readingProgress": {"art_001": 75, "art_005": 100},
  "guideCompletions": {"guide_001": true}
}
```

**`users/{uid}/moodData/{date}`**
```json
{
  "moodId": "loved",
  "encryptedNote": "<AES encrypted>",
  "date": "2026-03-21"
}
```

**`users/{uid}/trackerData/journal/{entryId}`**
```json
{
  "id": "abc123",
  "title": "My thoughts",
  "encryptedContent": "<AES ciphertext>",
  "moodTag": "loved",
  "tags": ["intimacy", "gratitude"],
  "createdAt": "2026-03-21T...",
  "updatedAt": "2026-03-21T..."
}
```

**`users/{uid}/trackerData/kegels/{sessionId}`**
```json
{
  "id": "def456",
  "durationSeconds": 180,
  "reps": 10,
  "intensity": "medium",
  "completedAt": "2026-03-21T..."
}
```

**`users/{uid}/trackerData/goals/{goalId}`**
```json
{
  "id": "ghi789",
  "title": "Practice mindful intimacy weekly",
  "category": "intimacy",
  "targetDate": "2026-06-01",
  "progress": 60,
  "isCompleted": false,
  "createdAt": "2026-03-21T...",
  "completedAt": null
}
```

**`users/{uid}/trackerData/badges/{badgeId}`**
```json
{
  "badgeId": "first_journal",
  "earnedAt": "2026-03-21T..."
}
```

### Partner Code Document (`partnerCodes/{code}`)
```json
{
  "uid": "user_abc123",
  "displayName": "John",
  "createdAt": "2026-03-21T..."
}
```

### Couple Document (`couples/{coupleId}`)
```json
{
  "partnerA": "uid_alice",
  "partnerB": "uid_bob",
  "partnerAName": "Alice",
  "partnerBName": "Bob",
  "connectedAt": "2026-03-21T...",
  "wantToTry": [
    {
      "id": "wtt_abc",
      "positionId": "pos_042",
      "addedBy": "uid_alice",
      "addedAt": "2026-03-21T...",
      "tried": false,
      "triedAt": null
    }
  ],
  "stats": {"gamesPlayed": 0, "positionsExplored": 0},
  "lastActivity": "2026-03-21T..."
}
```

### Couple Activity (`couples/{coupleId}/activity/{activityId}`)
```json
{
  "type": "game_played",
  "description": "Played Truth or Dare",
  "actorUid": "uid_alice",
  "actorName": "Alice",
  "metadata": {"gameId": "truth-or-dare"},
  "createdAt": "2026-03-21T..."
}
```

---

## 8. Cloud Messaging (Push Notifications)

### Android Setup
1. `google-services.json` already messaging config include karta hai
2. App mein `@react-native-firebase/messaging` already installed hai
3. Kuch extra setup nahi chahiye Android ke liye

### iOS Setup (Extra Steps)
1. **Apple Developer Account** mein:
   - Push Notification capability enable karo
   - APNs Authentication Key generate karo (.p8 file)
2. Firebase Console → **Project Settings** → **Cloud Messaging** tab:
   - APNs Authentication Key upload karo
3. Xcode mein:
   - **Signing & Capabilities** → **+ Capability** → **Push Notifications**
   - **Background Modes** → **Remote notifications** check karo

### App Mein Kya Hota Hai
- App start hone par `NotificationService.initialize(userId)` call hota hai
- FCM token generate hota hai aur Firestore mein save hota hai
- Foreground notifications Toast ke through dikhte hain
- Disguise mode ON hone par notification content masked hota hai

---

## 9. Cloud Storage Setup

### Storage Rules (Firebase Console → Storage → Rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos: user apni photo upload/read kar sakta hai
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### App Mein Usage
- Profile photo upload: `profiles/{userId}/avatar.jpg`
- `src/api/firebase/storage.js` mein `uploadProfilePhoto()` function hai

---

## 10. App Mein Firebase Functions

### Authentication (`src/api/firebase/auth.js`)
| Function | Kya Karta Hai |
|---------|--------------|
| `signUpWithEmail(email, pass, name)` | Account + Firestore doc + partnerCode create |
| `signInWithEmail(email, pass)` | Login |
| `signOut()` | Logout |
| `resetPassword(email)` | Password reset email |
| `onAuthStateChanged(callback)` | Auth state listener |
| `getUserProfile(uid)` | Firestore se profile fetch |
| `subscribeToUserProfile(uid, cb)` | Real-time profile listener |
| `updateUserProfile(updates)` | Profile update |
| `getPartnerByCode(code)` | Partner code lookup |
| `deleteAccount()` | Full account + data delete |

### Firestore (`src/api/firebase/firestore.js`)
| Function | Kya Karta Hai |
|---------|--------------|
| `getDocument(collection, docId)` | Ek document fetch |
| `setDocument(collection, docId, data)` | Create/update (merge) |
| `updateDocument(collection, docId, data)` | Partial update |
| `deleteDocument(collection, docId)` | Document delete |
| `addDocument(collection, data)` | Auto-ID se add |
| `queryCollection(coll, conditions)` | Query with filters |
| `subscribeToDocument(coll, docId, cb)` | Real-time listener |
| `subscribeToQuery(coll, conditions, cb)` | Real-time query listener |
| `batchWrite(operations)` | Atomic batch (set/update/delete) |
| `serverTimestamp()` | Server timestamp |

### Cloud Messaging (`src/api/firebase/messaging.js`)
| Function | Kya Karta Hai |
|---------|--------------|
| `requestPermission()` | Notification permission maango |
| `getToken()` | FCM device token |
| `onMessage(callback)` | Foreground notification handler |
| `onBackgroundMessage(handler)` | Background notification handler |
| `subscribeToTopic(topic)` | Topic subscribe |
| `saveFCMToken(userId, token)` | Token Firestore mein save |

### Cloud Storage (`src/api/firebase/storage.js`)
| Function | Kya Karta Hai |
|---------|--------------|
| `uploadFile(path, uri, metadata)` | File upload → download URL |
| `downloadURL(path)` | File ka URL get |
| `deleteFile(path)` | File delete |
| `uploadProfilePhoto(userId, uri)` | Profile photo upload shortcut |

---

## 11. Testing & Verification

### Step 1: Build & Run
```bash
# JS Bundle verify
cd IntimateConnect
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# APK Build
cd android && ./gradlew assembleDebug
```

### Step 2: Firebase Connection Test
1. App install karo device/emulator par
2. Sign Up karo new account se
3. Firebase Console → **Authentication** mein check karo:
   - Naya user dikhna chahiye
4. Firebase Console → **Firestore** mein check karo:
   - `users/{uid}` document bana hoga
   - `partnerCodes/{code}` document bana hoga

### Step 3: Feature-wise Check
| Feature | Firebase Console Mein Check Karo |
|---------|-------------------------------|
| Sign Up | Authentication → Users mein naya user |
| Profile | Firestore → users/{uid} document |
| Favorite Position | Firestore → users/{uid}/positionData/{id} |
| Mood Check-In | Firestore → users/{uid}/moodData/{date} |
| Journal Entry | Firestore → users/{uid}/trackerData/journal/{id} |
| Kegel Session | Firestore → users/{uid}/trackerData/kegels/{id} |
| Goal | Firestore → users/{uid}/trackerData/goals/{id} |
| Partner Connect | Firestore → couples/{id} document |
| Partner Code | Firestore → partnerCodes/{code} document |

---

## 12. Common Errors & Solutions

### Error: "No Firebase App '[DEFAULT]' has been created"
**Solution**: `google-services.json` (Android) ya `GoogleService-Info.plist` (iOS) missing hai. Download karke correct location pe dalo.

### Error: "FirebaseError: Missing or insufficient permissions"
**Solution**: Firestore Security Rules deploy nahi hue. Section 6 ke rules Firebase Console mein paste karo aur Publish karo.

### Error: "DEVELOPER_ERROR" during Google Auth
**Solution**: SHA-1 fingerprint Firebase Console mein add nahi kiya. Run karo:
```bash
cd android && ./gradlew signingReport
```
SHA-1 copy karo aur Firebase Console → Project Settings → Android app → SHA certificate fingerprints mein add karo.

### Error: "Network error" / Firestore not connecting
**Solution**:
1. Internet permission check karo AndroidManifest.xml mein
2. `google-services.json` mein project ID correct hona chahiye
3. Firestore database create hua hai check karo Console mein

### Error: FCM Token not generating
**Solution**:
1. `google-services.json` mein messaging sender ID check karo
2. Android emulator use kar rahe ho to Google Play Services installed honi chahiye
3. Physical device par test karo for best results

### Error: "Could not find google-services.json"
**Solution**: File ko exactly `android/app/google-services.json` path pe rakhna hai (not `android/` root).

---

## Quick Start Checklist

- [ ] Firebase Console pe project create kiya
- [ ] Android app register kiya (package: `com.intimateconnect`)
- [ ] `google-services.json` download karke `android/app/` mein rakha
- [ ] Authentication → Email/Password method enable kiya
- [ ] Firestore Database create kiya
- [ ] Firestore Security Rules deploy kiye (Section 6)
- [ ] Cloud Storage enable kiya
- [ ] Storage Rules deploy kiye (Section 9)
- [ ] Cloud Messaging automatically enabled hai — check kiya
- [ ] App build & run kiya
- [ ] Sign Up karke Firebase Console mein user verify kiya
- [ ] Firestore mein user document bana — confirmed

---

## Dependencies (Already Installed)

```json
"@react-native-firebase/app": "^19.3.0",
"@react-native-firebase/auth": "^19.3.0",
"@react-native-firebase/firestore": "^19.3.0",
"@react-native-firebase/messaging": "^19.3.0",
"@react-native-firebase/storage": "^19.3.0"
```

Yeh sab already `package.json` mein hain. `npm install` karne se automatically install ho jayenge.

---

**Guide complete! Follow the checklist aur aapka Firebase setup ho jayega.**
