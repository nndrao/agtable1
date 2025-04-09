import { RefObject } from "react";
import { AgGridReact } from "ag-grid-react";
import { GridOptions, SuppressKeyboardEventParams } from "ag-grid-community";

/**
 * Sanitizes grid options by removing or converting invalid options
 * This fixes warnings about invalid grid options
 */
export function sanitizeGridOptions(gridOptions: any): any {
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
}

/**
 * Creates a keyboard event suppressor for AG-Grid
 */
export function createKeyboardEventSuppressor(gridOptions: any, gridRef: RefObject<AgGridReact>) {
  return (params: SuppressKeyboardEventParams) => {
    const { event, editing, api } = params;

    // Handle arrow keys during editing
    if (editing && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      // Check if custom navigation after edit is enabled in grid options
      const useCustomNavigation = gridOptions?.useCustomNavigation === true;

      // If the feature is disabled, don't suppress the event
      if (!useCustomNavigation) {
        return false;
      }

      // Stop editing and save changes
      api.stopEditing();

      // Get the current focused cell
      const focusedCell = api.getFocusedCell();
      if (!focusedCell) {
        return true; // Suppress the event anyway
      }

      // Calculate the next row index
      const nextRowIndex = event.key === 'ArrowUp' ?
        focusedCell.rowIndex - 1 :
        focusedCell.rowIndex + 1;

      // Set focus to the next cell
      setTimeout(() => {
        api.setFocusedCell(nextRowIndex, focusedCell.column);
      }, 0);

      // Suppress the default event
      return true;
    }

    // Don't suppress other events
    return false;
  };
}

/**
 * Creates a cell navigation handler for AG-Grid
 */
export function createCellNavigationHandler(gridOptions: any, gridRef: RefObject<AgGridReact>) {
  return (params: any) => {
    // Add null check for gridRef.current.api
    const api = gridRef.current?.api;
    // Destructure params *after* the api check
    const { nextCellPosition, previousCellPosition, event } = params;
    // Return default *after* destructuring if api not ready
    if (!api) return nextCellPosition;

    // If there's no next cell position (we're at an edge), decide what to do based on settings
    if (!nextCellPosition) {
      // Check if we should navigate to the next row or column when at the last cell
      const navigateToNextCellOnLastCell = gridOptions?.navigateToNextCellOnLastCell === true;

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
        const enterNavigatesVertically = gridOptions?.enterNavigatesVertically === true;
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
  };
}

/**
 * Creates a batch update function for grid state changes
 */
export function createBatchUpdateFunction(setSuppressGridRefresh: React.Dispatch<React.SetStateAction<boolean>>) {
  return (updates: () => void) => {
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
      });
    }
  };
}
