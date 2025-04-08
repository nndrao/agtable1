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
    <div className="flex h-full overflow-hidden">
      {/* Left panel - Categories */}
      <div className="w-44 border-r border-border/40 bg-gradient-to-b from-background to-muted/5 flex flex-col">
        {/* Search box */}
        <div className="p-3 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-7 h-8 text-xs rounded-full bg-background border-border/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories list */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2 text-left transition-colors text-xs rounded-r-full",
                  activeCategory === category.id && !searchQuery
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted/40"
                )}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSearchQuery("");
                }}
              >
                <span className={activeCategory === category.id && !searchQuery ? "font-medium" : ""}>{category.name}</span>
                {changedPropertiesByCategory[category.id] > 0 && (
                  <Badge variant="outline" className="h-4 px-1.5 bg-primary/10 text-primary text-[10px] rounded-full">
                    {changedPropertiesByCategory[category.id]}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel - Properties */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background/80 to-background">
        {searchQuery && (
          <div className="px-4 py-2 border-b border-border/40 bg-muted/5">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3 w-3" />
              Results for <span className="text-foreground font-medium">"{searchQuery}"</span>
            </p>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-0 px-1">
            <table className="w-full property-grid-table">
              <tbody>
                {filteredProperties.map((property) => (
                  <tr
                    key={property.path}
                    className={cn(
                      "border-b border-border/30 hover:bg-muted/10 transition-colors",
                      changedProperties.has(property.path) && "bg-primary/5 modified"
                    )}
                  >
                    <td className="py-2 px-4 w-[45%]">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 truncate">
                          <span className="text-xs font-medium truncate">{property.name}</span>
                          {property.description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-primary/70 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs text-xs">
                                  <p>{property.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {changedProperties.has(property.path) && (
                            <span className="h-2 w-2 rounded-full bg-primary/80 ml-1 animate-pulse" title="Modified" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <PropertyEditor
                        property={property}
                        onChange={onPropertyChange}
                      />
                    </td>
                  </tr>
                ))}

                {filteredProperties.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {searchQuery ? (
                          <>
                            <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No properties match your search</p>
                          </>
                        ) : (
                          <>
                            <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="8" height="8" x="2" y="2" rx="2"/><path d="M14 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/><path d="M20 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/><path d="M2 14c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M2 20c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M14 14c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M14 20c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/></svg>
                            </div>
                            <p className="text-sm text-muted-foreground">No properties in this category</p>
                          </>
                        )}
                      </div>
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
