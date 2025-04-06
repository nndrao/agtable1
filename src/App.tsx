import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DataTable } from "@/components/DataTable/DataTable";

function App() {
  const [fixedIncomeData, setFixedIncomeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<any[]>([]);

  // Load data from the JSON file
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/fixedIncomeData.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFixedIncomeData(data);
        console.log(`Loaded ${data.length} fixed income positions`);

        // Generate columns from the first data item
        if (data.length > 0) {
          const firstItem = data[0];
          const cols = Object.keys(firstItem).map(key => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
            filter: true,
            sortable: true,
            resizable: true,
            // Add special formatting for fields that look like numbers
            ...(typeof firstItem[key] === 'number' && key.toLowerCase().includes('price') ? {
              valueFormatter: (params: any) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(params.value);
              }
            } : {})
          }));
          setColumns(cols);
        }
      } catch (err) {
        setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`);
        console.error('Error loading fixed income data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get the current theme
  const AppContent = () => {
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === "dark";

    if (isLoading) {
      return <div className="flex items-center justify-center h-full">Loading data...</div>;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    return (
      <div className="flex h-full flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Fixed Income Portfolio</h1>
          <p className="text-muted-foreground">
            {fixedIncomeData.length} positions | {columns.length} displayed fields
          </p>
        </div>
        <div className="flex-1">
          <DataTable
            columns={columns}
            data={columns}
            rowData={fixedIncomeData}
            isDark={isDarkMode}
            gridOptions={{
              // Performance options for large datasets
              suppressColumnVirtualisation: false,
              enableCellTextSelection: true,
              ensureDomOrder: false,
              rowBuffer: 20,
              pagination: false, // Disable pagination to show all rows
              cacheQuickFilter: true,
              // Infinite row model would be better for this scale of data
              // but using client-side for simplicity in this demo
              rowModelType: 'clientSide',
              // Preloading rows for better scrolling experience
              infiniteInitialRowCount: 1000
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <Header />
          <main className="flex-1 container mx-auto p-5">
            <AppContent />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;