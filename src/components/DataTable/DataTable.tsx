import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { ModuleRegistry, ColDef, GridOptions, SuppressKeyboardEventParams, ValueFormatterParams } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { DataTableToolbar } from "./Toolbar/DataTableToolbar";

import { ProfilesDialog } from "./Settings/Profiles/ProfilesDialog";
import { PropertyGridDialog } from "./Settings/General/PropertyGridDialog";
import { ColumnSettingsDialog } from "./Settings/Columns/ColumnSettingsDialog";
import { useThemeSync } from "./hooks/useThemeSync";
import { useGridStore } from "./store/gridStore";
import { generateColumnDefsFromData, GridRowData, defaultColDef } from "./utils/dataTableHelpers";
import { createGridTheme, applyGridStyles, createGridTransitionsStyle } from "./utils/gridStyling";
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

// --- Add numeric formatting helper functions HERE ---

/**
 * Converts a decimal price to MBS tick format (points-32nds notation)
 */
function decimalToTickFormat(decimalPrice: number | null | undefined): string {
  if (decimalPrice == null || isNaN(decimalPrice)) return "";
  const wholePoints = Math.floor(decimalPrice);
  const fraction = decimalPrice - wholePoints;
  const thirtySeconds = fraction * 32;
  const wholeThirtySeconds = Math.floor(thirtySeconds);
  const remainderIn256ths = Math.round((thirtySeconds - wholeThirtySeconds) * 8);

  if (remainderIn256ths > 0) {
    return `${wholePoints}-${wholeThirtySeconds}${remainderIn256ths}`;
  } else {
    return `${wholePoints}-${wholeThirtySeconds < 10 ? '0' + wholeThirtySeconds : wholeThirtySeconds}`;
  }
}

/**
 * Formats large numbers with K, M, B suffixes.
 */
function formatNumberKMB(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return "";
  if (Math.abs(num) < 1000) {
    return num.toString(); // No suffix needed
  }
  const si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "K" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "B" },
    { value: 1E12, symbol: "T" } // Add Trillion if needed
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (Math.abs(num) >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(1).replace(rx, "$1") + si[i].symbol;
}

/**
 * Applies numeric formatting options to a list of column definitions.
 */
const applyNumericFormattingToDefs = (defs: ColDef[], formatOption: string): ColDef[] => {
  if (!defs) return [];

  // Refined keyword list (removed 'id')
  const numericKeywords = [
    'price', 'amount', 'quantity', 'value', 'number',
    'count', 'size', 'total', 'balance', 'rate', 'level',
    'vol', 'pct', 'percent', 'chg', 'age', 'qty', 'cost'
  ];

  return defs.map((colDef: ColDef) => {
    const fieldName = (colDef.field || colDef.colId || '').toLowerCase();
    const type = colDef.type;
    const isExplicitlyNumeric = Array.isArray(type) ? type.includes('numericColumn') : type === 'numericColumn';
    // Check if type is defined AND is NOT numeric
    const isExplicitlyNonNumeric = type !== undefined && !isExplicitlyNumeric;
    // Only use keywords if type is completely undefined
    const checkKeywords = type === undefined && numericKeywords.some(keyword => fieldName.includes(keyword));

    // Determine if we should apply numeric formatting
    const applyNumericFormat =
        isExplicitlyNumeric || // Definitely numeric
        checkKeywords;          // Type is undefined, but keywords match

    // Only apply formatting if needed AND not explicitly non-numeric
    if (applyNumericFormat && !isExplicitlyNonNumeric) {
      let newValueFormatter: ((params: ValueFormatterParams) => string) | undefined = undefined;

      switch (formatOption) {
        case 'currency':
          newValueFormatter = (params: ValueFormatterParams) => {
            if (params.value == null || isNaN(params.value)) return '';
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value);
          };
          break;
        case 'dec0':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(0);
          break;
        case 'dec1':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(1);
          break;
        case 'dec2':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(2);
          break;
        case 'dec3':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(3);
          break;
        case 'dec4':
          newValueFormatter = (params: ValueFormatterParams) => (params.value == null || isNaN(params.value)) ? '' : params.value.toFixed(4);
          break;
        case 'kmb': // Note: Was 'k', 'm', 'b' before, consolidated
          newValueFormatter = (params: ValueFormatterParams) => formatNumberKMB(params.value);
          break;
        case 'tick':
          newValueFormatter = (params: ValueFormatterParams) => decimalToTickFormat(params.value);
          break;
        case 'default':
        default:
          newValueFormatter = undefined;
          break;
      }

      return {
          ...colDef,
          cellStyle: colDef.cellStyle,
          valueFormatter: newValueFormatter
      };
    }

    // Return original definition if no formatting applied
    return colDef;
  });
};

// --- Rest of the DataTable component ---

export function DataTable({
  data,
  id,
  isDark = false, // Default to light mode if not specified
  rowData: externalRowData,
  gridOptions: externalGridOptions,
  onThemeChange
}: DataTableProps) {
  // Use the grid store with selectors
  const spacing = useGridStore(state => state.spacing);
  const fontSize = useGridStore(state => state.fontSize);
  const selectedFont = useGridStore(state => state.selectedFont);
  const gridOptions = useGridStore(state => state.gridOptions); // Needed for sanitizedGridOptions & handleSaveProfile
  const profiles = useGridStore(state => state.profiles); // Needed for Toolbar
  const selectedProfileId = useGridStore(state => state.selectedProfileId); // Needed for Toolbar & useEffect
  const numericFormatOption = useGridStore(state => state.numericFormatOption);

  // Select actions
  const setSpacing = useGridStore(state => state.setSpacing);
  const setFontSize = useGridStore(state => state.setFontSize);
  const setSelectedFont = useGridStore(state => state.setSelectedFont);
  const setColumnState = useGridStore(state => state.setColumnState);
  const setColumnDefs = useGridStore(state => state.setColumnDefs);
  const setFilterModel = useGridStore(state => state.setFilterModel);
  const setSortModel = useGridStore(state => state.setSortModel); // Needed for handleSaveProfile
  const setGridOptions = useGridStore(state => state.setGridOptions); // Needed for handleSaveProfile
  const saveToProfile = useGridStore(state => state.saveToProfile);
  const selectProfile = useGridStore(state => state.selectProfile);
  const setNumericFormatOption = useGridStore(state => state.setNumericFormatOption);

  // Local state for UI components
  const [profilesDialogOpen, setProfilesDialogOpen] = useState(false);
  const [generalSettingsOpen, setGeneralSettingsOpen] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  // Refs to manage initial load logic
  const gridReadyRef = useRef(false);
  const isHydratedRef = useRef(useGridStore.persist.hasHydrated());
  const didInitialLoadApplyRef = useRef(false);

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

  // REMOVED: Unused state variable
  // const [suppressGridRefresh, setSuppressGridRefresh] = useState(false);
  // Restore setter for use in batchUpdate, ignore state variable
  const [, setSuppressGridRefresh] = useState(false);

  // Track the last applied settings to avoid unnecessary updates
  // Linter flags 'any', but using specific types might require importing them
  // Leaving as 'any' for now to avoid further potential issues
  const lastAppliedSettings = useRef({
    gridOptions: null as any,
    columnDefs: null as any,
    columnState: null as any,
    filterModel: null as any
  });

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

  // ** Define applySettingsToGrid function ONLY ONCE and AFTER helpers **
  const applySettingsToGrid = useCallback(() => {
    // Use refs for checks inside the callback
    if (!gridReadyRef.current || !gridRef.current?.api) {
      console.log('Apply skipped: Grid not ready or API not available');
      return;
    }
    console.log('Applying settings to grid');
    const gridApi = gridRef.current.api;
    const latestState = useGridStore.getState();
    const latestStoredColumnDefs = latestState.columnDefs;
    const latestColumnState = latestState.columnState;
    const latestFilterModel = latestState.filterModel;
    const latestGridOptions = latestState.gridOptions;
    const latestNumericFormat = latestState.numericFormatOption; // Get format

    // Apply numeric formatting BEFORE saving/applying definitions
    let formattedDefs = latestStoredColumnDefs; // Start with original
    if (latestStoredColumnDefs) {
        console.log(`Applying numeric format '${latestNumericFormat}' to column definitions`);
        // Use the helper defined above
        formattedDefs = applyNumericFormattingToDefs(latestStoredColumnDefs, latestNumericFormat);
    }

    // Apply column definitions (now formatted) if changed
    // Compare and apply the *formatted* definitions
    if (formattedDefs && formattedDefs !== lastAppliedSettings.current.columnDefs) {
      console.log('Apply Check 2: Applying column definitions with formatting');
      console.log('Formatted Defs to Apply:', JSON.stringify(formattedDefs.map((d: any) => ({ field: d.field, type: d.type, cellStyle: d.cellStyle, valueFormatter: d.valueFormatter ? '[Function]' : undefined })))); // Log relevant parts
      // Apply the FORMATTED definitions
      gridApi.setGridOption('columnDefs', formattedDefs);
      // Store the reference to the FORMATTED definitions
      lastAppliedSettings.current.columnDefs = formattedDefs;
    }

    // Apply column state if changed
    if (latestColumnState && latestColumnState !== lastAppliedSettings.current.columnState) {
      console.log('Applying column state');
      gridApi.applyColumnState({ state: latestColumnState, applyOrder: true });
       lastAppliedSettings.current.columnState = latestColumnState;
    }

    // Apply filter model
    if (latestFilterModel && latestFilterModel !== lastAppliedSettings.current.filterModel) {
      console.log('Applying filter model');
      gridApi.setFilterModel(latestFilterModel);
      lastAppliedSettings.current.filterModel = latestFilterModel;
    }

    // Apply grid options
    if (latestGridOptions && latestGridOptions !== lastAppliedSettings.current.gridOptions) {
      console.log('Applying grid options');
      lastAppliedSettings.current.gridOptions = latestGridOptions;
    }

    // Refresh grid
    console.log("Refreshing grid after explicit apply");
    gridApi.refreshCells({force: true});
    gridApi.redrawRows();
    console.log('Settings applied to grid');
  }, [
    gridRef,
    gridId,
   ]);

  // Function to check conditions and apply initial settings ONCE
  const checkAndApplyInitialSettings = useCallback(() => {
    console.log(`Checking initial apply: Hydrated=${isHydratedRef.current}, GridReady=${gridReadyRef.current}, InitialApplied=${didInitialLoadApplyRef.current}`);
    if (
      isHydratedRef.current &&
      gridReadyRef.current &&
      !didInitialLoadApplyRef.current
    ) {
      console.log("Conditions met, applying initial settings.");
      applySettingsToGrid();
      didInitialLoadApplyRef.current = true; // Ensure it only runs once
    }
  }, [applySettingsToGrid]); // Dependency on the apply function itself

  // Effect to watch hydration status
  const isHydrated = useGridStore.persist.hasHydrated();
  useEffect(() => {
    if (isHydrated && !isHydratedRef.current) {
        console.log("Store hydration detected.");
        isHydratedRef.current = true;
        checkAndApplyInitialSettings();
    }
  }, [isHydrated, checkAndApplyInitialSettings]);

  // Handle grid ready event
  const onGridReady = useCallback(() => {
    setGridReady(true); // Set state as well as ref
    console.log("Grid is ready.");
    gridReadyRef.current = true; // Set the ref

    // Add event listeners for debugging (keep if useful)
    if (gridRef.current?.api) {
      // ... existing debug listeners ...
    }

    // Check if initial settings can be applied now
    checkAndApplyInitialSettings();

  }, [gridId, gridRef, checkAndApplyInitialSettings, setGridReady]); // Add setGridReady dependency

  // Memoize the combined grid options passed to AgGridReact
  const memoizedGridOptions = useMemo(() => {
    // Start with external options, then override with sanitized store options
    return {
      ...externalGridOptions, // Apply external first
      ...sanitizedGridOptions // Override with sanitized store options
    };
    // Dependencies ensure this recalculates if either source changes
  }, [externalGridOptions, sanitizedGridOptions]);

  // ** Moved suppressKeyboardEvent definition earlier **
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

  // Memoize defaultColDef to ensure stability
  const memoizedDefaultColDef = useMemo(() => ({
    ...defaultColDef,
    suppressKeyboardEvent: suppressKeyboardEvent // Now defined earlier
  }), [suppressKeyboardEvent]);

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
    console.log("--- handleSaveProfile START ---");
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
      // If grid is not ready, just select the profile (apply will happen on grid ready)
      selectProfile(id);
    }

    // Trigger settings application *after* the batch update logic and store update
    // Use setTimeout to ensure it runs after the current render cycle triggered by batchUpdate state changes
    setTimeout(() => {
      console.log("Triggering applySettingsToGrid after profile switch");
      applySettingsToGrid();
    }, 0);
  }, [selectProfile, batchUpdate, applySettingsToGrid]); // Add applySettingsToGrid

  // Custom navigation handler to implement cell navigation behavior
  const navigateToNextCell = useCallback((params: any) => {
    // Add null check for gridRef.current.api
    const api = gridRef.current?.api;
    // Destructure params *after* the api check
    const { nextCellPosition, previousCellPosition, event } = params;
    // FIX: Return default *after* destructuring if api not ready
    if (!api) return nextCellPosition;

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

  // Handler for numeric format change from Toolbar
  const handleNumericFormatChange = useCallback((option: string) => {
    console.log(`--> handleNumericFormatChange called with option: ${option}`); // LOG 1
    setNumericFormatOption(option);
    // Trigger grid update after state change
    setTimeout(() => {
      console.log('--> Triggering applySettingsToGrid from handleNumericFormatChange'); // LOG 2
      applySettingsToGrid();
    }, 0);
  }, [setNumericFormatOption, applySettingsToGrid]);

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
        numericFormatOption={numericFormatOption} // Pass current format
        onNumericFormatChange={handleNumericFormatChange} // Pass handler
      />

      {/* AG Grid */}
      <div id={gridId} className="ag-theme-quartz flex-1">
        {themeReady && (
          <AgGridReact
            ref={gridRef}
            theme={gridTheme}
            columnDefs={columnDefs} // Assuming this is memoized correctly upstream or stable
            rowData={rowData} // Assuming this is memoized correctly upstream or stable
            defaultColDef={memoizedDefaultColDef} // Use memoized version
            sideBar={true}
            domLayout="normal"
            className="h-full w-full"
            onGridReady={onGridReady}
            stopEditingWhenCellsLoseFocus={false}
            navigateToNextCell={navigateToNextCell}
            // Apply the memoized combined options object
            {...memoizedGridOptions} // Use memoized version
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
            applySettingsToGrid();
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
             applySettingsToGrid();
          }
        }}
        gridRef={gridRef}
      />
    </div>
  );
}
