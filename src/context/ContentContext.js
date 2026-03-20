import React, {createContext, useContext, useMemo} from 'react';

const ContentContext = createContext(null);

export const ContentProvider = ({children}) => {
  const value = useMemo(
    () => ({
      positions: [],
      categories: [],
      featuredContent: [],
      healthContent: [],
      guides: [],
      isLoading: false,
      fetchContent: async () => {},
    }),
    [],
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export default ContentContext;
