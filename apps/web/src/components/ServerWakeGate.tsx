import { useEffect, useState, type ReactNode } from 'react';
import { env } from '../config/env';

type GateState = 'checking' | 'ready' | 'slow';

const HEALTH_URL = env.VITE_API_URL ? `${env.VITE_API_URL}/health` : '/health';
const POLL_MS = 2500;
const SLOW_HINT_MS = 3000;

async function pingHealth(signal: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(HEALTH_URL, {
      method: 'GET',
      cache: 'no-store',
      signal,
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    return body?.status === 'ok' || res.ok;
  } catch {
    return false;
  }
}

/**
 * Free-tier hosts (e.g. Render) can take 30–60s to wake. Show an explanatory
 * splash instead of a blank screen until /health responds.
 *
 * Skipped in Vite dev so a stopped local API does not block the UI.
 */
export function ServerWakeGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>(() => (import.meta.env.DEV ? 'ready' : 'checking'));

  useEffect(() => {
    if (import.meta.env.DEV) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setState((s) => (s === 'ready' ? s : 'slow'));
    }, SLOW_HINT_MS);

    const run = async () => {
      while (!cancelled) {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 20000);
        const ok = await pingHealth(ctrl.signal);
        clearTimeout(timeout);
        if (cancelled) return;
        if (ok) {
          setState('ready');
          return;
        }
        setState('slow');
        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, POLL_MS);
        });
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (state === 'ready') {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(176,141,87,0.14), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(110,42,50,0.08), transparent 50%)',
        }}
      />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-5">
        <img src="/logo-mark.png" alt="DecorFlow" className="h-12 w-12 object-contain" />
        <h1 className="font-serif text-3xl tracking-tight text-[#231F1C]">DecorFlow</h1>
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[#B08D57]/30 border-t-[#B08D57]"
          aria-hidden
        />
        <div className="space-y-2">
          <p className="text-base font-medium text-[#231F1C]">Waking up the server…</p>
          <p className="text-sm leading-relaxed text-[#6B6560]">
            This can take up to a minute on the free hosting tier. The app is not broken — please
            wait while the demo server starts.
          </p>
          {state === 'slow' && (
            <p className="pt-1 text-xs text-[#6B6560]/80">Still starting — hang tight.</p>
          )}
        </div>
      </div>
    </div>
  );
}
