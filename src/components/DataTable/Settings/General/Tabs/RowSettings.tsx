import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface RowSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function RowSettings({ options, updateOptions }: RowSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Row Display</h3>
        <p className="text-sm text-muted-foreground">
          Configure how rows are displayed in the grid.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Alternate Row Colors
            </FormLabel>
            <FormDescription>
              Use alternating colors for rows
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressRowAlternation !== true}
              onCheckedChange={(checked) => updateOptions("suppressRowAlternation", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Row Animation
            </FormLabel>
            <FormDescription>
              Animate row changes
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressRowAnimation !== true}
              onCheckedChange={(checked) => updateOptions("suppressRowAnimation", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <div className="space-y-2">
          <Label htmlFor="rowBuffer">Row Buffer</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="rowBuffer"
              min={5}
              max={100}
              step={1}
              value={[options.rowBuffer || 10]}
              onValueChange={(value) => updateOptions("rowBuffer", value[0])}
              className="flex-1"
            />
            <Input
              type="number"
              value={options.rowBuffer || 10}
              onChange={(e) => updateOptions("rowBuffer", parseInt(e.target.value))}
              className="w-16"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Number of rows rendered outside visible area
          </p>
        </div>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Full Width Rows
            </FormLabel>
            <FormDescription>
              Allow rows to span all columns
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressFullWidthRows !== true}
              onCheckedChange={(checked) => updateOptions("suppressFullWidthRows", !checked)}
            />
          </FormControl>
        </FormItem>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Row Behavior</h3>
        <p className="text-sm text-muted-foreground">
          Configure how rows behave in the grid.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Row Drag
            </FormLabel>
            <FormDescription>
              Allow dragging rows
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.rowDragManaged === true}
              onCheckedChange={(checked) => updateOptions("rowDragManaged", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Multiple Row Drag
            </FormLabel>
            <FormDescription>
              Allow dragging multiple rows
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressMultiRowDrag !== true}
              onCheckedChange={(checked) => updateOptions("suppressMultiRowDrag", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Row Click Selection
            </FormLabel>
            <FormDescription>
              Select rows by clicking
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressRowClickSelection !== true}
              onCheckedChange={(checked) => updateOptions("suppressRowClickSelection", !checked)}
            />
          </FormControl>
        </FormItem>
        
        <div className="space-y-2">
          <Label htmlFor="rowClass">Row Class Rules</Label>
          <Input
            id="rowClass"
            placeholder="e.g., my-row-class"
            value={options.rowClass || ""}
            onChange={(e) => updateOptions("rowClass", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            CSS class to apply to all rows
          </p>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Row Data</h3>
        <p className="text-sm text-muted-foreground">
          Configure how row data is processed.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="getRowId">Row ID Field</Label>
          <Input
            id="getRowId"
            placeholder="e.g., id"
            value={options.getRowIdField || ""}
            onChange={(e) => updateOptions("getRowIdField", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Field to use as unique row ID
          </p>
        </div>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Immutable Data
            </FormLabel>
            <FormDescription>
              Optimize for immutable data
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.immutableData === true}
              onCheckedChange={(checked) => updateOptions("immutableData", checked)}
            />
          </FormControl>
        </FormItem>
        
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Maintain Row Order
            </FormLabel>
            <FormDescription>
              Keep rows in original order
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.maintainRowOrder === true}
              onCheckedChange={(checked) => updateOptions("maintainRowOrder", checked)}
            />
          </FormControl>
        </FormItem>
        
        <div className="space-y-2">
          <Label htmlFor="rowHeight">Default Row Height (px)</Label>
          <div className="flex items-center gap-2">
            <Slider
              id="rowHeight"
              min={20}
              max={100}
              step={1}
              value={[options.rowHeight || 25]}
              onValueChange={(value) => updateOptions("rowHeight", value[0])}
              className="flex-1"
            />
            <Input
              type="number"
              value={options.rowHeight || 25}
              onChange={(e) => updateOptions("rowHeight", parseInt(e.target.value))}
              className="w-16"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Default height for all rows
          </p>
        </div>
      </div>
    </div>
  );
}
