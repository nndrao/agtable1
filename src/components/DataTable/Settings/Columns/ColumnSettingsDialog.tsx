import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { BorderStyleEditor } from "./BorderStyleEditor";
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
  const sidebarItems: SidebarItem[] = [
    { id: "header", label: "Header Settings" },
    { id: "cell", label: "Cell Formatting" },
    { id: "value", label: "Value Formatting" },
    { id: "component", label: "Component Config" },
  ];
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
            updatedColDef.valueFormatter = (params: any) => {
              if (params.value == null) return "";
              return new Intl.NumberFormat("en-US", {
                useGrouping: valueSettings.numberFormat.includes(","),
                minimumFractionDigits:
                  valueSettings.numberFormat.split(".")[1]?.length || 0,
                maximumFractionDigits:
                  valueSettings.numberFormat.split(".")[1]?.length || 0,
              }).format(params.value);
            };
          } else if (valueSettings.formatType === "currency") {
            updatedColDef.valueFormatter = (params: any) => {
              if (params.value == null) return "";
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                useGrouping: valueSettings.currencyFormat.includes(","),
                minimumFractionDigits:
                  valueSettings.currencyFormat.split(".")[1]?.length || 0,
                maximumFractionDigits:
                  valueSettings.currencyFormat.split(".")[1]?.length || 0,
              }).format(params.value);
            };
          } else if (valueSettings.formatType === "date") {
            updatedColDef.valueFormatter = (params: any) => {
              if (params.value == null) return "";
              const date = new Date(params.value);
              if (isNaN(date.getTime())) return params.value;
              return new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: valueSettings.dateFormat.includes("hh")
                  ? "2-digit"
                  : undefined,
                minute: valueSettings.dateFormat.includes("hh")
                  ? "2-digit"
                  : undefined,
              }).format(date);
            };
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
    setHasChanges,
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

    // *** FIX: Save the COMPLETE updated column definitions, not just the changed ones ***
    const columnDefsToSave = updatedColumnDefs;

    // REMOVED: Filtering logic and attempts to add back missing definitions
    /*
    // Filter column definitions to only include those that have been explicitly changed
    const columnDefsToSave = updatedColumnDefs.filter((colDef) => {
      const colId = colDef.colId || colDef.field;
      return changedColumnIds.includes(colId);
    });

    console.log("columnDefsToSave before processing:", columnDefsToSave);

    // Make sure we have complete column definitions for all changed columns
    changedColumnIds.forEach((colId) => {
      // Check if this column ID already has a definition in the filtered list
      const existingColDef = columnDefsToSave.find(
        (def) => def.colId === colId || def.field === colId,
      );

      if (!existingColDef) {
        // Find the original column definition from the full list
        const originalColDef = updatedColumnDefs.find(
          (def) => def.colId === colId || def.field === colId,
        );

        if (originalColDef) {
          console.log(`Adding missing column definition for ${colId}`);
          columnDefsToSave.push(originalColDef);
        } else {
          console.log(`WARNING: Could not find column definition for ${colId}`);
        }
      }
    });
    */

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
  }, [
    onOpenChange,
    setColumnState,
    setColumnDefs,
    updateColumnSettings, // Contains the logic to create updatedColumnDefs
    changedProperties,
    hasChanges,
    // No longer need selectedColumn, columnDefs, headerSettings, cellSettings here directly
    // as they are used within updateColumnSettings
  ]);

  // Reset all columns to default
  const resetColumns = useCallback(() => {
    if (gridRef.current?.api) {
      // Get the original column definitions
      const allColumns = gridRef.current.api.getColumnDefs();

      // Create a reset state with only the properties that are part of the column state
      // according to AG-Grid's ColumnStateParams interface
      const resetState = allColumns.map((col: any) => ({
        colId: col.field || col.colId,
        // Only include properties that are part of the column state
        hide: false,
        // Include width if it was defined in the original column definition
        width: col.width,
        // Reset any other state properties
        pinned: null,
        sort: null,
        sortIndex: null,
      }));

      console.log("Resetting column state to:", resetState);

      // Update local state
      setColumns(allColumns);

      // Mark all columns as having changed for simplicity
      allColumns.forEach((col) => {
        if (col.colId) {
          trackPropertyChange(col.colId, "header", "reset");
        }
      });

      // Save to store only - the DataTable component will apply the changes to the grid
      // This follows the same data flow pattern as the General Settings Dialog
      setColumnState(resetState);
    }
  }, [gridRef, setColumnState]);

  // Render the content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "header":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Header Settings</h3>
              {selectedColumn ? (
                <div className="text-sm font-medium text-primary">
                  Editing: {selectedColumn}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a column first
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Customize the header appearance for the selected column.
            </p>
            <Separator className="my-2" />

            {selectedColumn ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Header Text */}
                  <div className="space-y-2">
                    <Label htmlFor="header-text">Header Text</Label>
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
                    />
                  </div>

                  {/* Text Alignment */}
                  <div className="space-y-2">
                    <Label>Text Alignment</Label>
                    <RadioGroup
                      value={headerSettings.alignment}
                      onValueChange={(value) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          alignment: value,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "alignment",
                        );
                      }}
                      className="flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="left" id="align-left" />
                        <Label
                          htmlFor="align-left"
                          className="flex items-center"
                        >
                          <AlignLeft className="h-4 w-4 mr-1" /> Left
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="center" id="align-center" />
                        <Label
                          htmlFor="align-center"
                          className="flex items-center"
                        >
                          <AlignCenter className="h-4 w-4 mr-1" /> Center
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="right" id="align-right" />
                        <Label
                          htmlFor="align-right"
                          className="flex items-center"
                        >
                          <AlignRight className="h-4 w-4 mr-1" /> Right
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex">
                      <Input
                        id="text-color"
                        type="color"
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
                        className="w-12 p-1 h-9"
                      />
                      <Input
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
                        className="w-full ml-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex">
                      <Input
                        id="bg-color"
                        type="color"
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
                        className="w-12 p-1 h-9"
                      />
                      <Input
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
                        className="w-full ml-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Font Settings */}
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={headerSettings.fontFamily}
                    onValueChange={(value) => {
                      setHeaderSettings((prev) => ({
                        ...prev,
                        fontFamily: value,
                      }));
                      trackPropertyChange(
                        selectedColumn,
                        "header",
                        "fontFamily",
                      );
                    }}
                  >
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <div className="flex items-center">
                    <Input
                      id="font-size"
                      type="number"
                      min={8}
                      max={24}
                      value={headerSettings.fontSize}
                      onChange={(e) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          fontSize: parseInt(e.target.value) || 14,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "fontSize",
                        );
                      }}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-weight">Font Weight</Label>
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
                    <SelectTrigger id="font-weight">
                      <SelectValue placeholder="Weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Lighter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-style">Font Style</Label>
                  <Select
                    value={headerSettings.fontStyle}
                    onValueChange={(value) => {
                      setHeaderSettings((prev) => ({
                        ...prev,
                        fontStyle: value,
                      }));
                      trackPropertyChange(
                        selectedColumn,
                        "header",
                        "fontStyle",
                      );
                    }}
                  >
                    <SelectTrigger id="font-style">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="italic">Italic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Border Settings */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Border Settings
                  </Label>
                  <div className="space-y-3 pl-1">
                    <BorderStyleEditor
                      title="Top"
                      enabled={headerSettings.borderTop}
                      onEnabledChange={(enabled) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderTop: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderTop",
                        );
                      }}
                      width={headerSettings.borderTopWidth}
                      onWidthChange={(width) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderTopWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderTopWidth",
                        );
                      }}
                      style={headerSettings.borderTopStyle}
                      onStyleChange={(style) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderTopStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderTopStyle",
                        );
                      }}
                      color={headerSettings.borderTopColor}
                      onColorChange={(color) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderTopColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderTopColor",
                        );
                      }}
                    />

                    <BorderStyleEditor
                      title="Right"
                      enabled={headerSettings.borderRight}
                      onEnabledChange={(enabled) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderRight: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderRight",
                        );
                      }}
                      width={headerSettings.borderRightWidth}
                      onWidthChange={(width) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderRightWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderRightWidth",
                        );
                      }}
                      style={headerSettings.borderRightStyle}
                      onStyleChange={(style) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderRightStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderRightStyle",
                        );
                      }}
                      color={headerSettings.borderRightColor}
                      onColorChange={(color) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderRightColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderRightColor",
                        );
                      }}
                    />

                    <BorderStyleEditor
                      title="Bottom"
                      enabled={headerSettings.borderBottom}
                      onEnabledChange={(enabled) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderBottom: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderBottom",
                        );
                      }}
                      width={headerSettings.borderBottomWidth}
                      onWidthChange={(width) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderBottomWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderBottomWidth",
                        );
                      }}
                      style={headerSettings.borderBottomStyle}
                      onStyleChange={(style) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderBottomStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderBottomStyle",
                        );
                      }}
                      color={headerSettings.borderBottomColor}
                      onColorChange={(color) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderBottomColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderBottomColor",
                        );
                      }}
                    />

                    <BorderStyleEditor
                      title="Left"
                      enabled={headerSettings.borderLeft}
                      onEnabledChange={(enabled) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderLeft: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderLeft",
                        );
                      }}
                      width={headerSettings.borderLeftWidth}
                      onWidthChange={(width) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderLeftWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderLeftWidth",
                        );
                      }}
                      style={headerSettings.borderLeftStyle}
                      onStyleChange={(style) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderLeftStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderLeftStyle",
                        );
                      }}
                      color={headerSettings.borderLeftColor}
                      onColorChange={(color) => {
                        setHeaderSettings((prev) => ({
                          ...prev,
                          borderLeftColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "header",
                          "borderLeftColor",
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Preview - spans 2 columns */}
                <div className="space-y-2 col-span-2">
                  <Label>Preview</Label>
                  <div
                    className="border p-3 rounded-md"
                    style={{
                      color: headerSettings.textColor,
                      backgroundColor: headerSettings.backgroundColor,
                      fontFamily: headerSettings.fontFamily,
                      fontSize: `${headerSettings.fontSize}px`,
                      fontWeight: headerSettings.fontWeight,
                      fontStyle: headerSettings.fontStyle,
                      textAlign: headerSettings.alignment as any,
                      borderTop: headerSettings.borderTop
                        ? "1px solid #ccc"
                        : "none",
                      borderRight: headerSettings.borderRight
                        ? "1px solid #ccc"
                        : "none",
                      borderBottom: headerSettings.borderBottom
                        ? "1px solid #ccc"
                        : "none",
                      borderLeft: headerSettings.borderLeft
                        ? "1px solid #ccc"
                        : "none",
                    }}
                  >
                    {headerSettings.text || selectedColumn}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[400px] border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  Please select a column from the Available Columns tab
                </p>
              </div>
            )}
          </div>
        );

      case "cell":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Cell Formatting</h3>
              {selectedColumn ? (
                <div className="text-sm font-medium text-primary">
                  Editing: {selectedColumn}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a column first
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Configure cell appearance and formatting options.
            </p>
            <Separator className="my-2" />

            {selectedColumn ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Text Alignment */}
                  <div className="space-y-2">
                    <Label>Text Alignment</Label>
                    <RadioGroup
                      value={cellSettings.alignment}
                      onValueChange={(value) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          alignment: value,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "alignment",
                        );
                      }}
                      className="flex space-x-2"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="left" id="cell-align-left" />
                        <Label
                          htmlFor="cell-align-left"
                          className="flex items-center"
                        >
                          <AlignLeft className="h-4 w-4 mr-1" /> Left
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="center" id="cell-align-center" />
                        <Label
                          htmlFor="cell-align-center"
                          className="flex items-center"
                        >
                          <AlignCenter className="h-4 w-4 mr-1" /> Center
                        </Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="right" id="cell-align-right" />
                        <Label
                          htmlFor="cell-align-right"
                          className="flex items-center"
                        >
                          <AlignRight className="h-4 w-4 mr-1" /> Right
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label htmlFor="cell-text-color">Text Color</Label>
                    <div className="flex">
                      <Input
                        id="cell-text-color"
                        type="color"
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
                        className="w-12 p-1 h-9"
                      />
                      <Input
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
                        className="w-full ml-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cell-bg-color">Background Color</Label>
                      <div className="flex">
                        <Input
                          id="cell-bg-color"
                          type="color"
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
                          className="w-12 p-1 h-9"
                        />
                        <Input
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
                          className="w-full ml-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Settings */}
                  <div className="space-y-2">
                    <Label htmlFor="cell-font-family">Font Family</Label>
                    <Select
                      value={cellSettings.fontFamily}
                      onValueChange={(value) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          fontFamily: value,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "fontFamily",
                        );
                      }}
                    >
                      <SelectTrigger id="cell-font-family">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">
                          Times New Roman
                        </SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cell-font-size">Font Size</Label>
                    <div className="flex items-center">
                      <Input
                        id="cell-font-size"
                        type="number"
                        min={8}
                        max={24}
                        value={cellSettings.fontSize}
                        onChange={(e) => {
                          setCellSettings((prev) => ({
                            ...prev,
                            fontSize: parseInt(e.target.value) || 14,
                          }));
                          trackPropertyChange(
                            selectedColumn,
                            "cell",
                            "fontSize",
                          );
                        }}
                        className="w-full"
                      />
                      <span className="ml-2 text-sm">px</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cell-font-weight">Font Weight</Label>
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
                      <SelectTrigger id="cell-font-weight">
                        <SelectValue placeholder="Weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="lighter">Lighter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cell-font-style">Font Style</Label>
                    <Select
                      value={cellSettings.fontStyle}
                      onValueChange={(value) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          fontStyle: value,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "fontStyle",
                        );
                      }}
                    >
                      <SelectTrigger id="cell-font-style">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="italic">Italic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Border Settings - Top */}
                  <div className="space-y-2">
                    <BorderStyleEditor
                      title="Top"
                      enabled={cellSettings.borderTop}
                      onEnabledChange={(enabled) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderTop: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderTop",
                        );
                      }}
                      width={cellSettings.borderTopWidth}
                      onWidthChange={(width) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderTopWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderTopWidth",
                        );
                      }}
                      style={cellSettings.borderTopStyle}
                      onStyleChange={(style) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderTopStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderTopStyle",
                        );
                      }}
                      color={cellSettings.borderTopColor}
                      onColorChange={(color) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderTopColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderTopColor",
                        );
                      }}
                    />
                  </div>

                  {/* Border Right */}
                  <div className="space-y-2">
                    <BorderStyleEditor
                      title="Right"
                      enabled={cellSettings.borderRight}
                      onEnabledChange={(enabled) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderRight: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderRight",
                        );
                      }}
                      width={cellSettings.borderRightWidth}
                      onWidthChange={(width) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderRightWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderRightWidth",
                        );
                      }}
                      style={cellSettings.borderRightStyle}
                      onStyleChange={(style) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderRightStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderRightStyle",
                        );
                      }}
                      color={cellSettings.borderRightColor}
                      onColorChange={(color) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderRightColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderRightColor",
                        );
                      }}
                    />
                  </div>

                  {/* Border Bottom */}
                  <div className="space-y-2">
                    <BorderStyleEditor
                      title="Bottom"
                      enabled={cellSettings.borderBottom}
                      onEnabledChange={(enabled) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderBottom: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderBottom",
                        );
                      }}
                      width={cellSettings.borderBottomWidth}
                      onWidthChange={(width) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderBottomWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderBottomWidth",
                        );
                      }}
                      style={cellSettings.borderBottomStyle}
                      onStyleChange={(style) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderBottomStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderBottomStyle",
                        );
                      }}
                      color={cellSettings.borderBottomColor}
                      onColorChange={(color) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderBottomColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderBottomColor",
                        );
                      }}
                    />
                  </div>

                  {/* Border Left */}
                  <div className="space-y-2">
                    <BorderStyleEditor
                      title="Left"
                      enabled={cellSettings.borderLeft}
                      onEnabledChange={(enabled) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderLeft: enabled,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderLeft",
                        );
                      }}
                      width={cellSettings.borderLeftWidth}
                      onWidthChange={(width) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderLeftWidth: width,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderLeftWidth",
                        );
                      }}
                      style={cellSettings.borderLeftStyle}
                      onStyleChange={(style) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderLeftStyle: style,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderLeftStyle",
                        );
                      }}
                      color={cellSettings.borderLeftColor}
                      onColorChange={(color) => {
                        setCellSettings((prev) => ({
                          ...prev,
                          borderLeftColor: color,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "cell",
                          "borderLeftColor",
                        );
                      }}
                    />
                  </div>

                  {/* Conditional Formatting Section */}
                  <div className="space-y-2">
                    <Label>Conditional Formatting</Label>
                    <p className="text-xs text-muted-foreground">
                      Apply styles based on cell values. This feature will be
                      implemented in a future update.
                    </p>
                    <Button variant="outline" disabled className="w-full">
                      Add Conditional Format Rule
                    </Button>
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div
                      className="border p-3 rounded-md"
                      style={{
                        color: cellSettings.textColor,
                        backgroundColor: cellSettings.backgroundColor,
                        fontFamily: cellSettings.fontFamily,
                        fontSize: `${cellSettings.fontSize}px`,
                        fontWeight: cellSettings.fontWeight,
                        fontStyle: cellSettings.fontStyle,
                        textAlign: cellSettings.alignment as any,
                        borderTop: cellSettings.borderTop
                          ? "1px solid #ccc"
                          : "none",
                        borderRight: cellSettings.borderRight
                          ? "1px solid #ccc"
                          : "none",
                        borderBottom: cellSettings.borderBottom
                          ? "1px solid #ccc"
                          : "none",
                        borderLeft: cellSettings.borderLeft
                          ? "1px solid #ccc"
                          : "none",
                      }}
                    >
                      Sample Cell Value
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[400px] border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  Please select a column from the Available Columns tab
                </p>
              </div>
            )}
          </div>
        );

      case "value":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Value Formatting</h3>
              {selectedColumn ? (
                <div className="text-sm font-medium text-primary">
                  Editing: {selectedColumn}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a column first
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Set up how values are displayed in the grid.
            </p>
            <Separator className="my-2" />

            {selectedColumn ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Format Type */}
                  <div className="space-y-2">
                    <Label htmlFor="format-type">Format Type</Label>
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
                      <SelectTrigger id="format-type">
                        <SelectValue placeholder="Select format type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="date">Date/Time</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format Options based on type */}
                  {valueSettings.formatType === "number" && (
                    <div className="space-y-2">
                      <Label htmlFor="number-format">Number Format</Label>
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
                        <SelectTrigger id="number-format">
                          <SelectValue placeholder="Select number format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1000</SelectItem>
                          <SelectItem value="1,000">1,000</SelectItem>
                          <SelectItem value="1000.00">1000.00</SelectItem>
                          <SelectItem value="1,000.00">1,000.00</SelectItem>
                          <SelectItem value="1,000.000">1,000.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {valueSettings.formatType === "currency" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency-symbol">Currency Symbol</Label>
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
                          <SelectTrigger id="currency-symbol">
                            <SelectValue placeholder="Select currency symbol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="$">$ (Dollar)</SelectItem>
                            <SelectItem value="€">€ (Euro)</SelectItem>
                            <SelectItem value="£">£ (Pound)</SelectItem>
                            <SelectItem value="¥">¥ (Yen)</SelectItem>
                            <SelectItem value="₹">₹ (Rupee)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency-format">Currency Format</Label>
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
                          <SelectTrigger id="currency-format">
                            <SelectValue placeholder="Select currency format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="$1000">$1000</SelectItem>
                            <SelectItem value="$1,000">$1,000</SelectItem>
                            <SelectItem value="$1000.00">$1000.00</SelectItem>
                            <SelectItem value="$1,000.00">$1,000.00</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {valueSettings.formatType === "percent" && (
                    <div className="space-y-2">
                      <Label htmlFor="percent-format">Percent Format</Label>
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
                        <SelectTrigger id="percent-format">
                          <SelectValue placeholder="Select percent format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0%">0%</SelectItem>
                          <SelectItem value="0.0%">0.0%</SelectItem>
                          <SelectItem value="0.00%">0.00%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {valueSettings.formatType === "date" && (
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
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
                        <SelectTrigger id="date-format">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="MM/DD/YYYY hh:mm">
                            MM/DD/YYYY hh:mm
                          </SelectItem>
                          <SelectItem value="DD/MM/YYYY hh:mm">
                            DD/MM/YYYY hh:mm
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {valueSettings.formatType === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-format">Custom Format</Label>
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
                        placeholder="Enter custom format pattern"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use # for digits, 0 for zero-padded digits, $ for
                        currency symbols, etc.
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border p-3 rounded-md">
                      {valueSettings.formatType === "text" && "Sample Text"}
                      {valueSettings.formatType === "number" &&
                        valueSettings.numberFormat.replace(/[0-9]/g, "1")}
                      {valueSettings.formatType === "currency" &&
                        valueSettings.currencyFormat.replace(/[0-9]/g, "1")}
                      {valueSettings.formatType === "percent" &&
                        valueSettings.numberFormat.replace(/[0-9]/g, "7")}
                      {valueSettings.formatType === "date" &&
                        valueSettings.dateFormat.replace(/[MDY]/g, (m) =>
                          m === "M" ? "01" : m === "D" ? "15" : "2023",
                        )}
                      {valueSettings.formatType === "custom" &&
                        (valueSettings.customFormat || "Enter a custom format")}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[400px] border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  Please select a column from the Available Columns tab
                </p>
              </div>
            )}
          </div>
        );

      case "component":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Component Configuration</h3>
              {selectedColumn ? (
                <div className="text-sm font-medium text-primary">
                  Editing: {selectedColumn}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a column first
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Configure cell renderers, editors, and filters.
            </p>
            <Separator className="my-2" />

            {selectedColumn ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Cell Renderer */}
                  <div className="space-y-2">
                    <Label htmlFor="cell-renderer">Cell Renderer</Label>
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
                      <SelectTrigger id="cell-renderer">
                        <SelectValue placeholder="Select cell renderer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="date">Date Picker</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="button">Button</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Editable */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editable"
                      checked={componentSettings.editable}
                      onChange={(e) => {
                        setComponentSettings((prev) => ({
                          ...prev,
                          editable: e.target.checked,
                        }));
                        trackPropertyChange(
                          selectedColumn,
                          "component",
                          "editable",
                        );
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="editable">Allow Editing</Label>
                  </div>

                  {/* Dropdown Options (if dropdown renderer) */}
                  {componentSettings.cellRenderer === "dropdown" && (
                    <div className="space-y-2">
                      <Label>Dropdown Options</Label>
                      <div className="border rounded-md p-4 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Enter options for the dropdown, one per line
                        </p>
                        <textarea
                          className="w-full h-24 p-2 border rounded-md"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          value={componentSettings.dropdownOptions.join("\n")}
                          onChange={(e) => {
                            const options = e.target.value
                              .split("\n")
                              .filter(Boolean);
                            setComponentSettings((prev) => ({
                              ...prev,
                              dropdownOptions: options,
                            }));
                            trackPropertyChange(
                              selectedColumn,
                              "component",
                              "dropdownOptions",
                            );
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Filter Configuration */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="filter-type">Filter Type</Label>
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
                        <SelectTrigger id="filter-type">
                          <SelectValue placeholder="Select filter type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {componentSettings.filterType === "set" && (
                      <div className="space-y-2">
                        <Label>Filter Options</Label>
                        <div className="border rounded-md p-4 space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Enter filter options, one per line
                          </p>
                          <textarea
                            className="w-full h-24 p-2 border rounded-md"
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            value={componentSettings.filterOptions.join("\n")}
                            onChange={(e) => {
                              const options = e.target.value
                                .split("\n")
                                .filter(Boolean);
                              setComponentSettings((prev) => ({
                                ...prev,
                                filterOptions: options,
                              }));
                              trackPropertyChange(
                                selectedColumn,
                                "component",
                                "filterOptions",
                              );
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border p-4 rounded-md">
                      {componentSettings.cellRenderer === "text" && (
                        <div>Text Cell: Sample Value</div>
                      )}
                      {componentSettings.cellRenderer === "checkbox" && (
                        <div className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 mr-2" />
                          <span>Checkbox Cell</span>
                        </div>
                      )}
                      {componentSettings.cellRenderer === "date" && (
                        <div>Date Cell: 01/15/2023</div>
                      )}
                      {componentSettings.cellRenderer === "dropdown" && (
                        <div>
                          <select className="p-1 border rounded-md w-full">
                            {componentSettings.dropdownOptions.length > 0 ? (
                              componentSettings.dropdownOptions.map(
                                (option, index) => (
                                  <option key={index}>{option}</option>
                                ),
                              )
                            ) : (
                              <option>Dropdown Options</option>
                            )}
                          </select>
                        </div>
                      )}
                      {componentSettings.cellRenderer === "button" && (
                        <Button size="sm" variant="outline">
                          Action
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[400px] border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  Please select a column from the Available Columns tab
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
      <DialogContent className="max-w-[1000px] p-0 gap-0 rounded-lg overflow-hidden" hideCloseButton>
        <DialogHeader className="sr-only">
          <DialogTitle>Column Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[650px]">
          {/* Header with close button */}
          <div className="border-b px-6 py-4 flex justify-between items-center bg-background">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <Columns className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  Column Settings
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customize column appearance and behavior
                </p>
              </div>
              {selectedColumn && (
                <p className="text-sm text-muted-foreground ml-3">
                  Editing:{" "}
                  <span className="font-medium text-accent">
                    {selectedColumn}
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClose(false)}
              className="h-8 w-8 rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar with columns list */}
            <div className="w-64 border-r flex flex-col bg-muted/5">
              {/* Search input */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium mb-2">
                  Available Columns
                </h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Columns list */}
              <ScrollArea className="flex-1 py-2">
                <div className="px-2 space-y-0.5">
                  {columns
                    .filter((col) =>
                      col.colId
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((column) => (
                      <button
                        key={column.colId}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-left transition-colors",
                          selectedColumn === column.colId
                            ? "bg-accent/80 text-accent-foreground font-medium"
                            : "text-foreground hover:bg-muted",
                        )}
                        onClick={() => {
                          // Set the selected column
                          setSelectedColumn(column.colId);

                          // Load current settings for this column
                          const col = columns.find(
                            (c) => c.colId === column.colId,
                          );
                          if (col) {
                            // Find the matching column definition for more details
                            const colDef = columnDefs.find(
                              (def) =>
                                def.field === column.colId ||
                                def.colId === column.colId,
                            );

                            console.log(
                              "Found column definition for selection:",
                              colDef,
                            );

                            // Update header settings
                            const headerText =
                              colDef?.headerName || col.headerName || col.colId;
                            console.log(
                              `Setting header text to: ${headerText} for column ${column.colId}`,
                            );

                            // Create a complete set of header settings from the saved column definition
                            const newHeaderSettings = {
                              // Start with defaults
                              ...headerSettings,
                              // Update with the settings from the column definition
                              text: headerText,
                            };

                            // Apply header alignment if it exists
                            if (colDef?.headerStyle?.justifyContent) {
                              if (
                                colDef.headerStyle.justifyContent === "center"
                              ) {
                                newHeaderSettings.alignment = "center";
                              } else if (
                                colDef.headerStyle.justifyContent === "flex-end"
                              ) {
                                newHeaderSettings.alignment = "right";
                              } else {
                                newHeaderSettings.alignment = "left";
                              }
                              console.log(
                                `Setting header alignment to: ${newHeaderSettings.alignment}`,
                              );
                            } else if (colDef?.headerClass) {
                              // Check for alignment in the header class
                              if (colDef.headerClass.includes("center")) {
                                newHeaderSettings.alignment = "center";
                              } else if (colDef.headerClass.includes("right")) {
                                newHeaderSettings.alignment = "right";
                              } else {
                                newHeaderSettings.alignment = "left";
                              }
                              console.log(
                                `Setting header alignment from class to: ${newHeaderSettings.alignment}`,
                              );
                            }

                            // Apply other header styles if they exist
                            if (colDef?.headerStyle) {
                              if (colDef.headerStyle.color)
                                newHeaderSettings.textColor =
                                  colDef.headerStyle.color;
                              if (colDef.headerStyle.backgroundColor)
                                newHeaderSettings.backgroundColor =
                                  colDef.headerStyle.backgroundColor;
                              if (colDef.headerStyle.fontFamily)
                                newHeaderSettings.fontFamily =
                                  colDef.headerStyle.fontFamily;
                              if (colDef.headerStyle.fontSize) {
                                // Extract the number from fontSize (e.g., "14px" -> 14)
                                const fontSizeMatch =
                                  colDef.headerStyle.fontSize.match(/(\d+)/);
                                if (fontSizeMatch) {
                                  newHeaderSettings.fontSize = parseInt(
                                    fontSizeMatch[1],
                                  );
                                }
                              }
                              if (colDef.headerStyle.fontWeight)
                                newHeaderSettings.fontWeight =
                                  colDef.headerStyle.fontWeight;
                              if (colDef.headerStyle.fontStyle)
                                newHeaderSettings.fontStyle =
                                  colDef.headerStyle.fontStyle;

                              // Header Border styles
                              // Border top
                              if (colDef.headerStyle.borderTop) {
                                if (colDef.headerStyle.borderTop !== "none") {
                                  newHeaderSettings.borderTop = true;
                                  // Parse the border string (e.g. "1px solid #cccccc")
                                  const borderMatch =
                                    colDef.headerStyle.borderTop.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newHeaderSettings.borderTopWidth = parseInt(
                                      borderMatch[1],
                                    );
                                    newHeaderSettings.borderTopStyle =
                                      borderMatch[2];
                                    newHeaderSettings.borderTopColor =
                                      borderMatch[3];
                                  }
                                } else {
                                  newHeaderSettings.borderTop = false;
                                }
                              }

                              // Border right
                              if (colDef.headerStyle.borderRight) {
                                if (colDef.headerStyle.borderRight !== "none") {
                                  newHeaderSettings.borderRight = true;
                                  const borderMatch =
                                    colDef.headerStyle.borderRight.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newHeaderSettings.borderRightWidth =
                                      parseInt(borderMatch[1]);
                                    newHeaderSettings.borderRightStyle =
                                      borderMatch[2];
                                    newHeaderSettings.borderRightColor =
                                      borderMatch[3];
                                  }
                                } else {
                                  newHeaderSettings.borderRight = false;
                                }
                              }

                              // Border bottom
                              if (colDef.headerStyle.borderBottom) {
                                if (
                                  colDef.headerStyle.borderBottom !== "none"
                                ) {
                                  newHeaderSettings.borderBottom = true;
                                  const borderMatch =
                                    colDef.headerStyle.borderBottom.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newHeaderSettings.borderBottomWidth =
                                      parseInt(borderMatch[1]);
                                    newHeaderSettings.borderBottomStyle =
                                      borderMatch[2];
                                    newHeaderSettings.borderBottomColor =
                                      borderMatch[3];
                                  }
                                } else {
                                  newHeaderSettings.borderBottom = false;
                                }
                              }

                              // Border left
                              if (colDef.headerStyle.borderLeft) {
                                if (colDef.headerStyle.borderLeft !== "none") {
                                  newHeaderSettings.borderLeft = true;
                                  const borderMatch =
                                    colDef.headerStyle.borderLeft.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newHeaderSettings.borderLeftWidth =
                                      parseInt(borderMatch[1]);
                                    newHeaderSettings.borderLeftStyle =
                                      borderMatch[2];
                                    newHeaderSettings.borderLeftColor =
                                      borderMatch[3];
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
                                newCellSettings.alignment =
                                  colDef.cellStyle.textAlign;
                                console.log(
                                  `Setting cell alignment to: ${newCellSettings.alignment}`,
                                );
                              }

                              // Other cell styles
                              if (colDef.cellStyle.color)
                                newCellSettings.textColor =
                                  colDef.cellStyle.color;
                              if (colDef.cellStyle.backgroundColor)
                                newCellSettings.backgroundColor =
                                  colDef.cellStyle.backgroundColor;
                              if (colDef.cellStyle.fontFamily)
                                newCellSettings.fontFamily =
                                  colDef.cellStyle.fontFamily;
                              if (colDef.cellStyle.fontSize) {
                                // Extract the number from fontSize (e.g., "14px" -> 14)
                                const fontSizeMatch =
                                  colDef.cellStyle.fontSize.match(/(\d+)/);
                                if (fontSizeMatch) {
                                  newCellSettings.fontSize = parseInt(
                                    fontSizeMatch[1],
                                  );
                                }
                              }
                              if (colDef.cellStyle.fontWeight)
                                newCellSettings.fontWeight =
                                  colDef.cellStyle.fontWeight;
                              if (colDef.cellStyle.fontStyle)
                                newCellSettings.fontStyle =
                                  colDef.cellStyle.fontStyle;

                              // Border styles
                              // Border top
                              if (colDef.cellStyle.borderTop) {
                                if (colDef.cellStyle.borderTop !== "none") {
                                  newCellSettings.borderTop = true;
                                  // Parse the border string (e.g. "1px solid #cccccc")
                                  const borderMatch =
                                    colDef.cellStyle.borderTop.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newCellSettings.borderTopWidth = parseInt(
                                      borderMatch[1],
                                    );
                                    newCellSettings.borderTopStyle =
                                      borderMatch[2];
                                    newCellSettings.borderTopColor =
                                      borderMatch[3];
                                  }
                                }
                              }

                              // Border right
                              if (colDef.cellStyle.borderRight) {
                                if (colDef.cellStyle.borderRight !== "none") {
                                  newCellSettings.borderRight = true;
                                  const borderMatch =
                                    colDef.cellStyle.borderRight.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newCellSettings.borderRightWidth = parseInt(
                                      borderMatch[1],
                                    );
                                    newCellSettings.borderRightStyle =
                                      borderMatch[2];
                                    newCellSettings.borderRightColor =
                                      borderMatch[3];
                                  }
                                }
                              }

                              // Border bottom
                              if (colDef.cellStyle.borderBottom) {
                                if (colDef.cellStyle.borderBottom !== "none") {
                                  newCellSettings.borderBottom = true;
                                  const borderMatch =
                                    colDef.cellStyle.borderBottom.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newCellSettings.borderBottomWidth =
                                      parseInt(borderMatch[1]);
                                    newCellSettings.borderBottomStyle =
                                      borderMatch[2];
                                    newCellSettings.borderBottomColor =
                                      borderMatch[3];
                                  }
                                }
                              }

                              // Border left
                              if (colDef.cellStyle.borderLeft) {
                                if (colDef.cellStyle.borderLeft !== "none") {
                                  newCellSettings.borderLeft = true;
                                  const borderMatch =
                                    colDef.cellStyle.borderLeft.match(
                                      /(\d+)px\s+(\w+)\s+(#\w+)/,
                                    );
                                  if (borderMatch) {
                                    newCellSettings.borderLeftWidth = parseInt(
                                      borderMatch[1],
                                    );
                                    newCellSettings.borderLeftStyle =
                                      borderMatch[2];
                                    newCellSettings.borderLeftColor =
                                      borderMatch[3];
                                  }
                                }
                              }
                            }

                            // Update cell settings state
                            setCellSettings(newCellSettings);

                            // Update component settings
                            const newComponentSettings = {
                              ...componentSettings,
                              cellRenderer:
                                colDef?.cellRenderer ||
                                col.cellRenderer ||
                                "text",
                              editable: colDef?.editable !== false, // Default to true if not specified
                            };

                            if (colDef?.filter) {
                              newComponentSettings.filterType =
                                typeof colDef.filter === "string"
                                  ? colDef.filter
                                      .replace("ag", "")
                                      .replace("ColumnFilter", "")
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
                              const formatterStr =
                                colDef.valueFormatter.toString();

                              // Check for currency formatter
                              if (
                                formatterStr.includes("style: 'currency'") ||
                                formatterStr.includes("currency:") ||
                                formatterStr.includes("$") ||
                                (colDef.field || "")
                                  .toLowerCase()
                                  .includes("price") ||
                                (colDef.field || "")
                                  .toLowerCase()
                                  .includes("cost")
                              ) {
                                formatterType = "currency";
                                newValueSettings.formatType = "currency";

                                // Try to determine currency symbol
                                if (formatterStr.includes("currency: 'USD'")) {
                                  newValueSettings.currencySymbol = "$";
                                } else if (
                                  formatterStr.includes("currency: 'EUR'")
                                ) {
                                  newValueSettings.currencySymbol = "€";
                                } else if (
                                  formatterStr.includes("currency: 'GBP'")
                                ) {
                                  newValueSettings.currencySymbol = "£";
                                }

                                // Try to determine format
                                if (
                                  formatterStr.includes(
                                    "minimumFractionDigits: 0",
                                  )
                                ) {
                                  newValueSettings.currencyFormat = "$1,000";
                                } else if (
                                  formatterStr.includes(
                                    "minimumFractionDigits: 2",
                                  )
                                ) {
                                  newValueSettings.currencyFormat = "$1,000.00";
                                }
                              }
                              // Check for number formatter
                              else if (
                                formatterStr.includes("NumberFormat") ||
                                formatterStr.includes(
                                  "minimumFractionDigits",
                                ) ||
                                formatterStr.includes("maximumFractionDigits")
                              ) {
                                formatterType = "number";
                                newValueSettings.formatType = "number";

                                // Try to determine format
                                if (
                                  formatterStr.includes("useGrouping: true") ||
                                  formatterStr.includes(
                                    "useGrouping: undefined",
                                  )
                                ) {
                                  if (
                                    formatterStr.includes(
                                      "minimumFractionDigits: 0",
                                    ) &&
                                    formatterStr.includes(
                                      "maximumFractionDigits: 0",
                                    )
                                  ) {
                                    newValueSettings.numberFormat = "1,000";
                                  } else if (
                                    formatterStr.includes(
                                      "minimumFractionDigits: 2",
                                    ) &&
                                    formatterStr.includes(
                                      "maximumFractionDigits: 2",
                                    )
                                  ) {
                                    newValueSettings.numberFormat = "1,000.00";
                                  }
                                } else {
                                  if (
                                    formatterStr.includes(
                                      "minimumFractionDigits: 0",
                                    ) &&
                                    formatterStr.includes(
                                      "maximumFractionDigits: 0",
                                    )
                                  ) {
                                    newValueSettings.numberFormat = "1000";
                                  } else if (
                                    formatterStr.includes(
                                      "minimumFractionDigits: 2",
                                    ) &&
                                    formatterStr.includes(
                                      "maximumFractionDigits: 2",
                                    )
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
                                  newValueSettings.dateFormat =
                                    "MM/DD/YYYY hh:mm";
                                } else {
                                  newValueSettings.dateFormat = "MM/DD/YYYY";
                                }
                              }

                              console.log(
                                `Detected value formatter type: ${formatterType}`,
                              );
                            }

                            // Update the value settings state
                            setValueSettings(newValueSettings);

                            setComponentSettings(newComponentSettings);

                            // Reset changed properties for this column
                            setChangedProperties((prev) => {
                              const newChangedProps = { ...prev };
                              // Remove any existing changes for this column
                              delete newChangedProps[column.colId];
                              return newChangedProps;
                            });

                            // Reset the hasChanges flag if there are no other changes
                            setTimeout(() => {
                              const hasOtherChanges =
                                Object.keys(changedProperties).length > 0;
                              if (!hasOtherChanges) {
                                setHasChanges(false);
                              }
                            }, 0);
                          }
                        }}
                      >
                        <span className="truncate">{column.colId}</span>
                        {selectedColumn === column.colId && (
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center ml-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  {columns.filter((col) =>
                    col.colId.toLowerCase().includes(searchTerm.toLowerCase()),
                  ).length === 0 && (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No columns found
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col bg-background">
              {/* Horizontal tabs */}
              {selectedColumn && (
                <div className="px-6 pt-4 pb-0 border-b">
                  <div className="flex space-x-2">
                    {sidebarItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            isActive
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                          )}
                          onClick={() => setActiveTab(item.id)}
                          disabled={!selectedColumn}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                <div className="p-6 h-full overflow-auto">
                  {selectedColumn ? (
                    renderTabContent()
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-muted-foreground">
                        <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                          <Columns className="h-10 w-10 text-muted-foreground/60" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">
                          No Column Selected
                        </h3>
                        <p className="max-w-md mt-2 text-muted-foreground">
                          Please select a column from the sidebar to configure
                          its settings.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {hasChanges && "Changes will be applied when you save"}
                </div>
                <div className="flex gap-2">
                  {/* Debug button removed */}
                  <Button
                    variant="outline"
                    onClick={resetColumns}
                    disabled={!hasChanges}
                    size="sm"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleClose(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={applyChanges}
                    disabled={!hasChanges}
                    size="sm"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
