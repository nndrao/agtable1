import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BorderStyleEditorProps {
  title: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  width: number;
  onWidthChange: (width: number) => void;
  style: string;
  onStyleChange: (style: string) => void;
  color: string;
  onColorChange: (color: string) => void;
}

export function BorderStyleEditor({
  title,
  enabled,
  onEnabledChange,
  width,
  onWidthChange,
  style,
  onStyleChange,
  color,
  onColorChange,
}: BorderStyleEditorProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 w-16">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`border-${title}-enabled`}
            checked={enabled}
            onCheckedChange={(checked) => onEnabledChange(checked === true)}
          />
          <Label 
            htmlFor={`border-${title}-enabled`}
            className="text-sm cursor-pointer"
          >
            {title}
          </Label>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-3 gap-2">
        <Input
          type="number"
          min={1}
          max={10}
          value={width}
          onChange={(e) => onWidthChange(parseInt(e.target.value) || 1)}
          disabled={!enabled}
          className="h-8 text-sm"
        />
        
        <Select
          value={style}
          onValueChange={onStyleChange}
          disabled={!enabled}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex space-x-1 items-center">
          <div 
            className={cn(
              "h-5 w-5 rounded border cursor-pointer",
              !enabled && "opacity-50 cursor-not-allowed"
            )}
            style={{ backgroundColor: color }}
            onClick={() => {
              if (enabled) {
                // Simulate click on the hidden color input
                document.getElementById(`border-${title}-color`)?.click();
              }
            }}
          />
          <Input
            id={`border-${title}-color`}
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={!enabled}
            className="hidden"
          />
          <Input
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={!enabled}
            className="h-8 text-sm flex-1"
          />
        </div>
      </div>
    </div>
  );
}
