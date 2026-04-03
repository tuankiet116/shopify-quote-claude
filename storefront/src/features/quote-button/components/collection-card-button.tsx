import type { QuoteButtonConfig } from '../../../shared/types/config';
import { extractHandleFromCard, fetchProduct } from '../../../shared/services/storefront-api';
import { addItem, openDrawer } from '../../quote-drawer/store';
import { QuoteButton } from './quote-button';

interface Props {
  config: QuoteButtonConfig;
  card: Element;
}

export function CollectionCardButton({ config, card }: Props) {
  const handleClick = async () => {
    const handle = extractHandleFromCard(card);
    if (!handle) {
      openDrawer();
      return;
    }
    const product = await fetchProduct(handle, config);
    if (product) addItem(product);
    openDrawer();
  };

  return <QuoteButton config={config} onClick={handleClick} />;
}
