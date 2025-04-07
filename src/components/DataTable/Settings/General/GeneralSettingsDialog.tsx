import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Edit
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
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
  | "editing";

interface SidebarItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "behavior", label: "Behavior", icon: Sliders },
  { id: "rows", label: "Rows", icon: Rows },
  { id: "columns", label: "Columns", icon: LayoutGrid },
  { id: "pagination", label: "Pagination", icon: FileText },
  { id: "selection", label: "Selection", icon: MousePointer },
  { id: "editing", label: "Editing", icon: Edit },
  { id: "grouping", label: "Grouping", icon: Group },
  { id: "accessories", label: "Accessories", icon: Package },
];

export function GeneralSettingsDialog({ open, onOpenChange }: GeneralSettingsDialogProps) {
  const { gridOptions, setGridOptions } = useGrid();
  const [activeTab, setActiveTab] = useState<TabType>("appearance");
  const [hasChanges, setHasChanges] = useState(false);

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
    }
  }, [open, gridOptions, form]);

  // Update formValues when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormValues(value);
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
    setHasChanges(true);
  };

  // Update form values
  const updateOptions = (path: string, value: any) => {
    // Split the path into parts (e.g., "pagination.pageSize" -> ["pagination", "pageSize"])
    const parts = path.split(".");

    if (parts.length === 1) {
      // Simple field
      form.setValue(path, value);
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
      form.setValue(fieldName, newValue);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] p-0 gap-0 rounded-lg overflow-hidden general-settings-dialog">
        {/* The general-settings-dialog class is used to target and hide the default close button with CSS */}
        <div className="flex flex-col h-[650px] bg-background">
          {/* Fixed Header */}
          <div className="flex items-center justify-between bg-muted/30 px-6 py-4 border-b z-10">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Grid Settings</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/10 overflow-y-auto">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
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
                  <span className="text-sm">{item.label}</span>
                </button>
            ))}
          </div>

          {/* Content Area with Form */}
          <div className="flex-1 flex flex-col bg-background">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-6">
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
                    </div>
                  </ScrollArea>
                </div>

                {/* Fixed Footer */}
                <div className="border-t bg-muted/30 px-6 py-4 flex items-center justify-between z-10">
                  <div className="text-xs text-muted-foreground">
                    {hasChanges && "Changes will be applied when you save"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={!hasChanges}
                      size="sm"
                    >
                      Reset
                    </Button>
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
