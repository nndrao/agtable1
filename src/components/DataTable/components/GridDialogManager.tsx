import React, { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ProfilesDialog } from '../Settings/Profiles/ProfilesDialog';
import { PropertyGridDialog } from '../Settings/General/PropertyGridDialog';
import { ColumnSettingsDialog } from '../Settings/Columns/ColumnSettingsDialog';

interface GridDialogManagerProps {
  gridRef: React.RefObject<AgGridReact>;
  applySettings: () => void;
  profilesDialogOpen: boolean;
  generalSettingsOpen: boolean;
  columnSettingsOpen: boolean;
  setProfilesDialogOpen: (open: boolean) => void;
  setGeneralSettingsOpen: (open: boolean) => void;
  setColumnSettingsOpen: (open: boolean) => void;
}

/**
 * Component that manages all grid-related dialogs
 */
export const GridDialogManager = React.memo(({
  gridRef,
  applySettings,
  profilesDialogOpen,
  generalSettingsOpen,
  columnSettingsOpen,
  setProfilesDialogOpen,
  setGeneralSettingsOpen,
  setColumnSettingsOpen
}: GridDialogManagerProps) => {
  // Dialog open/close handlers
  const handleProfilesDialogOpenChange = useCallback((isOpen: boolean) => {
    setProfilesDialogOpen(isOpen);
  }, [setProfilesDialogOpen]);

  const handleGeneralSettingsOpenChange = useCallback((isOpen: boolean) => {
    setGeneralSettingsOpen(isOpen);
    if (!isOpen) {
      console.log("Triggering settings apply after General Settings close");
      applySettings();
    }
  }, [setGeneralSettingsOpen, applySettings]);

  const handleColumnSettingsOpenChange = useCallback((isOpen: boolean) => {
    setColumnSettingsOpen(isOpen);
    if (!isOpen) {
      console.log("Triggering settings apply after Column Settings close");
      applySettings();
    }
  }, [setColumnSettingsOpen, applySettings]);

  return (
    <>
      <ProfilesDialog
        open={profilesDialogOpen}
        onOpenChange={handleProfilesDialogOpenChange}
      />

      <PropertyGridDialog
        open={generalSettingsOpen}
        onOpenChange={handleGeneralSettingsOpenChange}
      />

      <ColumnSettingsDialog
        open={columnSettingsOpen}
        onOpenChange={handleColumnSettingsOpenChange}
        gridRef={gridRef}
      />
    </>
  );
});

GridDialogManager.displayName = 'GridDialogManager';


