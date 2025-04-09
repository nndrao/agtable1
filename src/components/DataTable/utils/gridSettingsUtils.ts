import { RefObject, MutableRefObject } from "react";
import { AgGridReact } from "ag-grid-react";
import { useGridStore } from "../store/gridStore";
import { applyNumericFormattingToDefs } from "./numericFormatting";

/**
 * Applies current settings from the store to the grid
 */
export function applySettingsToGrid(
  gridRef: RefObject<AgGridReact>,
  gridReadyRef: MutableRefObject<boolean>,
  lastAppliedSettings: MutableRefObject<{
    gridOptions: any;
    columnDefs: any;
    columnState: any;
    filterModel: any;
  }>
) {
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
  const latestNumericFormat = latestState.numericFormatOption;

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
}

/**
 * Extracts current grid state and saves it to the store
 */
export function saveGridStateToProfile(
  gridRef: RefObject<AgGridReact>,
  sanitizedGridOptions: any,
  setColumnState: (state: any) => void,
  setColumnDefs: (defs: any) => void,
  setFilterModel: (model: any) => void,
  setSortModel: (model: any) => void,
  setGridOptions: (options: any) => void,
  saveToProfile: () => void,
  batchUpdate: (updates: () => void) => void
) {
  console.log("--- saveGridStateToProfile START ---");
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
  }
}

/**
 * Resets the grid state completely before switching profiles
 */
export function resetGridState(
  gridRef: RefObject<AgGridReact>,
  batchUpdate: (updates: () => void) => void
) {
  // Use batch update to prevent multiple refreshes during reset
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

    console.log('Grid state completely reset');
  });
}
