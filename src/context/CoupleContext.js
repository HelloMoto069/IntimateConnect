import React, {createContext, useContext, useMemo} from 'react';
import {useCouple} from '@hooks/useCouple';

const CoupleContext = createContext(null);

export const CoupleProvider = ({children}) => {
  const coupleHook = useCouple();

  const value = useMemo(() => ({...coupleHook}), [coupleHook]);

  return (
    <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
  );
};

export const useCoupleCx = () => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCoupleCx must be used within a CoupleProvider');
  }
  return context;
};

export default CoupleContext;
