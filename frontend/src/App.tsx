import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import { useEffect } from 'react';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import QuoteList from './pages/quotes/QuoteList';
import QuoteCreate from './pages/quotes/QuoteCreate';
import QuoteDetail from './pages/quotes/QuoteDetail';
import FormBuilderList from './pages/form-builder/FormBuilderList';
import FormBuilderEdit from './pages/form-builder/FormBuilderEdit';
import Settings from './pages/Settings';

function useNavigationMenu() {
    useEffect(() => {
        const shopify = (window as any).shopify;
        if (shopify?.navigationMenu) {
            shopify.navigationMenu({
                items: [
                    { label: 'Dashboard', href: '/app' },
                    { label: 'Quotes', href: '/app/quotes' },
                    { label: 'Form Builder', href: '/app/form-builder' },
                    { label: 'Settings', href: '/app/settings' },
                ],
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
                    <Route path="/app" element={<AppLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="quotes" element={<QuoteList />} />
                        <Route path="quotes/new" element={<QuoteCreate />} />
                        <Route path="quotes/:id" element={<QuoteDetail />} />
                        <Route path="form-builder" element={<FormBuilderList />} />
                        <Route path="form-builder/:id" element={<FormBuilderEdit />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </AppProvider>
        </BrowserRouter>
    );
}
