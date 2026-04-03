import { useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/home/HomePage';
import ButtonSettingsPage from './pages/settings/ButtonSettingsPage';
import QuotesPage from './pages/quotes/QuotesPage';
import QuoteDetailPage from './pages/quotes/QuoteDetailPage';

const basename = window.location.pathname.startsWith('/build') ? '/build' : '';

function AppRouterLink({ url, children, external, ...rest }: React.HTMLProps<HTMLAnchorElement> & { url: string; external?: boolean }) {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (external) return;
      e.preventDefault();
      navigate(url);
    },
    [navigate, url, external],
  );

  const href = external ? url : `${basename}${url}`;

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppProvider i18n={en} linkComponent={AppRouterLink}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/settings/button" element={<ButtonSettingsPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/quotes/:id" element={<QuoteDetailPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
