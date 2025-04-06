import { RefObject } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

/**
 * Apply font and spacing styles to the grid
 */
export function applyGridStyles(
  gridId: string,
  fontFamily: string,
  fontSize: number,
  spacing: number,
  darkMode: boolean
) {
  const gridElement = document.getElementById(gridId);
  if (gridElement) {
    gridElement.style.setProperty('--ag-font-family', fontFamily);
    gridElement.style.setProperty('--ag-font-size', `${fontSize}px`);
    gridElement.style.setProperty('--ag-header-font-size', `${fontSize}px`);
    gridElement.style.setProperty('--ag-spacing', `${spacing}px`);
    
    // Also set a data attribute on the grid element for CSS targeting
    gridElement.dataset.theme = darkMode ? "dark" : "light";
  }
}

/**
 * Create a style element for grid transitions
 */
export function createGridTransitionsStyle(gridId: string) {
  const transitionsStyleElement = document.createElement('style');
  transitionsStyleElement.id = `grid-transitions-${gridId}`;
  transitionsStyleElement.textContent = `
    #${gridId}.ag-theme-quartz.ag-no-transitions * {
      transition: none !important;
      animation: none !important;
    }
  `;
  document.head.appendChild(transitionsStyleElement);
  
  return transitionsStyleElement;
}

/**
 * Refresh the grid after style changes
 */
export function refreshGrid(gridRef: RefObject<AgGridReact>) {
  if (gridRef.current?.api) {
    // Do a more complete refresh
    gridRef.current.api.refreshCells({ force: true });
    gridRef.current.api.redrawRows();
    gridRef.current.api.sizeColumnsToFit();
  }
}

/**
 * Create a grid theme with the specified font family
 */
export function createGridTheme(fontFamily: string) {
  return themeQuartz
    .withParams(
      {
        accentColor: "#8AAAA7",
        backgroundColor: "#F7F7F7",
        borderColor: "#23202029",
        browserColorScheme: "light",
        buttonBorderRadius: 2,
        cellTextColor: "#000000",
        checkboxBorderRadius: 2,
        columnBorder: true,
        fontFamily: fontFamily,
        headerBackgroundColor: "#EFEFEFD6",
        headerFontFamily: fontFamily,
        headerFontWeight: 500,
        iconButtonBorderRadius: 1,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: "#EEF1F1E8",
        wrapperBorderRadius: 2,
      },
      "light"
    )
    .withParams(
      {
        accentColor: "#8AAAA7",
        backgroundColor: "#1f2836",
        borderRadius: 2,
        checkboxBorderRadius: 2,
        fontFamily: fontFamily,
        browserColorScheme: "dark",
        chromeBackgroundColor: {
          ref: "foregroundColor",
          mix: 0.07,
          onto: "backgroundColor",
        },
        columnBorder: true,
        foregroundColor: "#FFF",
        headerFontFamily: fontFamily,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: "#2A2E35",
        wrapperBorderRadius: 2,
      },
      "dark"
    );
}
