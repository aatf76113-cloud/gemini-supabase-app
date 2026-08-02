import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { pwaService } from './services/pwaService';
import { ErrorBoundary } from './components/ErrorBoundary';

// Global uncaught error and unhandled promise rejection safety guard
if (typeof window !== 'undefined') {
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.error('[Global window.onerror]:', msg, error);
    return true; // prevent default crash behavior on older webviews
  };

  window.onunhandledrejection = function (event) {
    console.warn('[Global window.onunhandledrejection]:', event.reason);
    if (event.preventDefault) event.preventDefault();
  };

  window.addEventListener('error', (event) => {
    console.error('[Global App Error Caught]:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global Unhandled Promise Rejection]:', event.reason);
    if (event.preventDefault) event.preventDefault();
  });
}

// Register Service Worker for PWA Offline Mode & Push Notifications
pwaService.registerServiceWorker();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary language="ar">
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
