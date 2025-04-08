import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface SortingSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function SortingSettings({ options, updateOptions }: SortingSettingsProps) {
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
      {/* Basic Sorting Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Sorting Options</CardTitle>
          <CardDescription>
            Configure basic sorting behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Accented Sort
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-sort-accentedSort">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Take accented characters into account when sorting
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.accentedSort === true}
                  onCheckedChange={(checked) => updateOptions("accentedSort", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Suppress Multi-Sort
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-sort-suppressMultiSort">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Disable multi-column sorting
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.suppressMultiSort === true}
                  onCheckedChange={(checked) => updateOptions("suppressMultiSort", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Always Multi-Sort
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-sort-alwaysMultiSort">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Always use multi-sort when clicking column headers
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.alwaysMultiSort === true}
                  onCheckedChange={(checked) => updateOptions("alwaysMultiSort", checked)}
                />
              </FormControl>
            </FormItem>

            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">
                Multi-Sort Key
                <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-sort-multiSortKey">
                  docs
                </DocLink>
              </FormLabel>
              <Select
                value={options.multiSortKey || "none"}
                onValueChange={(value) => updateOptions("multiSortKey", value === "none" ? undefined : value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="ctrl">Ctrl Key (Cmd on Mac)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                Key to hold for multi-sorting
              </FormDescription>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Sorting Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Advanced Sorting</CardTitle>
          <CardDescription>
            Configure advanced sorting options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Suppress Maintain Unsorted Order
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-sort-suppressMaintainUnsortedOrder">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Don't maintain original order for unsorted data
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.suppressMaintainUnsortedOrder === true}
                  onCheckedChange={(checked) => updateOptions("suppressMaintainUnsortedOrder", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Delta Sort
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-sort-deltaSort">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Only sort rows added/updated by a transaction
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.deltaSort === true}
                  onCheckedChange={(checked) => updateOptions("deltaSort", checked)}
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
