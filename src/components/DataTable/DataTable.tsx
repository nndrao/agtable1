import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { ModuleRegistry, ColDef, GridOptions, SuppressKeyboardEventParams } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { DataTableToolbar } from "./Toolbar/DataTableToolbar";

import { ProfilesDialog } from "./Settings/Profiles/ProfilesDialog";
import { GeneralSettingsDialog } from "./Settings/General/GeneralSettingsDialog";
import { PropertyGridDialog } from "./Settings/General/PropertyGridDialog";
import { ColumnSettingsDialog } from "./Settings/Columns/ColumnSettingsDialog";
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
    columnDefs: storedColumnDefs,
    filterModel,
    sortModel,
    gridOptions,
    profiles,
    selectedProfileId,
    setSpacing,
    setFontSize,
    setSelectedFont,
    setColumnState,
    setColumnDefs,
    setFilterModel,
    setSortModel,
    setGridOptions,
    saveToProfile,
    selectProfile
  } = useGrid();

  // Local state for UI components
  const [profilesDialogOpen, setProfilesDialogOpen] = useState(false);
  const [generalSettingsOpen, setGeneralSettingsOpen] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  // Add state to explicitly trigger settings application
  const [applySettingsTrigger, setApplySettingsTrigger] = useState(0);

  // Use a unique ID for this grid instance
  const gridId = id || `grid-${Math.random().toString(36).substring(2, 11)}`;

  // Use the theme sync hook
  const { darkMode, themeReady, handleThemeChange: onThemeChangeHandler } = useThemeSync({
    isDark,
    onThemeChange
  });

  // Create grid theme
  const gridTheme = useMemo(() => createGridTheme(selectedFont.value), [selectedFont.value]);

  // Convert invalid grid options to valid ones
  // This fixes warnings about invalid grid options
  const sanitizedGridOptions = useMemo(() => {
    if (!gridOptions) return {};

    // Create a deep copy to avoid mutating the original object
    const sanitized = JSON.parse(JSON.stringify(gridOptions));

    // Remove or convert all invalid grid options
    if ('suppressCellBorders' in sanitized) delete sanitized.suppressCellBorders;
    if ('suppressHeaderBorders' in sanitized) delete sanitized.suppressHeaderBorders;
    if ('enableCellChangeFlash' in sanitized) delete sanitized.enableCellChangeFlash;
    if ('navigateToNextCellWhenAtLastCell' in sanitized) {
      sanitized.navigateToNextCellOnLastCell = sanitized.navigateToNextCellWhenAtLastCell;
      delete sanitized.navigateToNextCellWhenAtLastCell;
    }
    if ('enterMovesDown' in sanitized) {
      sanitized.enterNavigatesVertically = sanitized.enterMovesDown;
      delete sanitized.enterMovesDown;
    }
    if ('arrowKeysNavigateAfterEdit' in sanitized) {
      sanitized.useCustomNavigation = sanitized.arrowKeysNavigateAfterEdit;
      delete sanitized.arrowKeysNavigateAfterEdit;
    }
    if ('enterMovesDownAfterEdit' in sanitized) {
      sanitized.enterNavigatesVerticallyAfterEdit = sanitized.enterMovesDownAfterEdit;
      delete sanitized.enterMovesDownAfterEdit;
    }

    return sanitized;
  }, [gridOptions]);

  // Set up grid styling
  useEffect(() => {
    // Apply styles to the grid
    applyGridStyles(gridId, selectedFont.value, fontSize, spacing, darkMode || false);

    // Create transitions style element
    createGridTransitionsStyle(gridId);

    // Clean up on unmount
    return () => {
      const transElement = document.getElementById(`grid-transitions-${gridId}`);
      if (transElement) {
        document.head.removeChild(transElement);
      }
    };
  }, [darkMode, selectedFont, gridId, fontSize, spacing]);

  // Handle font change
  const handleFontChangeCallback = useCallback((font: { name: string; value: string }) => {
    setSelectedFont(font);

    // Apply font family directly to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-font-family', font.value);
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
  }, [gridId, setFontSize]);

  // Track when we need to refresh the grid
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Flag to suppress grid refreshes during save profile operations
  const [suppressGridRefresh, setSuppressGridRefresh] = useState(false);

  // Flag to track when settings have changed and need to be applied
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Track the last applied settings to avoid unnecessary updates
  const lastAppliedSettings = useRef({
    gridOptions: null as any,
    columnDefs: null as any,
    columnState: null as any,
    filterModel: null as any
  });

  // Detect when any settings change
  useEffect(() => {
    // Check if grid refreshes are suppressed (during save profile operation)
    if (suppressGridRefresh) {
      console.log('Settings change detection suppressed during save profile operation');
      return;
    }

    // Check if any settings have changed
    const gridOptionsChanged = gridOptions !== lastAppliedSettings.current.gridOptions;
    const columnDefsChanged = storedColumnDefs !== lastAppliedSettings.current.columnDefs;
    const columnStateChanged = columnState !== lastAppliedSettings.current.columnState;
    const filterModelChanged = filterModel !== lastAppliedSettings.current.filterModel;

    if (gridOptionsChanged || columnDefsChanged || columnStateChanged || filterModelChanged) {
      console.log('Settings changed, marking for update');
      setSettingsChanged(true);
    }
  }, [gridOptions, storedColumnDefs, columnState, filterModel, suppressGridRefresh]);

  // Apply settings in the correct order ONLY when explicitly triggered
  useEffect(() => {
    // Don't run if not ready or if trigger hasn't changed (initial state 0)
    if (!gridReady || !gridRef.current?.api || applySettingsTrigger === 0) {
      return;
    }

    console.log(`Applying settings due to trigger: ${applySettingsTrigger}`);

    // Store a reference to the grid API to avoid null checks
    const gridApi = gridRef.current.api;

    // 1. First apply general settings (grid options)
    // Use sanitizedGridOptions which is already memoized
    if (sanitizedGridOptions && sanitizedGridOptions !== lastAppliedSettings.current.gridOptions) {
      console.log('1. Applying grid options:', sanitizedGridOptions);
      // We pass options declaratively now, but keep track of what was applied
      lastAppliedSettings.current.gridOptions = sanitizedGridOptions;
      // applyGridOptions might still be needed if it does more than setGridOption
      // If applyGridOptions just sets options, it might be redundant with the declarative prop
      // applyGridOptions(gridRef, gridId, sanitizedGridOptions); // Review if needed
    }

    // 2. Second apply column definition settings FROM THE STORE
    // Check if stored definitions exist and have changed since last apply
    if (storedColumnDefs && storedColumnDefs.length > 0 && storedColumnDefs !== lastAppliedSettings.current.columnDefs) {
      console.log('2. Applying stored column definitions:', storedColumnDefs);
      // Apply the definitions saved in the store
      gridApi.setGridOption('columnDefs', storedColumnDefs);
      // Update the last applied setting reference
      lastAppliedSettings.current.columnDefs = storedColumnDefs;
    }

    // 3. Lastly apply column state and other settings extracted directly from AG-Grid
    if (columnState && columnState.length > 0 && columnState !== lastAppliedSettings.current.columnState) {
      console.log('3. Applying column state:', columnState);
      gridApi.applyColumnState({
        state: columnState,
        applyOrder: true
      });
      lastAppliedSettings.current.columnState = columnState;
    }

    // Apply filter model if available
    if (filterModel && Object.keys(filterModel).length > 0 && filterModel !== lastAppliedSettings.current.filterModel) {
      console.log('4. Applying filter model:', filterModel);
      gridApi.setFilterModel(filterModel);
      lastAppliedSettings.current.filterModel = filterModel;
    }

    // Now refresh the grid once after all settings have been applied
    console.log('5. Refreshing grid after all triggered settings have been applied');
    gridApi.refreshCells({ force: true });
    gridApi.redrawRows();

    // Reset flags if they were used (might be removable)
    // setSettingsChanged(false);
    // setNeedsRefresh(false);

    // Depend on the trigger and the state values needed *inside* the effect
  }, [gridReady, applySettingsTrigger, sanitizedGridOptions, storedColumnDefs, columnState, filterModel, gridId]);

  // Load the selected profile when the component mounts
  // This ensures the grid loads the last selected profile when the app reloads
  useEffect(() => {
    // Only load if we have a selected profile and the grid is ready
    if (gridReady && selectedProfileId) {
      // The settings application effect triggered by onGridReady will handle applying the initial profile state
      console.log(`Profile selected on load: ${selectedProfileId}, applied by trigger.`);
    }
  }, [gridReady, selectedProfileId]); // Keep dependencies simple

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

    // Initial application of options/state is now handled by the main settings effect triggered below
    console.log("Grid is ready.");

    // Add event listeners for debugging (keep if useful)
    if (gridRef.current?.api) {
      // ... existing debug listeners ...
    }

    // Trigger initial settings application
    console.log("Triggering initial settings apply on grid ready");
    setApplySettingsTrigger(prev => prev + 1); // Initial trigger

  }, [gridId, gridRef]); // Simplified dependencies

  // Function to perform a batch update without refreshing the grid
  const batchUpdate = useCallback((updates: () => void) => {
    // Set the suppress flag to prevent grid refreshes during the batch update
    setSuppressGridRefresh(true);

    try {
      // Execute the updates
      updates();
    } finally {
      // Use requestAnimationFrame to reset the suppress flag after the current render cycle
      // This ensures that the flag is reset after all the effects have been skipped
      requestAnimationFrame(() => {
        setSuppressGridRefresh(false);
        console.log('Grid refresh suppression disabled');
      });
    }
  }, [setSuppressGridRefresh]);

  // Save current grid state to profile without refreshing the grid
  const handleSaveProfile = useCallback(() => {
    if (gridRef.current?.api) {
      console.log('Saving profile - extracting current grid state');

      // Explicitly extract current grid state
      const columnState = gridRef.current.api.getColumnState() || [];
      console.log('Saving column state:', columnState);

      // Get column definitions with current widths from column state
      const currentColDefs = gridRef.current.api.getColumnDefs() || [];

      // Merge column state information (width, etc.) into column definitions
      const enhancedColumnDefs = currentColDefs.map((colDef: any) => {
        // Find the matching column state
        const colState = columnState.find((state: any) =>
          state.colId === (colDef.colId || colDef.field)
        );

        // If we have state for this column, merge it with the column definition
        if (colState) {
          return {
            ...colDef,
            // Add width from column state if it exists
            width: colState.width,
            // Add flex from column state if it exists
            flex: colState.flex,
            // Add visibility from column state
            hide: colState.hide,
            // Add pinned state from column state
            pinned: colState.pinned
          };
        }

        return colDef;
      });

      const filterModel = gridRef.current.api.getFilterModel() || {};
      const sortModel = columnState.filter(col => col.sort).map(col => ({
        colId: col.colId,
        sort: col.sort,
        sortIndex: col.sortIndex
      }));

      // Prepare grid options (use sanitizedGridOptions for consistency)
      const updatedGridOptions = sanitizedGridOptions; // Already includes external + store

      // Perform a batch update without refreshing the grid
      batchUpdate(() => {
        // Update the store with the current grid state
        setColumnState(columnState);
        setColumnDefs(enhancedColumnDefs); // Save the definitions *with* state applied
        setFilterModel(filterModel);
        setSortModel(sortModel);
        setGridOptions(updatedGridOptions); // Save the combined & sanitized options

        // Now save to profile - this will update the profile in the store
        // with all the current state including column widths
        saveToProfile();

        console.log('Profile saved with column state and enhanced column definitions');
      });
       // NO trigger needed here, saving doesn't update the *live* grid immediately
    }
  }, [saveToProfile, setColumnState, setColumnDefs, setFilterModel, setSortModel, setGridOptions, sanitizedGridOptions, batchUpdate]); // Use sanitizedGridOptions

  // Open profiles dialog
  const handleManageProfiles = useCallback(() => {
    setProfilesDialogOpen(true);
  }, []);

  // Open general settings dialog
  const handleGeneralSettings = useCallback(() => {
    setGeneralSettingsOpen(true);
  }, []);

  // Open column settings dialog
  const handleColumnSettings = useCallback(() => {
    setColumnSettingsOpen(true);
  }, []);

  // Handle profile selection
  const handleSelectProfile = useCallback((id: string) => {
    console.log('Switching to profile:', id);

    // Completely reset the grid before applying new profile settings
    if (gridRef.current?.api) {
      // Use batch update to prevent multiple refreshes during reset and profile selection
      batchUpdate(() => {
        // Store a reference to the grid API to avoid null checks
        const gridApi = gridRef.current?.api;
        if (!gridApi) return;

        // 1. Reset all column state
        // This completely clears all column state including widths, visibility, etc.
        console.log('Completely resetting column state before switching profiles');
        gridApi.applyColumnState({
          defaultState: {
            sort: null,
            width: undefined, // Clear width
            flex: undefined,  // Clear flex
            hide: false,      // Show all columns
            pinned: null      // Unpin all columns
          },
          applyOrder: true,
          state: [] // Empty state to clear everything
        });

        // 2. Clear all filter models
        gridApi.setFilterModel({});

        // 3. Reset column definitions to bare minimum
        const currentColDefs = gridApi.getColumnDefs();
        if (currentColDefs) {
          // Create stripped-down column definitions with only essential properties
          // Use type assertion to avoid TypeScript errors
          const bareColumnDefs = currentColDefs.map((colDef: any) => ({
            field: colDef.field,
            colId: colDef.colId || colDef.field,
            headerName: colDef.headerName
          }));

          // Apply the bare column definitions
          gridApi.setGridOption('columnDefs', bareColumnDefs);
        }

        // 4. Reset any other grid state
        gridApi.resetRowHeights();
        gridApi.redrawRows();

        // 5. Clear any custom styling
        gridApi.refreshHeader();

        console.log('Grid state completely reset before switching profiles');

        // Now select the new profile - this will hydrate the grid store with the profile settings
        // This is done inside the batch update to prevent multiple refreshes
        selectProfile(id);
      });
    } else {
      // If grid is not ready, just select the profile
      selectProfile(id);
    }

    // Trigger settings application *after* the batch update logic has run
    // Use setTimeout to ensure it runs after the current render cycle triggered by batchUpdate state changes
    setTimeout(() => {
        console.log("Triggering settings apply after profile switch");
        setApplySettingsTrigger(prev => prev + 1);
    }, 0);
  }, [selectProfile, batchUpdate]);

  // Handle keyboard events, especially arrow keys during editing
  const suppressKeyboardEvent = useCallback((params: SuppressKeyboardEventParams) => {
    const { event, editing, api } = params;
    console.log('suppressKeyboardEvent called:', {
      key: event.key,
      editing,
      type: event.type,
      target: event.target instanceof HTMLElement ? event.target.tagName : 'unknown'
    });

    // Handle arrow keys during editing
    if (editing && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      // Check if custom navigation after edit is enabled in grid options
      const useCustomNavigation = sanitizedGridOptions?.useCustomNavigation === true;
      console.log('useCustomNavigation enabled:', useCustomNavigation);

      // If the feature is disabled, don't suppress the event
      if (!useCustomNavigation) {
        console.log('Feature disabled, not handling arrow keys');
        return false;
      }

      // Stop editing and save changes
      console.log('Stopping edit and saving changes');
      api.stopEditing();

      // Get the current focused cell
      const focusedCell = api.getFocusedCell();
      if (!focusedCell) {
        console.log('No focused cell found');
        return true; // Suppress the event anyway
      }

      console.log('Current focused cell:', focusedCell);

      // Calculate the next row index
      const nextRowIndex = event.key === 'ArrowUp' ?
        focusedCell.rowIndex - 1 :
        focusedCell.rowIndex + 1;

      console.log('Moving to row:', nextRowIndex);

      // Set focus to the next cell
      setTimeout(() => {
        api.setFocusedCell(nextRowIndex, focusedCell.column);
      }, 0);

      // Suppress the default event
      return true;
    }

    // Don't suppress other events
    return false;
  }, [sanitizedGridOptions]);

  // Custom navigation handler to implement cell navigation behavior
  const navigateToNextCell = useCallback((params: any) => {
    // Add null check for gridRef.current.api
    const api = gridRef.current?.api;
    if (!api) return nextCellPosition; // Return default if api not ready

    const { nextCellPosition, previousCellPosition, event } = params;

    // If there's no next cell position (we're at an edge), decide what to do based on settings
    if (!nextCellPosition) {
      // Check if we should navigate to the next row or column when at the last cell
      const navigateToNextCellOnLastCell = sanitizedGridOptions?.navigateToNextCellOnLastCell === true;

      if (navigateToNextCellOnLastCell && previousCellPosition) {
        // Determine direction based on the key pressed
        const isTabKey = event?.key === 'Tab';
        const isShiftKey = event?.shiftKey === true;
        const isEnterKey = event?.key === 'Enter';

        // Handle Tab key navigation (horizontal movement)
        if (isTabKey) {
          const direction = isShiftKey ? -1 : 1;
          // Moving right at the rightmost cell - wrap to the next row
          if (direction > 0 && previousCellPosition.column.isPinned !== 'right') {
            const firstCol = api.getAllDisplayedColumns()?.[0]; // Get first displayed column
            return {
              rowIndex: previousCellPosition.rowIndex + 1,
              column: firstCol || previousCellPosition.column, // Fallback if no columns
              rowPinned: previousCellPosition.rowPinned
            };
          }
          // Moving left at the leftmost cell - wrap to the previous row
          else if (direction < 0 && previousCellPosition.column.isPinned !== 'left') {
             const allCols = api.getAllDisplayedColumns();
             const lastCol = allCols?.[allCols.length - 1]; // Get last displayed column
            return {
              rowIndex: previousCellPosition.rowIndex - 1,
              column: lastCol || previousCellPosition.column, // Fallback if no columns
              rowPinned: previousCellPosition.rowPinned
            };
          }
        }

        // Handle Enter key navigation (vertical movement) if enterNavigatesVertically is enabled
        const enterNavigatesVertically = sanitizedGridOptions?.enterNavigatesVertically === true;
        if (isEnterKey && enterNavigatesVertically) {
          const direction = isShiftKey ? -1 : 1;
          return {
            rowIndex: previousCellPosition.rowIndex + direction,
            column: previousCellPosition.column,
            rowPinned: previousCellPosition.rowPinned
          };
        }
      }
    }

    // Return the default next cell position
    return nextCellPosition;
  }, [sanitizedGridOptions, gridRef]); // Add gridRef dependency

  // We're now handling arrow key navigation in suppressKeyboardEvent instead

  // Memoize the combined grid options passed to AgGridReact
  const memoizedGridOptions = useMemo(() => {
    // Start with external options, then override with sanitized store options
    return {
      ...externalGridOptions, // Apply external first
      ...sanitizedGridOptions // Override with sanitized store options
    };
    // Dependencies ensure this recalculates if either source changes
  }, [externalGridOptions, sanitizedGridOptions]);

  // Memoize defaultColDef to ensure stability
  const memoizedDefaultColDef = useMemo(() => ({
    ...defaultColDef, // Assuming defaultColDef imported object is static
    suppressKeyboardEvent: suppressKeyboardEvent // suppressKeyboardEvent is a useCallback, so stable
  }), [suppressKeyboardEvent]);

  return (
    <div
      className={`flex h-full flex-col rounded-md border ${darkMode ? 'dark' : 'light'}`}
      data-theme={darkMode ? 'dark' : 'light'}
    >
      <DataTableToolbar
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
        onColumnSettings={handleColumnSettings}
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
            defaultColDef={memoizedDefaultColDef}
            sideBar={true}
            domLayout="normal"
            className="h-full w-full"
            onGridReady={onGridReady}
            stopEditingWhenCellsLoseFocus={false}
            navigateToNextCell={navigateToNextCell}
            // Apply the memoized combined options object
            {...memoizedGridOptions}
          />
        )}
      </div>

      <ProfilesDialog
        open={profilesDialogOpen}
        onOpenChange={setProfilesDialogOpen}
      />

      {/* Use the new PropertyGridDialog instead of GeneralSettingsDialog */}
      <PropertyGridDialog
        open={generalSettingsOpen}
        // Trigger settings application when dialog is closed (proxy for save)
        onOpenChange={(isOpen) => {
          setGeneralSettingsOpen(isOpen);
          if (!isOpen) {
            console.log("Triggering settings apply after General Settings close");
            setApplySettingsTrigger(prev => prev + 1);
          }
        }}
      />

      <ColumnSettingsDialog
        open={columnSettingsOpen}
         // Trigger settings application when dialog is closed (proxy for save)
        onOpenChange={(isOpen) => {
          setColumnSettingsOpen(isOpen);
          if (!isOpen) {
             console.log("Triggering settings apply after Column Settings close");
             setApplySettingsTrigger(prev => prev + 1);
          }
        }}
        gridRef={gridRef}
      />
    </div>
  );
}
