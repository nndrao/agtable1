import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGrid } from "../../hooks/useGridStore";
import {
  X,
  Search,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns,
  Info,
  Save,
  XCircle,
  Eye,
  EyeOff,
  ArrowUpDown,
  Lock,
  Unlock,
  Circle,
  Settings2,
  Paintbrush,
  Type,
  Component,
} from "lucide-react";
import { BorderStyleEditor } from "./BorderStyleEditor";
import { Checkbox } from "@/components/ui/checkbox";
import "../settings-dialogs.css";

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridRef: React.RefObject<any>;
}

type TabType = "header" | "cell" | "value" | "component";

interface SidebarItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function ColumnSettingsDialog({
  open,
  onOpenChange,
  gridRef,
}: ColumnSettingsDialogProps) {
  const { columnState, setColumnState, setColumnDefs } = useGrid();
  const [activeTab, setActiveTab] = useState<TabType>("header");
  const [hasChanges, setHasChanges] = useState(false);
  // Track which properties have been explicitly changed by the user for each column
  const [changedProperties, setChangedProperties] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [columnDefs, setLocalColumnDefs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Define sidebar items based on the selected column
  const sidebarItems: SidebarItem[] = useMemo(() => [
    { 
      id: "header", 
      label: "Header Settings", 
      icon: <Settings2 className="h-4 w-4" />,
      description: "Configure column header appearance and styling"
    },
    { 
      id: "cell", 
      label: "Cell Formatting", 
      icon: <Paintbrush className="h-4 w-4" />,
      description: "Style cells with colors, borders, and alignment options"
    },
    { 
      id: "value", 
      label: "Value Formatting", 
      icon: <Type className="h-4 w-4" />,
      description: "Set number formats, date formats, and value transformations"
    },
    { 
      id: "component", 
      label: "Component Config",
      icon: <Component className="h-4 w-4" />,
      description: "Configure cell renderers, editors, and advanced options"
    },
  ], []);

  // ... rest of your state and useEffect blocks remain the same
  const [headerSettings, setHeaderSettings] = useState({
    text: "",
    alignment: "left",
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "normal",
    fontStyle: "normal",
    borderTop: false,
    borderRight: false,
    borderBottom: true,
    borderLeft: false,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: "#cccccc",
    borderRightColor: "#cccccc",
    borderBottomColor: "#cccccc",
    borderLeftColor: "#cccccc",
  });

  const [cellSettings, setCellSettings] = useState({
    alignment: "left",
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "normal",
    fontStyle: "normal",
    borderTop: false,
    borderRight: false,
    borderBottom: true,
    borderLeft: false,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: "#cccccc",
    borderRightColor: "#cccccc",
    borderBottomColor: "#cccccc",
    borderLeftColor: "#cccccc",
  });

  const [valueSettings, setValueSettings] = useState({
    formatType: "text",
    numberFormat: "1,000.00",
    currencySymbol: "$",
    currencyFormat: "$1,000.00",
    dateFormat: "MM/DD/YYYY",
    useCustomFormat: false,
    customFormat: "",
    dataType: "text",
  });

  const [componentSettings, setComponentSettings] = useState({
    cellRenderer: "text",
    editable: true,
    filterType: "text",
    filterOptions: [],
    dropdownOptions: [],
  });

  // Load columns from the grid store when dialog opens
  useEffect(() => {
    if (open) {
      // Get column state and definitions from the grid store
      if (columnState && columnState.length > 0) {
        console.log(
          "Initializing column settings dialog from grid store - column state:",
          columnState,
        );
        setColumns(columnState);
      }

      // Get column definitions from the grid store via the gridRef
      // This is necessary because the grid store might not have all column definitions
      if (gridRef.current?.api) {
        const currentColumnDefs = gridRef.current.api.getColumnDefs();
        console.log(
          "Initializing column settings dialog from grid - column defs:",
          currentColumnDefs,
        );
        setLocalColumnDefs(currentColumnDefs || []);
      }

      // Reset change tracking
      setHasChanges(false);
      setChangedProperties({});
    }
  }, [open, gridRef, columnState]);

  // Helper function to track property changes
  const trackPropertyChange = useCallback(
    (colId: string, category: string, property: string) => {
      if (!colId) {
        console.warn(
          "Attempted to track property change for undefined column ID",
        );
        return;
      }

      console.log(
        `Tracking change for column ${colId}, category ${category}, property ${property}`,
      );

      // Update the changed properties state with the new property
      setChangedProperties((prev) => {
        // Create a new object to avoid mutating state
        const newState = { ...prev };

        // Initialize the column object if it doesn't exist
        if (!newState[colId]) {
          newState[colId] = {};
        }

        // Initialize the category object if it doesn't exist
        if (!newState[colId][category]) {
          newState[colId][category] = {};
        }

        // Set the property to true
        newState[colId][category][property] = true;

        console.log("Updated changed properties:", newState);
        return newState;
      });

      // Set the hasChanges flag
      setHasChanges(true);
    },
    [],
  );

  // Handle dialog close with confirmation if there are unsaved changes
  const handleClose = useCallback(
    (open: boolean) => {
      if (!open && hasChanges) {
        // In a real app, you might want to show a confirmation dialog here
        if (
          confirm("You have unsaved changes. Are you sure you want to close?")
        ) {
          onOpenChange(false);
        }
      } else {
        onOpenChange(open);
      }
    },
    [hasChanges, onOpenChange],
  );

  // Handle column selection
  const handleColumnSelect = useCallback((colId: string) => {
    // Set the selected column
    setSelectedColumn(colId);

    // Find the column data
    const col = columns.find((c) => c.colId === colId);
    if (!col) return;

    // Find the matching column definition for more details
    const colDef = columnDefs.find(
      (def) => def.field === colId || def.colId === colId
    );

    console.log("Found column definition for selection:", colDef);

    // Update header settings
    const headerText = colDef?.headerName || col.headerName || col.colId;
    console.log(`Setting header text to: ${headerText} for column ${colId}`);

    // Create a complete set of header settings from the saved column definition
    const newHeaderSettings = {
      // Start with defaults
      ...headerSettings,
      // Update with the settings from the column definition
      text: headerText,
    };

    // Apply header alignment if it exists
    if (colDef?.headerStyle?.justifyContent) {
      if (colDef.headerStyle.justifyContent === "center") {
        newHeaderSettings.alignment = "center";
      } else if (colDef.headerStyle.justifyContent === "flex-end") {
        newHeaderSettings.alignment = "right";
      } else {
        newHeaderSettings.alignment = "left";
      }
      console.log(`Setting header alignment to: ${newHeaderSettings.alignment}`);
    } else if (colDef?.headerClass) {
      // Check for alignment in the header class
      if (colDef.headerClass.includes("center")) {
        newHeaderSettings.alignment = "center";
      } else if (colDef.headerClass.includes("right")) {
        newHeaderSettings.alignment = "right";
      } else {
        newHeaderSettings.alignment = "left";
      }
      console.log(`Setting header alignment from class to: ${newHeaderSettings.alignment}`);
    }

    // Apply other header styles if they exist
    if (colDef?.headerStyle) {
      if (colDef.headerStyle.color)
        newHeaderSettings.textColor = colDef.headerStyle.color;
      if (colDef.headerStyle.backgroundColor)
        newHeaderSettings.backgroundColor = colDef.headerStyle.backgroundColor;
      if (colDef.headerStyle.fontFamily)
        newHeaderSettings.fontFamily = colDef.headerStyle.fontFamily;
      if (colDef.headerStyle.fontSize) {
        // Extract the number from fontSize (e.g., "14px" -> 14)
        const fontSizeMatch = colDef.headerStyle.fontSize.match(/(\d+)/);
        if (fontSizeMatch) {
          newHeaderSettings.fontSize = parseInt(fontSizeMatch[1]);
        }
      }
      if (colDef.headerStyle.fontWeight)
        newHeaderSettings.fontWeight = colDef.headerStyle.fontWeight;
      if (colDef.headerStyle.fontStyle)
        newHeaderSettings.fontStyle = colDef.headerStyle.fontStyle;

      // Header Border styles
      // Border top
      if (colDef.headerStyle.borderTop) {
        if (colDef.headerStyle.borderTop !== "none") {
          newHeaderSettings.borderTop = true;
          // Parse the border string (e.g. "1px solid #cccccc")
          const borderMatch = colDef.headerStyle.borderTop.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newHeaderSettings.borderTopWidth = parseInt(borderMatch[1]);
            newHeaderSettings.borderTopStyle = borderMatch[2];
            newHeaderSettings.borderTopColor = borderMatch[3];
          }
        } else {
          newHeaderSettings.borderTop = false;
        }
      }

      // Border right
      if (colDef.headerStyle.borderRight) {
        if (colDef.headerStyle.borderRight !== "none") {
          newHeaderSettings.borderRight = true;
          const borderMatch = colDef.headerStyle.borderRight.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newHeaderSettings.borderRightWidth = parseInt(borderMatch[1]);
            newHeaderSettings.borderRightStyle = borderMatch[2];
            newHeaderSettings.borderRightColor = borderMatch[3];
          }
        } else {
          newHeaderSettings.borderRight = false;
        }
      }

      // Border bottom
      if (colDef.headerStyle.borderBottom) {
        if (colDef.headerStyle.borderBottom !== "none") {
          newHeaderSettings.borderBottom = true;
          const borderMatch = colDef.headerStyle.borderBottom.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newHeaderSettings.borderBottomWidth = parseInt(borderMatch[1]);
            newHeaderSettings.borderBottomStyle = borderMatch[2];
            newHeaderSettings.borderBottomColor = borderMatch[3];
          }
        } else {
          newHeaderSettings.borderBottom = false;
        }
      }

      // Border left
      if (colDef.headerStyle.borderLeft) {
        if (colDef.headerStyle.borderLeft !== "none") {
          newHeaderSettings.borderLeft = true;
          const borderMatch = colDef.headerStyle.borderLeft.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newHeaderSettings.borderLeftWidth = parseInt(borderMatch[1]);
            newHeaderSettings.borderLeftStyle = borderMatch[2];
            newHeaderSettings.borderLeftColor = borderMatch[3];
          }
        } else {
          newHeaderSettings.borderLeft = false;
        }
      }
    }

    // Update header settings state
    setHeaderSettings(newHeaderSettings);

    // Create a complete set of cell settings from the saved column definition
    const newCellSettings = {
      // Start with defaults
      ...cellSettings,
    };

    // Apply cell styles if they exist
    if (colDef?.cellStyle) {
      // Cell alignment
      if (colDef.cellStyle.textAlign) {
        newCellSettings.alignment = colDef.cellStyle.textAlign;
        console.log(`Setting cell alignment to: ${newCellSettings.alignment}`);
      }

      // Other cell styles
      if (colDef.cellStyle.color)
        newCellSettings.textColor = colDef.cellStyle.color;
      if (colDef.cellStyle.backgroundColor)
        newCellSettings.backgroundColor = colDef.cellStyle.backgroundColor;
      if (colDef.cellStyle.fontFamily)
        newCellSettings.fontFamily = colDef.cellStyle.fontFamily;
      if (colDef.cellStyle.fontSize) {
        // Extract the number from fontSize (e.g., "14px" -> 14)
        const fontSizeMatch = colDef.cellStyle.fontSize.match(/(\d+)/);
        if (fontSizeMatch) {
          newCellSettings.fontSize = parseInt(fontSizeMatch[1]);
        }
      }
      if (colDef.cellStyle.fontWeight)
        newCellSettings.fontWeight = colDef.cellStyle.fontWeight;
      if (colDef.cellStyle.fontStyle)
        newCellSettings.fontStyle = colDef.cellStyle.fontStyle;

      // Border styles
      // Border top
      if (colDef.cellStyle.borderTop) {
        if (colDef.cellStyle.borderTop !== "none") {
          newCellSettings.borderTop = true;
          // Parse the border string (e.g. "1px solid #cccccc")
          const borderMatch = colDef.cellStyle.borderTop.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newCellSettings.borderTopWidth = parseInt(borderMatch[1]);
            newCellSettings.borderTopStyle = borderMatch[2];
            newCellSettings.borderTopColor = borderMatch[3];
          }
        }
      }

      // Border right
      if (colDef.cellStyle.borderRight) {
        if (colDef.cellStyle.borderRight !== "none") {
          newCellSettings.borderRight = true;
          const borderMatch = colDef.cellStyle.borderRight.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newCellSettings.borderRightWidth = parseInt(borderMatch[1]);
            newCellSettings.borderRightStyle = borderMatch[2];
            newCellSettings.borderRightColor = borderMatch[3];
          }
        }
      }

      // Border bottom
      if (colDef.cellStyle.borderBottom) {
        if (colDef.cellStyle.borderBottom !== "none") {
          newCellSettings.borderBottom = true;
          const borderMatch = colDef.cellStyle.borderBottom.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newCellSettings.borderBottomWidth = parseInt(borderMatch[1]);
            newCellSettings.borderBottomStyle = borderMatch[2];
            newCellSettings.borderBottomColor = borderMatch[3];
          }
        }
      }

      // Border left
      if (colDef.cellStyle.borderLeft) {
        if (colDef.cellStyle.borderLeft !== "none") {
          newCellSettings.borderLeft = true;
          const borderMatch = colDef.cellStyle.borderLeft.match(
            /(\d+)px\s+(\w+)\s+(#\w+)/
          );
          if (borderMatch) {
            newCellSettings.borderLeftWidth = parseInt(borderMatch[1]);
            newCellSettings.borderLeftStyle = borderMatch[2];
            newCellSettings.borderLeftColor = borderMatch[3];
          }
        }
      }
    }

    // Update cell settings state
    setCellSettings(newCellSettings);

    // Update component settings
    const newComponentSettings = {
      ...componentSettings,
      cellRenderer: colDef?.cellRenderer || col.cellRenderer || "text",
      editable: colDef?.editable !== false, // Default to true if not specified
    };

    if (colDef?.filter) {
      newComponentSettings.filterType =
        typeof colDef.filter === "string"
          ? colDef.filter.replace("ag", "").replace("ColumnFilter", "")
          : "text";
    }

    // Detect value formatter
    const newValueSettings = { ...valueSettings };

    // Detect if it has valueFormatter defined
    if (colDef?.valueFormatter) {
      // Try to determine the formatter type by inspecting its code
      // or surrounding properties
      let formatterType = "text";

      // Look for clues in the function's string representation
      const formatterStr = colDef.valueFormatter.toString();

      // Check for currency formatter
      if (
        formatterStr.includes("style: 'currency'") ||
        formatterStr.includes("currency:") ||
        formatterStr.includes("$") ||
        (colDef.field || "").toLowerCase().includes("price") ||
        (colDef.field || "").toLowerCase().includes("cost")
      ) {
        formatterType = "currency";
        newValueSettings.formatType = "currency";

        // Try to determine currency symbol
        if (formatterStr.includes("currency: 'USD'")) {
          newValueSettings.currencySymbol = "$";
        } else if (formatterStr.includes("currency: 'EUR'")) {
          newValueSettings.currencySymbol = "€";
        } else if (formatterStr.includes("currency: 'GBP'")) {
          newValueSettings.currencySymbol = "£";
        }

        // Try to determine format
        if (formatterStr.includes("minimumFractionDigits: 0")) {
          newValueSettings.currencyFormat = "$1,000";
        } else if (formatterStr.includes("minimumFractionDigits: 2")) {
          newValueSettings.currencyFormat = "$1,000.00";
        }
      }
      // Check for number formatter
      else if (
        formatterStr.includes("NumberFormat") ||
        formatterStr.includes("minimumFractionDigits") ||
        formatterStr.includes("maximumFractionDigits")
      ) {
        formatterType = "number";
        newValueSettings.formatType = "number";

        // Try to determine format
        if (
          formatterStr.includes("useGrouping: true") ||
          formatterStr.includes("useGrouping: undefined")
        ) {
          if (
            formatterStr.includes("minimumFractionDigits: 0") &&
            formatterStr.includes("maximumFractionDigits: 0")
          ) {
            newValueSettings.numberFormat = "1,000";
          } else if (
            formatterStr.includes("minimumFractionDigits: 2") &&
            formatterStr.includes("maximumFractionDigits: 2")
          ) {
            newValueSettings.numberFormat = "1,000.00";
          }
        } else {
          if (
            formatterStr.includes("minimumFractionDigits: 0") &&
            formatterStr.includes("maximumFractionDigits: 0")
          ) {
            newValueSettings.numberFormat = "1000";
          } else if (
            formatterStr.includes("minimumFractionDigits: 2") &&
            formatterStr.includes("maximumFractionDigits: 2")
          ) {
            newValueSettings.numberFormat = "1000.00";
          }
        }
      }
      // Check for date formatter
      else if (
        formatterStr.includes("Date(") ||
        formatterStr.includes("DateTimeFormat") ||
        formatterStr.includes("toLocaleDateString")
      ) {
        formatterType = "date";
        newValueSettings.formatType = "date";

        // Try to determine format
        if (
          formatterStr.includes("hour:") &&
          formatterStr.includes("minute:")
        ) {
          newValueSettings.dateFormat = "MM/DD/YYYY hh:mm";
        } else {
          newValueSettings.dateFormat = "MM/DD/YYYY";
        }
      }

      console.log(`Detected value formatter type: ${formatterType}`);
    }

    // Update the value settings state
    setValueSettings(newValueSettings);
    setComponentSettings(newComponentSettings);

    // Reset changed properties for this column
    setChangedProperties((prev) => {
      const newChangedProps = { ...prev };
      // Remove any existing changes for this column
      delete newChangedProps[colId];
      return newChangedProps;
    });

    // Reset the hasChanges flag if there are no other changes
    setTimeout(() => {
      const hasOtherChanges = Object.keys(changedProperties).length > 0;
      if (!hasOtherChanges) {
        setHasChanges(false);
      }
    }, 0);

    // Try to determine the column data type
    let dataType = "text"; // Default
    if (colDef) {
      if (colDef.cellDataType) {
        dataType = colDef.cellDataType;
      } else if (colDef.type === 'numericColumn' || 
                (colDef.field && (
                  colDef.field.toLowerCase().includes('price') || 
                  colDef.field.toLowerCase().includes('amount') || 
                  colDef.field.toLowerCase().includes('value') || 
                  colDef.field.toLowerCase().includes('cost')
                ))) {
        dataType = "number";
      } else if (colDef.field && (
                  colDef.field.toLowerCase().includes('date') || 
                  colDef.field.toLowerCase().includes('time')
                )) {
        dataType = "date";
      } else if (colDef.field && (
                  colDef.field.toLowerCase().includes('boolean') || 
                  colDef.field.toLowerCase().includes('flag') ||
                  colDef.field.toLowerCase().includes('enable') ||
                  colDef.field.toLowerCase().includes('active') ||
                  colDef.field.toLowerCase().includes('visible')
                )) {
        dataType = "boolean";
      }
    }

    // Add the determined data type to the value settings
    newValueSettings.dataType = dataType;
  }, [
    columns,
    columnDefs,
    headerSettings,
    cellSettings,
    valueSettings,
    componentSettings,
    changedProperties,
  ]);
  
  // Update column settings based on the selected column and current settings
  const updateColumnSettings = useCallback(() => {
    if (!selectedColumn) return { columnState: columns, columnDefs };

    // Find the selected column in the columns array (for column state)
    const updatedColumns = columns.map((col) => {
      if (col.colId === selectedColumn) {
        // Create a new column object with updated settings
        const updatedCol = { ...col };
        return updatedCol;
      }
      return col;
    });

    // Find the selected column in the column definitions array
    const updatedColumnDefs = columnDefs.map((colDef) => {
      if (colDef.field === selectedColumn || colDef.colId === selectedColumn) {
        // Create a new column definition object with updated settings
        const updatedColDef = { ...colDef };
        const colId = selectedColumn;
        const colChanges = changedProperties[colId] || {};

        // Log the current state
        console.log(`Updating column ${colId} with changes:`, colChanges);
        console.log("Current header settings:", headerSettings);
        console.log("Has changes flag:", hasChanges);

        // If hasChanges is true but no explicit changes are recorded,
        // apply the current header settings anyway
        if (hasChanges) {
          // Always apply header text if it's different from the original
          const originalHeaderName =
            colDef.headerName || colDef.field || colDef.colId;
          if (headerSettings.text !== originalHeaderName) {
            console.log(
              `Applying header text change: ${originalHeaderName} -> ${headerSettings.text}`,
            );
            updatedColDef.headerName = headerSettings.text;
          }
        }

        // Apply header settings if they've been explicitly changed
        if (colChanges.header?.text) {
          console.log(
            `Applying explicit header text change to: ${headerSettings.text}`,
          );
          updatedColDef.headerName = headerSettings.text;
        }

        // Apply other settings based on the active tab and changed properties
        if (colChanges.header) {
          // Apply header settings if they've been changed
          const headerChanges = colChanges.header;

          // Initialize header style if any header style property has changed
          if (
            Object.keys(headerChanges).some((key) =>
              [
                "textColor",
                "backgroundColor",
                "fontFamily",
                "fontSize",
                "fontWeight",
                "fontStyle",
                "borderTop",
                "borderRight",
                "borderBottom",
                "borderLeft",
                "borderTopWidth",
                "borderRightWidth",
                "borderBottomWidth",
                "borderLeftWidth",
                "borderTopStyle",
                "borderRightStyle",
                "borderBottomStyle",
                "borderLeftStyle",
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor",
              ].includes(key),
            )
          ) {
            updatedColDef.headerStyle = updatedColDef.headerStyle || {};
          }

          // Apply header alignment if changed
          if (headerChanges.alignment) {
            // Create a custom header class for alignment
            // AG-Grid header uses flexbox internally
            updatedColDef.headerClass = `custom-header-${headerSettings.alignment}`;

            // Use a custom header component (function) to control alignment
            // This is the most reliable approach according to AG-Grid docs
            updatedColDef.headerComponentParams =
              updatedColDef.headerComponentParams || {};

            // Create a custom style with the proper flexbox alignment
            updatedColDef.headerStyle = updatedColDef.headerStyle || {};
            if (headerSettings.alignment === "left") {
              updatedColDef.headerStyle.justifyContent = "flex-start";
            } else if (headerSettings.alignment === "center") {
              updatedColDef.headerStyle.justifyContent = "center";
            } else if (headerSettings.alignment === "right") {
              updatedColDef.headerStyle.justifyContent = "flex-end";
            }

            console.log(
              `Applied header alignment with justifyContent: ${updatedColDef.headerStyle.justifyContent}`,
            );
          }

          // Apply individual header style properties if changed
          if (headerChanges.textColor)
            updatedColDef.headerStyle.color = headerSettings.textColor;
          if (headerChanges.backgroundColor)
            updatedColDef.headerStyle.backgroundColor =
              headerSettings.backgroundColor;
          if (headerChanges.fontFamily)
            updatedColDef.headerStyle.fontFamily = headerSettings.fontFamily;
          if (headerChanges.fontSize)
            updatedColDef.headerStyle.fontSize = `${headerSettings.fontSize}px`;
          if (headerChanges.fontWeight)
            updatedColDef.headerStyle.fontWeight = headerSettings.fontWeight;
          if (headerChanges.fontStyle)
            updatedColDef.headerStyle.fontStyle = headerSettings.fontStyle;

          // Apply border properties if changed
          if (
            headerChanges.borderTop ||
            headerChanges.borderTopWidth ||
            headerChanges.borderTopStyle ||
            headerChanges.borderTopColor
          ) {
            updatedColDef.headerStyle.borderTop = headerSettings.borderTop
              ? `${headerSettings.borderTopWidth}px ${headerSettings.borderTopStyle} ${headerSettings.borderTopColor}`
              : "none";
          }

          if (
            headerChanges.borderRight ||
            headerChanges.borderRightWidth ||
            headerChanges.borderRightStyle ||
            headerChanges.borderRightColor
          ) {
            updatedColDef.headerStyle.borderRight = headerSettings.borderRight
              ? `${headerSettings.borderRightWidth}px ${headerSettings.borderRightStyle} ${headerSettings.borderRightColor}`
              : "none";
          }

          if (
            headerChanges.borderBottom ||
            headerChanges.borderBottomWidth ||
            headerChanges.borderBottomStyle ||
            headerChanges.borderBottomColor
          ) {
            updatedColDef.headerStyle.borderBottom = headerSettings.borderBottom
              ? `${headerSettings.borderBottomWidth}px ${headerSettings.borderBottomStyle} ${headerSettings.borderBottomColor}`
              : "none";
          }

          if (
            headerChanges.borderLeft ||
            headerChanges.borderLeftWidth ||
            headerChanges.borderLeftStyle ||
            headerChanges.borderLeftColor
          ) {
            updatedColDef.headerStyle.borderLeft = headerSettings.borderLeft
              ? `${headerSettings.borderLeftWidth}px ${headerSettings.borderLeftStyle} ${headerSettings.borderLeftColor}`
              : "none";
          }
        }

        // Apply cell formatting settings if they've been changed
        if (colChanges.cell) {
          const cellChanges = colChanges.cell;
          console.log("Applying cell changes:", cellChanges);

          // Initialize cell style if any cell style property has changed
          if (
            Object.keys(cellChanges).some((key) =>
              [
                "alignment",
                "textColor",
                "backgroundColor",
                "fontFamily",
                "fontSize",
                "fontWeight",
                "fontStyle",
                "borderTop",
                "borderRight",
                "borderBottom",
                "borderLeft",
                "borderTopWidth",
                "borderRightWidth",
                "borderBottomWidth",
                "borderLeftWidth",
                "borderTopStyle",
                "borderRightStyle",
                "borderBottomStyle",
                "borderLeftStyle",
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor",
              ].includes(key),
            )
          ) {
            updatedColDef.cellStyle = updatedColDef.cellStyle || {};
          }

          // Apply individual cell style properties if changed
          if (cellChanges.alignment) {
            updatedColDef.cellStyle.textAlign = cellSettings.alignment;
            console.log(`Applied cell alignment: ${cellSettings.alignment}`);
          }
          if (cellChanges.textColor)
            updatedColDef.cellStyle.color = cellSettings.textColor;
          if (cellChanges.backgroundColor)
            updatedColDef.cellStyle.backgroundColor =
              cellSettings.backgroundColor;
          if (cellChanges.fontFamily)
            updatedColDef.cellStyle.fontFamily = cellSettings.fontFamily;
          if (cellChanges.fontSize)
            updatedColDef.cellStyle.fontSize = `${cellSettings.fontSize}px`;
          if (cellChanges.fontWeight)
            updatedColDef.cellStyle.fontWeight = cellSettings.fontWeight;
          if (cellChanges.fontStyle)
            updatedColDef.cellStyle.fontStyle = cellSettings.fontStyle;

          // Apply border properties if changed
          if (
            cellChanges.borderTop ||
            cellChanges.borderTopWidth ||
            cellChanges.borderTopStyle ||
            cellChanges.borderTopColor
          ) {
            updatedColDef.cellStyle.borderTop = cellSettings.borderTop
              ? `${cellSettings.borderTopWidth}px ${cellSettings.borderTopStyle} ${cellSettings.borderTopColor}`
              : "none";
          }

          if (
            cellChanges.borderRight ||
            cellChanges.borderRightWidth ||
            cellChanges.borderRightStyle ||
            cellChanges.borderRightColor
          ) {
            updatedColDef.cellStyle.borderRight = cellSettings.borderRight
              ? `${cellSettings.borderRightWidth}px ${cellSettings.borderRightStyle} ${cellSettings.borderRightColor}`
              : "none";
          }

          if (
            cellChanges.borderBottom ||
            cellChanges.borderBottomWidth ||
            cellChanges.borderBottomStyle ||
            cellChanges.borderBottomColor
          ) {
            updatedColDef.cellStyle.borderBottom = cellSettings.borderBottom
              ? `${cellSettings.borderBottomWidth}px ${cellSettings.borderBottomStyle} ${cellSettings.borderBottomColor}`
              : "none";
          }

          if (
            cellChanges.borderLeft ||
            cellChanges.borderLeftWidth ||
            cellChanges.borderLeftStyle ||
            cellChanges.borderLeftColor
          ) {
            updatedColDef.cellStyle.borderLeft = cellSettings.borderLeft
              ? `${cellSettings.borderLeftWidth}px ${cellSettings.borderLeftStyle} ${cellSettings.borderLeftColor}`
              : "none";
          }

          // Log the updated column definition
          console.log(
            "Updated column definition with cell styles:",
            updatedColDef,
          );
        }

        // Apply value formatting settings if they've been changed
        if (colChanges.value && colChanges.value.formatType) {
          if (valueSettings.formatType === "number") {
            // Use string expression instead of function
            updatedColDef.valueFormatter = `
              value == null || value === '' ? '' : 
              isNaN(Number(value)) ? value : 
              new Intl.NumberFormat("en-US", {
                useGrouping: ${valueSettings.numberFormat.includes(",")},
                minimumFractionDigits: ${valueSettings.numberFormat.split(".")[1]?.length || 0},
                maximumFractionDigits: ${valueSettings.numberFormat.split(".")[1]?.length || 0}
              }).format(Number(value))
            `;
            
            // Store type for proper sorting
            updatedColDef.type = "numericColumn";
          } else if (valueSettings.formatType === "currency") {
            // Use string expression instead of function
            const currencyCode = valueSettings.currencySymbol === '€' ? 'EUR' : 
                                valueSettings.currencySymbol === '£' ? 'GBP' :
                                valueSettings.currencySymbol === '¥' ? 'JPY' : 'USD';
            
            updatedColDef.valueFormatter = `
              value == null || value === '' ? '' : 
              isNaN(Number(value)) ? value : 
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "${currencyCode}",
                useGrouping: ${valueSettings.currencyFormat.includes(",")},
                minimumFractionDigits: ${valueSettings.currencyFormat.split(".")[1]?.length || 0},
                maximumFractionDigits: ${valueSettings.currencyFormat.split(".")[1]?.length || 0}
              }).format(Number(value))
            `;
            
            // Store type for proper sorting
            updatedColDef.type = "numericColumn";
          } else if (valueSettings.formatType === "percent") {
            // Use string expression instead of function
            updatedColDef.valueFormatter = `
              value == null || value === '' ? '' : 
              isNaN(Number(value)) ? value : 
              new Intl.NumberFormat("en-US", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(Number(value))
            `;
            
            // Store type for proper sorting
            updatedColDef.type = "numericColumn";
          } else if (valueSettings.formatType === "date") {
            // Use string expression for date formatting
            const includeTime = valueSettings.dateFormat.includes("hh");
            
            updatedColDef.valueFormatter = `
              value == null || value === '' ? '' : 
              (() => {
                try {
                  const date = new Date(value);
                  if (isNaN(date.getTime())) return value;
                  return new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"${includeTime ? ',\n            hour: "2-digit",\n            minute: "2-digit"' : ''}
                  }).format(date);
                } catch (e) {
                  return value;
                }
              })()
            `;
          } else if (valueSettings.formatType === "custom" && valueSettings.customFormat) {
            // Handle custom format with string expression
            // Store the custom format template
            const template = valueSettings.customFormat;
            
            updatedColDef.valueFormatter = `
              value == null || value === '' ? '' : 
              (() => {
                try {
                  let result = "${template.replace(/"/g, '\\"')}";
                  result = result.replace(/\\{value\\}/g, value);
                  result = result.replace(/\\{row\\}/g, rowIndex);
                  result = result.replace(/\\{col\\}/g, column.colId);
                  return result;
                } catch (e) {
                  return value;
                }
              })()
            `;
          }
        }

        // Apply component settings if they've been changed
        if (colChanges.component) {
          const componentChanges = colChanges.component;

          if (
            componentChanges.cellRenderer &&
            componentSettings.cellRenderer !== "text"
          ) {
            updatedColDef.cellRenderer = componentSettings.cellRenderer;
          }

          if (componentChanges.editable !== undefined) {
            updatedColDef.editable = componentSettings.editable;
          }
        }

        // Apply data type change if it's been changed
        if (colChanges.value && colChanges.value.dataType) {
          updatedColDef.cellDataType = valueSettings.dataType;
          
          // If changing to number, add numericColumn for proper sorting
          if (valueSettings.dataType === "number") {
            updatedColDef.type = "numericColumn";
          } 
          // If changing to date, set appropriate date-related properties
          else if (valueSettings.dataType === "date" || valueSettings.dataType === "dateString") {
            // Only apply a default formatter if there isn't already one set
            if (!updatedColDef.valueFormatter) {
              // Use string expression for date formatting
              updatedColDef.valueFormatter = `
                value == null || value === '' ? '' : 
                (() => {
                  try {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return value;
                    return new Intl.DateTimeFormat("en-US", {
                      year: "numeric", 
                      month: "2-digit", 
                      day: "2-digit"
                    }).format(date);
                  } catch (e) {
                    return value;
                  }
                })()
              `;
            }
          }
        }

        // In the section where value formatters are applied, add a flag to mark columns with custom formatters
        // This should be in the updateColumnSettings function

        // When applying any valueFormatter:
        if (valueSettings.formatType !== "text") {
          // Add this line after setting the valueFormatter
          updatedColDef.suppressGlobalFormatterOverride = true;
          updatedColDef.customFormatterApplied = true; // Add a custom flag to easily identify columns with formatters
          
          // Also ensure the colId is set properly for identification
          updatedColDef.colId = updatedColDef.colId || colId;
          
          console.log(`Applied ${valueSettings.formatType} formatter to column ${colId} with override protection`);
        }

        return updatedColDef;
      }
      return colDef;
    });

    setColumns(updatedColumns);
    setLocalColumnDefs(updatedColumnDefs);

    return { columnState: updatedColumns, columnDefs: updatedColumnDefs };
  }, [
    selectedColumn,
    columns,
    columnDefs,
    headerSettings,
    cellSettings,
    valueSettings,
    componentSettings,
    activeTab,
    hasChanges,
    changedProperties,
  ]);

  // Apply changes to the grid
  const applyChanges = useCallback(() => {
    // Update column settings before applying
    const { columnState: updatedColumns, columnDefs: updatedColumnDefs } =
      updateColumnSettings();

    // Get the list of columns that have been explicitly changed
    const changedColumnIds = Object.keys(changedProperties);
    console.log("Columns with explicit changes:", changedColumnIds);

    // If no changes detected, just close
    if (!hasChanges) {
        console.log("No changes detected, closing dialog");
        onOpenChange(false);
        return;
    }

    // Extract only the properties that are part of the column state
    // Apply state changes to *all* columns, not just changed ones, to ensure consistency
    const columnStateToSave = updatedColumns.map((col) => {
      // Always include the column ID
      const state: any = {
        colId: col.colId,
      };

      // Only include properties that are part of the column state
      if (col.hide !== undefined) state.hide = col.hide;
      if (col.width !== undefined) state.width = col.width;
      if (col.flex !== undefined) state.flex = col.flex;
      if (col.sort !== undefined) state.sort = col.sort;
      if (col.sortIndex !== undefined) state.sortIndex = col.sortIndex;
      if (col.pinned !== undefined) state.pinned = col.pinned;

      return state;
    });

    // Save the COMPLETE updated column definitions, not just the changed ones
    const columnDefsToSave = updatedColumnDefs;

    console.log("Saving column state to store:", columnStateToSave);
    console.log(
      "Saving COMPLETE column definitions to store:",
      columnDefsToSave, // Now saving the full array
    );

    // Save both column state and column definitions to the store
    setColumnState(columnStateToSave);
    setColumnDefs(columnDefsToSave); // Save the complete list

    // Reset local state after saving
    setHasChanges(false);
    setChangedProperties({});

    // Close dialog
    onOpenChange(false);

    // Add this code before the dialog is closed:
    // Perform a more thorough refresh to ensure formatters are fully applied
    if (gridRef.current?.api) {
      console.log('Performing thorough grid refresh to ensure formatters are applied');
      
      // First refresh cells
      gridRef.current.api.refreshCells({ force: true });
      
      // Then trigger a complete client-side row model refresh
      setTimeout(() => {
        if (gridRef.current?.api) {
          // For client-side row model, refresh everything
          try {
            gridRef.current.api.refreshClientSideRowModel('everything');
            console.log('Client-side row model refresh completed');
          } catch (e) {
            // If not using client-side row model, this might throw an error
            console.log('Could not refresh client side row model - using alternative refresh method');
            // Alternative refresh method
            gridRef.current.api.redrawRows();
          }
          
          // Also dispatch a custom event that tells other components formatters have changed
          const event = new CustomEvent('formattersUpdated', { 
            detail: { columns: selectedColumns } 
          });
          document.dispatchEvent(event);
        }
      }, 100);
    }
  }, [
    onOpenChange,
    setColumnState,
    setColumnDefs,
    updateColumnSettings,
    changedProperties,
    hasChanges,
    gridRef,
  ]);

  // Just updating the render part for a better UI
  
  // Filter columns for search
  const filteredColumns = useMemo(() => {
    if (!searchTerm) return columns;
    
    return columns.filter(col => {
      const colId = col.colId || '';
      const headerName = col.headerName || col.colId || '';
      return colId.toLowerCase().includes(searchTerm.toLowerCase()) || 
             headerName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [columns, searchTerm]);

  // Render a more compact column list
  const renderColumnList = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="px-1.5 mb-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search columns"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-7 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-1.5">
          <div className="space-y-0.5">
            {filteredColumns.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-xs">
                No columns found
              </div>
            ) : (
              filteredColumns.map((col) => {
                const isActive = selectedColumn === col.colId;
                const isModified = changedProperties[col.colId];
                
                return (
                  <div
                    key={col.colId}
                    className={cn(
                      "flex items-center rounded px-2 py-1 text-xs cursor-pointer group relative transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/40",
                      isModified && "border-l-2 border-primary pl-1.5"
                    )}
                    onClick={() => handleColumnSelect(col.colId)}
                  >
                    <div className="flex-1 flex items-center space-x-2 overflow-hidden">
                      <Columns className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <div className="flex-1 truncate">
                        <span className="font-medium">{col.headerName || col.colId}</span>
                        {col.headerName && col.colId && col.headerName !== col.colId && (
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {col.colId}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100">
                      {col.hide ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              Column is hidden
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                    </div>
                    
                    {isModified && (
                      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                        <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Render compact tab content 
  const renderTabContent = () => {
    switch (activeTab) {
      case "header":
        return (
          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-primary" />
                Header Settings
              </h3>
              {selectedColumn ? (
                <div className="text-xs font-medium px-1.5 py-0.5 bg-primary/10 rounded text-primary">
                  {selectedColumn}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Select a column
                </div>
              )}
            </div>
            <Separator className="my-1" />

            {selectedColumn ? (
              <ScrollArea className="pr-2">
                <div className="space-y-3">
                  {/* Header Text */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="header-text" className="text-xs font-medium">Header Text</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-60 text-xs">
                            The text displayed in the header.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="header-text"
                      value={headerSettings.text}
                      onChange={(e) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          text: e.target.value,
                        }));
                        trackPropertyChange(selectedColumn, "header", "text");
                      }}
                      placeholder="Enter header text"
                      className="h-7 text-xs"
                    />
                  </div>

                  {/* Visual settings group */}
                  <div className="space-y-2 rounded border p-2">
                    <h4 className="text-xs font-medium">Visual Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Text Color */}
                      <div>
                        <Label htmlFor="text-color" className="text-[10px] mb-1 block text-muted-foreground">Text Color</Label>
                        <Input
                          id="text-color"
                          value={headerSettings.textColor}
                          onChange={(e) => {
                            setHeaderSettings((prev) => ({
                              ...prev,
                              textColor: e.target.value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "header",
                              "textColor",
                            );
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      
                      {/* Background Color */}
                      <div>
                        <Label htmlFor="bg-color" className="text-[10px] mb-1 block text-muted-foreground">Background Color</Label>
                        <Input
                          id="bg-color"
                          value={headerSettings.backgroundColor}
                          onChange={(e) => {
                            setHeaderSettings((prev) => ({
                              ...prev,
                              backgroundColor: e.target.value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "header",
                              "backgroundColor",
                            );
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div>
                        <Label htmlFor="font-weight" className="text-[10px] mb-1 block text-muted-foreground">Weight</Label>
                        <Select
                          value={headerSettings.fontWeight}
                          onValueChange={(value) => {
                            setHeaderSettings((prev) => ({
                              ...prev,
                              fontWeight: value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "header",
                              "fontWeight",
                            );
                          }}
                        >
                          <SelectTrigger id="font-weight" className="h-7 text-xs">
                            <SelectValue placeholder="Weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Regular</SelectItem>
                            <SelectItem value="400">400</SelectItem>
                            <SelectItem value="500">500</SelectItem>
                            <SelectItem value="600">600</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-[10px] mb-1 block text-muted-foreground">Style</Label>
                        <div className="flex space-x-0.5">
                          <Button
                            type="button"
                            variant={headerSettings.fontWeight === 'bold' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setHeaderSettings((prev) => ({
                                ...prev,
                                fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold',
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "fontWeight",
                              );
                            }}
                          >
                            B
                          </Button>
                          <Button
                            type="button"
                            variant={headerSettings.fontStyle === 'italic' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setHeaderSettings((prev) => ({
                                ...prev,
                                fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic',
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "fontStyle",
                              );
                            }}
                          >
                            I
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            disabled
                          >
                            U
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Alignment */}
                    <div className="mt-1.5">
                      <Label className="text-[10px] mb-1 block text-muted-foreground">Alignment</Label>
                      <div className="flex">
                        <Button
                          type="button"
                          variant={headerSettings.alignment === 'left' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-7 rounded-l text-xs"
                          onClick={() => {
                            setHeaderSettings((prev) => ({
                              ...prev,
                              alignment: 'left',
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "header",
                              "alignment",
                            );
                          }}
                        >
                          <AlignLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant={headerSettings.alignment === 'center' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-7 rounded-none border-x-0 text-xs"
                          onClick={() => {
                            setHeaderSettings((prev) => ({
                              ...prev,
                              alignment: 'center',
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "header",
                              "alignment",
                            );
                          }}
                        >
                          <AlignCenter className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant={headerSettings.alignment === 'right' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-7 rounded-r text-xs"
                          onClick={() => {
                            setHeaderSettings((prev) => ({
                              ...prev,
                              alignment: 'right',
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "header",
                              "alignment",
                            );
                          }}
                        >
                          <AlignRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Border */}
                    <div className="mt-1.5">
                      <Label className="text-[10px] mb-1 block text-muted-foreground">Border</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex space-x-0.5">
                          <Button
                            type="button"
                            variant={headerSettings.borderTop ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setHeaderSettings((prev) => ({
                                ...prev,
                                borderTop: !prev.borderTop,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "borderTop",
                              );
                            }}
                          >
                            T
                          </Button>
                          <Button
                            type="button"
                            variant={headerSettings.borderRight ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setHeaderSettings((prev) => ({
                                ...prev,
                                borderRight: !prev.borderRight,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "borderRight",
                              );
                            }}
                          >
                            R
                          </Button>
                          <Button
                            type="button"
                            variant={headerSettings.borderBottom ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setHeaderSettings((prev) => ({
                                ...prev,
                                borderBottom: !prev.borderBottom,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "borderBottom",
                              );
                            }}
                          >
                            B
                          </Button>
                          <Button
                            type="button"
                            variant={headerSettings.borderLeft ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setHeaderSettings((prev) => ({
                                ...prev,
                                borderLeft: !prev.borderLeft,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "borderLeft",
                              );
                            }}
                          >
                            L
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          <Select
                            value={headerSettings.borderTopStyle}
                            onValueChange={(value) => {
                              setHeaderSettings((prev) => ({
                                ...prev,
                                borderTopStyle: value,
                                borderRightStyle: value,
                                borderBottomStyle: value,
                                borderLeftStyle: value,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "borderTopStyle",
                              );
                            }}
                          >
                            <SelectTrigger className="h-7 flex-1 text-xs">
                              <SelectValue placeholder="Style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solid">Solid</SelectItem>
                              <SelectItem value="dashed">Dashed</SelectItem>
                              <SelectItem value="dotted">Dotted</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative w-7 h-7 rounded border flex items-center justify-center overflow-hidden">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: headerSettings.borderTopColor }}
                            />
                            <Input
                              type="color"
                              value={headerSettings.borderTopColor}
                              onChange={(e) => {
                                const color = e.target.value;
                                setHeaderSettings((prev) => ({
                                  ...prev,
                                  borderTopColor: color,
                                  borderRightColor: color,
                                  borderBottomColor: color,
                                  borderLeftColor: color,
                                }));
                                trackPropertyChange(
                                  selectedColumn,
                                  "header",
                                  "borderTopColor",
                                );
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Border Width Slider */}
                      <div className="mt-1.5 flex items-center space-x-2">
                        <Label className="text-[10px] w-16 text-muted-foreground">Thickness:</Label>
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={headerSettings.borderTopWidth}
                            onChange={(e) => {
                              const width = parseInt(e.target.value);
                              setHeaderSettings((prev) => ({
                                ...prev,
                                borderTopWidth: width,
                                borderRightWidth: width,
                                borderBottomWidth: width,
                                borderLeftWidth: width,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "header",
                                "borderTopWidth",
                              );
                            }}
                            className="w-full h-1.5 bg-primary/20 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="w-7 flex justify-end">
                          <span className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded-sm">
                            {headerSettings.borderTopWidth}px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-1 mt-2">
                    <h4 className="text-xs font-medium">Preview</h4>
                    <div 
                      className="h-8 flex items-center px-3 border rounded text-xs"
                      style={{
                        color: headerSettings.textColor,
                        backgroundColor: headerSettings.backgroundColor,
                        fontFamily: headerSettings.fontFamily,
                        fontSize: `${headerSettings.fontSize}px`,
                        fontWeight: headerSettings.fontWeight,
                        fontStyle: headerSettings.fontStyle,
                        justifyContent: 
                          headerSettings.alignment === 'left' 
                            ? 'flex-start' 
                            : headerSettings.alignment === 'right' 
                              ? 'flex-end' 
                              : 'center',
                        borderTop: headerSettings.borderTop 
                          ? `${headerSettings.borderTopWidth}px ${headerSettings.borderTopStyle} ${headerSettings.borderTopColor}` 
                          : undefined,
                        borderRight: headerSettings.borderRight 
                          ? `${headerSettings.borderRightWidth}px ${headerSettings.borderRightStyle} ${headerSettings.borderRightColor}` 
                          : undefined,
                        borderBottom: headerSettings.borderBottom 
                          ? `${headerSettings.borderBottomWidth}px ${headerSettings.borderBottomStyle} ${headerSettings.borderBottomColor}` 
                          : undefined,
                        borderLeft: headerSettings.borderLeft 
                          ? `${headerSettings.borderLeftWidth}px ${headerSettings.borderLeftStyle} ${headerSettings.borderLeftColor}` 
                          : undefined,
                      }}
                    >
                      {headerSettings.text || selectedColumn || "Header Preview"}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded p-4">
                <Columns className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium">No Column Selected</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Select a column from the list on the left
                </p>
              </div>
            )}
          </div>
        );
      
      case "cell":
        return (
          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Paintbrush className="h-3.5 w-3.5 text-primary" />
                Cell Formatting
              </h3>
              {selectedColumn ? (
                <div className="text-xs font-medium px-1.5 py-0.5 bg-primary/10 rounded text-primary">
                  {selectedColumn}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Select a column
                </div>
              )}
            </div>
            <Separator className="my-1" />

            {selectedColumn ? (
              <ScrollArea className="pr-2">
                <div className="space-y-3">
                  {/* Visual settings group */}
                  <div className="space-y-2 rounded border p-2">
                    <h4 className="text-xs font-medium">Visual Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Text Color */}
                      <div>
                        <Label htmlFor="text-color" className="text-[10px] mb-1 block text-muted-foreground">Text Color</Label>
                        <Input
                          id="text-color"
                          value={cellSettings.textColor}
                          onChange={(e) => {
                            setCellSettings((prev) => ({
                              ...prev,
                              textColor: e.target.value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "cell",
                              "textColor",
                            );
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      
                      {/* Background Color */}
                      <div>
                        <Label htmlFor="bg-color" className="text-[10px] mb-1 block text-muted-foreground">Background Color</Label>
                        <Input
                          id="bg-color"
                          value={cellSettings.backgroundColor}
                          onChange={(e) => {
                            setCellSettings((prev) => ({
                              ...prev,
                              backgroundColor: e.target.value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "cell",
                              "backgroundColor",
                            );
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div>
                        <Label htmlFor="font-weight" className="text-[10px] mb-1 block text-muted-foreground">Weight</Label>
                        <Select
                          value={cellSettings.fontWeight}
                          onValueChange={(value) => {
                            setCellSettings((prev) => ({
                              ...prev,
                              fontWeight: value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "cell",
                              "fontWeight",
                            );
                          }}
                        >
                          <SelectTrigger id="font-weight" className="h-7 text-xs">
                            <SelectValue placeholder="Weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Regular</SelectItem>
                            <SelectItem value="400">400</SelectItem>
                            <SelectItem value="500">500</SelectItem>
                            <SelectItem value="600">600</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-[10px] mb-1 block text-muted-foreground">Style</Label>
                        <div className="flex space-x-0.5">
                          <Button
                            type="button"
                            variant={cellSettings.fontWeight === 'bold' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setCellSettings((prev) => ({
                                ...prev,
                                fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold',
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "fontWeight",
                              );
                            }}
                          >
                            B
                          </Button>
                          <Button
                            type="button"
                            variant={cellSettings.fontStyle === 'italic' ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setCellSettings((prev) => ({
                                ...prev,
                                fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic',
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "fontStyle",
                              );
                            }}
                          >
                            I
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            disabled
                          >
                            U
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Alignment */}
                    <div className="mt-1.5">
                      <Label className="text-[10px] mb-1 block text-muted-foreground">Alignment</Label>
                      <div className="flex">
                        <Button
                          type="button"
                          variant={cellSettings.alignment === 'left' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-7 rounded-l text-xs"
                          onClick={() => {
                            setCellSettings((prev) => ({
                              ...prev,
                              alignment: 'left',
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "cell",
                              "alignment",
                            );
                          }}
                        >
                          <AlignLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant={cellSettings.alignment === 'center' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-7 rounded-none border-x-0 text-xs"
                          onClick={() => {
                            setCellSettings((prev) => ({
                              ...prev,
                              alignment: 'center',
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "cell",
                              "alignment",
                            );
                          }}
                        >
                          <AlignCenter className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant={cellSettings.alignment === 'right' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 h-7 rounded-r text-xs"
                          onClick={() => {
                            setCellSettings((prev) => ({
                              ...prev,
                              alignment: 'right',
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "cell",
                              "alignment",
                            );
                          }}
                        >
                          <AlignRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Border */}
                    <div className="mt-1.5">
                      <Label className="text-[10px] mb-1 block text-muted-foreground">Border</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex space-x-0.5">
                          <Button
                            type="button"
                            variant={cellSettings.borderTop ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setCellSettings((prev) => ({
                                ...prev,
                                borderTop: !prev.borderTop,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "borderTop",
                              );
                            }}
                          >
                            T
                          </Button>
                          <Button
                            type="button"
                            variant={cellSettings.borderRight ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setCellSettings((prev) => ({
                                ...prev,
                                borderRight: !prev.borderRight,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "borderRight",
                              );
                            }}
                          >
                            R
                          </Button>
                          <Button
                            type="button"
                            variant={cellSettings.borderBottom ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setCellSettings((prev) => ({
                                ...prev,
                                borderBottom: !prev.borderBottom,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "borderBottom",
                              );
                            }}
                          >
                            B
                          </Button>
                          <Button
                            type="button"
                            variant={cellSettings.borderLeft ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setCellSettings((prev) => ({
                                ...prev,
                                borderLeft: !prev.borderLeft,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "borderLeft",
                              );
                            }}
                          >
                            L
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          <Select
                            value={cellSettings.borderTopStyle}
                            onValueChange={(value) => {
                              setCellSettings((prev) => ({
                                ...prev,
                                borderTopStyle: value,
                                borderRightStyle: value,
                                borderBottomStyle: value,
                                borderLeftStyle: value,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "borderTopStyle",
                              );
                            }}
                          >
                            <SelectTrigger className="h-7 flex-1 text-xs">
                              <SelectValue placeholder="Style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solid">Solid</SelectItem>
                              <SelectItem value="dashed">Dashed</SelectItem>
                              <SelectItem value="dotted">Dotted</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative w-7 h-7 rounded border flex items-center justify-center overflow-hidden">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: cellSettings.borderTopColor }}
                            />
                            <Input
                              type="color"
                              value={cellSettings.borderTopColor}
                              onChange={(e) => {
                                const color = e.target.value;
                                setCellSettings((prev) => ({
                                  ...prev,
                                  borderTopColor: color,
                                  borderRightColor: color,
                                  borderBottomColor: color,
                                  borderLeftColor: color,
                                }));
                                trackPropertyChange(
                                  selectedColumn,
                                  "cell",
                                  "borderTopColor",
                                );
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Border Width Slider */}
                      <div className="mt-1.5 flex items-center space-x-2">
                        <Label className="text-[10px] w-16 text-muted-foreground">Thickness:</Label>
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={cellSettings.borderTopWidth}
                            onChange={(e) => {
                              const width = parseInt(e.target.value);
                              setCellSettings((prev) => ({
                                ...prev,
                                borderTopWidth: width,
                                borderRightWidth: width,
                                borderBottomWidth: width,
                                borderLeftWidth: width,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "cell",
                                "borderTopWidth",
                              );
                            }}
                            className="w-full h-1.5 bg-primary/20 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="w-7 flex justify-end">
                          <span className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded-sm">
                            {cellSettings.borderTopWidth}px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-1 mt-2">
                    <h4 className="text-xs font-medium">Preview</h4>
                    <div 
                      className="h-8 flex items-center px-3 border rounded text-xs"
                      style={{
                        color: cellSettings.textColor,
                        backgroundColor: cellSettings.backgroundColor,
                        fontFamily: cellSettings.fontFamily,
                        fontSize: `${cellSettings.fontSize}px`,
                        fontWeight: cellSettings.fontWeight,
                        fontStyle: cellSettings.fontStyle,
                        textAlign: cellSettings.alignment,
                        borderTop: cellSettings.borderTop 
                          ? `${cellSettings.borderTopWidth}px ${cellSettings.borderTopStyle} ${cellSettings.borderTopColor}` 
                          : undefined,
                        borderRight: cellSettings.borderRight 
                          ? `${cellSettings.borderRightWidth}px ${cellSettings.borderRightStyle} ${cellSettings.borderRightColor}` 
                          : undefined,
                        borderBottom: cellSettings.borderBottom 
                          ? `${cellSettings.borderBottomWidth}px ${cellSettings.borderBottomStyle} ${cellSettings.borderBottomColor}` 
                          : undefined,
                        borderLeft: cellSettings.borderLeft 
                          ? `${cellSettings.borderLeftWidth}px ${cellSettings.borderLeftStyle} ${cellSettings.borderLeftColor}` 
                          : undefined,
                      }}
                    >
                      Sample Cell Value
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded p-4">
                <Columns className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium">No Column Selected</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Select a column from the list on the left
                </p>
              </div>
            )}
          </div>
        );
        
      case "value":
        return (
          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-primary" />
                Value Formatting
              </h3>
              {selectedColumn ? (
                <div className="text-xs font-medium px-1.5 py-0.5 bg-primary/10 rounded text-primary">
                  {selectedColumn}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Select a column
                </div>
              )}
            </div>
            <Separator className="my-1" />

            {selectedColumn ? (
              <ScrollArea className="pr-2">
                <div className="space-y-3">
                  {/* Data Type Selection */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="data-type" className="text-xs font-medium">Column Data Type</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-60 text-xs">
                            The data type determines how the column's data is stored, validated, and processed by the grid.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={valueSettings.dataType}
                      onValueChange={(value) => {
                        setValueSettings((prev) => ({
                          ...prev,
                          dataType: value,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "value",
                          "dataType",
                        );
                      }}
                    >
                      <SelectTrigger id="data-type" className="h-7 text-xs">
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="dateString">Date String</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format Type Selection */}
                  <div className="space-y-1.5">
                    <Label htmlFor="format-type" className="text-xs font-medium">Format Type</Label>
                    <Select
                      value={valueSettings.formatType}
                      onValueChange={(value) => {
                        setValueSettings((prev) => ({
                          ...prev,
                          formatType: value,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "value",
                          "formatType",
                        );
                      }}
                    >
                      <SelectTrigger id="format-type" className="h-7 text-xs">
                        <SelectValue placeholder="Select format type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format specific settings */}
                  <div className="space-y-2 rounded border p-2">
                    <h4 className="text-xs font-medium">Format Options</h4>
                    
                    {valueSettings.formatType === "number" && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] mb-1 block text-muted-foreground">Number Format</Label>
                        <Select
                          value={valueSettings.numberFormat}
                          onValueChange={(value) => {
                            setValueSettings((prev) => ({
                              ...prev,
                              numberFormat: value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "value",
                              "numberFormat",
                            );
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Select number format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1,000">1,000</SelectItem>
                            <SelectItem value="1,000.00">1,000.00</SelectItem>
                            <SelectItem value="1000">1000</SelectItem>
                            <SelectItem value="1000.00">1000.00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {valueSettings.formatType === "currency" && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] mb-1 block text-muted-foreground">Currency Symbol</Label>
                            <Select
                              value={valueSettings.currencySymbol}
                              onValueChange={(value) => {
                                setValueSettings((prev) => ({
                                  ...prev,
                                  currencySymbol: value,
                                }));
                                trackPropertyChange(
                                  selectedColumn,
                                  "value",
                                  "currencySymbol",
                                );
                              }}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Symbol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="$">$ (USD)</SelectItem>
                                <SelectItem value="€">€ (EUR)</SelectItem>
                                <SelectItem value="£">£ (GBP)</SelectItem>
                                <SelectItem value="¥">¥ (JPY/CNY)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[10px] mb-1 block text-muted-foreground">Format</Label>
                            <Select
                              value={valueSettings.currencyFormat}
                              onValueChange={(value) => {
                                setValueSettings((prev) => ({
                                  ...prev,
                                  currencyFormat: value,
                                }));
                                trackPropertyChange(
                                  selectedColumn,
                                  "value",
                                  "currencyFormat",
                                );
                              }}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="$1,000">$1,000</SelectItem>
                                <SelectItem value="$1,000.00">$1,000.00</SelectItem>
                                <SelectItem value="$ 1,000.00">$ 1,000.00</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {valueSettings.formatType === "date" && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] mb-1 block text-muted-foreground">Date Format</Label>
                        <Select
                          value={valueSettings.dateFormat}
                          onValueChange={(value) => {
                            setValueSettings((prev) => ({
                              ...prev,
                              dateFormat: value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "value",
                              "dateFormat",
                            );
                          }}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            <SelectItem value="MM/DD/YYYY hh:mm">MM/DD/YYYY hh:mm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {valueSettings.formatType === "custom" && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="custom-format" className="text-[10px] text-muted-foreground">Custom Format String</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-60 text-xs">
                                Enter a custom format string or JavaScript formatting expression.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="custom-format"
                          value={valueSettings.customFormat}
                          onChange={(e) => {
                            setValueSettings((prev) => ({
                              ...prev,
                              customFormat: e.target.value,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "value",
                              "customFormat",
                            );
                          }}
                          placeholder="Enter custom format"
                          className="h-7 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="space-y-1 mt-2">
                    <h4 className="text-xs font-medium">Preview</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-1">Input Value</div>
                        <div className="h-8 flex items-center px-3 border rounded text-xs bg-muted/30">
                          {valueSettings.formatType === "number" || valueSettings.formatType === "currency" ? "1234.56" : 
                           valueSettings.formatType === "date" ? "2023-01-15" : 
                           "Sample Value"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-1">Formatted Output</div>
                        <div className="h-8 flex items-center px-3 border rounded text-xs">
                          {valueSettings.formatType === "number" ? 
                            valueSettings.numberFormat === "1,000" ? "1,235" :
                            valueSettings.numberFormat === "1,000.00" ? "1,234.56" :
                            valueSettings.numberFormat === "1000" ? "1235" : "1234.56" :
                           valueSettings.formatType === "currency" ?
                            valueSettings.currencyFormat === "$1,000" ? 
                              `${valueSettings.currencySymbol}1,235` : 
                              `${valueSettings.currencySymbol}1,234.56` :
                           valueSettings.formatType === "date" ?
                            valueSettings.dateFormat === "MM/DD/YYYY" ? "01/15/2023" :
                            valueSettings.dateFormat === "DD/MM/YYYY" ? "15/01/2023" :
                            valueSettings.dateFormat === "YYYY-MM-DD" ? "2023-01-15" : "01/15/2023 12:00" :
                           "Sample Value"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded p-4">
                <Columns className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium">No Column Selected</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Select a column from the list on the left
                </p>
              </div>
            )}
          </div>
        );
        
      case "component":
        return (
          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Component className="h-3.5 w-3.5 text-primary" />
                Component Configuration
              </h3>
              {selectedColumn ? (
                <div className="text-xs font-medium px-1.5 py-0.5 bg-primary/10 rounded text-primary">
                  {selectedColumn}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Select a column
                </div>
              )}
            </div>
            <Separator className="my-1" />

            {selectedColumn ? (
              <ScrollArea className="pr-2">
                <div className="space-y-3">
                  {/* Cell Renderer Selection */}
                  <div className="space-y-2 rounded border p-2">
                    <h4 className="text-xs font-medium">Cell Renderer</h4>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] mb-1 block text-muted-foreground">Renderer Type</Label>
                      <Select
                        value={componentSettings.cellRenderer}
                        onValueChange={(value) => {
                          setComponentSettings((prev) => ({
                            ...prev,
                            cellRenderer: value,
                          }));
                          trackPropertyChange(
                            selectedColumn,
                            "component",
                            "cellRenderer",
                          );
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Select renderer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                          <SelectItem value="button">Button</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Editing Options */}
                  <div className="space-y-2 rounded border p-2">
                    <h4 className="text-xs font-medium">Editing Options</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="editable"
                        checked={componentSettings.editable}
                        onCheckedChange={(checked) => {
                          setComponentSettings((prev) => ({
                            ...prev,
                            editable: checked === true,
                          }));
                          trackPropertyChange(
                            selectedColumn,
                            "component",
                            "editable",
                          );
                        }}
                      />
                      <Label 
                        htmlFor="editable" 
                        className="text-xs cursor-pointer"
                      >
                        Allow Editing
                      </Label>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {componentSettings.cellRenderer === "dropdown" && (
                    <div className="space-y-2 rounded border p-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium">Dropdown Options</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => {
                            setComponentSettings((prev) => ({
                              ...prev,
                              dropdownOptions: [...prev.dropdownOptions, "New Option"],
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "component",
                              "dropdownOptions",
                            );
                          }}
                        >
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {componentSettings.dropdownOptions.length > 0 ? (
                          componentSettings.dropdownOptions.map((option, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...componentSettings.dropdownOptions];
                                  newOptions[index] = e.target.value;
                                  setComponentSettings((prev) => ({
                                    ...prev,
                                    dropdownOptions: newOptions,
                                  }));
                                  trackPropertyChange(
                                    selectedColumn,
                                    "component",
                                    "dropdownOptions",
                                  );
                                }}
                                className="h-6 text-xs flex-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const newOptions = componentSettings.dropdownOptions.filter((_, i) => i !== index);
                                  setComponentSettings((prev) => ({
                                    ...prev,
                                    dropdownOptions: newOptions,
                                  }));
                                  trackPropertyChange(
                                    selectedColumn,
                                    "component",
                                    "dropdownOptions",
                                  );
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-center text-muted-foreground py-2">
                            No options added
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Filter Configuration */}
                  <div className="space-y-2 rounded border p-2">
                    <h4 className="text-xs font-medium">Filter Configuration</h4>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] mb-1 block text-muted-foreground">Filter Type</Label>
                      <Select
                        value={componentSettings.filterType}
                        onValueChange={(value) => {
                          setComponentSettings((prev) => ({
                            ...prev,
                            filterType: value,
                          }));
                          trackPropertyChange(
                            selectedColumn,
                            "component",
                            "filterType",
                          );
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Select filter type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Component Preview */}
                  <div className="space-y-1 mt-2">
                    <h4 className="text-xs font-medium">Component Preview</h4>
                    <div className="rounded border overflow-hidden">
                      <div className="bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground border-b">
                        {componentSettings.cellRenderer.charAt(0).toUpperCase() + componentSettings.cellRenderer.slice(1)} Renderer
                      </div>
                      <div className="p-3 flex items-center justify-center">
                        {componentSettings.cellRenderer === "text" && (
                          <div className="text-xs">Sample Text Value</div>
                        )}
                        {componentSettings.cellRenderer === "checkbox" && (
                          <Checkbox checked={true} />
                        )}
                        {componentSettings.cellRenderer === "date" && (
                          <div className="text-xs border rounded px-2 py-1 bg-background">01/15/2023</div>
                        )}
                        {componentSettings.cellRenderer === "dropdown" && (
                          <Select>
                            <SelectTrigger className="h-7 text-xs w-32">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              {componentSettings.dropdownOptions.length > 0 ? 
                                componentSettings.dropdownOptions.map((option, i) => (
                                  <SelectItem key={i} value={option}>{option}</SelectItem>
                                )) : 
                                <SelectItem value="sample">Sample Option</SelectItem>
                              }
                            </SelectContent>
                          </Select>
                        )}
                        {componentSettings.cellRenderer === "button" && (
                          <Button size="sm" className="h-7 text-xs">Action</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] border border-dashed rounded p-4">
                <Columns className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium">No Column Selected</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Select a column from the list on the left
                </p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="column-settings-dialog max-w-[900px] max-h-[min(700px,calc(100vh-40px))] h-auto p-0 gap-0 flex flex-col"
        onInteractOutside={(e) => {
          // Prevent closing on outside clicks if there are pending changes
          if (hasChanges) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex-none">
          <DialogHeader className="px-4 pt-3 pb-1 flex flex-row justify-between items-center">
            <DialogTitle className="text-sm font-medium flex items-center gap-1.5">
              <Columns className="h-4 w-4 text-primary" />
              Column Settings
            </DialogTitle>
          </DialogHeader>
          <Separator className="mb-0.5" />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-52 border-r h-full flex flex-col">
            <div className="p-1.5">
              <h3 className="font-medium px-1.5 py-1 text-xs">Columns</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderColumnList()}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs for each section */}
            <div className="border-b">
              <div className="px-2">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
                  <TabsList className="w-full justify-start h-8 p-0 bg-transparent border-b-0">
                    {sidebarItems.map((item) => (
                      <TabsTrigger 
                        key={item.id} 
                        value={item.id}
                        className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-3 h-full text-xs"
                      >
                        {item.icon}
                        <span className="hidden sm:inline">{item.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 p-3">
              {renderTabContent()}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-none py-1.5 px-3 border-t bg-muted/10">
          <div className="flex items-center gap-1 mr-auto">
            {hasChanges && (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                <Circle className="h-1.5 w-1.5 fill-amber-600" />
                Unsaved changes
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleClose(false)}
            className="h-6 text-xs mr-1.5"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={() => applyChanges()} 
            disabled={!hasChanges || !selectedColumn}
            className="h-6 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
