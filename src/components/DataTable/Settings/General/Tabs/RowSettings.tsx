import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface RowSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function RowSettings({ options, updateOptions }: RowSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Row Display Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Row Display</CardTitle>
          <CardDescription>
            Configure how rows are displayed in the grid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="rowBuffer" className="text-sm font-medium">Row Buffer</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Number of rows rendered outside the visible area. Higher values improve scrolling performance but use more memory.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">5</span>
                <Slider
                  id="rowBuffer"
                  min={5}
                  max={100}
                  step={1}
                  value={[options.rowBuffer || 10]}
                  onValueChange={(value) => updateOptions("rowBuffer", value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">100</span>
                <Input
                  type="number"
                  min={5}
                  max={100}
                  value={options.rowBuffer || 10}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 5 && value <= 100) {
                      updateOptions("rowBuffer", value);
                    }
                  }}
                  className="w-16 h-8 text-center"
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
        </CardContent>
      </Card>

      {/* Row Behavior Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Row Behavior</CardTitle>
          <CardDescription>
            Configure how rows behave in the grid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="rowClass" className="text-sm font-medium">Row Class Rules</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>CSS class to apply to all rows. You can use multiple classes separated by spaces.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="rowClass"
                placeholder="e.g., my-row-class"
                value={options.rowClass || ""}
                onChange={(e) => updateOptions("rowClass", e.target.value)}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                CSS class to apply to all rows
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row Data Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Row Data</CardTitle>
          <CardDescription>
            Configure how row data is processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="getRowId" className="text-sm font-medium">Row ID Field</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Field in your data that contains a unique identifier for each row. Important for row selection and state persistence.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="getRowId"
                placeholder="e.g., id"
                value={options.getRowIdField || ""}
                onChange={(e) => updateOptions("getRowIdField", e.target.value)}
                className="h-9"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="rowHeight" className="text-sm font-medium">Default Row Height (px)</Label>
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
              <p className="text-xs text-muted-foreground">
                Default height for all rows
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
