import firestore from '@react-native-firebase/firestore';

export const getDocument = async (collection, docId) => {
  const doc = await firestore().collection(collection).doc(docId).get();
  return doc.exists ? {id: doc.id, ...doc.data()} : null;
};

export const setDocument = async (collection, docId, data, merge = true) => {
  await firestore().collection(collection).doc(docId).set(data, {merge});
};

export const updateDocument = async (collection, docId, data) => {
  await firestore().collection(collection).doc(docId).update(data);
};

export const deleteDocument = async (collection, docId) => {
  await firestore().collection(collection).doc(docId).delete();
};

export const addDocument = async (collection, data) => {
  const ref = await firestore().collection(collection).add(data);
  return ref.id;
};

export const queryCollection = async (
  collection,
  conditions = [],
  orderByField = null,
  orderDirection = 'asc',
  limitCount = null,
) => {
  let query = firestore().collection(collection);

  conditions.forEach(([field, operator, value]) => {
    query = query.where(field, operator, value);
  });

  if (orderByField) {
    query = query.orderBy(orderByField, orderDirection);
  }

  if (limitCount) {
    query = query.limit(limitCount);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
};

export const subscribeToDocument = (collection, docId, callback) => {
  return firestore()
    .collection(collection)
    .doc(docId)
    .onSnapshot(
      doc => {
        callback(doc.exists ? {id: doc.id, ...doc.data()} : null);
      },
      error => {
        console.error(`Subscription error [${collection}/${docId}]:`, error);
      },
    );
};

export const subscribeToQuery = (
  collection,
  conditions = [],
  callback,
  orderByField = null,
  orderDirection = 'asc',
) => {
  let query = firestore().collection(collection);

  conditions.forEach(([field, operator, value]) => {
    query = query.where(field, operator, value);
  });

  if (orderByField) {
    query = query.orderBy(orderByField, orderDirection);
  }

  return query.onSnapshot(
    snapshot => {
      const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      callback(data);
    },
    error => {
      console.error(`Query subscription error [${collection}]:`, error);
    },
  );
};

export const batchWrite = async operations => {
  const batch = firestore().batch();

  operations.forEach(({type, collection, docId, data}) => {
    const ref = firestore().collection(collection).doc(docId);
    switch (type) {
      case 'set':
        batch.set(ref, data, {merge: true});
        break;
      case 'update':
        batch.update(ref, data);
        break;
      case 'delete':
        batch.delete(ref);
        break;
    }
  });

  await batch.commit();
};

export const serverTimestamp = () => firestore.FieldValue.serverTimestamp();
