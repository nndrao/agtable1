import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppearanceSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function AppearanceSettings({ options, updateOptions }: AppearanceSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Theme & Styling Section */}
      <div>
        <h3 className="text-sm font-semibold text-blue-400 mb-4">Theme & Styling</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-row items-center justify-between rounded-md bg-[#151d2c] p-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Borders</Label>
              <p className="text-xs text-zinc-400">Show borders around cells</p>
            </div>
            <Switch
              checked={options.suppressCellBorders !== true}
              onCheckedChange={(checked) => updateOptions("suppressCellBorders", !checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-md bg-[#151d2c] p-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Header Borders</Label>
              <p className="text-xs text-zinc-400">Show borders around headers</p>
            </div>
            <Switch
              checked={options.suppressHeaderBorders !== true}
              onCheckedChange={(checked) => updateOptions("suppressHeaderBorders", !checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-md bg-[#151d2c] p-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Row Hover Effect</Label>
              <p className="text-xs text-zinc-400">Highlight rows on hover</p>
            </div>
            <Switch
              checked={options.suppressRowHoverHighlight !== true}
              onCheckedChange={(checked) => updateOptions("suppressRowHoverHighlight", !checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-md bg-[#151d2c] p-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Cell Flash on Change</Label>
              <p className="text-xs text-zinc-400">Flash cells when data changes</p>
            </div>
            <Switch
              checked={options.enableCellChangeFlash === true}
              onCheckedChange={(checked) => updateOptions("enableCellChangeFlash", checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Layout & Sizing Section */}
      <div>
        <h3 className="text-sm font-semibold text-blue-400 mb-4">Layout & Sizing</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="domLayout" className="text-sm">DOM Layout</Label>
              <Info className="h-4 w-4 text-zinc-500" />
            </div>
            <Select
              value={options.domLayout || "normal"}
              onValueChange={(value) => updateOptions("domLayout", value)}
            >
              <SelectTrigger id="domLayout" className="bg-[#151d2c] border-zinc-700 text-sm">
                <SelectValue placeholder="Normal" />
              </SelectTrigger>
              <SelectContent className="bg-[#151d2c] border-zinc-700">
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="autoHeight">Auto Height</SelectItem>
                <SelectItem value="print">Print</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="visualDensity" className="text-sm">Visual Density</Label>
            </div>
            <Select
              value={options.density || "comfortable"}
              onValueChange={(value) => updateOptions("density", value)}
            >
              <SelectTrigger id="visualDensity" className="bg-[#151d2c] border-zinc-700 text-sm">
                <SelectValue placeholder="Comfortable" />
              </SelectTrigger>
              <SelectContent className="bg-[#151d2c] border-zinc-700">
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="cozy">Cozy</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-400">Controls the spacing and padding of grid elements</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rowHeight" className="text-sm">Row Height (px)</Label>
              <span className="text-sm text-zinc-300 font-mono">{options.rowHeight || 25}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">0</span>
              <Slider
                id="rowHeight"
                min={20}
                max={100}
                step={1}
                value={[options.rowHeight || 25]}
                onValueChange={(value) => updateOptions("rowHeight", value[0])}
                className="flex-1"
              />
              <span className="text-xs text-zinc-500">100</span>
              <Input
                type="number"
                value={options.rowHeight || 25}
                onChange={(e) => updateOptions("rowHeight", parseInt(e.target.value))}
                className="w-16 h-8 bg-[#151d2c] border-zinc-700 text-center"
              />
            </div>
            <p className="text-xs text-zinc-400">Height of each row in pixels</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="headerHeight" className="text-sm">Header Height (px)</Label>
              <span className="text-sm text-zinc-300 font-mono">{options.headerHeight || 25}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">0</span>
              <Slider
                id="headerHeight"
                min={20}
                max={100}
                step={1}
                value={[options.headerHeight || 25]}
                onValueChange={(value) => updateOptions("headerHeight", value[0])}
                className="flex-1"
              />
              <span className="text-xs text-zinc-500">100</span>
              <Input
                type="number"
                value={options.headerHeight || 25}
                onChange={(e) => updateOptions("headerHeight", parseInt(e.target.value))}
                className="w-16 h-8 bg-[#151d2c] border-zinc-700 text-center"
              />
            </div>
            <p className="text-xs text-zinc-400">Height of the header row in pixels</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="animationSpeed" className="text-sm">Animation Speed (ms)</Label>
              <span className="text-sm text-zinc-300 font-mono">{options.animationDuration || 300}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">0</span>
              <Slider
                id="animationSpeed"
                min={0}
                max={1000}
                step={10}
                value={[options.animationDuration || 300]}
                onValueChange={(value) => updateOptions("animationDuration", value[0])}
                className="flex-1"
              />
              <span className="text-xs text-zinc-500">1000</span>
              <Input
                type="number"
                value={options.animationDuration || 300}
                onChange={(e) => updateOptions("animationDuration", parseInt(e.target.value))}
                className="w-16 h-8 bg-[#151d2c] border-zinc-700 text-center"
              />
            </div>
            <p className="text-xs text-zinc-400">Controls the speed of grid animations</p>
          </div>

          <div className="flex flex-row items-center justify-between rounded-md bg-[#151d2c] p-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto Size Columns</Label>
              <p className="text-xs text-zinc-400">Automatically size columns to fit content</p>
            </div>
            <Switch
              checked={options.autoSizeStrategy !== undefined}
              onCheckedChange={(checked) => updateOptions("autoSizeStrategy", checked ? { type: 'fitCellContents' } : undefined)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
