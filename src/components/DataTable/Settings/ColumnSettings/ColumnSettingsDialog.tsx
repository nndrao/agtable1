import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, X, Save, ChevronRight, Columns } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { ColumnTree } from "./ColumnTree";
import { ColumnEditor } from "./ColumnEditor";
import { debounce } from "./utils";
import type { ColumnState, ColumnDefinition } from "./types";
import type { AgGridReact } from "ag-grid-react";

interface ColumnSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridRef: React.RefObject<AgGridReact>;
}

export function ColumnSettingsDialog({
  open,
  onOpenChange,
  gridRef
}: ColumnSettingsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [columnStates, setColumnStates] = useState<Record<string, ColumnState>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const initialStateRef = useRef<Record<string, ColumnState>>({});

  // Initialize column state from grid
  /*
  useEffect(() => {
    if (!open || !gridRef.current?.columnApi) return;

    const columnApi = gridRef.current.columnApi;
    const allColumns = columnApi.getAllColumns() || [];
    
    // Reset states
    const states: Record<string, ColumnState> = {};
    const columnDefs: ColumnDefinition[] = [];

    allColumns.forEach(col => {
      const colDef = col.getColDef();
      const colId = col.getId();
      const colState = columnApi.getColumnState().find(s => s.colId === colId);
      
      // Create column state
      states[colId] = {
        visible: col.isVisible(),
        width: col.getActualWidth(),
        pinned: col.getPinned(),
        sort: colState?.sort || null,
        position: columnApi.getColumnIndex(colId),
        headerName: colDef.headerName || colDef.field || '',
        field: colDef.field || '',
        filter: colDef.filter !== false,
        resizable: colDef.resizable !== false,
        sortable: colDef.sortable !== false,
        headerAlignment: colDef.headerClass || 'left',
        cellAlignment: colDef.cellClass || 'left',
      };

      // Create column definition
      columnDefs.push({
        id: colId,
        field: colDef.field || '',
        headerName: colDef.headerName || colDef.field || '',
        children: [], // Add children if you have grouped columns
      });
    });

    // Update state
    setColumnStates(states);
    initialStateRef.current = JSON.parse(JSON.stringify(states));
    setColumns(columnDefs);
    
    // Clear selected column
    setSelectedColumn(null);
  }, [open, gridRef]);
*/


  // Initialize column state from grid
useEffect(() => {
  if (!open) return;

  console.log('Grid ref:', gridRef.current);
  console.log('Column API available:', !!gridRef.current?.columnApi);
  
  // Wait for next render cycle to ensure grid is fully initialized
  const timeoutId = setTimeout(() => {
    if (!gridRef.current || !gridRef.current.api || !gridRef.current.columnApi) {
      console.warn('Grid or APIs not available');
      return;
    }

  console.log('All columns:', gridRef.current.columnApi.getAllColumns());
    console.log('Column state:', gridRef.current.columnApi.getColumnState());

    
    const columnApi = gridRef.current.columnApi;
    const allColumns = columnApi.getAllColumns();
    
    if (!allColumns || allColumns.length === 0) {
      console.warn('No columns found in the grid');
      return;
    }
    
    // Reset states
    const states: Record<string, ColumnState> = {};
    const columnDefs: ColumnDefinition[] = [];

    allColumns.forEach(col => {
      // Rest of your code...
    });

    // Update state
    setColumnStates(states);
    initialStateRef.current = JSON.parse(JSON.stringify(states));
    setColumns(columnDefs);
    
    // Clear selected column
    setSelectedColumn(null);
  }, 100); // Short delay to ensure grid is ready
  
  return () => clearTimeout(timeoutId);
}, [open, gridRef]);


  
  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query) {
        setColumns(prev => prev.map(col => ({ ...col, hidden: false })));
        return;
      }

      const searchLower = query.toLowerCase();
      setColumns(prev => 
        prev.map(col => ({
          ...col,
          hidden: !col.headerName?.toLowerCase().includes(searchLower) && 
                 !col.field.toLowerCase().includes(searchLower)
        }))
      );
    }, 150),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleColumnStateChange = (columnId: string, changes: Partial<ColumnState>) => {
    setColumnStates(prev => ({
      ...prev,
      [columnId]: { ...prev[columnId], ...changes }
    }));
    setHasChanges(true);
  };

  const handleApply = () => {
    if (!gridRef.current?.columnApi) return;

    const columnApi = gridRef.current.columnApi;
    const gridApi = gridRef.current.api;

    Object.entries(columnStates).forEach(([columnId, state]) => {
      const column = columnApi.getColumn(columnId);
      if (!column) return;

      // Update column visibility
      columnApi.setColumnVisible(columnId, state.visible);

      // Update column width
      columnApi.setColumnWidth(columnId, state.width);

      // Update column pinning
      columnApi.setColumnPinned(columnId, state.pinned);

      // Update column position
      if (typeof state.position === 'number') {
        columnApi.moveColumn(columnId, state.position);
      }

      // Update column definition
      const colDef = column.getColDef();
      colDef.headerName = state.headerName;
      colDef.filter = state.filter;
      colDef.resizable = state.resizable;
      colDef.sortable = state.sortable;
      colDef.headerClass = state.headerAlignment;
      colDef.cellClass = state.cellAlignment;
    });

    // Refresh the grid
    gridApi.refreshHeader();
    gridApi.refreshCells({ force: true });

    setHasChanges(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        setColumnStates(initialStateRef.current);
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1000px] p-0" hideCloseButton>
        <div className="flex h-[600px]">
          {/* Left Panel - Column Tree */}
          <div className="w-[280px] border-r flex flex-col">
            <div className="p-2 border-b bg-muted/40">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search columns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <ColumnTree
                columns={columns}
                columnStates={columnStates}
                selectedColumn={selectedColumn}
                onColumnSelect={setSelectedColumn}
                onColumnStateChange={handleColumnStateChange}
              />
            </ScrollArea>
          </div>

          {/* Right Panel - Column Editor */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/40">
              <div className="flex items-center space-x-2">
                <Columns className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Columns</span>
                {selectedColumn && (
                  <>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {columnStates[selectedColumn]?.headerName || selectedColumn}
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              {selectedColumn ? (
                <ColumnEditor
                  columnId={selectedColumn}
                  state={columnStates[selectedColumn]}
                  onChange={(changes) => handleColumnStateChange(selectedColumn, changes)}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Select a column to edit its properties
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between py-2 px-3 border-t bg-muted/40">
              <div className="flex items-center space-x-2">
                {hasChanges && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs py-0">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  size="sm"
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApply}
                  size="sm"
                  disabled={!hasChanges}
                  className="text-sm"
                >
                  <Save className="mr-2 h-3 w-3" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}