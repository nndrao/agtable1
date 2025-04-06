import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SelectionSettingsProps {
  options: any;
  updateOptions: (path: string, value: any) => void;
}

export function SelectionSettings({ options, updateOptions }: SelectionSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Row Selection</h3>
        <p className="text-sm text-muted-foreground">
          Configure how rows can be selected in the grid.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Row Selection Mode</Label>
          <RadioGroup
            value={options.rowSelection || "none"}
            onValueChange={(value) => updateOptions("rowSelection", value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">None</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single">Single row</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple" id="multiple" />
              <Label htmlFor="multiple">Multiple rows</Label>
            </div>
          </RadioGroup>
        </div>

        {options.rowSelection && options.rowSelection !== "none" && (
          <>
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Row Click Selection
                </FormLabel>
                <FormDescription>
                  Select rows by clicking anywhere
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.suppressRowClickSelection !== true}
                  onCheckedChange={(checked) => updateOptions("suppressRowClickSelection", !checked)}
                />
              </FormControl>
            </FormItem>

            {options.rowSelection === "multiple" && (
              <>
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Row Multi-Select with Click
                    </FormLabel>
                    <FormDescription>
                      Select multiple rows without Ctrl key
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={options.rowMultiSelectWithClick === true}
                      onCheckedChange={(checked) => updateOptions("rowMultiSelectWithClick", checked)}
                    />
                  </FormControl>
                </FormItem>

                <div className="space-y-2">
                  <Label htmlFor="rowDeselection">Row Deselection</Label>
                  <Select
                    value={options.suppressRowDeselection === true ? "disabled" : "enabled"}
                    onValueChange={(value) => updateOptions("suppressRowDeselection", value === "disabled")}
                  >
                    <SelectTrigger id="rowDeselection">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Allow deselecting rows by clicking
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Selection Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Configure how selection is displayed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Row Highlight
            </FormLabel>
            <FormDescription>
              Highlight selected rows
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.suppressRowHighlight !== true}
              onCheckedChange={(checked) => updateOptions("suppressRowHighlight", !checked)}
            />
          </FormControl>
        </FormItem>

        <div className="space-y-2">
          <Label htmlFor="rowStyle">Row Selection Style</Label>
          <Select
            value={options.rowStyle || "row"}
            onValueChange={(value) => updateOptions("rowStyle", value)}
          >
            <SelectTrigger id="rowStyle">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="row">Full Row</SelectItem>
              <SelectItem value="checkbox">Checkbox Only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How selected rows are highlighted
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Checkbox Selection</h3>
        <p className="text-sm text-muted-foreground">
          Configure checkbox selection options.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              Checkbox Selection
            </FormLabel>
            <FormDescription>
              Show checkboxes for selection
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={options.checkboxSelection === true}
              onCheckedChange={(checked) => updateOptions("checkboxSelection", checked)}
            />
          </FormControl>
        </FormItem>

        {options.checkboxSelection && (
          <>
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Header Checkbox
                </FormLabel>
                <FormDescription>
                  Show checkbox in header
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.headerCheckboxSelection === true}
                  onCheckedChange={(checked) => updateOptions("headerCheckboxSelection", checked)}
                />
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Header Checkbox Selection Filtered Only
                </FormLabel>
                <FormDescription>
                  Header checkbox selects only filtered rows
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={options.headerCheckboxSelectionFilteredOnly === true}
                  onCheckedChange={(checked) => updateOptions("headerCheckboxSelectionFilteredOnly", checked)}
                />
              </FormControl>
            </FormItem>
          </>
        )}
      </div>
    </div>
  );
}
