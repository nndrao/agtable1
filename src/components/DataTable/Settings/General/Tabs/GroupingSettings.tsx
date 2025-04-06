import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
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
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Enable Row Grouping
            </FormLabel>
            <FormDescription>
              Allow grouping rows by column values
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.groupUseEntireRow !== false}
              onCheckedChange={(checked) => updateOptions("groupUseEntireRow", checked)}
            />
          </FormControl>
        </FormItem>
        
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
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Group Multi Auto Column
            </FormLabel>
            <FormDescription>
              Create auto columns for each group level
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.groupMultiAutoColumn === true}
              onCheckedChange={(checked) => updateOptions("groupMultiAutoColumn", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Group Suppress Auto Column
            </FormLabel>
            <FormDescription>
              Don't create auto group columns
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.groupSuppressAutoColumn === true}
              onCheckedChange={(checked) => updateOptions("groupSuppressAutoColumn", checked)}
            />
          </FormControl>
        </FormItem>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Group Display</h3>
        <p className="text-sm text-muted-foreground">
          Configure how groups are displayed.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Group Row Inner Renderer
            </FormLabel>
            <FormDescription>
              Use custom renderer for group rows
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.groupRowInnerRenderer !== undefined}
              onCheckedChange={(checked) => updateOptions("groupRowInnerRenderer", checked ? "default" : undefined)}
            />
          </FormControl>
        </FormItem>
        
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
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Group Hide Open Parents
            </FormLabel>
            <FormDescription>
              Hide parent rows when expanded
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.groupHideOpenParents === true}
              onCheckedChange={(checked) => updateOptions("groupHideOpenParents", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Group Remove Single Children
            </FormLabel>
            <FormDescription>
              Remove groups with only one child
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.groupRemoveSingleChildren === true}
              onCheckedChange={(checked) => updateOptions("groupRemoveSingleChildren", checked)}
            />
          </FormControl>
        </FormItem>
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
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Group Include Footer
            </FormLabel>
            <FormDescription>
              Show footer for each group
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.groupIncludeFooter === true}
              onCheckedChange={(checked) => updateOptions("groupIncludeFooter", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Group Show Row Group Column
            </FormLabel>
            <FormDescription>
              Show column that was used for grouping
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.showRowGroupColumn !== false}
              onCheckedChange={(checked) => updateOptions("showRowGroupColumn", checked)}
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
}
