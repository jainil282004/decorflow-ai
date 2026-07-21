import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls the main app scroll container (or window) to top on route change. */
export function ScrollToTop({ containerSelector = 'main' }: { containerSelector?: string }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const el = document.querySelector(containerSelector);
    if (el instanceof HTMLElement) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, containerSelector]);

  return null;
}
