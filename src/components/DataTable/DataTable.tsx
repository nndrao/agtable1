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
    
    console.log('Applying settings to grid - prioritizing profile settings');
    
    const gridApi = gridRef.current.api;
    const latestState = useGridStore.getState();
    const latestStoredColumnDefs = latestState.columnDefs;
    const latestColumnState = latestState.columnState;
    const latestFilterModel = latestState.filterModel;
    const latestGridOptions = latestState.gridOptions;
    const latestNumericFormat = latestState.numericFormatOption; // Get format
    const currentSelectedProfileId = latestState.selectedProfileId; // Get selected profile

    console.log(`Current selected profile: ${currentSelectedProfileId}`);
    
    // Apply numeric formatting BEFORE saving/applying definitions
    let formattedDefs = latestStoredColumnDefs; // Start with original
    if (latestStoredColumnDefs) {
      console.log(`Applying numeric format '${latestNumericFormat}' to column definitions`);
      // Use the helper defined above
      formattedDefs = applyNumericFormattingToDefs(latestStoredColumnDefs, latestNumericFormat);
    } else {
      console.warn('No column definitions found in store to apply formatting');
    }

    // Apply column definitions (now formatted) if changed
    // Compare and apply the *formatted* definitions
    if (formattedDefs) {
      console.log('Applying column definitions with formatting');
      
      // Add extra logging to identify columns with custom formatters
      const columnsWithCustomFormatters = formattedDefs.filter((def: any) => 
        def.customFormatterApplied || def.suppressGlobalFormatterOverride
      );
      
      if (columnsWithCustomFormatters.length > 0) {
        console.log('Found columns with custom formatters:', 
          columnsWithCustomFormatters.map((def: any) => def.field || def.colId)
        );
      }
      
      try {
        // Instead of just setting column definitions, we need to make sure custom formatters aren't lost
        // First get current column definitions
        const currentColDefs = gridApi.getColumnDefs();
        
        // Merge the new definitions with special handling for columns with custom formatters
        const mergedDefs = formattedDefs.map((newDef: any) => {
          // Find the current column definition if it exists
          const currentDef = currentColDefs?.find((def: any) => 
            (def.field === newDef.field) || (def.colId === newDef.colId)
          );
          
          // If it has a custom formatter, preserve it
          if (newDef.customFormatterApplied || newDef.suppressGlobalFormatterOverride) {
            console.log(`Preserving custom formatter for column ${newDef.field || newDef.colId}`);
            
            // Ensure the formatter is not lost during column update
            return {
              ...newDef,
              suppressGlobalFormatterOverride: true
            };
          }
          
          return newDef;
        });
        
        // Apply the merged definitions
        gridApi.setGridOption('columnDefs', mergedDefs);
        
        // Store the reference to the FORMATTED definitions
        lastAppliedSettings.current.columnDefs = mergedDefs;
      } catch (error) {
        console.error('Error applying column definitions:', error);
      }
    }

    // Apply column state if available
    if (latestColumnState && latestColumnState.length > 0) {
      console.log('Applying column state', latestColumnState);
      try {
        gridApi.applyColumnState({ 
          state: latestColumnState, 
          applyOrder: true 
        });
        lastAppliedSettings.current.columnState = latestColumnState;
      } catch (error) {
        console.error('Error applying column state:', error);
      }
    } else {
      console.log('No column state to apply or it was empty');
    }

    // Apply filter model if available
    if (latestFilterModel && Object.keys(latestFilterModel).length > 0) {
      console.log('Applying filter model');
      try {
        gridApi.setFilterModel(latestFilterModel);
        lastAppliedSettings.current.filterModel = latestFilterModel;
      } catch (error) {
        console.error('Error applying filter model:', error);
      }
    }

    // Apply grid options if available
    if (latestGridOptions) {
      console.log('Applying grid options');
      lastAppliedSettings.current.gridOptions = latestGridOptions;
    }

    // Final refresh to ensure everything is properly applied
    setTimeout(() => {
      try {
        console.log("Performing final refresh");
        // Force a full refresh of cells with formatting
        gridApi.refreshCells({force: true});
        // Force a redraw of rows to ensure all changes are visible
        gridApi.redrawRows();
        console.log('Settings successfully applied to grid');
      } catch (error) {
        console.error('Error during final grid refresh:', error);
      }
    }, 100);
  }, [
    gridRef
  ]);

  // Function to check conditions and apply initial settings ONCE
  const checkAndApplyInitialSettings = useCallback(() => {
    console.log(`Checking initial apply conditions:
      - Hydrated = ${isHydratedRef.current} 
      - GridReady = ${gridReadyRef.current}
      - InitialApplied = ${didInitialLoadApplyRef.current}
      - Selected Profile = ${useGridStore.getState().selectedProfileId}`
    );
    
    if (
      isHydratedRef.current &&
      gridReadyRef.current &&
      !didInitialLoadApplyRef.current
    ) {
      console.log("✅ All conditions met, applying initial settings...");
      applySettingsToGrid();
      didInitialLoadApplyRef.current = true; // Ensure it only runs once
      console.log("✅ Initial settings applied, didInitialLoadApplyRef set to true");
    } else {
      console.log("❌ Not all conditions met, skipping initial settings application");
    }
  }, [applySettingsToGrid]);

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
  const onGridReady = useCallback((params) => {
    console.log('Grid ready - setting grid API and references');
    
    // Store the grid API in the ref
    if (gridRef.current) {
      gridRef.current.api = params.api;
      // Use 'any' type assertion to avoid TypeScript error for columnApi property
      (gridRef.current as any).columnApi = params.columnApi;
    }
    
    // IMPORTANT: Set both the state AND the ref
    setGridReady(true);
    gridReadyRef.current = true; // This was missing
    console.log("Grid is ready - gridReadyRef.current set to true");
    
    // Register an event listener for firstDataRendered to handle formatters
    params.api.addEventListener('firstDataRendered', (event) => {
      console.log('First data rendered - checking for formatters');
      
      // Get the current column definitions
      const colDefs = params.api.getColumnDefs();
      
      // Check if any columns have expression-based formatters
      const hasExpressionFormatters = colDefs.some(def => 
        def.valueFormatter && typeof def.valueFormatter === 'string'
      );
      
      if (hasExpressionFormatters) {
        console.log('Found columns with expression formatters - refreshing cells');
        // Force a refresh to ensure formatters are properly applied
        setTimeout(() => {
          params.api.refreshCells({ force: true });
        }, 200);
      }
    });
    
    // Add a more robust check and logging here
    setTimeout(() => {
      console.log(`After grid ready check: Hydrated=${isHydratedRef.current}, GridReady=${gridReadyRef.current}, Applied=${didInitialLoadApplyRef.current}`);
      // Check if initial settings can be applied now
      checkAndApplyInitialSettings();
    }, 0);
  }, [checkAndApplyInitialSettings]);

  // Memoize the combined grid options passed to AgGridReact
  const memoizedGridOptions = useMemo(() => {
    // Start with external options, then override with sanitized store options
    return {
      ...externalGridOptions, // Apply external first
      ...sanitizedGridOptions, // Override with sanitized store options
      enableCellExpressions: true,
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
