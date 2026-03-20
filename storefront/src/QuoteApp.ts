import { QuoteAppConfig } from './types';
import { QuoteCart } from './QuoteCart';
import { QuoteButton } from './QuoteButton';
import { QuoteDrawer } from './QuoteDrawer';
import { QuoteForm } from './QuoteForm';
import { QuoteAPI } from './QuoteAPI';

export class QuoteApp {
    private config: QuoteAppConfig;
    private cart: QuoteCart;
    private api: QuoteAPI;
    private form: QuoteForm;
    private button: QuoteButton;
    private drawer: QuoteDrawer;

    constructor(config: QuoteAppConfig) {
        this.config = config;
        this.cart = new QuoteCart();
        this.api = new QuoteAPI(config.proxyPath);

        const defaultFormConfig = {
            formId: 'default',
            title: 'Request a Quote',
            description: '',
            submitButtonText: 'Submit Quote',
            successMessage: 'Quote submitted! We\'ll contact you soon.',
            fields: [
                { name: 'customer_name', label: 'Full Name', type: 'text' as const, required: true },
                { name: 'customer_email', label: 'Email', type: 'email' as const, required: true },
                { name: 'customer_phone', label: 'Phone', type: 'phone' as const, required: false },
                { name: 'notes', label: 'Additional Notes', type: 'textarea' as const, required: false },
            ],
        };

        const formConfig = config.formConfig?.fields?.length
            ? config.formConfig
            : defaultFormConfig;

        this.form = new QuoteForm(formConfig, this.api, this.cart);

        const defaultButtonSettings = {
            text: 'Request Quote',
            backgroundColor: '#000000',
            textColor: '#FFFFFF',
            size: 'medium' as const,
            borderRadius: '4px',
            position: 'after_atc' as const,
            showOnProduct: true,
            showOnCollection: true,
            showQuantitySelector: true,
            iconEnabled: true,
        };

        const buttonSettings = config.buttonSettings?.text
            ? config.buttonSettings
            : defaultButtonSettings;

        this.button = new QuoteButton(buttonSettings, this.cart, this.form);

        const defaultCartSettings = {
            enabled: true,
            position: 'bottom-right' as const,
            badgeColor: '#FF0000',
            drawerWidth: '400px',
        };

        const cartSettings = config.cartSettings?.enabled !== undefined
            ? config.cartSettings
            : defaultCartSettings;

        this.drawer = new QuoteDrawer(cartSettings, this.cart, this.form);
    }

    init(): void {
        // Inject based on page type
        if (this.config.currentPage === 'product' && this.config.product) {
            this.button.injectOnProductPage(this.config.product);
        } else if (this.config.currentPage === 'collection') {
            this.button.injectOnCollectionPage();
        }

        // Always init drawer
        this.drawer.init();

        // Set CSS variables from config
        this.setCSSVariables();
    }

    private setCSSVariables(): void {
        const root = document.documentElement;
        const bs = this.config.buttonSettings;
        if (bs) {
            root.style.setProperty('--quote-btn-bg', bs.backgroundColor || '#000');
            root.style.setProperty('--quote-btn-color', bs.textColor || '#fff');
            root.style.setProperty('--quote-btn-radius', bs.borderRadius || '4px');
        }
        const cs = this.config.cartSettings;
        if (cs) {
            root.style.setProperty('--quote-badge-color', cs.badgeColor || '#FF0000');
            root.style.setProperty('--quote-drawer-width', cs.drawerWidth || '400px');
        }
    }
}
