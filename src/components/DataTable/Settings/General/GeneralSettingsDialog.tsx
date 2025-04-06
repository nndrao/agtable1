import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { useGrid } from "../../hooks/useGridStore";

// Import settings tabs
import { AppearanceSettings } from "./Tabs/AppearanceSettingsNew";
import { BehaviorSettings } from "./Tabs/BehaviorSettingsNew";
import { RowSettings } from "./Tabs/RowSettings";
import { ColumnSettings } from "./Tabs/ColumnSettings";
import { PaginationSettings } from "./Tabs/PaginationSettings";
import { SelectionSettings } from "./Tabs/SelectionSettingsNew";
import { GroupingSettings } from "./Tabs/GroupingSettingsNew";
import { AccessoriesSettings } from "./Tabs/AccessoriesSettings";

interface GeneralSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneralSettingsDialog({ open, onOpenChange }: GeneralSettingsDialogProps) {
  const { gridOptions, setGridOptions } = useGrid();

  // State for reset confirmation dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

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
    }
  }, [open, gridOptions, form]);

  // Update formValues when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormValues(value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  const onSubmit = (data: any) => {
    console.log('Submitting form with data:', data);
    // Update the grid options in the store
    setGridOptions(data);
    onOpenChange(false);
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to the store value
    form.reset(gridOptions || {});
    onOpenChange(false);
  };

  // Handle reset to defaults
  const handleResetClick = () => {
    // Open confirmation dialog
    setResetDialogOpen(true);
  };

  // Handle confirmed reset
  const handleResetConfirm = () => {
    // Reset form to default values
    form.reset({});
    setFormValues({});
    setResetDialogOpen(false);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Grid Settings</DialogTitle>
          <DialogDescription>
            Customize the behavior and appearance of the grid. Changes will be applied when you save.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="appearance" className="flex-1 overflow-hidden">
              <TabsList className="grid grid-cols-8 mb-4">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="rows">Rows</TabsTrigger>
                <TabsTrigger value="columns">Columns</TabsTrigger>
                <TabsTrigger value="pagination">Pagination</TabsTrigger>
                <TabsTrigger value="selection">Selection</TabsTrigger>
                <TabsTrigger value="grouping">Grouping</TabsTrigger>
                <TabsTrigger value="accessories">Accessories</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 pr-4" style={{ height: "calc(70vh - 200px)" }}>
                <TabsContent value="appearance" className="mt-0">
                  <AppearanceSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>

                <TabsContent value="behavior" className="mt-0">
                  <BehaviorSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>

                <TabsContent value="rows" className="mt-0">
                  <RowSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>

                <TabsContent value="columns" className="mt-0">
                  <ColumnSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>

                <TabsContent value="pagination" className="mt-0">
                  <PaginationSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>

                <TabsContent value="selection" className="mt-0">
                  <SelectionSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>

                <TabsContent value="grouping" className="mt-0">
                  <GroupingSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>

                <TabsContent value="accessories" className="mt-0">
                  <AccessoriesSettings
                    options={formValues}
                    updateOptions={updateOptions}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="pt-4 flex justify-between">
              <div>
                <Button type="button" variant="destructive" onClick={handleResetClick}>
                  Reset to Defaults
                </Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Defaults</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all grid settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
