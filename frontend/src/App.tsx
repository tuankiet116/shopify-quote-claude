import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import { useEffect } from 'react';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/home/HomePage';

function useNavigationMenu() {
  useEffect(() => {
    if (import.meta.env.DEV) return;

    const shopify = (window as any).shopify;
    if (shopify?.navigationMenu) {
      shopify.navigationMenu({
        items: [{ label: 'Home', href: '/app' }],
      });
    }
  }, []);
}

export default function App() {
  useNavigationMenu();

  return (
    <BrowserRouter>
      <AppProvider i18n={en}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
          </Route>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
