import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navigationConfig } from '../config/navigation';
import { useAuthStore } from '../stores/authStore';
import { useOrganization } from '../features/saas/api/saasApi';
import { Icon } from '../components/ui/icon';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed, isMobileOpen, setMobileOpen }: SidebarProps) {
  const { hasPermission } = useAuthStore();
  const { data: organization } = useOrganization();
  const location = useLocation();
  const navigate = useNavigate();
  const orgName = organization?.name || 'DecorFlow';

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isItemActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const NavButton = ({
    item,
    isActive,
  }: {
    item: { label: string; path: string; icon: any };
    isActive: boolean;
  }) => {
    const button = (
      <button
        className={cn(
          'w-full flex items-center justify-start text-sm transition-all duration-200 rounded-lg relative group',
          collapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5',
          isActive
            ? 'bg-primary/10 text-primary font-medium shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
        )}
        onClick={() => handleNavigate(item.path)}
        title={collapsed ? item.label : undefined}
      >
        {isActive && !collapsed && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <Icon
          name={item.icon}
          className={cn(
            'h-[18px] w-[18px] shrink-0 stroke-[1.5] transition-colors',
            !collapsed && 'mr-3',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {item.label}
          </motion.span>
        )}
        {isActive && collapsed && (
          <motion.div
            layoutId="sidebar-active-dot"
            className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-[3px] h-3 bg-primary rounded-l-full"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-14 items-center justify-between px-3 border-b border-sidebar-border">
        <div
          className="flex items-center gap-3 overflow-hidden cursor-pointer w-full p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          onClick={() => handleNavigate('/dashboard')}
        >
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary p-2 rounded-lg shadow-sm border border-primary/10">
            <Icon name="Box" className="h-4 w-4 shrink-0 stroke-[1.5]" />
          </div>
          {!collapsed && (
            <motion.div
              className="flex flex-col overflow-hidden"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <span className="text-sm font-serif font-medium truncate leading-none">
                {orgName}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                Workspace
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        <TooltipProvider>
          <Accordion
            type="multiple"
            defaultValue={navigationConfig.map((g) => g.label)}
            className="w-full space-y-1"
          >
            {navigationConfig.map((group, index) => {
              const availableItems = group.items.filter(
                (item) => !item.permissions || item.permissions.every((p) => hasPermission(p))
              );

              if (availableItems.length === 0) return null;

              if (group.label === 'Overview') {
                return (
                  <div key={group.label} className={cn('px-3', collapsed && 'px-2')}>
                    <div className="space-y-0.5">
                      {availableItems.map((item) => (
                        <NavButton key={item.path} item={item} isActive={isItemActive(item.path)} />
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <AccordionItem
                  key={group.label}
                  value={group.label}
                  className={cn('border-none', collapsed ? 'px-2' : 'px-3')}
                >
                  {!collapsed ? (
                    <AccordionTrigger className="py-2 hover:no-underline text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                      {group.label}
                    </AccordionTrigger>
                  ) : (
                    <>{index > 0 && <div className="h-px bg-sidebar-border my-4 mx-1" />}</>
                  )}

                  <AccordionContent className={cn('pb-0', collapsed && 'pt-0')}>
                    <div className="space-y-0.5 mt-0.5">
                      {availableItems.map((item) => (
                        <NavButton key={item.path} item={item} isActive={isItemActive(item.path)} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TooltipProvider>
      </div>

      <div className="hidden md:flex p-3 border-t border-sidebar-border items-center">
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:block h-screen sticky top-0 shrink-0 z-20"
      >
        <SidebarContent />
      </motion.aside>

      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-72 max-w-[85%] h-full flex flex-col shadow-2xl"
            >
              <SidebarContent />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-[-52px] text-foreground bg-card/90 backdrop-blur-md hover:bg-card rounded-full shadow-lg border border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                <Icon name="X" className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
