import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { ModuleRegistry, ColDef, GridOptions } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { DataTableToolbar } from "./Toolbar/DataTableToolbar";
import { ColumnSettingsDialog } from "./Settings/ColumnSettings/ColumnSettingsDialog";
import { ProfilesDialog } from "./Settings/Profiles/ProfilesDialog";
import { GeneralSettingsDialog } from "./Settings/General/GeneralSettingsDialog";
import { useThemeSync } from "./hooks/useThemeSync";
import { useGrid } from "./hooks/useGridStore";
import { generateColumnDefsFromData, GridRowData, defaultColDef } from "./utils/dataTableHelpers";
import { createGridTheme, applyGridStyles, createGridTransitionsStyle } from "./utils/gridStyling";
import { applyGridOptions } from "./utils/gridOptionsApplier";
import { monospacefonts } from "./utils/constants";
import "./styles/gridOptions.css";

ModuleRegistry.registerModules([AllEnterpriseModule]);

export interface DataTableProps {
  columns: ColDef[];
  data: ColDef[];
  id?: string;
  isDark?: boolean;
  rowData?: GridRowData[];
  gridOptions?: Partial<GridOptions>;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

export function DataTable({
  data,
  id,
  isDark = false, // Default to light mode if not specified
  rowData: externalRowData,
  gridOptions: externalGridOptions,
  onThemeChange
}: DataTableProps) {
  // Use the grid store
  const {
    spacing,
    fontSize,
    selectedFont,
    columnState,
    filterModel,
    sortModel,
    gridOptions,
    profiles,
    selectedProfileId,
    setSpacing,
    setFontSize,
    setSelectedFont,
    setColumnState,
    setFilterModel,
    setSortModel,
    setGridOptions,
    saveToProfile,
    selectProfile
  } = useGrid();

  // Local state for UI components
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [profilesDialogOpen, setProfilesDialogOpen] = useState(false);
  const [generalSettingsOpen, setGeneralSettingsOpen] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  // Use a unique ID for this grid instance
  const gridId = id || `grid-${Math.random().toString(36).substring(2, 11)}`;

  // Use the theme sync hook
  const { darkMode, themeReady, handleThemeChange: onThemeChangeHandler } = useThemeSync({
    isDark,
    onThemeChange
  });

  // Create grid theme
  const gridTheme = useMemo(() => createGridTheme(selectedFont.value), [selectedFont.value]);

  // Set up grid styling
  useEffect(() => {
    // Apply styles to the grid
    applyGridStyles(gridId, selectedFont.value, fontSize, spacing, darkMode || false);

    // Create transitions style element
    createGridTransitionsStyle(gridId);

    // Force grid refresh when theme changes
    if (gridReady && gridRef.current?.api) {
      setTimeout(() => {
        gridRef.current?.api?.refreshCells({ force: true });
        gridRef.current?.api?.redrawRows();
      }, 0);
    }

    // Clean up on unmount
    return () => {
      const transElement = document.getElementById(`grid-transitions-${gridId}`);
      if (transElement) {
        document.head.removeChild(transElement);
      }
    };
  }, [darkMode, selectedFont, gridId, gridReady, fontSize, spacing]);

  // Handle font change
  const handleFontChangeCallback = useCallback((font: { name: string; value: string }) => {
    setSelectedFont(font);

    // Apply font family directly to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-font-family', font.value);
    }

    // Refresh the grid to apply changes
    if (gridRef.current?.api) {
      setTimeout(() => {
        gridRef.current?.api?.refreshCells({ force: true });
      }, 0);
    }
  }, [gridId, setSelectedFont]);

  // Handle spacing change
  const handleSpacingChangeCallback = useCallback((value: number) => {
    setSpacing(value);

    // Apply spacing directly to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-spacing', `${value}px`);
    }

    // Dispatch a custom event when spacing change is complete
    if (gridElement) {
      gridElement.dispatchEvent(new CustomEvent('spacing-change-complete'));
    }
  }, [gridId, setSpacing]);

  // Handle font size change
  const handleFontSizeChangeCallback = useCallback((value: number) => {
    setFontSize(value);

    // Apply font size directly to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-font-size', `${value}px`);
      gridElement.style.setProperty('--ag-header-font-size', `${value}px`);
    }

    // Dispatch a custom event when font size change is complete
    if (gridElement) {
      gridElement.dispatchEvent(new CustomEvent('fontsize-change-complete'));
    }
  }, [gridId, setFontSize]);

  // Add event listeners for slider release events
  useEffect(() => {
    const gridElement = document.getElementById(gridId);
    if (!gridElement) return;

    const handleSpacingChangeComplete = () => {
      if (gridRef.current?.api) {
        // Do a more complete refresh
        gridRef.current.api.refreshCells({ force: true });
        gridRef.current.api.redrawRows();
        gridRef.current.api.sizeColumnsToFit();
      }
    };

    const handleFontSizeChangeComplete = () => {
      if (gridRef.current?.api) {
        // Do a more complete refresh
        gridRef.current.api.refreshCells({ force: true });
        gridRef.current.api.redrawRows();
        gridRef.current.api.sizeColumnsToFit();
      }
    };

    gridElement.addEventListener('spacing-change-complete', handleSpacingChangeComplete);
    gridElement.addEventListener('fontsize-change-complete', handleFontSizeChangeComplete);

    return () => {
      gridElement.removeEventListener('spacing-change-complete', handleSpacingChangeComplete);
      gridElement.removeEventListener('fontsize-change-complete', handleFontSizeChangeComplete);
    };
  }, [gridId]);

  // Apply column state, filter model, and sort model when they change in the store
  // This effect handles the one-way data flow from store to grid
  useEffect(() => {
    if (gridReady && gridRef.current?.api) {
      // Apply column state if available (includes sort information in AG-Grid 33+)
      if (columnState && columnState.length > 0) {
        gridRef.current.api.applyColumnState({
          state: columnState,
          applyOrder: true
        });
      }

      // Apply filter model if available
      if (filterModel && Object.keys(filterModel).length > 0) {
        gridRef.current.api.setFilterModel(filterModel);
      }

      // No need to apply sort model separately in AG-Grid 33+
      // as it's included in the column state

      // Refresh the grid to apply all changes
      gridRef.current.api.refreshCells({ force: true });
      gridRef.current.api.redrawRows();
    }
  }, [gridReady, columnState, filterModel, sortModel]);

  // Load the selected profile when the component mounts
  // This ensures the grid loads the last selected profile when the app reloads
  useEffect(() => {
    // Only load if we have a selected profile and the grid is ready
    if (gridReady && selectedProfileId) {
      // No need to call selectProfile here as the store already has the correct state
      // The above effect will apply the state to the grid
      console.log(`Loaded profile: ${selectedProfileId}`);
    }
  }, [gridReady, selectedProfileId]);

  // Apply grid options when they change
  useEffect(() => {
    if (gridReady && gridRef.current?.api && gridOptions) {
      // Use our utility function to apply grid options
      console.log('Grid options changed, applying new options');
      applyGridOptions(gridRef, gridId, gridOptions);
    }
  }, [gridReady, gridOptions, gridId, gridRef]);

  // Apply grid options when the component mounts
  useEffect(() => {
    if (gridReady && gridRef.current?.api && gridOptions) {
      // Use our utility function to apply grid options
      console.log('Component mounted, applying initial grid options');
      applyGridOptions(gridRef, gridId, gridOptions);
    }
  }, [gridReady, gridId, gridOptions, gridRef]);

  // Use external rowData if provided, otherwise use empty array
  const rowData = useMemo(() => {
    return externalRowData || [];
  }, [externalRowData]);

  // Generate column definitions based on the first row of data if available
  const columnDefs = useMemo(() => {
    // If we have external column definitions, use those
    if (data && data.length > 0) {
      return data as ColDef[];
    }

    // If we have rowData but no column definitions, generate them from the first row
    if (rowData && rowData.length > 0) {
      return generateColumnDefsFromData(rowData);
    }

    // Return empty array if no data is available
    return [] as ColDef[];
  }, [data, rowData]);

  // Handle grid ready event
  const onGridReady = useCallback(() => {
    setGridReady(true);
    // No event listeners for automatic state saving
    // Grid state will only be extracted when explicitly saving a profile

    // Apply grid options when the grid is ready
    if (gridRef.current?.api && gridOptions) {
      // Use our utility function to apply grid options
      applyGridOptions(gridRef, gridId, gridOptions);
    }
  }, [gridId, gridOptions, gridRef]);

  // Save current grid state to profile
  const handleSaveProfile = useCallback(() => {
    if (gridRef.current?.api) {
      // Explicitly extract current grid state
      const columnState = gridRef.current.api.getColumnState() || [];
      const filterModel = gridRef.current.api.getFilterModel() || {};
      // In AG-Grid 33+, we need to handle this differently
      // For AG-Grid 33+, use getColumnState() to get the sort model
      // The sort information is included in the column state
      const sortModel = columnState.filter(col => col.sort).map(col => ({
        colId: col.colId,
        sort: col.sort,
        sortIndex: col.sortIndex
      }));

      // Save to store
      setColumnState(columnState);
      setFilterModel(filterModel);
      setSortModel(sortModel);

      // Save grid options
      if (externalGridOptions) {
        // Merge external grid options with current grid options
        setGridOptions({ ...gridOptions, ...externalGridOptions });
      }

      // Save to profile
      saveToProfile();
    }
  }, [saveToProfile, setColumnState, setFilterModel, setSortModel, setGridOptions, gridOptions, externalGridOptions]);

  // Open profiles dialog
  const handleManageProfiles = useCallback(() => {
    setProfilesDialogOpen(true);
  }, []);

  // Open general settings dialog
  const handleGeneralSettings = useCallback(() => {
    setGeneralSettingsOpen(true);
  }, []);

  // Handle profile selection
  const handleSelectProfile = useCallback((id: string) => {
    selectProfile(id);
  }, [selectProfile]);

  return (
    <div
      className={`flex h-full flex-col rounded-md border bg-card ${darkMode ? 'dark' : 'light'}`}
      data-theme={darkMode ? 'dark' : 'light'}
    >
      <DataTableToolbar
        onColumnSettingsOpen={() => setColumnSettingsOpen(true)}
        selectedFont={selectedFont}
        setSelectedFont={handleFontChangeCallback}
        monospacefonts={monospacefonts}
        spacing={spacing}
        setSpacing={handleSpacingChangeCallback}
        fontSize={fontSize}
        setFontSize={handleFontSizeChangeCallback}
        isDark={darkMode}
        onThemeChange={onThemeChangeHandler}
        gridId={gridId}
        onSaveProfile={handleSaveProfile}
        onManageProfiles={handleManageProfiles}
        onGeneralSettings={handleGeneralSettings}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={handleSelectProfile}
      />

      {/* AG Grid */}
      <div id={gridId} className="ag-theme-quartz flex-1">
        {themeReady && (
          <AgGridReact
            ref={gridRef}
            theme={gridTheme}
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
            sideBar={true}
            domLayout="normal"
            className="h-full w-full"
            onGridReady={onGridReady}
            stopEditingWhenCellsLoseFocus={false}
            // Apply external grid options first
            {...externalGridOptions}
            // Then apply store grid options to override external options
            {...gridOptions}
          />
        )}
      </div>

      {gridReady && (
        <ColumnSettingsDialog
          open={columnSettingsOpen}
          onOpenChange={setColumnSettingsOpen}
          gridRef={gridRef}
        />
      )}

      <ProfilesDialog
        open={profilesDialogOpen}
        onOpenChange={setProfilesDialogOpen}
      />

      <GeneralSettingsDialog
        open={generalSettingsOpen}
        onOpenChange={setGeneralSettingsOpen}
      />
    </div>
  );
}
