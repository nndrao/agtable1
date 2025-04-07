import { debounce } from "lodash";
import { themeQuartz, ColDef, ValueFormatterParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { RefObject, MutableRefObject } from "react";

/**
 * Returns AG Grid theme with custom params based on ref.tsx
 */
export function createGridTheme(fontFamily?: string) {
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
        fontFamily: fontFamily || {
          googleFont: "Inter",
        },
        fontSize: 14,
        headerBackgroundColor: "#EFEFEFD6",
        headerFontFamily: fontFamily || {
          googleFont: "Inter",
        },
        headerFontSize: 14,
        headerFontWeight: 500,
        iconButtonBorderRadius: 1,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: "#EEF1F1E8",
        spacing: 6,
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
        columnBorder: true,
        fontFamily: fontFamily || {
          googleFont: "Inter",
        },
        browserColorScheme: "dark",
        chromeBackgroundColor: {
          ref: "foregroundColor",
          mix: 0.07,
          onto: "backgroundColor",
        },
        fontSize: 14,
        foregroundColor: "#FFF",
        headerFontFamily: fontFamily || {
          googleFont: "Inter",
        },
        headerFontSize: 14,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: "#2A2E35",
        spacing: 6,
        wrapperBorderRadius: 2,
      },
      "dark"
    );
}

/**
 * Creates a debounced function to refresh the grid
 */
export function createRefreshGridFunction(
  gridRef: RefObject<AgGridReact>,
  pendingUpdateRef: MutableRefObject<boolean>
) {
  return debounce(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.refreshCells({ force: true });
      gridRef.current.api.redrawRows();
      gridRef.current.api.sizeColumnsToFit();
      if (pendingUpdateRef.current) {
        pendingUpdateRef.current = false;
      }
    }
  }, 200);
}

/**
 * Creates a function to update grid styles with immediate visual feedback
 */
export function createUpdateGridStylesFunction(
  gridId: string,
  refreshGrid: () => void
) {
  // Keep track of the previous RAF request
  let rafId: number | null = null;

  // Keep track of whether a refresh is pending
  let refreshPending = false;

  return (spacing: number, fontSize: number) => {
    // Cancel any pending animation frame
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    // Use requestAnimationFrame for smooth visual updates
    rafId = requestAnimationFrame(() => {
      // Get the grid element
      const gridElement = document.getElementById(gridId);
      if (!gridElement) return;

      // Get the style element
      const styleElement = document.getElementById(`grid-styles-${gridId}`) as HTMLStyleElement;
      if (!styleElement) return;

      // Get current theme mode
      const isDarkMode = gridElement?.dataset.agThemeMode === 'dark';

      // Apply spacing directly to the specific grid instance
      gridElement.style.setProperty('--ag-spacing', `${spacing}px`);

      // Apply font size directly to the specific grid instance
      gridElement.style.setProperty('--ag-font-size', `${fontSize}px`);
      gridElement.style.setProperty('--ag-header-font-size', `${fontSize}px`);

      // Update the CSS with theme-specific styles
      styleElement.textContent = `
        /* Ensure styles ONLY apply to this specific grid instance with high specificity */
        #${gridId}.ag-theme-quartz {
          ${isDarkMode ? `
          --ag-foreground-color: #fff !important;
          --ag-background-color: hsl(224 71% 4%) !important;
          --ag-header-background-color: hsl(222 47% 11%) !important;
          --ag-odd-row-background-color: hsl(224 71% 4% / 0.8) !important;
          --ag-border-color: hsl(216 34% 17%) !important;
          --ag-row-hover-color: hsl(222 47% 11% / 0.7) !important;
          ` : `
          --ag-foreground-color: hsl(222.2 47.4% 11.2%) !important;
          --ag-background-color: hsl(0 0% 100%) !important;
          --ag-header-background-color: hsl(210 40% 98%) !important;
          --ag-odd-row-background-color: hsl(210 40% 98%) !important;
          --ag-border-color: hsl(214.3 31.8% 91.4%) !important;
          --ag-row-hover-color: hsl(210 40% 96%) !important;
          `}
        }

        /* Font size controls - target specific text elements */
        #${gridId}.ag-theme-quartz .ag-header-cell-text,
        #${gridId}.ag-theme-quartz .ag-cell-value,
        #${gridId}.ag-theme-quartz .ag-group-value,
        #${gridId}.ag-theme-quartz .ag-group-child-count,
        #${gridId}.ag-theme-quartz .ag-cell-wrapper,
        #${gridId}.ag-theme-quartz .ag-header-cell-label,
        #${gridId}.ag-theme-quartz .ag-filter-value {
          font-size: ${fontSize}px !important;
        }

        /* Performance optimization - disable transitions while adjusting */
        #${gridId}.ag-theme-quartz * {
          transition: none !important;
        }
      `;

      // Only trigger refresh if one isn't already pending
      if (!refreshPending) {
        refreshPending = true;
        // Debounce the actual refresh which is expensive
        setTimeout(() => {
          refreshGrid();
          refreshPending = false;
        }, 100);
      }
    });
  };
}

/**
 * Default column definition for AG Grid with AG-Grid 33+ compatible options
 */
export const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 100,
  filter: true,
  resizable: true,
  sortable: true,
  enableValue: true,
  enableRowGroup: true,
  enablePivot: true,
  editable: true,
  // Add valueFormatter and valueParser for object data types to prevent warnings
  valueFormatter: (params) => {
    if (params.value !== null && typeof params.value === 'object') {
      return JSON.stringify(params.value);
    }
    return params.value;
  },
  valueParser: (params) => {
    if (params.newValue !== null && typeof params.newValue === 'string') {
      try {
        // Try to parse as JSON if it looks like an object
        if (params.newValue.startsWith('{') && params.newValue.endsWith('}')) {
          return JSON.parse(params.newValue);
        }
      } catch {
        // If parsing fails, return the string value
      }
    }
    return params.newValue;
  }
};

// Interface for sample data
export interface SampleData extends GridRowData {
  make: string;
  model: string;
  price: number;
}

/**
 * Generates sample data for the grid
 */
export function generateSampleData(): SampleData[] {
  const sampleData: SampleData[] = [];
  for (let i = 0; i < 10; i++) {
    sampleData.push({ make: "Toyota", model: "Celica", price: 35000 + i * 1000 });
    sampleData.push({ make: "Ford", model: "Mondeo", price: 32000 + i * 1000 });
    sampleData.push({
      make: "Porsche",
      model: "Boxster",
      price: 72000 + i * 1000,
    });
  }
  return sampleData;
}

/**
 * Generates value formatter for currency values
 */
export function createCurrencyFormatter(currency = 'USD') {
  return (params: ValueFormatterParams) => {
    if (params.value === null || params.value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(params.value);
  };
}

/**
 * Define interface for row data to avoid 'any' type
 */
export interface GridRowData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Generates value formatter for number values with specified precision
 */
export function createNumberFormatter(precision = 2) {
  return (params: ValueFormatterParams) => {
    if (params.value === null || params.value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(params.value);
  };
}

/**
 * Generates value formatter for percentage values
 */
export function createPercentFormatter(precision = 2) {
  return (params: ValueFormatterParams) => {
    if (params.value === null || params.value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(params.value / 100); // Divide by 100 as AG-Grid expects percentages as whole numbers
  };
}

/**
 * Generates value formatter for date values
 */
export function createDateFormatter(format = 'MM/dd/yyyy') {
  return (params: ValueFormatterParams) => {
    if (params.value === null || params.value === undefined) return '';
    try {
      const date = new Date(params.value);
      if (isNaN(date.getTime())) return params.value; // Return original if not a valid date

      // Format based on the requested format
      if (format === 'MM/dd/yyyy') {
        return date.toLocaleDateString('en-US');
      } else if (format === 'MM/dd/yyyy HH:mm') {
        return date.toLocaleString('en-US');
      } else {
        return date.toLocaleDateString('en-US');
      }
    } catch (e) {
      return params.value; // Return original value if parsing fails
    }
  };
}

/**
 * Detect if a string might be a date
 */
function isLikelyDate(value: string): boolean {
  // Check for common date formats
  const dateRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?$/;
  if (dateRegex.test(value)) return true;

  // Try parsing as a date
  try {
    const date = new Date(value);
    // Check if it's a valid date and not just a number that got converted
    return !isNaN(date.getTime()) && value.includes('-') || value.includes('/') || value.includes('.');
  } catch {
    return false;
  }
}

/**
 * Detect the most likely data type for a column by sampling values
 */
function detectColumnType(values: any[], fieldName: string): {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'currency' | 'percentage' | 'mixed';
  precision?: number;
} {
  // Filter out null and undefined values
  const nonNullValues = values.filter(v => v !== null && v !== undefined);
  if (nonNullValues.length === 0) return { type: 'string' };

  // Check if all values are of the same type
  const types = new Set(nonNullValues.map(v => typeof v));

  // If all values are strings, check if they might be dates
  if (types.size === 1 && types.has('string')) {
    // Check if they might be dates
    const sampleSize = Math.min(nonNullValues.length, 10);
    const samples = nonNullValues.slice(0, sampleSize);
    const dateCount = samples.filter(v => isLikelyDate(v as string)).length;

    if (dateCount / sampleSize > 0.8) {
      return { type: 'date' };
    }

    return { type: 'string' };
  }

  // If all values are numbers
  if (types.size === 1 && types.has('number')) {
    // Check field name for hints
    const fieldNameLower = fieldName.toLowerCase();

    // Check if it's likely a currency field
    if (fieldNameLower.includes('price') ||
        fieldNameLower.includes('cost') ||
        fieldNameLower.includes('amount') ||
        fieldNameLower.includes('value') ||
        fieldNameLower.includes('revenue') ||
        fieldNameLower.includes('budget')) {
      return { type: 'currency' };
    }

    // Check if it's likely a percentage field
    if (fieldNameLower.includes('percent') ||
        fieldNameLower.includes('rate') ||
        fieldNameLower.includes('ratio') ||
        fieldNameLower.includes('yield')) {
      return { type: 'percentage' };
    }

    // Determine if it's an integer or float
    const sampleSize = Math.min(nonNullValues.length, 10);
    const samples = nonNullValues.slice(0, sampleSize) as number[];
    const nonIntegerCount = samples.filter(v => v % 1 !== 0).length;

    if (nonIntegerCount === 0) {
      return { type: 'integer' };
    } else {
      // Calculate the average precision needed
      const precisions = samples
        .filter(v => v % 1 !== 0)
        .map(v => v.toString().split('.')[1]?.length || 0);

      const avgPrecision = precisions.length > 0
        ? Math.min(Math.ceil(precisions.reduce((a, b) => a + b, 0) / precisions.length), 4)
        : 2;

      return { type: 'number', precision: avgPrecision };
    }
  }

  // If all values are booleans
  if (types.size === 1 && types.has('boolean')) {
    return { type: 'boolean' };
  }

  // Mixed types
  return { type: 'mixed' };
}

/**
 * Create column definitions from row data with enhanced type detection
 * @param rowData The data to analyze for column definitions
 * @param sampleSize Number of rows to sample for type detection (default: 20)
 */
export function generateColumnDefsFromData(rowData: GridRowData[], sampleSize = 20): ColDef[] {
  if (!rowData || rowData.length === 0) return [];

  const firstRow = rowData[0];
  const fields = Object.keys(firstRow);

  // Determine how many rows to sample
  const actualSampleSize = Math.min(rowData.length, sampleSize);
  const sampleRows = rowData.slice(0, actualSampleSize);

  return fields.map(field => {
    // Extract sample values for this field
    const fieldValues = sampleRows.map(row => row[field]);

    // Detect the column type
    const typeInfo = detectColumnType(fieldValues, field);

    // Create base column definition
    const colDef: ColDef = {
      field,
      headerName: field.charAt(0).toUpperCase() + field.slice(1), // Capitalize first letter
      sortable: true,
      resizable: true,
      editable: true,
    };

    // Apply type-specific configurations
    switch (typeInfo.type) {
      case 'number':
      case 'integer':
        colDef.filter = 'agNumberColumnFilter';
        colDef.valueFormatter = createNumberFormatter(typeInfo.precision || 0);
        break;

      case 'currency':
        colDef.filter = 'agNumberColumnFilter';
        colDef.valueFormatter = createCurrencyFormatter('USD');
        break;

      case 'percentage':
        colDef.filter = 'agNumberColumnFilter';
        colDef.valueFormatter = createPercentFormatter(typeInfo.precision || 2);
        break;

      case 'date':
        colDef.filter = 'agDateColumnFilter';
        colDef.valueFormatter = createDateFormatter();
        break;

      case 'boolean':
        colDef.filter = 'agSetColumnFilter';
        colDef.cellRenderer = 'agCheckboxCellRenderer';
        break;

      case 'string':
      case 'mixed':
      default:
        colDef.filter = 'agTextColumnFilter';
        break;
    }

    console.log(`Field ${field} detected as ${typeInfo.type}${typeInfo.precision !== undefined ? ` with precision ${typeInfo.precision}` : ''}`);

    return colDef;
  });
}