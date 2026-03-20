export interface ButtonSettings {
    text: string;
    backgroundColor: string;
    textColor: string;
    size: 'small' | 'medium' | 'large';
    borderRadius: string;
    position: 'after_atc' | 'before_atc' | 'custom';
    showOnProduct: boolean;
    showOnCollection: boolean;
    showQuantitySelector: boolean;
    iconEnabled: boolean;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'number';
    required: boolean;
    options?: string[];
}

export interface FormConfig {
    formId: string;
    title: string;
    description: string;
    submitButtonText: string;
    successMessage: string;
    fields: FormField[];
}

export interface CartSettings {
    enabled: boolean;
    position: 'bottom-right' | 'bottom-left';
    badgeColor: string;
    drawerWidth: string;
}

export interface ProductVariant {
    id: number;
    title: string;
    price: number;
    available: boolean;
    sku: string;
    image: string;
}

export interface ProductData {
    id: number;
    title: string;
    handle: string;
    image: string;
    variants: ProductVariant[];
    selectedVariantId: number;
}

export interface QuoteCartItem {
    productId: number;
    variantId: number;
    title: string;
    variantTitle: string;
    price: number;
    quantity: number;
    imageUrl: string;
    sku: string;
}

export interface QuoteAppConfig {
    shopDomain: string;
    proxyPath: string;
    buttonSettings: ButtonSettings;
    formConfig: FormConfig;
    cartSettings: CartSettings;
    currentPage: string;
    product: ProductData | null;
}
