import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface BehaviorSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function BehaviorSettings({ options, updateOptions }: BehaviorSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Interaction</h3>
        <p className="text-sm text-muted-foreground">
          Configure how users interact with the grid.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Cell Text Selection</Label>
            <p className="text-sm text-muted-foreground">Allow users to select and copy cell text</p>
          </div>
          <Switch
            checked={options.enableCellTextSelection === true}
            onCheckedChange={(checked) => updateOptions("enableCellTextSelection", checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Range Selection</Label>
            <p className="text-sm text-muted-foreground">Allow selecting ranges of cells</p>
          </div>
          <Switch
            checked={options.enableRangeSelection === true}
            onCheckedChange={(checked) => updateOptions("enableRangeSelection", checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Cell Editing</Label>
            <p className="text-sm text-muted-foreground">Allow editing cell values</p>
          </div>
          <Switch
            checked={options.suppressCellEdit !== true}
            onCheckedChange={(checked) => updateOptions("suppressCellEdit", !checked)}
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
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Navigation & Keyboard</h3>
        <p className="text-sm text-muted-foreground">
          Configure keyboard navigation and shortcuts.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Cell Navigation</Label>
            <p className="text-sm text-muted-foreground">Navigate cells with keyboard</p>
          </div>
          <Switch
            checked={options.suppressCellNavigation !== true}
            onCheckedChange={(checked) => updateOptions("suppressCellNavigation", !checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Navigate After Tab</Label>
            <p className="text-sm text-muted-foreground">Move to next cell after Tab key</p>
          </div>
          <Switch
            checked={options.tabToNextCell === true}
            onCheckedChange={(checked) => updateOptions("tabToNextCell", checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="navigateToNextCell">Tab Navigation Direction</Label>
          <Select
            value={options.navigateToNextCellWhenAtLastCell ? "wrap" : "stop"}
            onValueChange={(value) => updateOptions("navigateToNextCellWhenAtLastCell", value === "wrap")}
          >
            <SelectTrigger id="navigateToNextCell">
              <SelectValue placeholder="Select behavior" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stop">Stop at last cell</SelectItem>
              <SelectItem value="wrap">Wrap to next row</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            What happens when tabbing at the last cell
          </p>
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enter Moves Down</Label>
            <p className="text-sm text-muted-foreground">Move down after pressing Enter</p>
          </div>
          <Switch
            checked={options.enterMovesDown === true}
            onCheckedChange={(checked) => updateOptions("enterMovesDown", checked)}
          />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Performance</h3>
        <p className="text-sm text-muted-foreground">
          Configure options that affect grid performance.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Suppress Column Virtualization</Label>
            <p className="text-sm text-muted-foreground">Render all columns at once</p>
          </div>
          <Switch
            checked={options.suppressColumnVirtualisation === true}
            onCheckedChange={(checked) => updateOptions("suppressColumnVirtualisation", checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Cache Quick Filter</Label>
            <p className="text-sm text-muted-foreground">Improve filter performance</p>
          </div>
          <Switch
            checked={options.cacheQuickFilter === true}
            onCheckedChange={(checked) => updateOptions("cacheQuickFilter", checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rowModelType">Row Model Type</Label>
          <Select
            value={options.rowModelType || "clientSide"}
            onValueChange={(value) => updateOptions("rowModelType", value)}
          >
            <SelectTrigger id="rowModelType">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clientSide">Client Side</SelectItem>
              <SelectItem value="infinite">Infinite</SelectItem>
              <SelectItem value="serverSide">Server Side</SelectItem>
              <SelectItem value="viewport">Viewport</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How data is loaded and managed
          </p>
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Ensure DOM Order</Label>
            <p className="text-sm text-muted-foreground">Maintain DOM order for accessibility</p>
          </div>
          <Switch
            checked={options.ensureDomOrder === true}
            onCheckedChange={(checked) => updateOptions("ensureDomOrder", checked)}
          />
        </div>
      </div>
    </div>
  );
}
