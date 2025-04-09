import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { defaultColDef } from '../utils/dataTableHelpers';

interface GridCoreProps {
  gridId: string;
  gridRef: React.RefObject<AgGridReact>;
  gridTheme: any; // Allow any theme type
  columnDefs: ColDef[];
  rowData: any[];
  gridOptions: any;
  onGridReady: () => void;
  themeReady: boolean;
  suppressKeyboardEvent: (params: any) => boolean;
  navigateToNextCell: (params: any) => any;
}

/**
 * Core AG-Grid component that handles the grid instance
 * This component is memoized to prevent unnecessary re-renders
 */
export const GridCore = React.memo(({
  gridId,
  gridRef,
  gridTheme,
  columnDefs,
  rowData,
  gridOptions,
  onGridReady,
  themeReady,
  suppressKeyboardEvent,
  navigateToNextCell
}: GridCoreProps) => {
  // Memoize defaultColDef to ensure stability
  const memoizedDefaultColDef = useMemo(() => ({
    ...defaultColDef,
    suppressKeyboardEvent
  }), [suppressKeyboardEvent]);

  if (!themeReady) {
    return null;
  }

  return (
    <div id={gridId} className="ag-theme-quartz flex-1">
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
        {...gridOptions}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.themeReady === nextProps.themeReady &&
    prevProps.gridTheme === nextProps.gridTheme &&
    prevProps.gridId === nextProps.gridId &&
    prevProps.onGridReady === nextProps.onGridReady &&
    // Deep comparison would be better for these objects, but for simplicity:
    prevProps.columnDefs === nextProps.columnDefs &&
    prevProps.rowData === nextProps.rowData &&
    prevProps.gridOptions === nextProps.gridOptions
  );
});

GridCore.displayName = 'GridCore';
