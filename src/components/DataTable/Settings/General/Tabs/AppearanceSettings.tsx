import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Info, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";

interface AppearanceSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function AppearanceSettings({ options, updateOptions }: AppearanceSettingsProps) {
  // Helper function to create a documentation link tooltip
  const DocLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            {children}
          </a>
        </TooltipTrigger>
        <TooltipContent side="top">
          View AG-Grid documentation
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-8">
      {/* Theme & Styling Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Theme & Styling</CardTitle>
          <CardDescription>
            Configure the visual appearance of the grid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Row Hover Effect
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-styling-suppressRowHoverHighlight">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Highlight rows when the mouse hovers over them
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.suppressRowHoverHighlight !== true}
                  onCheckedChange={(checked) => updateOptions("suppressRowHoverHighlight", !checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Column Hover Highlight
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-styling-columnHoverHighlight">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Highlight columns when the mouse hovers over them
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.columnHoverHighlight === true}
                  onCheckedChange={(checked) => updateOptions("columnHoverHighlight", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Animate Rows
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-rendering-animateRows">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Enable row animations when sorting or filtering
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.animateRows === true}
                  onCheckedChange={(checked) => updateOptions("animateRows", checked)}
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </Card>

      {/* Layout & Sizing Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Layout & Sizing</CardTitle>
          <CardDescription>
            Configure the layout and dimensions of grid elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="domLayout" className="text-sm">
                  DOM Layout
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-rendering-domLayout">
                    docs
                  </DocLink>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Normal: Standard grid layout with virtualization</p>
                      <p>AutoHeight: Grid height adjusts to content</p>
                      <p>Print: Optimized for printing, all rows rendered</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={options.domLayout || "normal"}
                onValueChange={(value) => updateOptions("domLayout", value)}
              >
                <SelectTrigger id="domLayout" className="text-sm">
                  <SelectValue placeholder="Normal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="autoHeight">Auto Height</SelectItem>
                  <SelectItem value="print">Print</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Controls how the grid DOM is structured</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="visualDensity" className="text-sm">
                  Visual Density
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-rendering-density">
                    docs
                  </DocLink>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Comfortable: Standard spacing</p>
                      <p>Compact: Reduced spacing for more data</p>
                      <p>Cozy: Minimal spacing for maximum data density</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={options.density || "comfortable"}
                onValueChange={(value) => updateOptions("density", value)}
              >
                <SelectTrigger id="visualDensity" className="text-sm">
                  <SelectValue placeholder="Comfortable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="cozy">Cozy</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Controls the spacing and padding of grid elements</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rowHeight" className="text-sm">
                  Row Height (px)
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-styling-rowHeight">
                    docs
                  </DocLink>
                </Label>
                <span className="text-sm font-mono text-muted-foreground">{options.rowHeight || 25}px</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">20</span>
                <Slider
                  id="rowHeight"
                  min={20}
                  max={100}
                  step={1}
                  value={[options.rowHeight || 25]}
                  onValueChange={(value) => updateOptions("rowHeight", value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">100</span>
                <Input
                  type="number"
                  min={20}
                  max={100}
                  value={options.rowHeight || 25}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 20 && value <= 100) {
                      updateOptions("rowHeight", value);
                    }
                  }}
                  className="w-16 h-8 text-center"
                />
              </div>
              <p className="text-xs text-muted-foreground">Height of each row in pixels</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="headerHeight" className="text-sm">
                  Header Height (px)
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-headers-headerHeight">
                    docs
                  </DocLink>
                </Label>
                <span className="text-sm font-mono text-muted-foreground">{options.headerHeight || 25}px</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">20</span>
                <Slider
                  id="headerHeight"
                  min={20}
                  max={100}
                  step={1}
                  value={[options.headerHeight || 25]}
                  onValueChange={(value) => updateOptions("headerHeight", value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">100</span>
                <Input
                  type="number"
                  min={20}
                  max={100}
                  value={options.headerHeight || 25}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 20 && value <= 100) {
                      updateOptions("headerHeight", value);
                    }
                  }}
                  className="w-16 h-8 text-center"
                />
              </div>
              <p className="text-xs text-muted-foreground">Height of the header row in pixels</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="animationSpeed" className="text-sm">
                  Animation Duration (ms)
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-rendering-animationDuration">
                    docs
                  </DocLink>
                </Label>
                <span className="text-sm font-mono text-muted-foreground">{options.animationDuration || 300}ms</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">0</span>
                <Slider
                  id="animationSpeed"
                  min={0}
                  max={1000}
                  step={10}
                  value={[options.animationDuration || 300]}
                  onValueChange={(value) => updateOptions("animationDuration", value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">1000</span>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  value={options.animationDuration || 300}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 1000) {
                      updateOptions("animationDuration", value);
                    }
                  }}
                  className="w-16 h-8 text-center"
                />
              </div>
              <p className="text-xs text-muted-foreground">Controls the speed of grid animations</p>
            </div>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Auto Size Columns
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-columnSizing-autoSizeStrategy">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Automatically size columns to fit content
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.autoSizeStrategy !== undefined}
                  onCheckedChange={(checked) => updateOptions("autoSizeStrategy", checked ? { type: 'fitCellContents' } : undefined)}
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Additional Settings</CardTitle>
          <CardDescription>
            Configure other appearance-related options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Show Horizontal Scrollbar
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-scrolling-alwaysShowHorizontalScroll">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Always show the horizontal scrollbar
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.alwaysShowHorizontalScroll === true}
                  onCheckedChange={(checked) => updateOptions("alwaysShowHorizontalScroll", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Show Vertical Scrollbar
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-scrolling-alwaysShowVerticalScroll">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Always show the vertical scrollbar
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.alwaysShowVerticalScroll === true}
                  onCheckedChange={(checked) => updateOptions("alwaysShowVerticalScroll", checked)}
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
