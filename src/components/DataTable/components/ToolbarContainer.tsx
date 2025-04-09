import React, { useCallback } from 'react';
import { DataTableToolbar } from '../Toolbar/DataTableToolbar';
import { useGridStore } from '../store/gridStore';
import { monospacefonts } from '../utils/constants';
import { saveGridStateToProfile, resetGridState } from '../utils/gridSettingsUtils';
import { createBatchUpdateFunction } from '../utils/gridStateUtils';

interface ToolbarContainerProps {
  gridId: string;
  gridRef: React.RefObject<any>;
  darkMode: boolean;
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  sanitizedGridOptions: any;
  applySettings: () => void;
  openProfilesDialog: () => void;
  openGeneralSettingsDialog: () => void;
  openColumnSettingsDialog: () => void;
}

/**
 * Container component for the DataTable toolbar
 * Handles all toolbar-related state and callbacks
 */
export const ToolbarContainer = React.memo(({
  gridId,
  gridRef,
  darkMode,
  onThemeChange,
  sanitizedGridOptions,
  applySettings,
  openProfilesDialog,
  openGeneralSettingsDialog,
  openColumnSettingsDialog
}: ToolbarContainerProps) => {
  // Get state from store
  const spacing = useGridStore(state => state.spacing);
  const fontSize = useGridStore(state => state.fontSize);
  const selectedFont = useGridStore(state => state.selectedFont);
  const profiles = useGridStore(state => state.profiles);
  const selectedProfileId = useGridStore(state => state.selectedProfileId);
  const numericFormatOption = useGridStore(state => state.numericFormatOption);

  // Get actions from store
  const setSpacing = useGridStore(state => state.setSpacing);
  const setFontSize = useGridStore(state => state.setFontSize);
  const setSelectedFont = useGridStore(state => state.setSelectedFont);
  const setColumnState = useGridStore(state => state.setColumnState);
  const setColumnDefs = useGridStore(state => state.setColumnDefs);
  const setFilterModel = useGridStore(state => state.setFilterModel);
  const setSortModel = useGridStore(state => state.setSortModel);
  const setGridOptions = useGridStore(state => state.setGridOptions);
  const saveToProfile = useGridStore(state => state.saveToProfile);
  const selectProfile = useGridStore(state => state.selectProfile);
  const setNumericFormatOption = useGridStore(state => state.setNumericFormatOption);

  // Create batch update function
  const [, setSuppressGridRefresh] = React.useState(false);
  const batchUpdate = useCallback(
    createBatchUpdateFunction(setSuppressGridRefresh),
    [setSuppressGridRefresh]
  );

  // Handle font change
  const handleFontChange = useCallback((font: { name: string; value: string }) => {
    setSelectedFont(font);

    // Apply font family directly to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-font-family', font.value);
    }
  }, [gridId, setSelectedFont]);

  // Handle spacing change
  const handleSpacingChange = useCallback((value: number) => {
    setSpacing(value);

    // Apply spacing directly to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-spacing', `${value}px`);
    }
  }, [gridId, setSpacing]);

  // Handle font size change
  const handleFontSizeChange = useCallback((value: number) => {
    setFontSize(value);

    // Apply font size directly to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-font-size', `${value}px`);
      gridElement.style.setProperty('--ag-header-font-size', `${value}px`);
    }
  }, [gridId, setFontSize]);

  // Save current grid state to profile
  const handleSaveProfile = useCallback(() => {
    saveGridStateToProfile(
      gridRef,
      sanitizedGridOptions,
      setColumnState,
      setColumnDefs,
      setFilterModel,
      setSortModel,
      setGridOptions,
      saveToProfile,
      batchUpdate
    );
  }, [
    gridRef,
    sanitizedGridOptions,
    setColumnState,
    setColumnDefs,
    setFilterModel,
    setSortModel,
    setGridOptions,
    saveToProfile,
    batchUpdate
  ]);

  // Handle profile selection
  const handleSelectProfile = useCallback((id: string) => {
    console.log('Switching to profile:', id);

    // Completely reset the grid before applying new profile settings
    if (gridRef.current?.api) {
      resetGridState(gridRef, batchUpdate);
      
      // Now select the new profile - this will hydrate the grid store with the profile settings
      selectProfile(id);
      
      // Trigger settings application *after* the batch update logic and store update
      // Use setTimeout to ensure it runs after the current render cycle triggered by batchUpdate state changes
      setTimeout(() => {
        console.log("Triggering applySettingsToGrid after profile switch");
        applySettings();
      }, 0);
    } else {
      // If grid is not ready, just select the profile (apply will happen on grid ready)
      selectProfile(id);
    }
  }, [gridRef, selectProfile, batchUpdate, applySettings]);

  // Handler for numeric format change
  const handleNumericFormatChange = useCallback((option: string) => {
    setNumericFormatOption(option);
    // Trigger grid update after state change
    setTimeout(() => {
      applySettings();
    }, 0);
  }, [setNumericFormatOption, applySettings]);

  return (
    <DataTableToolbar
      selectedFont={selectedFont}
      setSelectedFont={handleFontChange}
      monospacefonts={monospacefonts}
      spacing={spacing}
      setSpacing={handleSpacingChange}
      fontSize={fontSize}
      setFontSize={handleFontSizeChange}
      isDark={darkMode}
      onThemeChange={onThemeChange}
      gridId={gridId}
      onSaveProfile={handleSaveProfile}
      onManageProfiles={openProfilesDialog}
      onGeneralSettings={openGeneralSettingsDialog}
      onColumnSettings={openColumnSettingsDialog}
      profiles={profiles}
      selectedProfileId={selectedProfileId}
      onSelectProfile={handleSelectProfile}
      numericFormatOption={numericFormatOption}
      onNumericFormatChange={handleNumericFormatChange}
    />
  );
});

ToolbarContainer.displayName = 'ToolbarContainer';
