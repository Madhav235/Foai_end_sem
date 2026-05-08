import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import './styles.css';

const App = lazy(() => import('./App'));

const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <Suspense fallback={<div className="boot-screen">Preparing dashboard...</div>}>
        <App />
      </Suspense>
    ),
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" toastOptions={{ className: 'toast-surface' }} />
  </StrictMode>,
);
