import React, {createContext, useContext, useMemo} from 'react';

const TrackerContext = createContext(null);

export const TrackerProvider = ({children}) => {
  const value = useMemo(
    () => ({
      journalEntries: [],
      kegelLog: [],
      moodHistory: [],
      goals: [],
      badges: [],
      addJournalEntry: async () => {},
      addKegelSession: async () => {},
      addMoodEntry: async () => {},
      setGoal: async () => {},
    }),
    [],
  );

  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};

export default TrackerContext;
