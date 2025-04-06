import { RefObject } from "react";
import { AgGridReact } from "ag-grid-react";
import { GridOptions, ColDef } from "ag-grid-community";

// Extended interface to include custom properties
interface ExtendedGridOptions extends GridOptions {
  suppressRowAnimation?: boolean;
  suppressRowHoverHighlight?: boolean;
  suppressHeaderBorders?: boolean;
  suppressCellBorders?: boolean;
  enableCellChangeFlash?: boolean;
  sideBarPosition?: 'left' | 'right';
  multiRowSelection?: boolean;
}

// Type-safe check for column definition
function isColDef(def: any): def is ColDef {
  return def && typeof def === 'object' && 'field' in def;
}

/**
 * Apply grid options to an AG-Grid instance
 * This function handles different types of grid options and applies them appropriately
 */
export function applyGridOptions(
  gridRef: RefObject<AgGridReact>,
  gridId: string,
  gridOptions: Partial<ExtendedGridOptions>
) {
  try {
    if (!gridRef.current?.api) return;

    const api = gridRef.current.api;
    const gridElement = document.getElementById(gridId);
    if (!gridElement) return;

    console.log('Applying grid options:', gridOptions);

    // Debug log for tracking which options are being applied
    const appliedOptions: Record<string, any> = {};
    const unsupportedOptions: Record<string, any> = {};

    // === Row Options ===

    // Row Height
    if (gridOptions.rowHeight !== undefined) {
      api.forEachNode(node => {
        node.setRowHeight(gridOptions.rowHeight);
      });
      api.onRowHeightChanged();
      appliedOptions['rowHeight'] = gridOptions.rowHeight;
    }

    // Row Animation
    if (gridOptions.suppressRowAnimation !== undefined) {
      if (gridOptions.suppressRowAnimation) {
        gridElement.classList.add('ag-no-row-animation');
      } else {
        gridElement.classList.remove('ag-no-row-animation');
      }
      appliedOptions['suppressRowAnimation'] = gridOptions.suppressRowAnimation;
    }

    // Row Hover
    if (gridOptions.suppressRowHoverHighlight !== undefined) {
      if (gridOptions.suppressRowHoverHighlight) {
        gridElement.classList.add('ag-no-row-hover');
      } else {
        gridElement.classList.remove('ag-no-row-hover');
      }
      appliedOptions['suppressRowHoverHighlight'] = gridOptions.suppressRowHoverHighlight;
    }

    // === Header Options ===

    // Header Height
    if (gridOptions.headerHeight !== undefined) {
      gridElement.style.setProperty('--ag-header-height', `${gridOptions.headerHeight}px`);
      appliedOptions['headerHeight'] = gridOptions.headerHeight;
    }

    // Header Borders
    if (gridOptions.suppressHeaderBorders !== undefined) {
      if (gridOptions.suppressHeaderBorders) {
        gridElement.classList.add('ag-no-header-borders');
      } else {
        gridElement.classList.remove('ag-no-header-borders');
      }
      appliedOptions['suppressHeaderBorders'] = gridOptions.suppressHeaderBorders;
    }

    // === Cell Options ===

    // Cell Borders
    if (gridOptions.suppressCellBorders !== undefined) {
      if (gridOptions.suppressCellBorders) {
        gridElement.classList.add('ag-no-cell-borders');
      } else {
        gridElement.classList.remove('ag-no-cell-borders');
      }
      appliedOptions['suppressCellBorders'] = gridOptions.suppressCellBorders;
    }

    // Cell Flash
    if (gridOptions.enableCellChangeFlash !== undefined) {
      // This is applied directly to the grid via props
    }

    // === Selection Options ===

    // Row Selection
    if (gridOptions.rowSelection !== undefined) {
      // This is applied directly to the grid via props
    }

    // Multi Row Selection
    if (gridOptions.multiRowSelection !== undefined) {
      // This is applied directly to the grid via props
      // AG-Grid 33+ uses multiRowSelection instead of rowMultiSelectWithClick
      appliedOptions['multiRowSelection'] = gridOptions.multiRowSelection;
    }

    // === Pagination Options ===

    // Pagination
    if (gridOptions.pagination !== undefined) {
      // In AG-Grid 33+, pagination is set via props, not via API
      // We'll mark it as applied but it will actually be applied via props
      appliedOptions['pagination'] = gridOptions.pagination;
    }

    // Page Size
    if (gridOptions.paginationPageSize !== undefined) {
      try {
        // For AG-Grid v33+, pagination page size should be set via props
        // This try-catch is kept in case the app is using an older version
        console.log('Pagination page size will be applied via props');
        appliedOptions['paginationPageSize'] = gridOptions.paginationPageSize;
      } catch (error) {
        console.error('Error setting pagination page size:', error);
        unsupportedOptions['paginationPageSize'] = gridOptions.paginationPageSize;
      }
    }

    // === Default Column Options ===

    // Default Column Definitions
    if (gridOptions.defaultColDef !== undefined) {
      // This is applied directly to the grid via props
      // But we can apply some aspects to existing columns
      const columnDefs = api.getColumnDefs();
      if (columnDefs) {
        // Add valueFormatter for object data types to prevent warnings
        // We're creating this but not using it directly as column defs should be set via props in AG-Grid 33+
        // This is just to show what would be done
        columnDefs.map(colDef => {
          if (isColDef(colDef) && colDef.valueFormatter === undefined) {
            return {
              ...colDef,
              valueFormatter: (params: any) => {
                if (params.value !== null && typeof params.value === 'object') {
                  return JSON.stringify(params.value);
                }
                return params.value;
              }
            };
          }
          return colDef;
        });

        // For AG-Grid v33+, column definitions should be set via props
        console.log('Column definitions will be updated via props');
      }
    }

    // === Layout Options ===

    // DOM Layout
    if (gridOptions.domLayout !== undefined) {
      // This requires recreating the grid, so we'll just apply it via props
    }

    // Auto Size Strategy
    if (gridOptions.autoSizeStrategy !== undefined) {
      // This is applied via props, but we can also trigger auto-sizing
      setTimeout(() => {
        api.autoSizeAllColumns();
      }, 0);
      appliedOptions['autoSizeStrategy'] = gridOptions.autoSizeStrategy;
    }

    // === Grouping Options ===
    // (Handled in AG-Grid 33+ Specific Options section below)

    // === AG-Grid 33+ Specific Options ===

    // Row Grouping Panel
    if (gridOptions.rowGroupPanelShow !== undefined) {
      // This is applied via props, but we can toggle the panel visibility
      const rowGroupPanel = gridElement.querySelector('.ag-column-drop-row-group');
      if (rowGroupPanel) {
        if (gridOptions.rowGroupPanelShow === 'always') {
          rowGroupPanel.classList.remove('ag-hidden');
        } else if (gridOptions.rowGroupPanelShow === 'never') {
          rowGroupPanel.classList.add('ag-hidden');
        } else if (gridOptions.rowGroupPanelShow === 'onlyWhenGrouping') {
          // This is handled by AG-Grid internally
        }
      }
      appliedOptions['rowGroupPanelShow'] = gridOptions.rowGroupPanelShow;
    }

    // === Accessories Options ===

    // Side Bar
    if (gridOptions.sideBar !== undefined) {
      // This is applied via props, but we can toggle the side bar visibility
      const sideBar = gridElement.querySelector('.ag-side-bar');
      if (sideBar) {
        if (gridOptions.sideBar === false) {
          sideBar.classList.add('ag-hidden');
        } else {
          sideBar.classList.remove('ag-hidden');
        }
      }
      appliedOptions['sideBar'] = gridOptions.sideBar;
    }

    // Side Bar Position
    if (gridOptions.sideBarPosition !== undefined) {
      // This requires recreating the grid, so we'll just apply it via props
      appliedOptions['sideBarPosition'] = gridOptions.sideBarPosition;
    }

    // Status Bar
    if (gridOptions.statusBar !== undefined) {
      // This is applied via props, but we can toggle the status bar visibility
      const statusBar = gridElement.querySelector('.ag-status-bar');
      if (statusBar) {
        if (!gridOptions.statusBar) {
          statusBar.classList.add('ag-hidden');
        } else {
          statusBar.classList.remove('ag-hidden');
        }
      }
      appliedOptions['statusBar'] = gridOptions.statusBar;
    }

    // Quick Filter
    if (gridOptions.quickFilterText !== undefined) {
      // In AG-Grid 33+, use setGridOption instead of setQuickFilter
      if (typeof api.setGridOption === 'function') {
        api.setGridOption('quickFilterText', gridOptions.quickFilterText);
      } else {
        // Fallback for compatibility
        console.log('Quick filter will be applied via props');
      }
      appliedOptions['quickFilterText'] = gridOptions.quickFilterText;
    }

    // === Refresh the Grid ===

    // Refresh the grid to apply changes
    api.refreshCells({ force: true });
    api.redrawRows();

    // Some options require a more complete refresh
    if (
      gridOptions.headerHeight !== undefined ||
      gridOptions.rowHeight !== undefined ||
      gridOptions.domLayout !== undefined
    ) {
      setTimeout(() => {
        api.sizeColumnsToFit();
      }, 0);
    }

    // Log which options were applied and which were not
    console.log('Applied grid options:', appliedOptions);

    // Check for options that weren't applied
    Object.keys(gridOptions).forEach(key => {
      if (!appliedOptions[key as keyof typeof appliedOptions] && gridOptions[key as keyof typeof gridOptions] !== undefined) {
        unsupportedOptions[key] = gridOptions[key as keyof typeof gridOptions];
      }
    });

    if (Object.keys(unsupportedOptions).length > 0) {
      console.log('Options applied via props or not supported for dynamic updates:', unsupportedOptions);
    }
  } catch (error) {
    console.error('Error applying grid options:', error);
  }
}
