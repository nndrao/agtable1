import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Type,
  Check,
  ChevronsUpDown,
  Settings,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Columns,
  Sliders,
  Text,
  Save,
  BookOpen,
  ChevronDown,
  PanelLeftOpen,
  AlignRight,
  DollarSign,
  Percent,
  Hash,
  Sigma,
  Baseline,
  Binary,
  Plus,
  Minus,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DataTableToolbarProps {
  selectedFont: { name: string; value: string };
  setSelectedFont: (font: { name: string; value: string }) => void;
  monospacefonts: Array<{ name: string; value: string }>;
  spacing: number;
  setSpacing: (value: number) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  isDark?: boolean;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  gridId: string;
  onSaveProfile?: () => void;
  onManageProfiles?: () => void;
  onGeneralSettings?: () => void;
  onColumnSettings?: () => void;
  profiles?: Array<{ id: string; name: string; isDefault?: boolean }>;
  selectedProfileId?: string | null;
  onSelectProfile?: (id: string) => void;
  numericFormatOption: string;
  onNumericFormatChange: (option: string) => void;
}

export function DataTableToolbar({
  selectedFont,
  setSelectedFont,
  monospacefonts,
  spacing,
  setSpacing,
  fontSize,
  setFontSize,
  isDark = false,
  onThemeChange,
  gridId,
  onSaveProfile,
  onManageProfiles,
  onGeneralSettings,
  onColumnSettings,
  profiles = [],
  selectedProfileId,
  onSelectProfile,
  numericFormatOption,
  onNumericFormatChange
}: DataTableToolbarProps) {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark" | "system">(
    isDark ? "dark" : "light"
  );

  // Update current theme when isDark prop changes
  useEffect(() => {
    // Only update if there's a definite mismatch
    if (isDark && currentTheme === "light") {
      setCurrentTheme("dark");
    } else if (!isDark && currentTheme === "dark") {
      setCurrentTheme("light");
    }
  }, [isDark, currentTheme]);

  // Handler for theme changes
  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setCurrentTheme(theme);
    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  // Formatting options
  const formatOptions = [
    { value: 'default', label: 'Default', icon: Baseline },
    { value: 'currency', label: 'Currency ($)', icon: DollarSign },
    { value: 'dec0', label: '0 Decimals', icon: Hash },
    { value: 'dec1', label: '1 Decimal', icon: Hash },
    { value: 'dec2', label: '2 Decimals', icon: Hash },
    { value: 'dec3', label: '3 Decimals', icon: Hash },
    { value: 'dec4', label: '4 Decimals', icon: Hash },
    { value: 'kmb', label: 'K/M/B', icon: Binary }, // Combine K/M/B for simplicity
    { value: 'tick', label: 'Tick (MBS)', icon: Sigma },
  ];

  const currentFormatLabel = formatOptions.find(opt => opt.value === numericFormatOption)?.label || 'Format';

  // Determine the icon component to render
  const CurrentIcon = formatOptions.find(opt => opt.value === numericFormatOption)?.icon || Hash;

  return (
    <div className="flex flex-col border-b bg-card/50">
      <div className="flex h-[60px] items-center justify-end px-4">
        <div className="flex items-center space-x-4">
          {/* Spacing Slider */}
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Spacing</span>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[spacing]}
                  onValueChange={([value]) => {
                    setSpacing(value);
                    // Update display immediately for smooth visual feedback
                    const spacingElement = document.getElementById("spacing");
                    if (spacingElement) {
                      spacingElement.innerText = value.toString();
                    }
                  }}
                  onValueCommit={([value]) => {
                    // Signal that sliding is complete and a full refresh can be done
                    setSpacing(value);
                    const gridElement = document.getElementById(gridId);
                    if (gridElement) {
                      gridElement.dispatchEvent(new CustomEvent('spacing-change-complete', { detail: { value } }));
                    }
                  }}
                  min={4}
                  max={12}
                  step={1}
                  className="w-[100px]"
                />
                <span id="spacing" className="text-xs w-6 text-muted-foreground">{spacing}</span>
              </div>
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="flex items-center space-x-2">
            <Text className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Text Size</span>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]) => {
                    setFontSize(value);
                    // Update display immediately for smooth visual feedback
                    const fontSizeElement = document.getElementById("fontSize");
                    if (fontSizeElement) {
                      fontSizeElement.innerText = value.toString();
                    }
                  }}
                  onValueCommit={([value]) => {
                    // Signal that sliding is complete and a full refresh can be done
                    setFontSize(value);
                    const gridElement = document.getElementById(gridId);
                    if (gridElement) {
                      gridElement.dispatchEvent(new CustomEvent('fontsize-change-complete', { detail: { value } }));
                    }
                  }}
                  min={10}
                  max={20}
                  step={1}
                  className="w-[100px]"
                />
                <span id="fontSize" className="text-xs w-6 text-muted-foreground">{fontSize}</span>
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Font Selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                <Type className="mr-2 h-4 w-4" />
                {selectedFont.name}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command value={selectedFont.value} shouldFilter={false}>
                <CommandInput placeholder="Search font..." />
                <CommandEmpty>No font found.</CommandEmpty>
                <CommandGroup>
                  {monospacefonts.map((font) => (
                    <CommandItem
                      key={font.value}
                      value={font.name.toLowerCase()}
                      onSelect={() => {
                        setSelectedFont(font);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedFont.value === font.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-8" />

          {/* Numeric Format Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-[140px] justify-start">
                {/* Render the selected icon component using JSX */}
                <CurrentIcon className="mr-2 h-4 w-4 opacity-70" />
                <span className="truncate">{currentFormatLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <DropdownMenuLabel>Numeric Formatting</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onNumericFormatChange('default')}>
                  <Baseline className="mr-2 h-4 w-4" />
                  <span>Default</span>
                  {numericFormatOption === 'default' && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNumericFormatChange('currency')}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Currency ($)</span>
                  {numericFormatOption === 'currency' && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Hash className="mr-2 h-4 w-4" />
                    <span>Decimal Places</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => onNumericFormatChange('dec0')}>
                        <span>0 Decimals</span>
                        {numericFormatOption === 'dec0' && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNumericFormatChange('dec1')}>
                        <span>1 Decimal</span>
                        {numericFormatOption === 'dec1' && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNumericFormatChange('dec2')}>
                        <span>2 Decimals</span>
                        {numericFormatOption === 'dec2' && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNumericFormatChange('dec3')}>
                        <span>3 Decimals</span>
                        {numericFormatOption === 'dec3' && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNumericFormatChange('dec4')}>
                        <span>4 Decimals</span>
                        {numericFormatOption === 'dec4' && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                 <DropdownMenuItem onClick={() => onNumericFormatChange('kmb')}>
                  <Binary className="mr-2 h-4 w-4" />
                  <span>K / M / B</span>
                  {numericFormatOption === 'kmb' && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNumericFormatChange('tick')}>
                  <Sigma className="mr-2 h-4 w-4" />
                  <span>Tick (MBS)</span>
                  {numericFormatOption === 'tick' && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>

            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-8" />

          {/* Profile Selector and Buttons */}
          {(profiles.length > 0 || onSaveProfile || onManageProfiles) && (
            <>
              {/* Profile Selector Dropdown */}
              {profiles.length > 0 && onSelectProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>
                        {selectedProfileId
                          ? profiles.find(p => p.id === selectedProfileId)?.name || "Profile"
                          : "Select Profile"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Profiles</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {profiles.map((profile) => (
                      <DropdownMenuItem
                        key={profile.id}
                        onClick={() => onSelectProfile(profile.id)}
                      >
                        {selectedProfileId === profile.id && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        <span>{profile.name}</span>
                        {profile.isDefault && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Default
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    {onManageProfiles && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onManageProfiles}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Manage Profiles</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Save Profile Button */}
              {onSaveProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveProfile}
                  className="ml-2"
                >
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save Profile</span>
                </Button>
              )}

              {/* Manage Profiles Button (only shown if dropdown is not available) */}
              {onManageProfiles && !profiles.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onManageProfiles}
                  className="ml-2"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Profiles</span>
                </Button>
              )}

              <Separator orientation="vertical" className="h-8 ml-2" />
            </>
          )}

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onGeneralSettings && (
                <DropdownMenuItem onClick={onGeneralSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>General Settings</span>
                </DropdownMenuItem>
              )}

              {onColumnSettings && (
                <DropdownMenuItem onClick={onColumnSettings}>
                  <Columns className="mr-2 h-4 w-4" />
                  <span>Column Settings</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => handleThemeChange("light")}
                      >
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                        {currentTheme === "light" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleThemeChange("dark")}
                      >
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                        {currentTheme === "dark" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleThemeChange("system")}
                      >
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>System</span>
                        {currentTheme === "system" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}