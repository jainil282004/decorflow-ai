import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import { Icon } from './ui/icon';
import { navigationConfig } from '../config/navigation';
import { useAuthStore } from '../stores/authStore';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-md border border-input transition-colors w-full md:w-64"
      >
        <Icon name="Search" className="h-4 w-4" />
        <span className="flex-1 text-left hidden sm:inline-block">Search...</span>
        <span className="hidden sm:inline-block text-xs bg-background px-1.5 py-0.5 rounded border text-muted-foreground/70">
          <kbd className="font-sans">⌘</kbd> K
        </span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {navigationConfig.map((group) => {
            // Filter items based on permissions
            const availableItems = group.items.filter(
              (item) => !item.permissions || item.permissions.every((p) => hasPermission(p))
            );

            if (availableItems.length === 0) return null;

            return (
              <CommandGroup key={group.label} heading={group.label}>
                {availableItems.map((item) => (
                  <CommandItem key={item.path} onSelect={() => handleSelect(item.path)}>
                    <Icon name={item.icon} className="mr-2 h-4 w-4" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

          <CommandSeparator />
          <CommandGroup heading="System">
            <CommandItem onSelect={() => handleSelect('/settings/organization')}>
              <Icon name="Settings" className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/profile')}>
              <Icon name="User" className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
