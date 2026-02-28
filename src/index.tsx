import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { sendNexusAlert } from '@/lib/nexusWebhook';

// ── NEXUS BRIDGE: Global Error Interceptor ─────────────────────────────────
// Catches errors that fall OUTSIDE the React tree (raw JS crashes, iframe
// escape attempts, unhandled promise rejections).

window.onerror = (message, source, lineno, colno, error) => {
  sendNexusAlert({
    error_message: typeof message === 'string' ? message : String(message),
    stack_trace: error?.stack ?? `${source}:${lineno}:${colno}`,
    component_context: 'window.onerror (global)',
    app_state: {
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
  });
  // Return false to let the browser's default error handling still run
  return false;
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  sendNexusAlert({
    error_message: reason instanceof Error ? reason.message : String(reason),
    stack_trace: reason instanceof Error ? reason.stack : undefined,
    component_context: 'window.onunhandledrejection (global)',
    app_state: {
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
  });
};
// ─────────────────────────────────────────────────────────────────────────────

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);