import { Outlet } from 'react-router-dom';
import { Frame } from '@shopify/polaris';

export default function AppLayout() {
  return (
    <Frame>
      <Outlet />
    </Frame>
  );
}
