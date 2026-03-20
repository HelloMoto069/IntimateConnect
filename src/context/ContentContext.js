import React, {createContext, useContext, useMemo} from 'react';
import {usePositions} from '@hooks/usePositions';
import {useGames} from '@hooks/useGames';
import {useHealth} from '@hooks/useHealth';

const ContentContext = createContext(null);

export const ContentProvider = ({children}) => {
  const positionHook = usePositions();
  const gamesHook = useGames();
  const healthHook = useHealth();

  const value = useMemo(
    () => ({
      // Position data
      positions: positionHook.positions,
      filteredPositions: positionHook.filteredPositions,
      categories: positionHook.categories,
      positionOfTheDay: positionHook.positionOfTheDay,
      favorites: positionHook.favorites,
      favoritePositions: positionHook.favoritePositions,

      // Getters
      getPositionById: positionHook.getPositionById,
      getUserPositionData: positionHook.getUserPositionData,
      getDecryptedNote: positionHook.getDecryptedNote,

      // Actions
      toggleFavorite: positionHook.toggleFavorite,
      setRating: positionHook.setRating,
      markAsTried: positionHook.markAsTried,
      savePersonalNote: positionHook.savePersonalNote,

      // Filtering
      filters: positionHook.filters,
      sortConfig: positionHook.sortConfig,
      searchQuery: positionHook.searchQuery,
      searchPositions: positionHook.searchPositions,
      filterByCategory: positionHook.filterByCategory,
      filterByDifficulty: positionHook.filterByDifficulty,
      filterByIntimacy: positionHook.filterByIntimacy,
      sortPositions: positionHook.sortPositions,
      applyFilters: positionHook.applyFilters,
      resetFilters: positionHook.resetFilters,

      // Recent searches
      getRecentSearches: positionHook.getRecentSearches,
      addRecentSearch: positionHook.addRecentSearch,
      clearRecentSearches: positionHook.clearRecentSearches,

      // Games
      games: gamesHook,

      // Health
      health: healthHook,

      isLoading: positionHook.isLoading,
    }),
    [positionHook, gamesHook, healthHook],
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
