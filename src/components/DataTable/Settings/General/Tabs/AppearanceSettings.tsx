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
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Borders</Label>
            <p className="text-sm text-muted-foreground">Show borders around cells</p>
          </div>
          <Switch
            checked={options.suppressCellBorders !== true}
            onCheckedChange={(checked) => updateOptions("suppressCellBorders", !checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Header Borders</Label>
            <p className="text-sm text-muted-foreground">Show borders around headers</p>
          </div>
          <Switch
            checked={options.suppressHeaderBorders !== true}
            onCheckedChange={(checked) => updateOptions("suppressHeaderBorders", !checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Row Hover Effect</Label>
            <p className="text-sm text-muted-foreground">Highlight rows on hover</p>
          </div>
          <Switch
            checked={options.suppressRowHoverHighlight !== true}
            onCheckedChange={(checked) => updateOptions("suppressRowHoverHighlight", !checked)}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Cell Flash on Change</Label>
            <p className="text-sm text-muted-foreground">Flash cells when data changes</p>
          </div>
          <Switch
            checked={options.enableCellChangeFlash === true}
            onCheckedChange={(checked) => updateOptions("enableCellChangeFlash", checked)}
          />
        </div>
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

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Auto Size Columns</Label>
            <p className="text-sm text-muted-foreground">Automatically size columns to fit content</p>
          </div>
          <Switch
            checked={options.autoSizeStrategy !== undefined}
            onCheckedChange={(checked) => updateOptions("autoSizeStrategy", checked ? { type: 'fitCellContents' } : undefined)}
          />
        </div>
      </div>
    </div>
  );
}
