import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { ServerWakeGate } from './components/ServerWakeGate';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ServerWakeGate>
        <App />
      </ServerWakeGate>
    </ThemeProvider>
  </React.StrictMode>
);
