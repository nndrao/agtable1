import { RefObject } from "react";
import { AgGridReact } from "ag-grid-react";
import { refreshGrid } from "./gridStyling";

/**
 * Set up event listeners for spacing and font size changes
 */
export function setupGridEventListeners(
  gridId: string,
  gridRef: RefObject<AgGridReact>,
  onCleanup: (cleanupFn: () => void) => void
) {
  const gridElement = document.getElementById(gridId);
  if (!gridElement) return;

  const handleSpacingChangeComplete = () => {
    refreshGrid(gridRef);
  };

  const handleFontSizeChangeComplete = () => {
    refreshGrid(gridRef);
  };

  gridElement.addEventListener('spacing-change-complete', handleSpacingChangeComplete);
  gridElement.addEventListener('fontsize-change-complete', handleFontSizeChangeComplete);

  onCleanup(() => {
    gridElement.removeEventListener('spacing-change-complete', handleSpacingChangeComplete);
    gridElement.removeEventListener('fontsize-change-complete', handleFontSizeChangeComplete);
  });
}

/**
 * Handle font change
 */
export function handleFontChange(
  font: { name: string; value: string },
  setSelectedFont: (font: { name: string; value: string }) => void,
  updateGridTheme: (fontFamily: string) => void
) {
  setSelectedFont(font);
  updateGridTheme(font.value);
}

/**
 * Handle spacing change
 */
export function handleSpacingChange(
  value: number,
  setSpacing: (value: number) => void,
  gridId: string
) {
  setSpacing(value);
  
  // Dispatch a custom event when spacing change is complete
  const gridElement = document.getElementById(gridId);
  if (gridElement) {
    gridElement.dispatchEvent(new CustomEvent('spacing-change-complete'));
  }
}

/**
 * Handle font size change
 */
export function handleFontSizeChange(
  value: number,
  setFontSize: (value: number) => void,
  gridId: string
) {
  setFontSize(value);
  
  // Dispatch a custom event when font size change is complete
  const gridElement = document.getElementById(gridId);
  if (gridElement) {
    gridElement.dispatchEvent(new CustomEvent('fontsize-change-complete'));
  }
}
