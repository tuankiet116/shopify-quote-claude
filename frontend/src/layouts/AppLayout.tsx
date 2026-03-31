import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Frame, Navigation } from '@shopify/polaris';
import { HomeIcon } from '@shopify/polaris-icons';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

function StandaloneNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: 'Home',
            icon: HomeIcon,
            url: '/',
            selected: location.pathname === '/',
            onClick: () => navigate('/'),
          },
        ]}
      />
    </Navigation>
  );
}

export default function AppLayout() {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return <Outlet />;
  }

  return (
    <Frame navigation={<StandaloneNavigation />}>
      <Outlet />
    </Frame>
  );
}
