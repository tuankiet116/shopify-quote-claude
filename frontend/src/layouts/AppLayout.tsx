import { Outlet } from 'react-router-dom';
import { Frame } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export default function AppLayout() {
  const isEmbedded = useIsEmbedded();

  // When embedded in Shopify Admin, don't use Frame — Admin provides its own chrome
  if (isEmbedded) {
    return <Outlet />;
  }

  return (
    <Frame>
      <Outlet />
    </Frame>
  );
}
