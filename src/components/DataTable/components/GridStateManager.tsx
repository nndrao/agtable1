import React, { useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { applySettingsToGrid } from '../utils/gridSettingsUtils';
import { useGridStore } from '../store/gridStore';

interface GridStateManagerProps {
  gridRef: React.RefObject<AgGridReact>;
  gridId: string;
  gridReady: boolean;
  setGridReady: (ready: boolean) => void;
  selectedProfileId: string | null;
  selectedFont: { name: string; value: string };
  fontSize: number;
  spacing: number;
  darkMode: boolean;
  children: React.ReactNode;
}

/**
 * Component that manages grid state and settings application
 * This component doesn't render anything visible, it just manages state
 */
export const GridStateManager = React.memo(({
  gridRef,
  gridId,
  gridReady,
  setGridReady,
  selectedProfileId,
  selectedFont,
  fontSize,
  spacing,
  darkMode,
  children
}: GridStateManagerProps) => {
  // Refs to manage initial load logic
  const gridReadyRef = useRef(false);
  const isHydratedRef = useRef(useGridStore.persist.hasHydrated());
  const didInitialLoadApplyRef = useRef(false);

  // Track the last applied settings to avoid unnecessary updates
  const lastAppliedSettings = useRef({
    gridOptions: null as any,
    columnDefs: null as any,
    columnState: null as any,
    filterModel: null as any
  });

  // Create a memoized applySettingsToGrid function
  const applySettings = useCallback(() => {
    applySettingsToGrid(gridRef, gridReadyRef, lastAppliedSettings);
  }, [gridRef]);

  // Function to check conditions and apply initial settings ONCE
  const checkAndApplyInitialSettings = useCallback(() => {
    console.log(`Checking initial apply: Hydrated=${isHydratedRef.current}, GridReady=${gridReadyRef.current}, InitialApplied=${didInitialLoadApplyRef.current}`);
    if (
      isHydratedRef.current &&
      gridReadyRef.current &&
      !didInitialLoadApplyRef.current
    ) {
      console.log("Conditions met, applying initial settings.");
      applySettings();
      didInitialLoadApplyRef.current = true; // Ensure it only runs once
    }
  }, [applySettings]); // Dependency on the apply function itself

  // Effect to watch hydration status
  const isHydrated = useGridStore.persist.hasHydrated();
  useEffect(() => {
    if (isHydrated && !isHydratedRef.current) {
      console.log("Store hydration detected.");
      isHydratedRef.current = true;
      checkAndApplyInitialSettings();
    }
  }, [isHydrated, checkAndApplyInitialSettings]);

  // Handle grid ready event
  const onGridReady = useCallback(() => {
    setGridReady(true); // Set state as well as ref
    console.log("Grid is ready.");
    gridReadyRef.current = true; // Set the ref

    // Check if initial settings can be applied now
    checkAndApplyInitialSettings();
  }, [setGridReady, checkAndApplyInitialSettings]);

  // Load the selected profile when the component mounts
  // This ensures the grid loads the last selected profile when the app reloads
  useEffect(() => {
    // Only load if we have a selected profile and the grid is ready
    if (gridReady && selectedProfileId) {
      // The settings application effect triggered by onGridReady will handle applying the initial profile state
      console.log(`Profile selected on load: ${selectedProfileId}, applied by trigger.`);
    }
  }, [gridReady, selectedProfileId]); // Keep dependencies simple

  // Set up grid styling
  useEffect(() => {
    // Apply styles to the grid
    const gridElement = document.getElementById(gridId);
    if (gridElement) {
      gridElement.style.setProperty('--ag-font-family', selectedFont.value);
      gridElement.style.setProperty('--ag-font-size', `${fontSize}px`);
      gridElement.style.setProperty('--ag-header-font-size', `${fontSize}px`);
      gridElement.style.setProperty('--ag-spacing', `${spacing}px`);
      
      // Also set a data attribute on the grid element for CSS targeting
      gridElement.dataset.theme = darkMode ? "dark" : "light";
    }

    // Create transitions style element
    const transitionsStyleElement = document.createElement('style');
    transitionsStyleElement.id = `grid-transitions-${gridId}`;
    transitionsStyleElement.textContent = `
      #${gridId}.ag-theme-quartz.ag-no-transitions * {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(transitionsStyleElement);

    // Clean up on unmount
    return () => {
      const transElement = document.getElementById(`grid-transitions-${gridId}`);
      if (transElement) {
        document.head.removeChild(transElement);
      }
    };
  }, [darkMode, selectedFont, gridId, fontSize, spacing]);

  // Clone children and pass additional props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        onGridReady,
        applySettings
      });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
});

GridStateManager.displayName = 'GridStateManager';
