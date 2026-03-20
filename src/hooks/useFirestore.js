import {useState, useEffect} from 'react';
import {
  subscribeToDocument,
  subscribeToQuery,
} from '@api/firebase/firestore';

export const useDocument = (collection, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collection || !docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDocument(collection, docId, doc => {
      setData(doc);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [collection, docId]);

  return {data, loading, error};
};

export const useCollection = (collection, conditions = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collection) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToQuery(collection, conditions, docs => {
      setData(docs);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [collection, JSON.stringify(conditions)]);

  return {data, loading, error};
};
