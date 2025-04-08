import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Palette,
  Sliders,
  LayoutGrid,
  Rows,
  FileText,
  MousePointer,
  Group,
  Package,
  X,
  Info,
  Edit,
  Search,
  Filter,
  ArrowDownWideNarrow,
  Database
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useGrid } from "../../hooks/useGridStore";
import { cn } from "@/lib/utils";
import "../settings-dialogs.css";

// Import settings tabs
import { AppearanceSettings } from "./Tabs/AppearanceSettings";
import { BehaviorSettings } from "./Tabs/BehaviorSettings";
import { RowSettings } from "./Tabs/RowSettings";
import { ColumnSettings } from "./Tabs/ColumnSettings";
import { PaginationSettings } from "./Tabs/PaginationSettings";
import { SelectionSettings } from "./Tabs/SelectionSettings";
import { GroupingSettings } from "./Tabs/GroupingSettings";
import { AccessoriesSettings } from "./Tabs/AccessoriesSettings";
import { EditingSettings } from "./Tabs/EditingSettings";
import { FilteringSettings } from "./Tabs/FilteringSettings";
import { SortingSettings } from "./Tabs/SortingSettings";

interface GeneralSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType =
  | "appearance"
  | "behavior"
  | "rows"
  | "columns"
  | "pagination"
  | "selection"
  | "grouping"
  | "accessories"
  | "editing"
  | "filtering"
  | "sorting";

interface SidebarItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  description?: string;
  category?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "appearance",
    label: "Appearance & Theme",
    icon: Palette,
    description: "Configure visual styling and themes",
    category: "Display"
  },
  {
    id: "behavior",
    label: "Behavior",
    icon: Sliders,
    description: "Configure grid behavior and interactions",
    category: "Display"
  },
  {
    id: "rows",
    label: "Rows",
    icon: Rows,
    description: "Configure row display and behavior",
    category: "Data"
  },
  {
    id: "columns",
    label: "Columns",
    icon: LayoutGrid,
    description: "Configure column display and behavior",
    category: "Data"
  },
  {
    id: "pagination",
    label: "Pagination",
    icon: FileText,
    description: "Configure pagination options",
    category: "Data"
  },
  {
    id: "selection",
    label: "Selection",
    icon: MousePointer,
    description: "Configure row and cell selection",
    category: "Interaction"
  },
  {
    id: "editing",
    label: "Editing",
    icon: Edit,
    description: "Configure cell editing behavior",
    category: "Interaction"
  },
  {
    id: "filtering",
    label: "Filtering",
    icon: Filter,
    description: "Configure filtering options",
    category: "Data"
  },
  {
    id: "sorting",
    label: "Sorting",
    icon: ArrowDownWideNarrow,
    description: "Configure sorting behavior",
    category: "Data"
  },
  {
    id: "grouping",
    label: "Grouping",
    icon: Group,
    description: "Configure row grouping options",
    category: "Data"
  },
  {
    id: "accessories",
    label: "Accessories",
    icon: Package,
    description: "Configure additional grid features",
    category: "Other"
  },
];

export function GeneralSettingsDialog({ open, onOpenChange }: GeneralSettingsDialogProps) {
  const { gridOptions, setGridOptions } = useGrid();
  const [activeTab, setActiveTab] = useState<TabType>("appearance");
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [undoStack, setUndoStack] = useState<Array<{path: string, value: any}>>([]);
  const [redoStack, setRedoStack] = useState<Array<{path: string, value: any}>>([]);

  // Group sidebar items by category
  const categories = sidebarItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  // Filter sidebar items based on search query
  const filteredSidebarItems = searchQuery
    ? sidebarItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Count changed fields by category
  const changedFieldsByCategory = sidebarItems.reduce((acc, item) => {
    if (Array.from(changedFields).some(field => field.startsWith(item.id))) {
      const category = item.category || "Other";
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Initialize form with current grid options
  const form = useForm({
    defaultValues: gridOptions || {}
  });

  // Create a state variable to track form values
  const [formValues, setFormValues] = useState(gridOptions || {});

  // Reset form when dialog opens or gridOptions change
  useEffect(() => {
    if (open) {
      form.reset(gridOptions || {});
      setFormValues(gridOptions || {});
      setHasChanges(false);
      setChangedFields(new Set());
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [open, gridOptions, form]);

  // Update formValues when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      setFormValues(value);

      if (name && type !== 'blur') {
        // Track changed fields
        setChangedFields(prev => {
          const newSet = new Set(prev);
          newSet.add(name);
          return newSet;
        });

        // Add to undo stack
        const oldValue = gridOptions ? form.getValues(name as any) : undefined;
        setUndoStack(prev => [...prev, { path: name, value: oldValue }]);
        // Clear redo stack on new changes
        setRedoStack([]);
      }

      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form, gridOptions]);

  // Handle form submission
  const onSubmit = (data: any) => {
    console.log('Submitting form with data:', data);
    // Update the grid options in the store
    setGridOptions(data);
    setHasChanges(false);
    onOpenChange(false);
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to the store value
    form.reset(gridOptions || {});
    onOpenChange(false);
  };

  // Handle reset to defaults
  const handleReset = () => {
    const defaultValues = {
      rowHeight: 25,
      headerHeight: 25,
      domLayout: "normal",
      // Remove invalid grid options
      // suppressCellBorders: false, // Not a valid AG-Grid option
      // suppressHeaderBorders: false, // Not a valid AG-Grid option
      suppressRowHoverHighlight: false,
      // enableCellChangeFlash: true, // Not a valid AG-Grid option
      // autoSizeAllColumns: false, // Not a valid AG-Grid option
      autoSizeStrategy: { type: 'fitCellContents' },
      animateRows: true,
    };

    form.reset(defaultValues);
    setFormValues(defaultValues);
    setChangedFields(new Set());
    setUndoStack([]);
    setRedoStack([]);
    setHasChanges(true);
  };

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));

      // Get current value for redo
      const currentValue = form.getValues(lastAction.path as any);
      setRedoStack(prev => [...prev, { path: lastAction.path, value: currentValue }]);

      // Restore previous value
      updateOptions(lastAction.path, lastAction.value, false);

      // Remove from changed fields if this was the only change for this field
      const remainingChangesForPath = undoStack.slice(0, -1).filter(action => action.path === lastAction.path);
      if (remainingChangesForPath.length === 0) {
        setChangedFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(lastAction.path);
          return newSet;
        });
      }

      // Check if we still have changes
      if (undoStack.length <= 1) {
        setHasChanges(false);
      }
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextAction = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));

      // Get current value for undo
      const currentValue = form.getValues(nextAction.path as any);
      setUndoStack(prev => [...prev, { path: nextAction.path, value: currentValue }]);

      // Apply redo value
      updateOptions(nextAction.path, nextAction.value, false);

      // Add to changed fields
      setChangedFields(prev => {
        const newSet = new Set(prev);
        newSet.add(nextAction.path);
        return newSet;
      });

      setHasChanges(true);
    }
  };

  // Update form values
  const updateOptions = (path: string, value: any, trackChange = true) => {
    // Split the path into parts (e.g., "pagination.pageSize" -> ["pagination", "pageSize"])
    const parts = path.split(".");

    if (parts.length === 1) {
      // Simple field
      form.setValue(path, value, { shouldDirty: true });

      if (trackChange) {
        // Track changed field
        setChangedFields(prev => {
          const newSet = new Set(prev);
          newSet.add(path);
          return newSet;
        });

        // Add to undo stack
        const oldValue = form.getValues(path as any);
        setUndoStack(prev => [...prev, { path, value: oldValue }]);
        // Clear redo stack on new changes
        setRedoStack([]);

        setHasChanges(true);
      }
    } else {
      // Nested field
      const fieldName = parts[0];
      const nestedPath = parts.slice(1).join(".");

      // Get current value
      const currentValue = form.getValues(fieldName) || {};

      // Create a deep copy to avoid mutating the previous state
      const newValue = JSON.parse(JSON.stringify(currentValue));

      // Navigate to the correct location in the object
      let current = newValue;
      for (let i = 1; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      // Set the value
      current[parts[parts.length - 1]] = value;

      // Update the form
      form.setValue(fieldName, newValue, { shouldDirty: true });

      if (trackChange) {
        // Track changed field
        setChangedFields(prev => {
          const newSet = new Set(prev);
          newSet.add(path);
          return newSet;
        });

        // Add to undo stack
        const oldValue = currentValue;
        setUndoStack(prev => [...prev, { path: fieldName, value: oldValue }]);
        // Clear redo stack on new changes
        setRedoStack([]);

        setHasChanges(true);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] p-0 gap-0 rounded-lg overflow-hidden general-settings-dialog">
        {/* The general-settings-dialog class is used to target and hide the default close button with CSS */}
        <div className="flex flex-col h-[80vh] max-h-[800px] min-h-[500px] bg-background">
          {/* Fixed Header */}
          <div className="flex items-center justify-between bg-muted/30 px-6 py-4 border-b z-10">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Grid Settings</span>
              {hasChanges && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  title="Undo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Redo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
                Reset to Defaults
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 border-r bg-muted/10 flex flex-col">
              {/* Search box */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search settings..."
                    className="pl-8 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Sidebar content */}
              <ScrollArea className="flex-1">
                {searchQuery ? (
                  // Show search results
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                      Search Results
                    </div>
                    {filteredSidebarItems.length > 0 ? (
                      filteredSidebarItems.map((item) => (
                        <TooltipProvider key={item.id}>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 w-full text-left transition-colors",
                                  activeTab === item.id
                                    ? "bg-primary/10 border-l-2 border-primary text-primary"
                                    : "border-l-2 border-transparent hover:bg-muted"
                                )}
                                onClick={() => {
                                  setActiveTab(item.id);
                                  setSearchQuery(""); // Clear search after selection
                                }}
                              >
                                <item.icon className={cn(
                                  "h-5 w-5",
                                  activeTab === item.id ? "text-primary" : "text-muted-foreground"
                                )} />
                                <div className="flex flex-1 items-center justify-between">
                                  <span className="text-sm">{item.label}</span>
                                  {Array.from(changedFields).some(field => field.startsWith(item.id)) && (
                                    <Badge variant="outline" className="h-5 ml-2 bg-primary/10 text-primary text-xs">
                                      <span className="sr-only">Changed</span>
                                      •
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              {item.description}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        No settings found
                      </div>
                    )}
                  </div>
                ) : (
                  // Show categorized sidebar items
                  <div className="py-2">
                    {Object.entries(categories).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <div className="px-4 py-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">{category}</span>
                          {(changedFieldsByCategory[category] || 0) > 0 && (
                            <Badge variant="outline" className="h-5 px-1 bg-primary/10 text-primary text-xs">
                              {changedFieldsByCategory[category] || 0}
                            </Badge>
                          )}
                        </div>
                        {items.map((item) => (
                          <TooltipProvider key={item.id}>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <button
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-3 w-full text-left transition-colors",
                                    activeTab === item.id
                                      ? "bg-primary/10 border-l-2 border-primary text-primary"
                                      : "border-l-2 border-transparent hover:bg-muted"
                                  )}
                                  onClick={() => setActiveTab(item.id)}
                                >
                                  <item.icon className={cn(
                                    "h-5 w-5",
                                    activeTab === item.id ? "text-primary" : "text-muted-foreground"
                                  )} />
                                  <div className="flex flex-1 items-center justify-between">
                                    <span className="text-sm">{item.label}</span>
                                    {Array.from(changedFields).some(field => field.startsWith(item.id)) && (
                                      <Badge variant="outline" className="h-5 ml-2 bg-primary/10 text-primary text-xs">
                                        <span className="sr-only">Changed</span>
                                        •
                                      </Badge>
                                    )}
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                {item.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

          {/* Content Area with Form */}
          <div className="flex-1 flex flex-col bg-background">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      {/* Tab title and description */}
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold">
                          {sidebarItems.find(item => item.id === activeTab)?.label}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {sidebarItems.find(item => item.id === activeTab)?.description}
                        </p>
                      </div>

                      {/* Tab content */}
                      {activeTab === "appearance" && (
                        <AppearanceSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "behavior" && (
                        <BehaviorSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "rows" && (
                        <RowSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "columns" && (
                        <ColumnSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "pagination" && (
                        <PaginationSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "selection" && (
                        <SelectionSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "grouping" && (
                        <GroupingSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "editing" && (
                        <EditingSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "accessories" && (
                        <AccessoriesSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "filtering" && (
                        <FilteringSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                      {activeTab === "sorting" && (
                        <SortingSettings
                          options={formValues}
                          updateOptions={updateOptions}
                        />
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Fixed Footer */}
                <div className="border-t bg-muted/30 px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Create a function to export settings
                        const settingsJson = JSON.stringify(formValues, null, 2);
                        const blob = new Blob([settingsJson], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'grid-settings.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Export Settings
                    </Button>
                    <label htmlFor="import-settings" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          document.getElementById('import-settings')?.click();
                        }}
                      >
                        Import Settings
                      </Button>
                      <input
                        id="import-settings"
                        type="file"
                        className="hidden"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const importedSettings = JSON.parse(event.target?.result as string);
                                form.reset(importedSettings);
                                setFormValues(importedSettings);
                                setChangedFields(new Set());
                                setUndoStack([]);
                                setRedoStack([]);
                                setHasChanges(true);
                                // Clear the file input so the same file can be imported again
                                e.target.value = '';
                              } catch (error) {
                                console.error('Error parsing settings file:', error);
                                // Clear the file input on error
                                e.target.value = '';
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!hasChanges}
                      size="sm"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
