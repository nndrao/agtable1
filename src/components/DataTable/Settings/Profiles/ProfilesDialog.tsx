import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGrid } from "../../hooks/useGridStore";
import { GridProfile } from "../../store/gridStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Trash2, Plus } from "lucide-react";

interface ProfilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfilesDialog({ open, onOpenChange }: ProfilesDialogProps) {
  const {
    profiles,
    selectedProfileId,
    selectProfile,
    deleteProfile,
    createProfileFromCurrent,
  } = useGrid();
  
  const [newProfileName, setNewProfileName] = useState("");
  
  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfileFromCurrent(newProfileName.trim());
      setNewProfileName("");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grid Profiles</DialogTitle>
          <DialogDescription>
            Manage your saved grid profiles. Profiles store column settings, filters, sorting, and display preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-profile">Create New Profile</Label>
              <div className="flex items-center mt-1 space-x-2">
                <Input
                  id="new-profile"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Profile name"
                />
                <Button 
                  size="sm" 
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Saved Profiles</Label>
              <ScrollArea className="h-[200px] mt-1 rounded-md border">
                <div className="p-4 space-y-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center">
                        {selectedProfileId === profile.id && (
                          <Check className="h-4 w-4 mr-2 text-primary" />
                        )}
                        <span className={selectedProfileId === profile.id ? "font-medium" : ""}>
                          {profile.name}
                          {profile.isDefault && " (Default)"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedProfileId !== profile.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectProfile(profile.id)}
                          >
                            Apply
                          </Button>
                        )}
                        {!profile.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProfile(profile.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {profiles.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No profiles saved yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
