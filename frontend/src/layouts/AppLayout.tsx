import { Outlet } from 'react-router-dom';
import { HomeIcon, SettingsIcon } from '@shopify/polaris-icons';
import { QAppNav } from '@/components/polaris';
import type { QAppNavItem } from '@/components/polaris';

const NAV_ITEMS: QAppNavItem[] = [
  {
    label: 'Home',
    url: '/',
    icon: HomeIcon,
    rel: 'home',
  },
  {
    label: 'Settings',
    url: '/settings/button',
    icon: SettingsIcon,
    selected: (pathname) => pathname.startsWith('/settings'),
  },
];

export default function AppLayout() {
  return (
    <QAppNav items={NAV_ITEMS}>
      <Outlet />
    </QAppNav>
  );
}
