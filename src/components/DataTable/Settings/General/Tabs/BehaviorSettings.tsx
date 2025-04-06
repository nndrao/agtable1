import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
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
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Enable Cell Text Selection
            </FormLabel>
            <FormDescription>
              Allow users to select and copy cell text
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.enableCellTextSelection === true}
              onCheckedChange={(checked) => updateOptions("enableCellTextSelection", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Enable Range Selection
            </FormLabel>
            <FormDescription>
              Allow selecting ranges of cells
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.enableRangeSelection === true}
              onCheckedChange={(checked) => updateOptions("enableRangeSelection", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Enable Cell Editing
            </FormLabel>
            <FormDescription>
              Allow editing cell values
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressCellEdit !== true}
              onCheckedChange={(checked) => updateOptions("suppressCellEdit", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Stop Editing When Grid Loses Focus
            </FormLabel>
            <FormDescription>
              Exit edit mode when clicking outside
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.stopEditingWhenCellsLoseFocus === true}
              onCheckedChange={(checked) => updateOptions("stopEditingWhenCellsLoseFocus", checked)}
            />
          </FormControl>
        </FormItem>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Navigation & Keyboard</h3>
        <p className="text-sm text-muted-foreground">
          Configure keyboard navigation and shortcuts.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Enable Cell Navigation
            </FormLabel>
            <FormDescription>
              Navigate cells with keyboard
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressCellNavigation !== true}
              onCheckedChange={(checked) => updateOptions("suppressCellNavigation", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Navigate After Tab
            </FormLabel>
            <FormDescription>
              Move to next cell after Tab key
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.tabToNextCell === true}
              onCheckedChange={(checked) => updateOptions("tabToNextCell", checked)}
            />
          </FormControl>
        </FormItem>
        
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
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Enter Moves Down
            </FormLabel>
            <FormDescription>
              Move down after pressing Enter
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.enterMovesDown === true}
              onCheckedChange={(checked) => updateOptions("enterMovesDown", checked)}
            />
          </FormControl>
        </FormItem>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Performance</h3>
        <p className="text-sm text-muted-foreground">
          Configure options that affect grid performance.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Suppress Column Virtualization
            </FormLabel>
            <FormDescription>
              Render all columns at once
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressColumnVirtualisation === true}
              onCheckedChange={(checked) => updateOptions("suppressColumnVirtualisation", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Cache Quick Filter
            </FormLabel>
            <FormDescription>
              Improve filter performance
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.cacheQuickFilter === true}
              onCheckedChange={(checked) => updateOptions("cacheQuickFilter", checked)}
            />
          </FormControl>
        </FormItem>
        
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
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Ensure DOM Order
            </FormLabel>
            <FormDescription>
              Maintain DOM order for accessibility
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.ensureDomOrder === true}
              onCheckedChange={(checked) => updateOptions("ensureDomOrder", checked)}
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
}
