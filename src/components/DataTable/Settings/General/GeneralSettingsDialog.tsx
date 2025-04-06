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
      suppressCellBorders: false,
      suppressHeaderBorders: false,
      suppressRowHoverHighlight: false,
      enableCellChangeFlash: true,
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
      <DialogContent className="max-w-[1000px] p-0 gap-0 bg-[#0f1623] text-white border-zinc-700 rounded-lg overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between bg-[#151d2c] px-4 py-3 border-b border-zinc-700 z-10">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <span className="text-lg font-semibold">Grid Settings</span>
          </div>
          <div className="flex items-center">
            <div className="flex space-x-1">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <button
              className="ml-4 p-1 hover:bg-zinc-700 rounded-sm transition-colors"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - No longer contains presets */}
          <div className="w-48 border-r border-zinc-700 bg-[#0f1623] overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 w-full text-left transition-colors",
                  activeTab === item.id
                    ? "bg-blue-500/10 border-l-2 border-blue-500 text-blue-400"
                    : "border-l-2 border-transparent hover:bg-zinc-800"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  activeTab === item.id ? "text-blue-400" : "text-zinc-400"
                )} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area with Form */}
          <div className="flex-1 flex flex-col">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[calc(600px-85px)]"> {/* Adjust height to account for header and footer */}
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
                <div className="border-t border-zinc-700 bg-[#151d2c] p-4 flex items-center justify-between z-10">
                  <div className="text-xs text-zinc-400">
                    {hasChanges && "Changes will be applied when you save"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="text-xs bg-transparent border-zinc-600 hover:bg-zinc-700 text-zinc-300"
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="text-xs bg-transparent border-zinc-600 hover:bg-zinc-700 text-zinc-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!hasChanges}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
