import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/home/HomePage';

const basename = window.location.pathname.startsWith('/build') ? '/build' : '';

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppProvider i18n={en}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
