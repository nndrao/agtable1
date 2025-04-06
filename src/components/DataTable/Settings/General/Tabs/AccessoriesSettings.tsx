import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface AccessoriesSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function AccessoriesSettings({ options, updateOptions }: AccessoriesSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Tool Panels</h3>
        <p className="text-sm text-muted-foreground">
          Configure tool panels and side bar options.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Side Bar</Label>
            <p className="text-sm text-muted-foreground">Enable side bar with tool panels</p>
          </div>
          <Switch
            checked={options.sideBar !== false}
            onCheckedChange={(checked) => updateOptions("sideBar", checked ? true : false)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Columns Tool Panel</Label>
            <p className="text-sm text-muted-foreground">Show columns tool panel</p>
          </div>
          <Switch
            checked={options.suppressColumnsToolPanel !== true}
            onCheckedChange={(checked) => updateOptions("suppressColumnsToolPanel", !checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Filters Tool Panel</Label>
            <p className="text-sm text-muted-foreground">Show filters tool panel</p>
          </div>
          <Switch
            checked={options.suppressFiltersToolPanel !== true}
            onCheckedChange={(checked) => updateOptions("suppressFiltersToolPanel", !checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sideBarPosition">Side Bar Position</Label>
          <Select
            value={options.sideBarPosition || "right"}
            onValueChange={(value) => updateOptions("sideBarPosition", value)}
          >
            <SelectTrigger id="sideBarPosition">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Position of the side bar
          </p>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Status Bar</h3>
        <p className="text-sm text-muted-foreground">
          Configure the status bar at the bottom of the grid.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Status Bar</Label>
            <p className="text-sm text-muted-foreground">Show status bar</p>
          </div>
          <Switch
            checked={options.statusBar !== undefined}
            onCheckedChange={(checked) => 
              updateOptions("statusBar", checked ? {
                statusPanels: [
                  { statusPanel: 'agTotalRowCountComponent', align: 'left' },
                  { statusPanel: 'agFilteredRowCountComponent' },
                  { statusPanel: 'agSelectedRowCountComponent' },
                  { statusPanel: 'agAggregationComponent' }
                ]
              } : undefined)
            }
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Row Count</Label>
            <p className="text-sm text-muted-foreground">Show total row count</p>
          </div>
          <Switch
            checked={options.statusBar?.statusPanels?.some(panel => panel.statusPanel === 'agTotalRowCountComponent')}
            onCheckedChange={(checked) => {
              const statusBar = options.statusBar || { statusPanels: [] };
              const panels = [...(statusBar.statusPanels || [])];
              
              if (checked) {
                if (!panels.some(panel => panel.statusPanel === 'agTotalRowCountComponent')) {
                  panels.push({ statusPanel: 'agTotalRowCountComponent', align: 'left' });
                }
              } else {
                const index = panels.findIndex(panel => panel.statusPanel === 'agTotalRowCountComponent');
                if (index >= 0) {
                  panels.splice(index, 1);
                }
              }
              
              updateOptions("statusBar", { statusPanels: panels });
            }}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Filtered Row Count</Label>
            <p className="text-sm text-muted-foreground">Show filtered row count</p>
          </div>
          <Switch
            checked={options.statusBar?.statusPanels?.some(panel => panel.statusPanel === 'agFilteredRowCountComponent')}
            onCheckedChange={(checked) => {
              const statusBar = options.statusBar || { statusPanels: [] };
              const panels = [...(statusBar.statusPanels || [])];
              
              if (checked) {
                if (!panels.some(panel => panel.statusPanel === 'agFilteredRowCountComponent')) {
                  panels.push({ statusPanel: 'agFilteredRowCountComponent' });
                }
              } else {
                const index = panels.findIndex(panel => panel.statusPanel === 'agFilteredRowCountComponent');
                if (index >= 0) {
                  panels.splice(index, 1);
                }
              }
              
              updateOptions("statusBar", { statusPanels: panels });
            }}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Selected Row Count</Label>
            <p className="text-sm text-muted-foreground">Show selected row count</p>
          </div>
          <Switch
            checked={options.statusBar?.statusPanels?.some(panel => panel.statusPanel === 'agSelectedRowCountComponent')}
            onCheckedChange={(checked) => {
              const statusBar = options.statusBar || { statusPanels: [] };
              const panels = [...(statusBar.statusPanels || [])];
              
              if (checked) {
                if (!panels.some(panel => panel.statusPanel === 'agSelectedRowCountComponent')) {
                  panels.push({ statusPanel: 'agSelectedRowCountComponent' });
                }
              } else {
                const index = panels.findIndex(panel => panel.statusPanel === 'agSelectedRowCountComponent');
                if (index >= 0) {
                  panels.splice(index, 1);
                }
              }
              
              updateOptions("statusBar", { statusPanels: panels });
            }}
          />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Quick Filter</h3>
        <p className="text-sm text-muted-foreground">
          Configure the quick filter functionality.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Quick Filter</Label>
            <p className="text-sm text-muted-foreground">Enable quick filtering</p>
          </div>
          <Switch
            checked={options.quickFilterText !== undefined}
            onCheckedChange={(checked) => updateOptions("quickFilterText", checked ? "" : undefined)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Cache Quick Filter</Label>
            <p className="text-sm text-muted-foreground">Cache quick filter for better performance</p>
          </div>
          <Switch
            checked={options.cacheQuickFilter === true}
            onCheckedChange={(checked) => updateOptions("cacheQuickFilter", checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quickFilterMatcher">Quick Filter Matching Strategy</Label>
          <Select
            value={options.quickFilterMatchMode || "contains"}
            onValueChange={(value) => updateOptions("quickFilterMatchMode", value)}
          >
            <SelectTrigger id="quickFilterMatcher">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="startsWith">Starts With</SelectItem>
              <SelectItem value="endsWith">Ends With</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How quick filter matches text
          </p>
        </div>
      </div>
    </div>
  );
}
