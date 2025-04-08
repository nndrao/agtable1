import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface FilteringSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function FilteringSettings({ options, updateOptions }: FilteringSettingsProps) {
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
      {/* Quick Filter Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Quick Filter</CardTitle>
          <CardDescription>
            Configure quick filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Cache Quick Filter
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-filter-cacheQuickFilter">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Improve performance by caching quick filter results
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.cacheQuickFilter === true}
                  onCheckedChange={(checked) => updateOptions("cacheQuickFilter", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Include Hidden Columns
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-filter-includeHiddenColumnsInQuickFilter">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Include hidden columns in quick filter search
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.includeHiddenColumnsInQuickFilter === true}
                  onCheckedChange={(checked) => updateOptions("includeHiddenColumnsInQuickFilter", checked)}
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filter Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Advanced Filter</CardTitle>
          <CardDescription>
            Configure advanced filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Enable Advanced Filter
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-filter-enableAdvancedFilter">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Enable the advanced filter feature
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.enableAdvancedFilter === true}
                  onCheckedChange={(checked) => updateOptions("enableAdvancedFilter", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">
                  Include Hidden Columns in Advanced Filter
                  <DocLink href="https://www.ag-grid.com/react-data-grid/grid-options/#reference-filter-includeHiddenColumnsInAdvancedFilter">
                    docs
                  </DocLink>
                </FormLabel>
                <FormDescription className="text-xs">
                  Include hidden columns in advanced filter
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.includeHiddenColumnsInAdvancedFilter === true}
                  onCheckedChange={(checked) => updateOptions("includeHiddenColumnsInAdvancedFilter", checked)}
                />
              </FormControl>
            </FormItem>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
