import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaginationSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function PaginationSettings({ options, updateOptions }: PaginationSettingsProps) {
  // Get pagination options or initialize them
  const pagination = options.pagination || false;
  const paginationPageSize = options.paginationPageSize || 100;
  const paginationAutoPageSize = options.paginationAutoPageSize || false;
  
  // Helper function to update pagination settings
  const updatePagination = (enabled: boolean) => {
    updateOptions("pagination", enabled);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Pagination</h3>
        <p className="text-sm text-muted-foreground">
          Configure how data is paginated in the grid.
        </p>
      </div>
      
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">
            Enable Pagination
          </FormLabel>
          <FormDescription>
            Display data in pages
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={pagination === true}
            onCheckedChange={(checked) => updatePagination(checked)}
          />
        </FormControl>
      </FormItem>
      
      {pagination && (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Page Size Type</Label>
              <RadioGroup
                value={paginationAutoPageSize ? "auto" : "fixed"}
                onValueChange={(value) => {
                  updateOptions("paginationAutoPageSize", value === "auto");
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed page size</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto">Auto page size (fit to height)</Label>
                </div>
              </RadioGroup>
            </div>
            
            {!paginationAutoPageSize && (
              <div className="space-y-2">
                <Label htmlFor="paginationPageSize">Page Size</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="paginationPageSize"
                    type="number"
                    min={1}
                    max={1000}
                    value={paginationPageSize}
                    onChange={(e) => updateOptions("paginationPageSize", parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">rows per page</span>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">Pagination Controls</h3>
            <p className="text-sm text-muted-foreground">
              Configure pagination control options.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Show Page Numbers
                </FormLabel>
                <FormDescription>
                  Display page numbers in controls
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.suppressPaginationPanel !== true}
                  onCheckedChange={(checked) => updateOptions("suppressPaginationPanel", !checked)}
                />
              </FormControl>
            </FormItem>
            
            <div className="space-y-2">
              <Label htmlFor="paginationPageSizeSelector">Page Size Selector</Label>
              <Select
                value={options.paginationPageSizeSelector === true ? "enabled" : "disabled"}
                onValueChange={(value) => updateOptions("paginationPageSizeSelector", value === "enabled")}
              >
                <SelectTrigger id="paginationPageSizeSelector">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Allow users to change page size
              </p>
            </div>
            
            {options.paginationPageSizeSelector && (
              <div className="space-y-2">
                <Label htmlFor="paginationPageSizeOptions">Page Size Options</Label>
                <Input
                  id="paginationPageSizeOptions"
                  placeholder="e.g., 10,25,50,100"
                  value={(options.paginationPageSizeOptions || [10, 25, 50, 100]).join(",")}
                  onChange={(e) => {
                    const values = e.target.value.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                    updateOptions("paginationPageSizeOptions", values);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of page sizes
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
