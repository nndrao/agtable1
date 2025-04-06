import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface ColumnSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function ColumnSettings({ options, updateOptions }: ColumnSettingsProps) {
  // Get defaultColDef or initialize it
  const defaultColDef = options.defaultColDef || {};
  
  // Helper function to update defaultColDef
  const updateDefaultColDef = (key: string, value: any) => {
    updateOptions(`defaultColDef.${key}`, value);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Default Column Behavior</h3>
        <p className="text-sm text-muted-foreground">
          Configure default settings for all columns.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Resizable
            </FormLabel>
            <FormDescription>
              Allow columns to be resized
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={defaultColDef.resizable === true}
              onCheckedChange={(checked) => updateDefaultColDef("resizable", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Sortable
            </FormLabel>
            <FormDescription>
              Allow columns to be sorted
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={defaultColDef.sortable === true}
              onCheckedChange={(checked) => updateDefaultColDef("sortable", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Filter
            </FormLabel>
            <FormDescription>
              Enable column filtering
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={defaultColDef.filter === true}
              onCheckedChange={(checked) => updateDefaultColDef("filter", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Editable
            </FormLabel>
            <FormDescription>
              Allow cell editing
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={defaultColDef.editable === true}
              onCheckedChange={(checked) => updateDefaultColDef("editable", checked)}
            />
          </FormControl>
        </FormItem>
        
        <div className="space-y-2">
          <Label htmlFor="minWidth">Minimum Width (px)</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="minWidth"
              min={50}
              max={300}
              step={10}
              value={[defaultColDef.minWidth || 100]}
              onValueChange={(value) => updateDefaultColDef("minWidth", value[0])}
              className="flex-1"
            />
            <Input
              type="number"
              value={defaultColDef.minWidth || 100}
              onChange={(e) => updateDefaultColDef("minWidth", parseInt(e.target.value))}
              className="w-16"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum width for all columns
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="flex">Flex Grow</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="flex"
              min={0}
              max={5}
              step={1}
              value={[defaultColDef.flex || 1]}
              onValueChange={(value) => updateDefaultColDef("flex", value[0])}
              className="flex-1"
            />
            <Input
              type="number"
              value={defaultColDef.flex || 1}
              onChange={(e) => updateDefaultColDef("flex", parseInt(e.target.value))}
              className="w-16"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            How columns grow to fill space
          </p>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Column Layout</h3>
        <p className="text-sm text-muted-foreground">
          Configure how columns are displayed and managed.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Column Virtualization
            </FormLabel>
            <FormDescription>
              Virtualize columns for performance
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressColumnVirtualisation !== true}
              onCheckedChange={(checked) => updateOptions("suppressColumnVirtualisation", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Auto Size All Columns
            </FormLabel>
            <FormDescription>
              Auto-size columns on load
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.autoSizeAllColumns === true}
              onCheckedChange={(checked) => updateOptions("autoSizeAllColumns", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Column Move
            </FormLabel>
            <FormDescription>
              Allow columns to be reordered
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressColumnMove !== true}
              onCheckedChange={(checked) => updateOptions("suppressColumnMove", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Column Drag
            </FormLabel>
            <FormDescription>
              Allow columns to be dragged
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressColumnDrag !== true}
              onCheckedChange={(checked) => updateOptions("suppressColumnDrag", !checked)}
            />
          </FormControl>
        </FormItem>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Header Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure column headers.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Header Tooltips
            </FormLabel>
            <FormDescription>
              Show tooltips on column headers
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressHeaderTooltips !== true}
              onCheckedChange={(checked) => updateOptions("suppressHeaderTooltips", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Header Checkboxes
            </FormLabel>
            <FormDescription>
              Show checkboxes in headers
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressHeaderCheckbox !== true}
              onCheckedChange={(checked) => updateOptions("suppressHeaderCheckbox", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <div className="space-y-2">
          <Label htmlFor="headerHeight">Header Height (px)</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="headerHeight"
              min={20}
              max={100}
              step={1}
              value={[options.headerHeight || 25]}
              onValueChange={(value) => updateOptions("headerHeight", value[0])}
              className="flex-1"
            />
            <Input
              type="number"
              value={options.headerHeight || 25}
              onChange={(e) => updateOptions("headerHeight", parseInt(e.target.value))}
              className="w-16"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Height of column headers
          </p>
        </div>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Header Borders
            </FormLabel>
            <FormDescription>
              Show borders around headers
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressHeaderBorders !== true}
              onCheckedChange={(checked) => updateOptions("suppressHeaderBorders", !checked)}
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
}
