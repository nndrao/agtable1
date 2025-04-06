import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AppearanceSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function AppearanceSettings({ options, updateOptions }: AppearanceSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Theme & Styling</h3>
        <p className="text-sm text-muted-foreground">
          Customize the visual appearance of the grid.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Borders
            </FormLabel>
            <FormDescription>
              Show borders around cells
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressCellBorders !== true}
              onCheckedChange={(checked) => updateOptions("suppressCellBorders", !checked)}
            />
          </FormControl>
        </FormItem>

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

        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Row Hover Effect
            </FormLabel>
            <FormDescription>
              Highlight rows on hover
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressRowHoverHighlight !== true}
              onCheckedChange={(checked) => updateOptions("suppressRowHoverHighlight", !checked)}
            />
          </FormControl>
        </FormItem>

        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Cell Flash on Change
            </FormLabel>
            <FormDescription>
              Flash cells when data changes
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.enableCellChangeFlash === true}
              onCheckedChange={(checked) => updateOptions("enableCellChangeFlash", checked)}
            />
          </FormControl>
        </FormItem>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Layout & Sizing</h3>
        <p className="text-sm text-muted-foreground">
          Configure the layout and dimensions of the grid.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="domLayout">DOM Layout</Label>
          <Select
            value={options.domLayout || "normal"}
            onValueChange={(value) => updateOptions("domLayout", value)}
          >
            <SelectTrigger id="domLayout">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="autoHeight">Auto Height</SelectItem>
              <SelectItem value="print">Print</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Controls how the grid is rendered in the DOM
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rowHeight">Row Height (px)</Label>
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
            Height of each row in pixels
          </p>
        </div>

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
            Height of the header row in pixels
          </p>
        </div>

        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Auto Size Columns
            </FormLabel>
            <FormDescription>
              Automatically size columns to fit content
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.autoSizeColumns === true}
              onCheckedChange={(checked) => updateOptions("autoSizeColumns", checked)}
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
}
