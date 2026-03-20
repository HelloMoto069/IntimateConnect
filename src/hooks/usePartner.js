import {useContext} from 'react';
import CoupleContext from '@context/CoupleContext';

export const usePartner = () => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('usePartner must be used within a CoupleProvider');
  }
  return context;
};
