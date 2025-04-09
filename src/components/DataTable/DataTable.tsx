import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import { ModuleRegistry, ColDef, GridOptions } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";

import { GridDialogManager } from "./components/GridDialogManager";
import { useThemeSync } from "./hooks/useThemeSync";
import { useGridStore } from "./store/gridStore";
import { generateColumnDefsFromData, GridRowData } from "./utils/dataTableHelpers";
import { createGridTheme, applyGridStyles, createGridTransitionsStyle } from "./utils/gridStyling";
import { applyNumericFormattingToDefs } from "./utils/numericFormatting";
import { sanitizeGridOptions, createKeyboardEventSuppressor, createCellNavigationHandler } from "./utils/gridStateUtils";
import { GridCore } from "./components/GridCore";
import { ToolbarContainer } from "./components/ToolbarContainer";
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

// Numeric formatting functions have been moved to utils/numericFormatting.ts

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
  const gridOptions = useGridStore(state => state.gridOptions); // Needed for sanitizedGridOptions
  const selectedProfileId = useGridStore(state => state.selectedProfileId); // Needed for useEffect

  // We don't need to access these actions directly anymore
  // They are used in the ToolbarContainer component

  // Local state for UI components
  const [gridReady, setGridReady] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  // Dialog state
  const [profilesDialogOpen, setProfilesDialogOpen] = useState(false);
  const [generalSettingsOpen, setGeneralSettingsOpen] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);

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

  // Convert invalid grid options to valid ones using utility function
  const sanitizedGridOptions = useMemo(() => sanitizeGridOptions(gridOptions), [gridOptions]);

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

  // These handlers have been moved to ToolbarContainer

  // We don't need this state variable anymore

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
    gridRef
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

  }, [gridRef, checkAndApplyInitialSettings, setGridReady]); // Add setGridReady dependency

  // Memoize the combined grid options passed to AgGridReact
  const memoizedGridOptions = useMemo(() => {
    // Start with external options, then override with sanitized store options
    return {
      ...externalGridOptions, // Apply external first
      ...sanitizedGridOptions // Override with sanitized store options
    };
    // Dependencies ensure this recalculates if either source changes
  }, [externalGridOptions, sanitizedGridOptions]);

  // Create keyboard event suppressor using utility function
  const suppressKeyboardEvent = useCallback((params: any) => {
    return createKeyboardEventSuppressor(sanitizedGridOptions, gridRef)(params);
  }, [sanitizedGridOptions, gridRef]);

  // This function has been moved to ToolbarContainer

  // This handler has been moved to ToolbarContainer

  // These handlers have been moved to ToolbarContainer or GridDialogManager
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

  // Create cell navigation handler using utility function
  const navigateToNextCell = useCallback((params: any) => {
    return createCellNavigationHandler(sanitizedGridOptions, gridRef)(params);
  }, [sanitizedGridOptions, gridRef]);

  // This handler has been moved to ToolbarContainer

  return (
    <div
      className={`flex h-full flex-col rounded-md border ${darkMode ? 'dark' : 'light'}`}
      data-theme={darkMode ? 'dark' : 'light'}
    >
      <ToolbarContainer
        gridId={gridId}
        gridRef={gridRef}
        darkMode={darkMode || false}
        onThemeChange={onThemeChangeHandler}
        sanitizedGridOptions={sanitizedGridOptions}
        applySettings={applySettingsToGrid}
        openProfilesDialog={handleManageProfiles}
        openGeneralSettingsDialog={handleGeneralSettings}
        openColumnSettingsDialog={handleColumnSettings}
      />

      {/* AG Grid */}
      <GridCore
        gridId={gridId}
        gridRef={gridRef}
        gridTheme={gridTheme}
        columnDefs={columnDefs}
        rowData={rowData}
        gridOptions={memoizedGridOptions}
        onGridReady={onGridReady}
        themeReady={themeReady}
        suppressKeyboardEvent={suppressKeyboardEvent}
        navigateToNextCell={navigateToNextCell}
      />

      <GridDialogManager
        gridRef={gridRef}
        applySettings={applySettingsToGrid}
        profilesDialogOpen={profilesDialogOpen}
        generalSettingsOpen={generalSettingsOpen}
        columnSettingsOpen={columnSettingsOpen}
        setProfilesDialogOpen={setProfilesDialogOpen}
        setGeneralSettingsOpen={setGeneralSettingsOpen}
        setColumnSettingsOpen={setColumnSettingsOpen}
      />
    </div>
  );
}
