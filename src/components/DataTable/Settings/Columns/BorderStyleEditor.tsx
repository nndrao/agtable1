import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`border-${title.toLowerCase()}-enabled`}
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
          <Label
            htmlFor={`border-${title.toLowerCase()}-enabled`}
            className={cn(
              "text-sm font-medium",
              !enabled && "text-muted-foreground"
            )}
          >
            {title} Border
          </Label>
        </div>
      </div>

      {enabled && (
        <div className="grid grid-cols-3 gap-2 pl-6 mt-1">
          <div>
            <Label className="text-xs mb-1 block">Width</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={width}
              onChange={(e) => onWidthChange(parseInt(e.target.value) || 1)}
              className="h-8 text-xs rounded-md bg-background border-border/60"
            />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Style</Label>
            <Select value={style} onValueChange={onStyleChange}>
              <SelectTrigger className="h-8 text-xs rounded-md bg-background border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="double">Double</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Color</Label>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-md border border-border/60 cursor-pointer overflow-hidden shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <Input
                    type="color"
                    id={`border-${title.toLowerCase()}-color`}
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </div>
              </div>
              <Input
                type="text"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="h-8 flex-1 text-xs rounded-md bg-background border-border/60"
                placeholder="#RRGGBB"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
