import React, {createContext, useContext, useMemo} from 'react';
import {useTracker} from '@hooks/useTracker';
import {useContent} from '@context/ContentContext';

const TrackerContext = createContext(null);

export const TrackerProvider = ({children}) => {
  const {health} = useContent();

  const moodHistoryLength = health?.moodHistory?.length || 0;
  const completedGuidesCount = health?.completedGuides
    ? Object.keys(health.completedGuides).length
    : 0;

  const trackerHook = useTracker(moodHistoryLength, completedGuidesCount);

  const value = useMemo(() => ({...trackerHook}), [trackerHook]);

  return (
    <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
  );
};

export const useTrackerContext = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTrackerContext must be used within a TrackerProvider');
  }
  return context;
};

export default TrackerContext;
