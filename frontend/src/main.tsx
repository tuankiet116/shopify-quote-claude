import { createRoot } from 'react-dom/client';
import '@shopify/polaris/build/esm/styles.css';
import './app.css';
import App from './App';

const root = document.getElementById('app');
if (root) {
    createRoot(root).render(<App />);
}
