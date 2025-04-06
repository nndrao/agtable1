import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface GroupingSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function GroupingSettings({ options, updateOptions }: GroupingSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Row Grouping</h3>
        <p className="text-sm text-muted-foreground">
          Configure how rows can be grouped in the grid.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Enable Row Grouping
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow grouping rows by column values
            </p>
          </div>
          <Switch
            checked={options.groupUseEntireRow !== false}
            onCheckedChange={(checked) => updateOptions("groupUseEntireRow", checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rowGroupPanelShow">Row Group Panel</Label>
          <Select
            value={options.rowGroupPanelShow || "never"}
            onValueChange={(value) => updateOptions("rowGroupPanelShow", value)}
          >
            <SelectTrigger id="rowGroupPanelShow">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">Always Show</SelectItem>
              <SelectItem value="onlyWhenGrouping">Only When Grouping</SelectItem>
              <SelectItem value="never">Never Show</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            When to show the row grouping panel
          </p>
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Group Multi Auto Column
            </Label>
            <p className="text-sm text-muted-foreground">
              Create auto columns for each group level
            </p>
          </div>
          <Switch
            checked={options.groupMultiAutoColumn === true}
            onCheckedChange={(checked) => updateOptions("groupMultiAutoColumn", checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Suppress Auto Group Column
            </Label>
            <p className="text-sm text-muted-foreground">
              Don't create auto group columns
            </p>
          </div>
          <Switch
            checked={options.suppressAutoColumn === true}
            onCheckedChange={(checked) => updateOptions("suppressAutoColumn", checked)}
          />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Group Display</h3>
        <p className="text-sm text-muted-foreground">
          Configure how groups are displayed.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Group Row Inner Renderer
            </Label>
            <p className="text-sm text-muted-foreground">
              Use custom renderer for group rows
            </p>
          </div>
          <Switch
            checked={options.groupRowInnerRenderer !== undefined}
            onCheckedChange={(checked) => updateOptions("groupRowInnerRenderer", checked ? "default" : undefined)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="groupDefaultExpanded">Default Expanded Level</Label>
          <Input
            id="groupDefaultExpanded"
            type="number"
            min={-1}
            max={10}
            value={options.groupDefaultExpanded || 0}
            onChange={(e) => updateOptions("groupDefaultExpanded", parseInt(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            How many levels to expand by default (-1 for all)
          </p>
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Group Hide Open Parents
            </Label>
            <p className="text-sm text-muted-foreground">
              Hide parent rows when expanded
            </p>
          </div>
          <Switch
            checked={options.groupHideOpenParents === true}
            onCheckedChange={(checked) => updateOptions("groupHideOpenParents", checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Hide Parent of Single Child
            </Label>
            <p className="text-sm text-muted-foreground">
              Remove groups with only one child
            </p>
          </div>
          <Switch
            checked={options.groupHideParentOfSingleChild === true}
            onCheckedChange={(checked) => updateOptions("groupHideParentOfSingleChild", checked)}
          />
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Group Customization</h3>
        <p className="text-sm text-muted-foreground">
          Customize group appearance and behavior.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="groupHeaderHeight">Group Header Height (px)</Label>
          <Input
            id="groupHeaderHeight"
            type="number"
            min={20}
            max={100}
            value={options.groupHeaderHeight || 25}
            onChange={(e) => updateOptions("groupHeaderHeight", parseInt(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Height of group header rows
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="groupDisplayType">Group Display Type</Label>
          <Select
            value={options.groupDisplayType || "singleColumn"}
            onValueChange={(value) => updateOptions("groupDisplayType", value)}
          >
            <SelectTrigger id="groupDisplayType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="singleColumn">Single Column</SelectItem>
              <SelectItem value="multipleColumns">Multiple Columns</SelectItem>
              <SelectItem value="groupRows">Group Rows</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How to display grouped data
          </p>
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Group Include Footer
            </Label>
            <p className="text-sm text-muted-foreground">
              Show footer for each group
            </p>
          </div>
          <Switch
            checked={options.groupIncludeFooter === true}
            onCheckedChange={(checked) => updateOptions("groupIncludeFooter", checked)}
          />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Show Row Group Column
            </Label>
            <p className="text-sm text-muted-foreground">
              Show column that was used for grouping
            </p>
          </div>
          <Switch
            checked={options.showRowGroupColumn !== false}
            onCheckedChange={(checked) => updateOptions("showRowGroupColumn", checked)}
          />
        </div>
      </div>
    </div>
  );
}
