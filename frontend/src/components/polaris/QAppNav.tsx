import { useLocation, useNavigate } from 'react-router-dom';
import { Frame, Navigation } from '@shopify/polaris';
import type { IconSource } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';
import type { ReactNode } from 'react';

export interface QAppNavItem {
  label: string;
  url: string;
  icon?: IconSource;
  rel?: string;
  selected?: (pathname: string) => boolean;
}

export interface QAppNavProps {
  items: QAppNavItem[];
  children: ReactNode;
}

export function QAppNav({ items, children }: QAppNavProps) {
  const isEmbedded = useIsEmbedded();
  const location = useLocation();
  const navigate = useNavigate();

  if (isEmbedded) {
    return (
      <>
        <s-app-nav>
          {items.map((item) => (
            <s-link key={item.url} href={item.url} rel={item.rel}>
              {item.label}
            </s-link>
          ))}
        </s-app-nav>
        {children}
      </>
    );
  }

  return (
    <Frame
      navigation={
        <Navigation location={location.pathname}>
          <Navigation.Section
            items={items.map((item) => ({
              label: item.label,
              icon: item.icon,
              url: item.url,
              selected: item.selected
                ? item.selected(location.pathname)
                : location.pathname === item.url,
              onClick: () => navigate(item.url),
            }))}
          />
        </Navigation>
      }
    >
      {children}
    </Frame>
  );
}
