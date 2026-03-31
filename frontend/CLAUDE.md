# CLAUDE.md - Frontend Instructions

## UI Component Strategy: Q* Wrapper Components

App chạy trong 2 môi trường — **Embedded (Shopify Admin)** và **Standalone (localhost dev)**. Mỗi môi trường dùng bộ component khác nhau, nhưng được abstract qua **Q* wrapper components**.

| Môi trường | Detect | Component Library |
|-----------|--------|------------------|
| Embedded (Shopify Admin) | `window.shopify` tồn tại | **Shopify Web Components** (`<s-*>` tags) |
| Standalone (localhost dev) | `window.shopify` không tồn tại | **Polaris React** (`@shopify/polaris`) |

### Tại sao dùng Web Components khi embedded?
- Shopify yêu cầu app embedded dùng **Polaris Web Components** (`<s-*>`) để đạt chuẩn **Built for Shopify**
- Web Components được Shopify inject qua App Bridge, chỉ hoạt động trong Shopify Admin iframe
- Docs: https://shopify.dev/docs/api/app-home/web-components
- Khi dev local, không có Shopify context → dùng Polaris React fallback

## Q* Wrapper Components

Tất cả UI components nằm trong `src/components/polaris/`. Mỗi Q* component tự detect môi trường và render phiên bản phù hợp.

**Import:** `import { QPage, QButton, QTextField } from '@/components/polaris';`

### Danh sách components:

| Q* Component | Embedded (`<s-*>`) | Standalone (Polaris React) |
|-------------|-------------------|---------------------------|
| `QPage` | `<s-page>` | `<Page>` + `<Layout>` |
| `QSection` | `<s-section>` | `<Card>` + heading |
| `QButton` | `<s-button>` | `<Button>` |
| `QTextField` | `<s-text-field>` | `<TextField>` |
| `QSelect` | `<s-select>` | `<Select>` |
| `QBanner` | `<s-banner>` | `<Banner>` |
| `QBadge` | `<s-badge>` | `<Badge>` |
| `QText` | `<s-text>` / `<s-heading>` | `<Text>` |
| `QBlockStack` | `<s-stack direction="block">` | `<BlockStack>` |
| `QInlineStack` | `<s-stack direction="inline">` | `<InlineStack>` |
| `QIcon` | `<s-icon>` | `<Icon>` |
| `QSpinner` | `<s-spinner>` | `<Spinner>` |
| `QModal` | `<s-modal>` | `<Modal>` |

### Ví dụ sử dụng:

```tsx
import { QPage, QSection, QButton, QTextField, QBlockStack } from '@/components/polaris';

function SettingsPage() {
  const [name, setName] = useState('');

  return (
    <QPage title="Settings">
      <QSection heading="General">
        <QBlockStack gap="300">
          <QTextField label="Store name" value={name} onChange={setName} />
          <QButton variant="primary" onClick={handleSave}>Save</QButton>
        </QBlockStack>
      </QSection>
    </QPage>
  );
}
```

## Cách detect môi trường

```tsx
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

const isEmbedded = useIsEmbedded(); // true khi chạy trong Shopify Admin
```

## Khi tạo Q* component mới

1. Tạo file `src/components/polaris/Q{Name}.tsx`
2. Xác định props interface chung (lấy giao của 2 API)
3. Dùng `useIsEmbedded()` để switch render
4. Với form components (có events) → dùng `ref` + `addEventListener` cho web components
5. Export từ `src/components/polaris/index.ts`

### Template:

```tsx
import type { ReactNode } from 'react';
import { PolarisComponent } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface Q{Name}Props {
  // Shared props interface
  children: ReactNode;
}

export function Q{Name}(props: Q{Name}Props) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return <s-{name} {...mappedProps}>{props.children}</s-{name}>;
  }

  return <PolarisComponent {...mappedProps}>{props.children}</PolarisComponent>;
}
```

### Event handling cho Web Components:

Web components dùng native DOM events, không dùng React synthetic events.
Dùng `ref` + `useEffect` + `addEventListener`:

```tsx
const ref = useRef<HTMLElement>(null);

useEffect(() => {
  const el = ref.current;
  if (!el || !isEmbedded) return;
  const handler = (e: Event) => onChange?.((e.target as any).value);
  el.addEventListener('input', handler);
  return () => el.removeEventListener('input', handler);
}, [isEmbedded, onChange]);

return <s-text-field ref={ref} label={label} value={value} />;
```

## Props mapping quan trọng

Một số props khác tên giữa 2 hệ thống:

| Concept | Q* Prop | Web Component Attr | Polaris React Prop |
|---------|---------|-------------------|-------------------|
| Page title | `title` | `heading` | `title` |
| Help text | `helpText` | `details` | `helpText` |
| Icon ref | `source` + `name` | `type="order"` | `source={OrderIcon}` |
| Text emphasis | `fontWeight="bold"` | `type="strong"` | `fontWeight="bold"` |
| Subdued text | `tone="subdued"` | `color="subdued"` | `tone="subdued"` |
| Banner title | `title` | `heading` | `title` |

## QIcon — cần cả `source` và `name`

```tsx
import { OrderIcon } from '@shopify/polaris-icons';

<QIcon source={OrderIcon} name="order" />
```
- `source`: Polaris React icon component (standalone mode)
- `name`: Web component icon name string (embedded mode)
- Danh sách icon names: xem icon library tại Shopify docs

## Shopify Web Components Reference

Docs gốc: https://shopify.dev/docs/api/app-home/web-components

### Các tag categories:
- **Layout:** `<s-page>`, `<s-section>`, `<s-stack>`, `<s-box>`, `<s-grid>`, `<s-divider>`, `<s-table>`
- **Actions:** `<s-button>`, `<s-link>`, `<s-menu>`, `<s-button-group>`
- **Forms:** `<s-text-field>`, `<s-text-area>`, `<s-number-field>`, `<s-email-field>`, `<s-select>`, `<s-checkbox>`, `<s-switch>`, `<s-color-field>`, `<s-date-field>`, `<s-drop-zone>`, `<s-money-field>`, `<s-url-field>`, `<s-password-field>`, `<s-search-field>`
- **Feedback:** `<s-badge>`, `<s-banner>`, `<s-spinner>`
- **Overlays:** `<s-modal>`, `<s-popover>`
- **Typography:** `<s-heading>`, `<s-paragraph>`, `<s-text>`, `<s-chip>`, `<s-tooltip>`
- **Media:** `<s-avatar>`, `<s-icon>`, `<s-image>`, `<s-thumbnail>`

### Key slots trong `<s-page>`:
- `slot="primary-action"` — Nút chính (1 nút)
- `slot="secondary-actions"` — Các nút phụ
- `slot="breadcrumb-actions"` — Link breadcrumb
- `slot="aside"` — Sidebar (chỉ khi `inlineSize="base"`)

## TypeScript cho Web Components

Type declarations nằm trong `src/types/shopify-web-components.d.ts`.
Khi thêm Q* component mới dùng `<s-*>` tag mới, cần thêm type declaration ở đây.

## File Structure

```
src/
├── components/
│   └── polaris/           # Q* wrapper components
│       ├── QPage.tsx
│       ├── QButton.tsx
│       ├── QTextField.tsx
│       ├── QSection.tsx
│       ├── QBanner.tsx
│       ├── QBadge.tsx
│       ├── QText.tsx
│       ├── QBlockStack.tsx
│       ├── QInlineStack.tsx
│       ├── QIcon.tsx
│       ├── QSelect.tsx
│       ├── QSpinner.tsx
│       ├── QModal.tsx
│       └── index.ts       # Barrel export
├── hooks/
│   └── useIsEmbedded.ts   # Hook detect embedded
├── pages/
│   └── home/
│       └── HomePage.tsx    # Single file — Q* handles switching
├── types/
│   └── shopify-web-components.d.ts
```

## Quy tắc quan trọng

1. **LUÔN dùng Q* components** — Không import trực tiếp `@shopify/polaris` hay dùng `<s-*>` tags trong pages/features.
2. **Q* components là nơi duy nhất** chứa logic embedded/standalone switch.
3. **Không cần tách Embedded/Standalone pages** — Q* components xử lý switching ở cấp component.
4. **Business logic tách riêng** — Hooks/API calls dùng chung, Q* components chỉ lo render.
5. **Thêm component mới** → tạo Q* wrapper, export từ index.ts, thêm TS declaration nếu cần.
6. **Form events** → luôn dùng `ref` + `addEventListener` cho web components.
7. **Test trên cả 2 môi trường** — `localhost:3001` (standalone) và embedded trong Shopify Admin.
