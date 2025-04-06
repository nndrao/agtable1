import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColDef } from 'ag-grid-community';
import { monospacefonts, DEFAULT_SPACING, DEFAULT_FONT_SIZE } from '../utils/constants';

// Define the profile type
export interface GridProfile {
  id: string;
  name: string;
  columnState: any[];
  filterModel: any;
  sortModel: any;
  spacing: number;
  fontSize: number;
  fontFamily: string;
  gridOptions: any;
  isDefault?: boolean;
}

// Define the grid store state
interface GridState {
  // Current settings
  spacing: number;
  fontSize: number;
  selectedFont: { name: string; value: string };
  darkMode: boolean;

  // Grid state
  columnState: any[];
  filterModel: any;
  sortModel: any;
  gridOptions: any;

  // Profiles
  profiles: GridProfile[];
  selectedProfileId: string | null;

  // Actions
  setSpacing: (spacing: number) => void;
  setFontSize: (fontSize: number) => void;
  setSelectedFont: (font: { name: string; value: string }) => void;
  setDarkMode: (darkMode: boolean) => void;

  // Grid state actions
  setColumnState: (columnState: any[]) => void;
  setFilterModel: (filterModel: any) => void;
  setSortModel: (sortModel: any) => void;
  setGridOptions: (gridOptions: any) => void;

  // Profile actions
  addProfile: (profile: Omit<GridProfile, 'id'>) => void;
  updateProfile: (id: string, profile: Partial<GridProfile>) => void;
  deleteProfile: (id: string) => void;
  selectProfile: (id: string) => void;

  // Save current settings to selected profile
  saveToProfile: () => void;

  // Load settings from selected profile
  loadFromProfile: (id: string) => void;

  // Create a profile from current settings
  createProfileFromCurrent: (name: string) => void;
}

// Create the default profile
const defaultProfile: GridProfile = {
  id: 'default',
  name: 'Default',
  columnState: [],
  filterModel: {},
  sortModel: [],
  spacing: DEFAULT_SPACING,
  fontSize: DEFAULT_FONT_SIZE,
  fontFamily: monospacefonts[0].value,
  gridOptions: {},
  isDefault: true
};

// Create the grid store
export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      // Initial state
      spacing: DEFAULT_SPACING,
      fontSize: DEFAULT_FONT_SIZE,
      selectedFont: monospacefonts[0],
      darkMode: false,

      columnState: [],
      filterModel: {},
      sortModel: [],
      gridOptions: {},

      profiles: [defaultProfile],
      selectedProfileId: 'default',

      // Actions
      setSpacing: (spacing) => set({ spacing }),
      setFontSize: (fontSize) => set({ fontSize }),
      setSelectedFont: (font) => set({ selectedFont: font }),
      setDarkMode: (darkMode) => set({ darkMode }),

      // Grid state actions
      setColumnState: (columnState) => set({ columnState }),
      setFilterModel: (filterModel) => set({ filterModel }),
      setSortModel: (sortModel) => set({ sortModel }),
      setGridOptions: (gridOptions) => set({ gridOptions }),

      // Profile actions
      addProfile: (profile) => {
        const id = `profile-${Date.now()}`;
        set((state) => ({
          profiles: [...state.profiles, { ...profile, id }]
        }));
        return id;
      },

      updateProfile: (id, profile) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...profile } : p
          )
        }));
      },

      deleteProfile: (id) => {
        // Don't allow deleting the default profile
        if (id === 'default') return;

        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          // If the deleted profile was selected, select the default profile
          selectedProfileId: state.selectedProfileId === id ? 'default' : state.selectedProfileId
        }));
      },

      selectProfile: (id) => {
        set({ selectedProfileId: id });
        get().loadFromProfile(id);
      },

      saveToProfile: () => {
        const { selectedProfileId, spacing, fontSize, selectedFont, columnState, filterModel, sortModel, gridOptions } = get();

        if (!selectedProfileId) return;

        // Save current settings to the selected profile
        // This is the only place where grid state is saved to a profile
        get().updateProfile(selectedProfileId, {
          spacing,
          fontSize,
          fontFamily: selectedFont.value,
          columnState,
          filterModel,
          sortModel,
          gridOptions
        });
      },

      loadFromProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);

        if (!profile) return;

        // Update the store with profile settings
        // This doesn't automatically update the grid - that happens separately
        // when the component uses these values
        set({
          spacing: profile.spacing,
          fontSize: profile.fontSize,
          selectedFont: monospacefonts.find((f) => f.value === profile.fontFamily) || monospacefonts[0],
          columnState: profile.columnState,
          filterModel: profile.filterModel,
          sortModel: profile.sortModel,
          gridOptions: profile.gridOptions || {}
        });

        // Note: The grid will be updated by the component when it detects these state changes
        // This maintains the one-way data flow: store -> grid
      },

      createProfileFromCurrent: (name) => {
        const { spacing, fontSize, selectedFont, columnState, filterModel, sortModel, gridOptions } = get();

        const profileId = get().addProfile({
          name,
          spacing,
          fontSize,
          fontFamily: selectedFont.value,
          columnState,
          filterModel,
          sortModel,
          gridOptions
        });

        set({ selectedProfileId: profileId });
      }
    }),
    {
      name: 'grid-store', // name of the item in localStorage
      partialize: (state) => ({
        // Only persist these fields
        profiles: state.profiles,
        selectedProfileId: state.selectedProfileId,
        // Also persist the current settings so they're available on reload
        spacing: state.spacing,
        fontSize: state.fontSize,
        selectedFont: state.selectedFont,
        columnState: state.columnState,
        filterModel: state.filterModel,
        sortModel: state.sortModel,
        gridOptions: state.gridOptions
      }),
      // This function runs when the store is hydrated from localStorage
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated, we want to make sure the selected profile is loaded
        if (state && state.selectedProfileId) {
          console.log(`Rehydrated store with profile: ${state.selectedProfileId}`);

          // Find the selected profile
          const profile = state.profiles.find(p => p.id === state.selectedProfileId);

          // If we found the profile, load its settings
          if (profile) {
            // These settings will override what was loaded from localStorage
            state.spacing = profile.spacing;
            state.fontSize = profile.fontSize;
            state.selectedFont = state.selectedFont; // Keep the font that was loaded
            state.columnState = profile.columnState;
            state.filterModel = profile.filterModel;
            state.sortModel = profile.sortModel;
            state.gridOptions = profile.gridOptions || {};
          }
        }
      }
    }
  )
);
