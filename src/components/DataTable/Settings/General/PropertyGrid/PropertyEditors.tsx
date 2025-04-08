import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyItem } from "./PropertyGrid";

interface PropertyEditorProps {
  property: PropertyItem;
  onChange: (path: string, value: any) => void;
}

export function PropertyEditor({ property, onChange }: PropertyEditorProps) {
  switch (property.type) {
    case "boolean":
      return <BooleanEditor property={property} onChange={onChange} />;
    case "number":
      return <NumberEditor property={property} onChange={onChange} />;
    case "select":
      return <SelectEditor property={property} onChange={onChange} />;
    case "string":
      return <StringEditor property={property} onChange={onChange} />;
    case "object":
      return <ObjectEditor property={property} onChange={onChange} />;
    default:
      return <div className="text-sm text-muted-foreground">Unsupported type</div>;
  }
}

function BooleanEditor({ property, onChange }: PropertyEditorProps) {
  return (
    <div className="flex items-center justify-between property-editor property-editor-boolean">
      <Switch
        checked={property.value === true}
        onCheckedChange={(checked) => onChange(property.path, checked)}
        className="h-5 w-9 data-[state=checked]:bg-primary"
      />
      <span className="text-[10px] text-muted-foreground ml-1 min-w-12 text-right">
        {property.value === true ?
          <span className="text-primary/90 font-medium">Enabled</span> :
          <span className="text-muted-foreground">Disabled</span>}
      </span>
    </div>
  );
}

function NumberEditor({ property, onChange }: PropertyEditorProps) {
  // Check if we have min/max metadata
  const hasRange = property.options && property.options.length >= 2;
  const min = hasRange ? parseFloat(property.options![0]) : 0;
  const max = hasRange ? parseFloat(property.options![1]) : 100;
  const step = property.options && property.options.length >= 3 ? parseFloat(property.options![2]) : 1;

  return (
    <div className="flex items-center gap-1 property-editor property-editor-number">
      {hasRange && (
        <>
          <span className="text-[8px] text-muted-foreground w-5 text-right">{min}</span>
          <Slider
            value={[property.value !== undefined ? property.value : min]}
            min={min}
            max={max}
            step={step}
            onValueChange={(value) => onChange(property.path, value[0])}
            className="flex-1 h-5"
          />
          <span className="text-[8px] text-muted-foreground w-5 text-left">{max}</span>
        </>
      )}
      <Input
        type="number"
        value={property.value !== undefined ? property.value : ""}
        onChange={(e) => {
          const value = parseFloat(e.target.value);
          if (!isNaN(value)) {
            onChange(property.path, value);
          }
        }}
        className="w-14 h-7 text-center text-xs rounded-md bg-background border-border/60"
      />
    </div>
  );
}

function SelectEditor({ property, onChange }: PropertyEditorProps) {
  if (!property.options || property.options.length === 0) {
    return <div className="text-xs text-muted-foreground italic">No options available</div>;
  }

  // Special handling for autoSizeStrategy
  if (property.path === 'autoSizeStrategy') {
    return (
      <div className="property-editor property-editor-select">
        <Select
          value={property.value !== undefined ?
            (typeof property.value === 'object' ? property.value.type : property.value) :
            "none"}
          onValueChange={(value) => {
            if (value === 'none') {
              onChange(property.path, undefined);
            } else {
              onChange(property.path, { type: value });
            }
          }}
        >
          <SelectTrigger className="h-7 text-xs rounded-md bg-background border-border/60">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {property.options.map((option) => (
              <SelectItem key={option} value={option} className="text-xs">
                {option === 'fitCellContents' ? 'Fit Cell Contents' :
                 option === 'fitGridWidth' ? 'Fit Grid Width' :
                 option === 'none' ? 'None' : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Default select editor for other properties
  return (
    <div className="property-editor property-editor-select">
      <Select
        value={property.value !== undefined ? String(property.value) : ""}
        onValueChange={(value) => onChange(property.path, value)}
      >
        <SelectTrigger className="h-6 text-xs">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {property.options.map((option) => (
            <SelectItem key={option} value={option} className="text-xs">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StringEditor({ property, onChange }: PropertyEditorProps) {
  return (
    <div className="property-editor property-editor-string">
      <Input
        value={property.value !== undefined ? property.value : ""}
        onChange={(e) => onChange(property.path, e.target.value)}
        className="h-7 text-xs rounded-md bg-background border-border/60"
      />
    </div>
  );
}

function ObjectEditor({ property, onChange }: PropertyEditorProps) {
  return (
    <div className="flex items-center justify-between property-editor property-editor-object">
      <span className="text-[10px] text-muted-foreground italic">
        {property.value ? "{...}" : "null"}
      </span>
      <button
        className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
        onClick={() => {
          // For now, just show a string representation
          alert(JSON.stringify(property.value, null, 2));
        }}
      >
        View
      </button>
    </div>
  );
}
