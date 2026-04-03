import type { QuoteButtonConfig } from '../../../shared/types/config';
import { fetchProduct, getSelectedVariantId } from '../../../shared/services/storefront-api';
import { addItem, openDrawer } from '../../quote-drawer/store';
import { QuoteButton } from './quote-button';

interface Props {
  config: QuoteButtonConfig;
}

export function ProductPageButton({ config }: Props) {
  const handleClick = async () => {
    if (!config.productHandle) return;
    const variantId = getSelectedVariantId();
    const product = await fetchProduct(config.productHandle, config, variantId);
    if (product) addItem(product);
    openDrawer();
  };

  return <QuoteButton config={config} onClick={handleClick} />;
}
