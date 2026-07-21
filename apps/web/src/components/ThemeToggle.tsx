import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { Icon } from './ui/icon';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      title="Toggle theme"
    >
      {theme === 'light' ? (
        <Icon name="Moon" className="h-5 w-5 transition-all" />
      ) : (
        <Icon name="Sun" className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
