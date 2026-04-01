import { useState, useEffect, useCallback, useRef } from 'react';
import { ContextualSaveBar } from '@shopify/polaris';
import {
  QPage,
  QSection,
  QBlockStack,
  QInlineStack,
  QTextField,
  QSelect,
  QBanner,
  QText,
  QCheckbox,
  QColorField,
} from '@/components/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';
import { apiGet, apiPut } from '@/api/client';
import { ButtonPreview } from './components/ButtonPreview';
import type { ButtonSettings, ButtonAppearance } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';

interface ApiResponse {
  success: boolean;
  data: ButtonSettings;
  message?: string;
}

const SIZE_OPTIONS = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

function settingsEqual(a: ButtonSettings, b: ButtonSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function ButtonSettingsPage() {
  const isEmbedded = useIsEmbedded();
  const [settings, setSettings] = useState<ButtonSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<ButtonSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'success' | 'critical'; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isDirty = !settingsEqual(settings, savedSettings);

  // Load settings
  useEffect(() => {
    apiGet<ApiResponse>('button-settings')
      .then((res) => {
        setSettings(res.data);
        setSavedSettings(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Embedded save bar: show/hide based on dirty state
  useEffect(() => {
    if (!isEmbedded || !window.shopify?.saveBar) return;
    if (isDirty) {
      window.shopify.saveBar.show('settings-save-bar');
    } else {
      window.shopify.saveBar.hide('settings-save-bar');
    }
  }, [isDirty, isEmbedded]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setBanner(null);
    try {
      const res = await apiPut<ApiResponse>('button-settings', settings);
      setSettings(res.data);
      setSavedSettings(res.data);
      setBanner({ tone: 'success', message: 'Settings saved successfully.' });
    } catch (e) {
      setBanner({ tone: 'critical', message: e instanceof Error ? e.message : 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleDiscard = useCallback(() => {
    setSettings(savedSettings);
    setBanner(null);
  }, [savedSettings]);

  // Embedded save bar: listen for form submit/reset events
  useEffect(() => {
    if (!isEmbedded) return;
    const form = formRef.current;
    if (!form) return;

    const onSubmit = (e: Event) => {
      e.preventDefault();
      handleSave();
    };
    const onReset = () => {
      handleDiscard();
    };

    form.addEventListener('submit', onSubmit);
    form.addEventListener('reset', onReset);
    return () => {
      form.removeEventListener('submit', onSubmit);
      form.removeEventListener('reset', onReset);
    };
  }, [isEmbedded, handleSave, handleDiscard]);

  const updateAppearance = (key: keyof ButtonAppearance, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }));
  };

  const updateFlag = (key: keyof ButtonSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <QPage title="Quote Button Settings">
        <QBlockStack gap="400">
          <QText tone="subdued">Loading...</QText>
        </QBlockStack>
      </QPage>
    );
  }

  const { appearance } = settings;

  const formContent = (
    <QBlockStack gap="400">
      {banner && (
        <QBanner
          tone={banner.tone === 'success' ? 'success' : 'critical'}
          dismissible
          onDismiss={() => setBanner(null)}
        >
          <p>{banner.message}</p>
        </QBanner>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Left column: Settings */}
        <QBlockStack gap="400">
          <QSection heading="Status">
            <QCheckbox
              label="Enable quote button on storefront"
              checked={settings.is_enabled}
              onChange={(v) => updateFlag('is_enabled', v)}
            />
          </QSection>

          <QSection heading="Button">
            <QBlockStack gap="300">
              <QTextField
                label="Button text"
                value={appearance.button_text}
                onChange={(v) => updateAppearance('button_text', v)}
                maxLength={100}
                helpText="Text displayed on the quote button"
              />
              <QSelect
                label="Button size"
                options={SIZE_OPTIONS}
                value={appearance.size}
                onChange={(v) => updateAppearance('size', v)}
              />
            </QBlockStack>
          </QSection>

          <QSection heading="Colors">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <QColorField
                label="Background"
                value={appearance.bg_color}
                onChange={(v) => updateAppearance('bg_color', v)}
              />
              <QColorField
                label="Text"
                value={appearance.text_color}
                onChange={(v) => updateAppearance('text_color', v)}
              />
              <QColorField
                label="Hover background"
                value={appearance.hover_bg_color}
                onChange={(v) => updateAppearance('hover_bg_color', v)}
              />
              <QColorField
                label="Border"
                value={appearance.border_color}
                onChange={(v) => updateAppearance('border_color', v)}
              />
            </div>
          </QSection>

          <QSection heading="Border">
            <QInlineStack gap="400">
              <div style={{ flex: 1 }}>
                <QTextField
                  label="Radius (px)"
                  type="number"
                  value={String(appearance.border_radius)}
                  onChange={(v) => updateAppearance('border_radius', parseInt(v) || 0)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <QTextField
                  label="Width (px)"
                  type="number"
                  value={String(appearance.border_width)}
                  onChange={(v) => updateAppearance('border_width', parseInt(v) || 0)}
                />
              </div>
            </QInlineStack>
          </QSection>

          <QSection heading="Show on pages">
            <QBlockStack gap="200">
              <QCheckbox
                label="Product pages"
                checked={settings.show_on_product}
                onChange={(v) => updateFlag('show_on_product', v)}
              />
              <QCheckbox
                label="Collection pages"
                checked={settings.show_on_collection}
                onChange={(v) => updateFlag('show_on_collection', v)}
              />
              <QCheckbox
                label="Search results"
                checked={settings.show_on_search}
                onChange={(v) => updateFlag('show_on_search', v)}
              />
              <QCheckbox
                label="Home page"
                checked={settings.show_on_home}
                onChange={(v) => updateFlag('show_on_home', v)}
              />
            </QBlockStack>
          </QSection>
        </QBlockStack>

        {/* Right column: Preview */}
        <div style={{ position: 'sticky', top: 20 }}>
          <ButtonPreview appearance={appearance} isEnabled={settings.is_enabled} />
        </div>
      </div>
    </QBlockStack>
  );

  if (isEmbedded) {
    return (
      <QPage title="Quote Button Settings">
        <form ref={formRef} data-save-bar data-discard-confirmation>
          {formContent}
        </form>
      </QPage>
    );
  }

  return (
    <QPage title="Quote Button Settings">
      {isDirty && (
        <ContextualSaveBar
          message="Unsaved changes"
          saveAction={{ onAction: handleSave, loading: saving }}
          discardAction={{ onAction: handleDiscard }}
        />
      )}
      {formContent}
    </QPage>
  );
}
