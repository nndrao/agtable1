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

    // Debug keyboard events at the DOM level
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('DOM keydown event:', {
        key: event.key,
        target: event.target instanceof HTMLElement ? event.target.tagName : 'unknown',
        isEditing: Boolean(gridRef.current?.api?.getEditingCells()?.length)
      });
    };

    gridElement.addEventListener('spacing-change-complete', handleSpacingChangeComplete);
    gridElement.addEventListener('fontsize-change-complete', handleFontSizeChangeComplete);
    gridElement.addEventListener('keydown', handleKeyDown);

    return () => {
      gridElement.removeEventListener('spacing-change-complete', handleSpacingChangeComplete);
      gridElement.removeEventListener('fontsize-change-complete', handleFontSizeChangeComplete);
      gridElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [gridId]);

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

  // Apply settings in the correct order when they change
  useEffect(() => {
    if (!gridReady || !gridRef.current?.api || !settingsChanged || suppressGridRefresh) {
      return;
    }

    console.log('Applying settings in the correct order');

    // Store a reference to the grid API to avoid null checks
    const gridApi = gridRef.current.api;

    // 1. First apply general settings (grid options)
    if (gridOptions && gridOptions !== lastAppliedSettings.current.gridOptions) {
      console.log('1. Applying grid options:', gridOptions);
      applyGridOptions(gridRef, gridId, gridOptions);
      lastAppliedSettings.current.gridOptions = gridOptions;
    }

    // 2. Second apply column definition settings
    if (storedColumnDefs && storedColumnDefs.length > 0 && storedColumnDefs !== lastAppliedSettings.current.columnDefs) {
      console.log('2. Applying column definitions:', storedColumnDefs);

      // Get current column definitions
      const currentColDefs = gridApi.getColumnDefs();
      if (currentColDefs) {
        // Create a completely new set of column definitions based on stored ones
        const newColumnDefs = currentColDefs.map((colDef: any) => {
          // Start with a minimal column definition with only essential properties
          const baseColDef: any = {
            field: colDef.field,
            colId: colDef.colId || colDef.field,
            headerName: colDef.headerName
          };

          // Find the matching stored column definition
          const storedColDef = storedColumnDefs.find((col: any) =>
            (col.field && col.field === colDef.field) || (col.colId && col.colId === colDef.colId)
          );

          // If we have stored settings for this column, apply them
          if (storedColDef) {
            // Only apply properties that are explicitly set in the stored definition
            Object.keys(storedColDef).forEach(key => {
              // Skip the field and colId properties as they're already set
              if (key !== 'field' && key !== 'colId' && storedColDef[key] !== undefined) {
                baseColDef[key] = storedColDef[key];
              }
            });
          }

          return baseColDef;
        });

        // Set the new column definitions
        gridApi.setGridOption('columnDefs', newColumnDefs);
      }

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
    console.log('5. Refreshing grid after all settings have been applied');
    gridApi.refreshCells({ force: true });
    gridApi.redrawRows();

    // Reset the settings changed flag
    setSettingsChanged(false);
    setNeedsRefresh(false);
  }, [gridReady, settingsChanged, suppressGridRefresh, gridOptions, storedColumnDefs, columnState, filterModel, gridId]);

  // Effect to handle grid refresh after all updates are applied
  // This is a fallback for any other changes that might need a refresh
  useEffect(() => {
    if (gridReady && gridRef.current?.api && needsRefresh && !suppressGridRefresh && !settingsChanged) {
      console.log('Refreshing grid after other updates');

      // Refresh the grid to apply all changes
      gridRef.current.api.refreshCells({ force: true });
      gridRef.current.api.redrawRows();

      // Reset the refresh flag
      setNeedsRefresh(false);
    }
  }, [gridReady, needsRefresh, suppressGridRefresh, settingsChanged]);

  // We've removed the old column definitions effect
  // It's been replaced by the new effect that applies settings in the correct order

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

  // We've removed the old grid options effect
  // It's been replaced by the new effect that applies settings in the correct order

  // We've removed the duplicate grid options effect
  // The effect at lines 311-317 will handle both initial and subsequent grid options changes

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

      // Add event listeners for debugging
      gridRef.current.api.addEventListener('cellKeyDown', (params: any) => {
        if (params.event && 'key' in params.event) {
          console.log('cellKeyDown event:', {
            key: params.event.key,
            editing: Boolean(gridRef.current?.api?.getEditingCells()?.length),
            cell: params.column ? `${params.column.getId()}:${params.rowIndex}` : 'unknown'
          });
        }
      });

      // Track editing state
      gridRef.current.api.addEventListener('cellEditingStarted', (params: any) => {
        console.log('cellEditingStarted:', {
          cell: params.column ? `${params.column.getId()}:${params.rowIndex}` : 'unknown',
          value: params.value
        });
      });

      gridRef.current.api.addEventListener('cellEditingStopped', (params: any) => {
        console.log('cellEditingStopped:', {
          cell: params.column ? `${params.column.getId()}:${params.rowIndex}` : 'unknown',
          oldValue: params.oldValue,
          newValue: params.value,
          cancelled: params.valueChanged === false
        });
      });
    }
  }, [gridId, gridOptions, gridRef]);

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
      // In AG-Grid 33+, we need to handle this differently
      // For AG-Grid 33+, use getColumnState() to get the sort model
      // The sort information is included in the column state
      const sortModel = columnState.filter(col => col.sort).map(col => ({
        colId: col.colId,
        sort: col.sort,
        sortIndex: col.sortIndex
      }));

      // Prepare grid options
      const updatedGridOptions = externalGridOptions
        ? { ...gridOptions, ...externalGridOptions }
        : gridOptions;

      // Perform a batch update without refreshing the grid
      batchUpdate(() => {
        // Update the store with the current grid state
        setColumnState(columnState);
        setColumnDefs(enhancedColumnDefs);
        setFilterModel(filterModel);
        setSortModel(sortModel);
        setGridOptions(updatedGridOptions);

        // Now save to profile - this will update the profile in the store
        // with all the current state including column widths
        saveToProfile();

        console.log('Profile saved with column state and enhanced column definitions');
      });
    }
  }, [saveToProfile, setColumnState, setColumnDefs, setFilterModel, setSortModel, setGridOptions, gridOptions, externalGridOptions, batchUpdate]);

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
            return {
              rowIndex: previousCellPosition.rowIndex + 1,
              column: api.getDisplayedColAfterCol(null), // First column
              rowPinned: previousCellPosition.rowPinned
            };
          }
          // Moving left at the leftmost cell - wrap to the previous row
          else if (direction < 0 && previousCellPosition.column.isPinned !== 'left') {
            return {
              rowIndex: previousCellPosition.rowIndex - 1,
              column: api.getDisplayedColBeforeCol(null), // Last column
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
  }, [sanitizedGridOptions]);

  // We're now handling arrow key navigation in suppressKeyboardEvent instead

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
            defaultColDef={{
              ...defaultColDef,
              suppressKeyboardEvent: suppressKeyboardEvent
            }}
            sideBar={true}
            domLayout="normal"
            className="h-full w-full"
            onGridReady={onGridReady}
            stopEditingWhenCellsLoseFocus={false}
            navigateToNextCell={navigateToNextCell}
            // Apply external grid options first
            {...externalGridOptions}
            // Then apply sanitized store grid options to override external options
            {...sanitizedGridOptions}
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
        onOpenChange={setGeneralSettingsOpen}
      />

      <ColumnSettingsDialog
        open={columnSettingsOpen}
        onOpenChange={setColumnSettingsOpen}
        gridRef={gridRef}
      />
    </div>
  );
}
