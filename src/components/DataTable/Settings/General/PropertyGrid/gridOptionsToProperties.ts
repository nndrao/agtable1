import { PropertyCategory, PropertyItem } from "./PropertyGrid";

// Define categories based on AG-Grid documentation
export const gridCategories: PropertyCategory[] = [
  {
    id: "appearance",
    name: "Appearance & Theme",
    description: "Configure visual styling and themes"
  },
  {
    id: "behavior",
    name: "Behavior",
    description: "Configure grid behavior and interactions"
  },
  {
    id: "columns",
    name: "Column Management",
    description: "Configure column behavior and appearance"
  },
  {
    id: "rows",
    name: "Row Configuration",
    description: "Configure row behavior and appearance"
  },
  {
    id: "editing",
    name: "Editing & Cell Behavior",
    description: "Configure editing and cell interactions"
  },
  {
    id: "pagination",
    name: "Pagination & Data",
    description: "Configure pagination and data loading"
  },
  {
    id: "filtering",
    name: "Filtering & Sorting",
    description: "Configure filtering and sorting behavior"
  },
  {
    id: "selection",
    name: "Selection",
    description: "Configure row and cell selection"
  },
  {
    id: "grouping",
    name: "Grouping",
    description: "Configure row grouping options"
  },
  {
    id: "accessories",
    name: "Accessories & Components",
    description: "Configure additional grid features"
  }
];

// Define property metadata
interface PropertyMetadata {
  name: string;
  description: string;
  category: string;
  type: "string" | "number" | "boolean" | "select" | "object";
  options?: string[];
  defaultValue?: any;
}

// Map of AG-Grid option paths to property metadata
const propertyMetadata: Record<string, PropertyMetadata> = {
  // Appearance & Theme
  "domLayout": {
    name: "DOM Layout",
    description: "Controls how the grid DOM is structured",
    category: "appearance",
    type: "select",
    options: ["normal", "autoHeight", "print"],
    defaultValue: "normal"
  },
  "rowHeight": {
    name: "Row Height",
    description: "Height of each row in pixels",
    category: "appearance",
    type: "number",
    options: ["20", "100", "1"],
    defaultValue: 25
  },
  "headerHeight": {
    name: "Header Height",
    description: "Height of the header row in pixels",
    category: "appearance",
    type: "number",
    options: ["20", "100", "1"],
    defaultValue: 25
  },
  "animateRows": {
    name: "Animate Rows",
    description: "Enable row animations when sorting or filtering",
    category: "appearance",
    type: "boolean",
    defaultValue: true
  },
  "animationDuration": {
    name: "Animation Duration",
    description: "Duration of animations in milliseconds",
    category: "appearance",
    type: "number",
    options: ["0", "1000", "10"],
    defaultValue: 300
  },
  "suppressRowHoverHighlight": {
    name: "Row Hover Effect",
    description: "Highlight rows when the mouse hovers over them",
    category: "appearance",
    type: "boolean",
    defaultValue: false
  },
  "columnHoverHighlight": {
    name: "Column Hover Highlight",
    description: "Highlight columns when the mouse hovers over them",
    category: "appearance",
    type: "boolean",
    defaultValue: false
  },
  "alwaysShowHorizontalScroll": {
    name: "Always Show Horizontal Scrollbar",
    description: "Always show the horizontal scrollbar",
    category: "appearance",
    type: "boolean",
    defaultValue: false
  },
  "alwaysShowVerticalScroll": {
    name: "Always Show Vertical Scrollbar",
    description: "Always show the vertical scrollbar",
    category: "appearance",
    type: "boolean",
    defaultValue: false
  },
  "density": {
    name: "Visual Density",
    description: "Controls the spacing and padding of grid elements",
    category: "appearance",
    type: "select",
    options: ["comfortable", "compact", "cozy"],
    defaultValue: "comfortable"
  },
  "suppressMenuHide": {
    name: "Always Show Column Menu",
    description: "Always show the column menu button in headers",
    category: "appearance",
    type: "boolean",
    defaultValue: false
  },

  // Column Management
  "defaultColDef.flex": {
    name: "Default Column Flex",
    description: "Default flex grow value for all columns",
    category: "columns",
    type: "number",
    options: ["0", "5", "1"],
    defaultValue: 1
  },
  "defaultColDef.minWidth": {
    name: "Default Min Width",
    description: "Default minimum width for all columns",
    category: "columns",
    type: "number",
    options: ["50", "500", "10"],
    defaultValue: 100
  },
  "defaultColDef.resizable": {
    name: "Resizable Columns",
    description: "Allow columns to be resized by default",
    category: "columns",
    type: "boolean",
    defaultValue: true
  },
  "defaultColDef.sortable": {
    name: "Sortable Columns",
    description: "Allow columns to be sorted by default",
    category: "columns",
    type: "boolean",
    defaultValue: true
  },
  "defaultColDef.filter": {
    name: "Filterable Columns",
    description: "Allow columns to be filtered by default",
    category: "columns",
    type: "boolean",
    defaultValue: true
  },

  // Row Configuration
  "rowBuffer": {
    name: "Row Buffer",
    description: "Number of rows rendered outside visible area",
    category: "rows",
    type: "number",
    options: ["5", "100", "5"],
    defaultValue: 10
  },
  "suppressRowAlternation": {
    name: "Alternate Row Colors",
    description: "Use alternating colors for rows",
    category: "rows",
    type: "boolean",
    defaultValue: false
  },
  "suppressRowAnimation": {
    name: "Row Animation",
    description: "Animate row changes",
    category: "rows",
    type: "boolean",
    defaultValue: false
  },
  "suppressFullWidthRows": {
    name: "Full Width Rows",
    description: "Allow rows to span all columns",
    category: "rows",
    type: "boolean",
    defaultValue: false
  },
  "rowDragManaged": {
    name: "Row Drag",
    description: "Allow dragging rows",
    category: "rows",
    type: "boolean",
    defaultValue: false
  },
  "suppressMultiRowDrag": {
    name: "Multiple Row Drag",
    description: "Allow dragging multiple rows",
    category: "rows",
    type: "boolean",
    defaultValue: false
  },
  "rowClass": {
    name: "Row Class",
    description: "CSS class to apply to all rows",
    category: "rows",
    type: "string",
    defaultValue: ""
  },
  "getRowIdField": {
    name: "Row ID Field",
    description: "Field to use as unique row ID",
    category: "rows",
    type: "string",
    defaultValue: ""
  },
  "immutableData": {
    name: "Immutable Data",
    description: "Optimize for immutable data",
    category: "rows",
    type: "boolean",
    defaultValue: false
  },
  "maintainRowOrder": {
    name: "Maintain Row Order",
    description: "Keep rows in original order",
    category: "rows",
    type: "boolean",
    defaultValue: false
  },

  // Behavior & Navigation
  "enableCellTextSelection": {
    name: "Cell Text Selection",
    description: "Allow users to select and copy cell text",
    category: "behavior",
    type: "boolean",
    defaultValue: false
  },
  "suppressCellNavigation": {
    name: "Cell Navigation",
    description: "Enable keyboard navigation between cells",
    category: "behavior",
    type: "boolean",
    defaultValue: false
  },
  "tabToNextCell": {
    name: "Tab Navigation",
    description: "Move to next cell after Tab key",
    category: "behavior",
    type: "boolean",
    defaultValue: false
  },
  "navigateToNextCellOnLastCell": {
    name: "Wrap Navigation",
    description: "Wrap to next row when tabbing at the last cell",
    category: "behavior",
    type: "boolean",
    defaultValue: false
  },
  "enterNavigatesVertically": {
    name: "Enter Navigates Vertically",
    description: "Press Enter to move to the cell below",
    category: "behavior",
    type: "boolean",
    defaultValue: false
  },
  "enterNavigatesVerticallyAfterEdit": {
    name: "Enter Moves Down After Edit",
    description: "Move down after editing with Enter key",
    category: "behavior",
    type: "boolean",
    defaultValue: false
  },
  "useCustomNavigation": {
    name: "Custom Navigation After Edit",
    description: "Use custom navigation when using arrow keys during edit",
    category: "behavior",
    type: "boolean",
    defaultValue: false
  },
  "defaultColDef.editable": {
    name: "Editable Cells",
    description: "Allow cells to be edited by default",
    category: "editing",
    type: "boolean",
    defaultValue: false
  },
  "editType": {
    name: "Edit Type",
    description: "How editing is triggered in the grid",
    category: "editing",
    type: "select",
    options: ["fullRow", "singleClick", "doubleClick"],
    defaultValue: "doubleClick"
  },
  "singleClickEdit": {
    name: "Single Click Edit",
    description: "Start editing with a single click",
    category: "editing",
    type: "boolean",
    defaultValue: false
  },
  "suppressClickEdit": {
    name: "Suppress Click Edit",
    description: "Prevent click from starting edit",
    category: "editing",
    type: "boolean",
    defaultValue: false
  },
  "readOnlyEdit": {
    name: "Read Only Edit",
    description: "Grid won't update data after edit operations",
    category: "editing",
    type: "boolean",
    defaultValue: false
  },
  "stopEditingWhenCellsLoseFocus": {
    name: "Stop Editing When Cells Lose Focus",
    description: "Stop editing when cells lose focus",
    category: "editing",
    type: "boolean",
    defaultValue: true
  },

  // Pagination & Data
  "pagination": {
    name: "Enable Pagination",
    description: "Enable pagination for the grid",
    category: "pagination",
    type: "boolean",
    defaultValue: false
  },
  "paginationPageSize": {
    name: "Page Size",
    description: "Number of rows per page",
    category: "pagination",
    type: "number",
    options: ["10", "100", "5"],
    defaultValue: 25
  },
  "paginationAutoPageSize": {
    name: "Auto Page Size",
    description: "Automatically adjust page size based on grid height",
    category: "pagination",
    type: "boolean",
    defaultValue: false
  },
  "rowModelType": {
    name: "Row Model Type",
    description: "How data is loaded and managed",
    category: "pagination",
    type: "select",
    options: ["clientSide", "infinite", "serverSide", "viewport"],
    defaultValue: "clientSide"
  },

  // Filtering & Sorting
  "cacheQuickFilter": {
    name: "Cache Quick Filter",
    description: "Improve filter performance by caching results",
    category: "filtering",
    type: "boolean",
    defaultValue: false
  },
  "includeHiddenColumnsInQuickFilter": {
    name: "Include Hidden Columns in Quick Filter",
    description: "Include hidden columns in quick filter search",
    category: "filtering",
    type: "boolean",
    defaultValue: false
  },
  "enableAdvancedFilter": {
    name: "Enable Advanced Filter",
    description: "Enable the advanced filter feature",
    category: "filtering",
    type: "boolean",
    defaultValue: false
  },
  "includeHiddenColumnsInAdvancedFilter": {
    name: "Include Hidden Columns in Advanced Filter",
    description: "Include hidden columns in advanced filter",
    category: "filtering",
    type: "boolean",
    defaultValue: false
  },
  "accentedSort": {
    name: "Accented Sort",
    description: "Take accented characters into account when sorting",
    category: "filtering",
    type: "boolean",
    defaultValue: false
  },
  "suppressMultiSort": {
    name: "Suppress Multi-Sort",
    description: "Disable multi-column sorting",
    category: "filtering",
    type: "boolean",
    defaultValue: false
  },
  "multiSortKey": {
    name: "Multi-Sort Key",
    description: "Key to hold down for multi-sorting",
    category: "filtering",
    type: "select",
    options: ["ctrl", "shift", "alt"],
    defaultValue: "ctrl"
  },

  // Selection
  "enableRangeSelection": {
    name: "Range Selection",
    description: "Allow selecting ranges of cells",
    category: "selection",
    type: "boolean",
    defaultValue: false
  },
  "suppressRowClickSelection": {
    name: "Row Click Selection",
    description: "Select rows by clicking",
    category: "selection",
    type: "boolean",
    defaultValue: false
  },
  "rowSelection": {
    name: "Row Selection Mode",
    description: "Type of row selection",
    category: "selection",
    type: "select",
    options: ["single", "multiple"],
    defaultValue: "single"
  },
  "rowMultiSelectWithClick": {
    name: "Multi-Select With Click",
    description: "Allow selecting multiple rows with single clicks",
    category: "selection",
    type: "boolean",
    defaultValue: false
  },
  "suppressRowDeselection": {
    name: "Suppress Row Deselection",
    description: "Prevent rows from being deselected",
    category: "selection",
    type: "boolean",
    defaultValue: false
  },
  "enableCellTextSelection": {
    name: "Enable Cell Text Selection",
    description: "Allow text selection within cells",
    category: "selection",
    type: "boolean",
    defaultValue: true
  },

  // Grouping
  "groupUseEntireRow": {
    name: "Group Use Entire Row",
    description: "Use the entire row for group rows",
    category: "grouping",
    type: "boolean",
    defaultValue: false
  },
  "groupSelectsChildren": {
    name: "Group Selects Children",
    description: "Selecting a group selects all children",
    category: "grouping",
    type: "boolean",
    defaultValue: false
  },
  "rowGroupPanelShow": {
    name: "Row Group Panel",
    description: "When to show the row group panel",
    category: "grouping",
    type: "select",
    options: ["always", "onlyWhenGrouping", "never"],
    defaultValue: "never"
  },
  "suppressMakeColumnVisibleAfterUnGroup": {
    name: "Hide Columns After Ungrouping",
    description: "Keep columns hidden after ungrouping",
    category: "grouping",
    type: "boolean",
    defaultValue: false
  },
  "groupDisplayType": {
    name: "Group Display Type",
    description: "How to display grouped rows",
    category: "grouping",
    type: "select",
    options: ["singleColumn", "multipleColumns", "groupRows", "custom"],
    defaultValue: "singleColumn"
  },
  "groupDefaultExpanded": {
    name: "Default Expanded Level",
    description: "Number of levels to expand by default (0 for none, -1 for all)",
    category: "grouping",
    type: "number",
    options: ["-1", "10", "1"],
    defaultValue: 0
  },

  // Accessories & Components
  "suppressColumnVirtualisation": {
    name: "Disable Column Virtualization",
    description: "Render all columns at once (may impact performance)",
    category: "accessories",
    type: "boolean",
    defaultValue: false
  },
  "ensureDomOrder": {
    name: "Ensure DOM Order",
    description: "Maintain DOM order for accessibility (impacts performance)",
    category: "accessories",
    type: "boolean",
    defaultValue: false
  },
  "autoSizeStrategy": {
    name: "Auto Size Columns",
    description: "Automatically size columns to fit content or grid width",
    category: "columns",
    type: "select",
    options: ["fitCellContents", "fitGridWidth", "none"],
    defaultValue: "none"
  },
  "sideBar": {
    name: "Side Bar",
    description: "Show side bar with tool panels",
    category: "accessories",
    type: "boolean",
    defaultValue: true
  },
  "suppressContextMenu": {
    name: "Suppress Context Menu",
    description: "Disable the grid's context menu",
    category: "accessories",
    type: "boolean",
    defaultValue: false
  },
  "statusBar": {
    name: "Status Bar",
    description: "Show status bar with aggregation information",
    category: "accessories",
    type: "boolean",
    defaultValue: false
  },
  "suppressLoadingOverlay": {
    name: "Suppress Loading Overlay",
    description: "Hide the loading overlay when loading data",
    category: "accessories",
    type: "boolean",
    defaultValue: false
  },
  "suppressNoRowsOverlay": {
    name: "Suppress No Rows Overlay",
    description: "Hide the 'no rows' overlay when grid is empty",
    category: "accessories",
    type: "boolean",
    defaultValue: false
  }
};

// Convert grid options to property items
export function gridOptionsToProperties(gridOptions: any): PropertyItem[] {
  const properties: PropertyItem[] = [];

  // Process each property in the metadata
  Object.entries(propertyMetadata).forEach(([path, metadata]) => {
    // Get the value from the grid options
    const pathParts = path.split('.');
    let value = gridOptions;

    for (const part of pathParts) {
      if (value === undefined || value === null) {
        value = undefined;
        break;
      }
      value = value[part];
    }

    // Special case for boolean properties that are inverted (suppress*)
    if (metadata.type === "boolean" && path.startsWith("suppress") && metadata.name.indexOf("Disable") === -1) {
      value = !value;
    }

    // Special case for autoSizeStrategy
    if (path === 'autoSizeStrategy') {
      if (value === undefined) {
        value = 'none';
      } else if (typeof value === 'object' && value !== null) {
        value = value.type || 'none';
      }
    }

    // Create the property item
    properties.push({
      path,
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      type: metadata.type,
      options: metadata.options,
      value: value !== undefined ? value : metadata.defaultValue
    });
  });

  return properties;
}

// Update grid options from property changes
export function updateGridOptionsFromProperty(gridOptions: any, path: string, value: any): any {
  const newOptions = { ...gridOptions };
  const pathParts = path.split('.');

  // Special case for boolean properties that are inverted (suppress*)
  const metadata = propertyMetadata[path];
  if (metadata && metadata.type === "boolean" && path.startsWith("suppress") && metadata.name.indexOf("Disable") === -1) {
    value = !value;
  }

  // Special case for autoSizeStrategy
  if (path === 'autoSizeStrategy') {
    if (value === 'none' || value === undefined) {
      newOptions[path] = undefined;
    } else if (typeof value === 'string') {
      newOptions[path] = { type: value };
    } else {
      newOptions[path] = value;
    }
    return newOptions;
  }

  // Handle nested paths
  if (pathParts.length > 1) {
    let current = newOptions;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];

      if (!current[part]) {
        current[part] = {};
      }

      current = current[part];
    }

    current[pathParts[pathParts.length - 1]] = value;
  } else {
    newOptions[path] = value;
  }

  return newOptions;
}
