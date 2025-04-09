import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, XCircle, Save, Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useGrid } from "../../hooks/useGridStore";
import {
  PropertyGrid,
  gridCategories,
  gridOptionsToProperties,
  updateGridOptionsFromProperty
} from "./PropertyGrid";
import "../settings-dialogs.css";

interface PropertyGridDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyGridDialog({ open, onOpenChange }: PropertyGridDialogProps) {
  const { gridOptions, setGridOptions } = useGrid();
  const [changedProperties, setChangedProperties] = useState<Set<string>>(new Set());
  const [undoStack, setUndoStack] = useState<Array<{path: string, value: any}>>([]);
  const [redoStack, setRedoStack] = useState<Array<{path: string, value: any}>>([]);

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
      setChangedProperties(new Set());
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [open, gridOptions, form]);

  // Handle property change
  const handlePropertyChange = (path: string, value: any) => {
    // Update form values
    const newValues = updateGridOptionsFromProperty(formValues, path, value);
    setFormValues(newValues);

    // Track changed properties
    setChangedProperties(prev => {
      const newSet = new Set(prev);
      newSet.add(path);
      return newSet;
    });

    // Add to undo stack
    const oldValue = gridOptions ? form.getValues(path as any) : undefined;
    setUndoStack(prev => [...prev, { path, value: oldValue }]);

    // Clear redo stack on new changes
    setRedoStack([]);
  };

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));

      // Get current value for redo
      const currentValue = formValues[lastAction.path];
      setRedoStack(prev => [...prev, { path: lastAction.path, value: currentValue }]);

      // Restore previous value
      const newValues = updateGridOptionsFromProperty(formValues, lastAction.path, lastAction.value);
      setFormValues(newValues);

      // Remove from changed properties if this was the only change for this path
      const remainingChangesForPath = undoStack.slice(0, -1).filter(action => action.path === lastAction.path);
      if (remainingChangesForPath.length === 0) {
        setChangedProperties(prev => {
          const newSet = new Set(prev);
          newSet.delete(lastAction.path);
          return newSet;
        });
      }
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextAction = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));

      // Get current value for undo
      const currentValue = formValues[nextAction.path];
      setUndoStack(prev => [...prev, { path: nextAction.path, value: currentValue }]);

      // Apply redo value
      const newValues = updateGridOptionsFromProperty(formValues, nextAction.path, nextAction.value);
      setFormValues(newValues);

      // Add to changed properties
      setChangedProperties(prev => {
        const newSet = new Set(prev);
        newSet.add(nextAction.path);
        return newSet;
      });
    }
  };

  // Handle form submission
  const handleSave = () => {
    setGridOptions(formValues);
    onOpenChange(false);
  };

  // Handle cancel button
  const handleCancel = () => {
    form.reset(gridOptions || {});
    onOpenChange(false);
  };

  // Handle reset button
  const handleReset = () => {
    form.reset({});
    setFormValues({});
    setChangedProperties(new Set());
    setUndoStack([]);
    setRedoStack([]);
  };

  // Handle export settings
  const handleExport = () => {
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
  };

  // Handle import settings
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedSettings = JSON.parse(event.target?.result as string);
          setFormValues(importedSettings);
          setChangedProperties(new Set());
          setUndoStack([]);
          setRedoStack([]);
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
  };

  // Convert grid options to property items
  const properties = gridOptionsToProperties(formValues);

  const hasChanges = changedProperties.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="general-settings-dialog max-w-[900px] max-h-[min(700px,calc(100vh-40px))] h-auto p-0 gap-0 flex flex-col"
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
              <Settings className="h-4 w-4 text-primary" />
              Grid Settings
            </DialogTitle>
          </DialogHeader>
          <Separator className="mb-0.5" />
        </div>

        <div className="flex-1 overflow-hidden">
          <PropertyGrid
            properties={properties}
            categories={gridCategories}
            changedProperties={changedProperties}
            onPropertyChange={handlePropertyChange}
          />
        </div>

        <DialogFooter className="flex-none py-1.5 px-3 border-t bg-muted/10">
          <div className="flex items-center gap-1 mr-auto">
            {hasChanges && (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                <Circle className="h-1.5 w-1.5 fill-amber-600" />
                Unsaved changes
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Undo"
                className="h-6 w-6 rounded-full hover:bg-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo"
                className="h-6 w-6 rounded-full hover:bg-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-6 text-xs mr-1.5"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleSave} 
            disabled={!hasChanges}
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
