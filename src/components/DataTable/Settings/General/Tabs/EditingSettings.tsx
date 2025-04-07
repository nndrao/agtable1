import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface EditingSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function EditingSettings({ options, updateOptions }: EditingSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Editing Mode</h3>
        <p className="text-sm text-muted-foreground">
          Configure how cell editing is triggered and behaves.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="editType">Edit Type</Label>
          <Select
            value={options.editType || "doubleClick"}
            onValueChange={(value) => updateOptions("editType", value)}
          >
            <SelectTrigger id="editType">
              <SelectValue placeholder="Select edit type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullRow">Full Row</SelectItem>
              <SelectItem value="singleClick">Single Click</SelectItem>
              <SelectItem value="doubleClick">Double Click</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How editing is triggered in the grid
          </p>
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Single Click Edit</Label>
            <p className="text-sm text-muted-foreground">Start editing with a single click</p>
          </div>
          <Switch
            checked={options.singleClickEdit === true}
            onCheckedChange={(checked) => updateOptions("singleClickEdit", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Suppress Click Edit</Label>
            <p className="text-sm text-muted-foreground">Prevent click from starting edit</p>
          </div>
          <Switch
            checked={options.suppressClickEdit === true}
            onCheckedChange={(checked) => updateOptions("suppressClickEdit", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Stop Editing When Grid Loses Focus</Label>
            <p className="text-sm text-muted-foreground">Exit edit mode when clicking outside</p>
          </div>
          <Switch
            checked={options.stopEditingWhenCellsLoseFocus === true}
            onCheckedChange={(checked) => updateOptions("stopEditingWhenCellsLoseFocus", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Cell Editing on Backspace</Label>
            <p className="text-sm text-muted-foreground">Start editing when backspace is pressed (MacOS)</p>
          </div>
          <Switch
            checked={options.enableCellEditingOnBackspace === true}
            onCheckedChange={(checked) => updateOptions("enableCellEditingOnBackspace", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Read Only Edit</Label>
            <p className="text-sm text-muted-foreground">Grid won't update data after edit operations</p>
          </div>
          <Switch
            checked={options.readOnlyEdit === true}
            onCheckedChange={(checked) => updateOptions("readOnlyEdit", checked)}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Navigation & Keyboard</h3>
        <p className="text-sm text-muted-foreground">
          Configure keyboard navigation during editing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enter Navigates Vertically</Label>
            <p className="text-sm text-muted-foreground">Move down after pressing Enter</p>
          </div>
          <Switch
            checked={options.enterNavigatesVertically === true}
            onCheckedChange={(checked) => updateOptions("enterNavigatesVertically", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enter Navigates Vertically After Edit</Label>
            <p className="text-sm text-muted-foreground">Move down after editing with Enter</p>
          </div>
          <Switch
            checked={options.enterNavigatesVerticallyAfterEdit === true}
            onCheckedChange={(checked) => updateOptions("enterNavigatesVerticallyAfterEdit", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enter Navigates Vertically</Label>
            <p className="text-sm text-muted-foreground">Excel-style Enter key navigation</p>
          </div>
          <Switch
            checked={options.enterNavigatesVertically === true}
            onCheckedChange={(checked) => updateOptions("enterNavigatesVertically", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enter Navigates Vertically After Edit</Label>
            <p className="text-sm text-muted-foreground">Excel-style Enter key navigation after edit</p>
          </div>
          <Switch
            checked={options.enterNavigatesVerticallyAfterEdit === true}
            onCheckedChange={(checked) => updateOptions("enterNavigatesVerticallyAfterEdit", checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Custom Navigation After Edit</Label>
            <p className="text-sm text-muted-foreground">Use custom navigation when using arrow keys during edit</p>
          </div>
          <Switch
            checked={options.useCustomNavigation === true}
            onCheckedChange={(checked) => updateOptions("useCustomNavigation", checked)}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Undo / Redo</h3>
        <p className="text-sm text-muted-foreground">
          Configure undo and redo functionality for cell editing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Undo / Redo</Label>
            <p className="text-sm text-muted-foreground">Allow undoing and redoing edits</p>
          </div>
          <Switch
            checked={options.undoRedoCellEditing === true}
            onCheckedChange={(checked) => updateOptions("undoRedoCellEditing", checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="undoRedoLimit">Undo / Redo Stack Size</Label>
          <Input
            id="undoRedoLimit"
            type="number"
            min={1}
            max={100}
            value={options.undoRedoCellEditingLimit || 10}
            onChange={(e) => updateOptions("undoRedoCellEditingLimit", parseInt(e.target.value, 10))}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of undo/redo steps to remember
          </p>
        </div>
      </div>
    </div>
  );
}
