import 'react';

/**
 * TypeScript declarations for Shopify Polaris Web Components (<s-*> tags).
 * Docs: https://shopify.dev/docs/api/app-home/web-components
 *
 * These components are injected by Shopify App Bridge when app runs embedded
 * in Shopify Admin. They only work inside the Shopify Admin iframe.
 */

type SBaseProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // Layout and Structure
      's-page': SBaseProps & {
        heading?: string;
        inlineSize?: 'small' | 'base' | 'large';
      };
      's-section': SBaseProps & {
        heading?: string;
        accessibilityLabel?: string;
        padding?: 'base' | 'none';
      };
      's-stack': SBaseProps & {
        direction?: 'block' | 'inline';
        gap?: string;
        justifyContent?: string;
        alignItems?: string;
        alignContent?: string;
        padding?: string;
        paddingBlock?: string;
        paddingInline?: string;
        background?: string;
        overflow?: 'visible' | 'hidden';
      };
      's-box': SBaseProps & {
        padding?: string;
        background?: string;
        borderRadius?: string;
      };
      's-grid': SBaseProps;
      's-divider': SBaseProps;
      's-table': SBaseProps;
      's-ordered-list': SBaseProps;
      's-unordered-list': SBaseProps;
      's-query-container': SBaseProps;

      // Actions
      's-button': SBaseProps & {
        variant?: 'primary' | 'secondary' | 'tertiary';
        tone?: 'critical';
        icon?: string;
        disabled?: boolean;
        loading?: boolean;
        type?: 'submit' | 'button';
        href?: string;
        target?: string;
        accessibilityLabel?: string;
      };
      's-button-group': SBaseProps;
      's-link': SBaseProps & { href?: string; target?: string; rel?: string };
      's-app-nav': SBaseProps;
      's-clickable': SBaseProps;
      's-clickable-chip': SBaseProps;
      's-menu': SBaseProps;

      // Forms
      's-text-field': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
        defaultValue?: string;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        readOnly?: boolean;
        error?: string;
        details?: string;
        icon?: string;
        prefix?: string;
        suffix?: string;
        minLength?: number;
        maxLength?: number;
        autocomplete?: string;
      };
      's-text-area': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        error?: string;
      };
      's-number-field': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
        min?: string;
        max?: string;
        step?: string;
        required?: boolean;
        disabled?: boolean;
        error?: string;
      };
      's-email-field': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        error?: string;
      };
      's-select': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        error?: string;
        details?: string;
        icon?: string;
      };
      's-option': SBaseProps & {
        value?: string;
        selected?: boolean;
        disabled?: boolean;
      };
      's-option-group': SBaseProps & {
        label?: string;
      };
      's-checkbox': SBaseProps & {
        label?: string;
        checked?: boolean;
        disabled?: boolean;
      };
      's-switch': SBaseProps & {
        label?: string;
        checked?: boolean;
        disabled?: boolean;
      };
      's-choice-list': SBaseProps;
      's-color-field': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
        disabled?: boolean;
      };
      's-color-picker': SBaseProps;
      's-date-field': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
      };
      's-date-picker': SBaseProps;
      's-drop-zone': SBaseProps;
      's-money-field': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
      };
      's-url-field': SBaseProps & {
        label?: string;
        name?: string;
        value?: string;
      };
      's-password-field': SBaseProps & {
        label?: string;
        name?: string;
      };
      's-search-field': SBaseProps & {
        placeholder?: string;
        value?: string;
      };

      // Feedback
      's-badge': SBaseProps & {
        tone?: 'info' | 'success' | 'warning' | 'critical';
      };
      's-banner': SBaseProps & {
        heading?: string;
        tone?: 'info' | 'success' | 'warning' | 'critical' | 'auto';
        hidden?: boolean;
        dismissible?: boolean;
      };
      's-spinner': SBaseProps;

      // Overlays
      's-modal': SBaseProps & {
        heading?: string;
        open?: boolean;
      };
      's-popover': SBaseProps;

      // Typography
      's-heading': SBaseProps;
      's-paragraph': SBaseProps;
      's-text': SBaseProps & {
        tone?: 'info' | 'success' | 'warning' | 'critical' | 'auto' | 'neutral' | 'caution';
        color?: 'base' | 'subdued';
        type?: 'strong' | 'generic' | 'address' | 'redundant';
      };
      's-chip': SBaseProps;
      's-tooltip': SBaseProps & { content?: string };

      // Media
      's-avatar': SBaseProps & { name?: string; src?: string };
      's-icon': SBaseProps & {
        type?: string;
        tone?: 'info' | 'success' | 'warning' | 'critical' | 'neutral' | 'caution';
        color?: 'base' | 'subdued';
        size?: 'small' | 'base';
      };
      's-image': SBaseProps & { src?: string; alt?: string };
      's-thumbnail': SBaseProps & { src?: string; alt?: string };
    }
  }
}
