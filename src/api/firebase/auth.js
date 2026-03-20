import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {FIREBASE_COLLECTIONS} from '@utils/constants';
import {generatePartnerCode} from '@utils/helpers';

export const signUpWithEmail = async (email, password, displayName) => {
  const userCredential = await auth().createUserWithEmailAndPassword(
    email,
    password,
  );
  await userCredential.user.updateProfile({displayName});

  // Create Firestore user document
  await firestore()
    .collection(FIREBASE_COLLECTIONS.USERS)
    .doc(userCredential.user.uid)
    .set({
      uid: userCredential.user.uid,
      email,
      displayName,
      partnerCode: generatePartnerCode(),
      partnerId: null,
      coupleId: null,
      preferences: {
        theme: 'dark',
        notifications: true,
        disguiseMode: false,
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

  return userCredential.user;
};

export const signInWithEmail = async (email, password) => {
  const userCredential = await auth().signInWithEmailAndPassword(
    email,
    password,
  );
  return userCredential.user;
};

export const signOut = async () => {
  await auth().signOut();
};

export const resetPassword = async email => {
  await auth().sendPasswordResetEmail(email);
};

export const getCurrentUser = () => {
  return auth().currentUser;
};

export const onAuthStateChanged = callback => {
  return auth().onAuthStateChanged(callback);
};

export const updateUserProfile = async updates => {
  const user = auth().currentUser;
  if (!user) throw new Error('No authenticated user');

  if (updates.displayName || updates.photoURL) {
    await user.updateProfile({
      displayName: updates.displayName,
      photoURL: updates.photoURL,
    });
  }

  // Update Firestore doc
  const firestoreUpdates = {...updates};
  delete firestoreUpdates.photoURL;
  if (Object.keys(firestoreUpdates).length > 0) {
    await firestore()
      .collection(FIREBASE_COLLECTIONS.USERS)
      .doc(user.uid)
      .update(firestoreUpdates);
  }
};

export const getUserProfile = async userId => {
  const doc = await firestore()
    .collection(FIREBASE_COLLECTIONS.USERS)
    .doc(userId)
    .get();
  return doc.exists ? doc.data() : null;
};

export const subscribeToUserProfile = (userId, callback) => {
  return firestore()
    .collection(FIREBASE_COLLECTIONS.USERS)
    .doc(userId)
    .onSnapshot(
      doc => {
        callback(doc.exists ? doc.data() : null);
      },
      error => {
        console.error('User profile subscription error:', error);
      },
    );
};

export const deleteAccount = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error('No authenticated user');

  // Delete Firestore document first
  await firestore()
    .collection(FIREBASE_COLLECTIONS.USERS)
    .doc(user.uid)
    .delete();

  // Then delete auth account
  await user.delete();
};
