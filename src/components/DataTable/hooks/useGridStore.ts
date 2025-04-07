import { useEffect } from 'react';
import { useGridStore } from '../store/gridStore';

// This hook provides a convenient way to access and use the grid store
export function useGrid() {
  const {
    // State
    spacing,
    fontSize,
    selectedFont,
    darkMode,
    columnState,
    columnDefs,
    filterModel,
    sortModel,
    gridOptions,
    profiles,
    selectedProfileId,

    // Actions
    setSpacing,
    setFontSize,
    setSelectedFont,
    setDarkMode,
    setColumnState,
    setColumnDefs,
    setFilterModel,
    setSortModel,
    setGridOptions,
    addProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    saveToProfile,
    loadFromProfile,
    createProfileFromCurrent
  } = useGridStore();

  // Get the selected profile
  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  return {
    // State
    spacing,
    fontSize,
    selectedFont,
    darkMode,
    columnState,
    columnDefs,
    filterModel,
    sortModel,
    gridOptions,
    profiles,
    selectedProfileId,
    selectedProfile,

    // Actions
    setSpacing,
    setFontSize,
    setSelectedFont,
    setDarkMode,
    setColumnState,
    setColumnDefs,
    setFilterModel,
    setSortModel,
    setGridOptions,
    addProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    saveToProfile,
    loadFromProfile,
    createProfileFromCurrent
  };
}
