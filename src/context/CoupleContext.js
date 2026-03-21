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

export default CoupleContext;
