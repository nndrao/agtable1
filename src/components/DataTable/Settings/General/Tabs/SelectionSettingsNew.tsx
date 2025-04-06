import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Row Click Selection</Label>
                <p className="text-sm text-muted-foreground">Select rows by clicking anywhere</p>
              </div>
              <Switch
                checked={options.suppressRowClickSelection !== true}
                onCheckedChange={(checked) => updateOptions("suppressRowClickSelection", !checked)}
              />
            </div>

            {options.rowSelection === "multiple" && (
              <>
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Multi Row Selection</Label>
                    <p className="text-sm text-muted-foreground">Select multiple rows without Ctrl key</p>
                  </div>
                  <Switch
                    checked={options.multiRowSelection === true}
                    onCheckedChange={(checked) => updateOptions("multiRowSelection", checked)}
                  />
                </div>

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
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Row Highlight</Label>
            <p className="text-sm text-muted-foreground">Highlight selected rows</p>
          </div>
          <Switch
            checked={options.suppressRowHighlight !== true}
            onCheckedChange={(checked) => updateOptions("suppressRowHighlight", !checked)}
          />
        </div>

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
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Checkbox Selection</Label>
            <p className="text-sm text-muted-foreground">Show checkboxes for selection</p>
          </div>
          <Switch
            checked={options.checkboxSelection === true}
            onCheckedChange={(checked) => updateOptions("checkboxSelection", checked)}
          />
        </div>

        {options.checkboxSelection && (
          <>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Header Checkbox</Label>
                <p className="text-sm text-muted-foreground">Show checkbox in header</p>
              </div>
              <Switch
                checked={options.headerCheckboxSelection === true}
                onCheckedChange={(checked) => updateOptions("headerCheckboxSelection", checked)}
              />
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Header Checkbox Selection Filtered Only</Label>
                <p className="text-sm text-muted-foreground">Header checkbox selects only filtered rows</p>
              </div>
              <Switch
                checked={options.headerCheckboxSelectionFilteredOnly === true}
                onCheckedChange={(checked) => updateOptions("headerCheckboxSelectionFilteredOnly", checked)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
