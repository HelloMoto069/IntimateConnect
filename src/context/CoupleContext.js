import React, {createContext, useContext, useMemo} from 'react';

const CoupleContext = createContext(null);

export const CoupleProvider = ({children}) => {
  const value = useMemo(
    () => ({
      partner: null,
      coupleId: null,
      isConnected: false,
      partnerCode: null,
      sharedFavorites: [],
      wantToTryList: [],
      connectPartner: async () => {},
      disconnectPartner: async () => {},
    }),
    [],
  );

  return (
    <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCouple must be used within a CoupleProvider');
  }
  return context;
};

export default CoupleContext;
