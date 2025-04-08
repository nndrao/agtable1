import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PropertyEditor } from "./PropertyEditors";

// Types for our property grid
export interface PropertyCategory {
  id: string;
  name: string;
  description?: string;
}

export interface PropertyItem {
  path: string;
  name: string;
  description?: string;
  category: string;
  type: "string" | "number" | "boolean" | "select" | "object";
  options?: string[];
  value: any;
}

interface PropertyGridProps {
  properties: PropertyItem[];
  categories: PropertyCategory[];
  changedProperties: Set<string>;
  onPropertyChange: (path: string, value: any) => void;
}

export function PropertyGrid({
  properties,
  categories,
  changedProperties,
  onPropertyChange,
}: PropertyGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );

  // Filter properties based on search query and active category
  const filteredProperties = properties.filter((property) => {
    // If there's a search query, filter by it
    if (searchQuery) {
      return (
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Otherwise, filter by active category
    return property.category === activeCategory;
  });

  // Count changed properties by category
  const changedPropertiesByCategory = categories.reduce((acc, category) => {
    const count = properties.filter(
      (property) =>
        property.category === category.id &&
        changedProperties.has(property.path)
    ).length;

    acc[category.id] = count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-full border rounded-md overflow-hidden">
      {/* Left panel - Categories */}
      <div className="w-44 border-r bg-muted/10 flex flex-col">
        {/* Search box */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-7 h-7 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories list */}
        <ScrollArea className="flex-1">
          <div className="py-1">
            {categories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-1.5 text-left transition-colors text-xs",
                  activeCategory === category.id && !searchQuery
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSearchQuery("");
                }}
              >
                <span className="font-medium">{category.name}</span>
                {changedPropertiesByCategory[category.id] > 0 && (
                  <Badge variant="outline" className="h-4 px-1 bg-primary/10 text-primary text-[10px]">
                    {changedPropertiesByCategory[category.id]}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel - Properties */}
      <div className="flex-1 flex flex-col">
        {searchQuery && (
          <div className="px-3 py-1 border-b bg-muted/10">
            <p className="text-xs text-muted-foreground">
              Search results for "{searchQuery}"
            </p>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-0">
            <table className="w-full property-grid-table">
              <tbody>
                {filteredProperties.map((property) => (
                  <tr
                    key={property.path}
                    className={cn(
                      "border-b hover:bg-muted/20 transition-colors",
                      changedProperties.has(property.path) && "bg-primary/5 modified"
                    )}
                  >
                    <td className="py-1.5 px-3 w-[45%]">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 truncate">
                          <span className="text-xs font-medium truncate">{property.name}</span>
                          {property.description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs text-xs">
                                  <p>{property.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {changedProperties.has(property.path) && (
                            <span className="h-2 w-2 rounded-full bg-primary ml-1" title="Modified" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      <PropertyEditor
                        property={property}
                        onChange={onPropertyChange}
                      />
                    </td>
                  </tr>
                ))}

                {filteredProperties.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-muted-foreground text-xs">
                      {searchQuery
                        ? "No properties match your search"
                        : "No properties in this category"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
