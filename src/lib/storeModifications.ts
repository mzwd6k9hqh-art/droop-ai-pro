import { StoreConfig } from '@/components/StorePreview';

export function applyModification(current: StoreConfig, functionCall: any): StoreConfig {
  const { action, target, details } = functionCall;
  const updated = { ...current };

  switch (action) {
    case 'update_product': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, ...details }
            : p
        );
      }
      break;
    }
    case 'add_product': {
      const newProduct = {
        name: details?.name || target || 'New Product',
        price: details?.price || '$0.00',
        image: details?.image || '📦',
      };
      updated.products = [...(updated.products || []), newProduct];
      break;
    }
    case 'remove_product': {
      if (updated.products) {
        updated.products = updated.products.filter(
          p => !p.name.toLowerCase().includes((target || '').toLowerCase())
        );
      }
      break;
    }
    case 'change_color':
    case 'update_color': {
      if (details?.primary) updated.primaryColor = details.primary;
      if (details?.accent) updated.accentColor = details.accent;
      if (details?.background || details?.bg) updated.bgColor = details.background || details.bg;
      break;
    }
    case 'update_layout': {
      if (details?.layout) updated.layout = details.layout;
      break;
    }
    case 'update_description': {
      if (details?.description) updated.description = details.description;
      if (details?.heroText) updated.heroText = details.heroText;
      if (details?.heroSubtext) updated.heroSubtext = details.heroSubtext;
      break;
    }
    case 'update_name':
    case 'update_store_name': {
      updated.storeName = details?.name || target;
      break;
    }
    case 'update_hero': {
      if (details?.text) updated.heroText = details.text;
      if (details?.subtext) updated.heroSubtext = details.subtext;
      if (details?.show !== undefined) updated.showHero = details.show;
      break;
    }
    case 'update_features': {
      if (details?.features) updated.features = details.features;
      break;
    }
    case 'update_price': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, price: details?.price || p.price }
            : p
        );
      }
      break;
    }
    case 'update_image': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, image: details?.image || p.image }
            : p
        );
      }
      break;
    }
    case 'update_currency': {
      updated.currency = details?.currency || target;
      break;
    }
    case 'update_store_type': {
      updated.storeType = details?.type || target;
      updated.products = undefined;
      break;
    }
    default: {
      if (details) {
        Object.assign(updated, details);
      }
      break;
    }
  }

  return updated;
}
