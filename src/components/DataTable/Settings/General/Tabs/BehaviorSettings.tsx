import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { ExternalLink, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface BehaviorSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function BehaviorSettings({ options, updateOptions }: BehaviorSettingsProps) {
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
      {/* Interaction Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Interaction</CardTitle>
          <CardDescription>
            Configure how users interact with the grid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Cell Text Selection
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-selection-enableCellTextSelection">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
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

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Range Selection
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-selection-enableRangeSelection">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
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
          </div>
        </CardContent>
      </Card>

      {/* Navigation & Keyboard Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Navigation & Keyboard</CardTitle>
          <CardDescription>
            Configure keyboard navigation and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Cell Navigation
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-nav-suppressCellNavigation">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Enable keyboard navigation between cells
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.suppressCellNavigation !== true}
                  onCheckedChange={(checked) => updateOptions("suppressCellNavigation", !checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Tab Navigation
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-nav-tabToNextCell">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
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
              <Label htmlFor="navigateToNextCell" className="text-sm font-medium">
                Tab Navigation Direction
                <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-nav-navigateToNextCellOnLastCell">
                  docs
                </DocLink>
              </Label>
              <Select
                value={options.navigateToNextCellOnLastCell ? "wrap" : "stop"}
                onValueChange={(value) => updateOptions("navigateToNextCellOnLastCell", value === "wrap")}
              >
                <SelectTrigger id="navigateToNextCell" className="text-sm">
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
          </div>
        </CardContent>
      </Card>

      {/* Performance Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Performance</CardTitle>
          <CardDescription>
            Configure options that affect grid performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Disable Column Virtualization
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-rendering-suppressColumnVirtualisation">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Render all columns at once (may impact performance)
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.suppressColumnVirtualisation === true}
                  onCheckedChange={(checked) => updateOptions("suppressColumnVirtualisation", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Ensure DOM Order
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-rendering-ensureDomOrder">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Maintain DOM order for accessibility (impacts performance)
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.ensureDomOrder === true}
                  onCheckedChange={(checked) => updateOptions("ensureDomOrder", checked)}
                />
              </FormControl>
            </FormItem>

            <div className="space-y-2">
              <Label htmlFor="rowModelType" className="text-sm font-medium">
                Row Model Type
                <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-rowModels-rowModelType">
                  docs
                </DocLink>
              </Label>
              <Select
                value={options.rowModelType || "clientSide"}
                onValueChange={(value) => updateOptions("rowModelType", value)}
              >
                <SelectTrigger id="rowModelType" className="text-sm">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
