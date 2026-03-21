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
        description: details?.description,
        category: details?.category,
        badge: details?.badge,
        discount: details?.discount,
        inStock: details?.inStock !== false,
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
      if (details?.productColumns) updated.productColumns = details.productColumns;
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
      if (details?.buttonText) updated.heroButtonText = details.buttonText;
      if (details?.image) updated.heroImage = details.image;
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
    case 'update_about_page': {
      updated.pages = { ...updated.pages };
      updated.pages.about = { ...(updated.pages?.about || {}), ...details };
      break;
    }
    case 'update_contact_page': {
      updated.pages = { ...updated.pages };
      updated.pages.contact = { ...(updated.pages?.contact || {}), ...details };
      break;
    }
    case 'update_offers_page': {
      updated.pages = { ...updated.pages };
      updated.pages.offers = { ...(updated.pages?.offers || {}), ...details };
      break;
    }
    // New expanded actions
    case 'update_logo': {
      updated.logo = details?.logo || details?.emoji || target;
      break;
    }
    case 'update_font': {
      updated.fontFamily = details?.font || details?.fontFamily || target;
      break;
    }
    case 'update_announcement': {
      updated.announcement = {
        text: details?.text || '',
        show: details?.show !== false,
        bgColor: details?.bgColor,
        textColor: details?.textColor,
      };
      break;
    }
    case 'update_social_links': {
      updated.socialLinks = { ...(updated.socialLinks || {}), ...details };
      break;
    }
    case 'update_navbar': {
      if (details?.style) updated.navbarStyle = details.style;
      if (details?.showSearch !== undefined) updated.showSearch = details.showSearch;
      if (details?.showCart !== undefined) updated.showCart = details.showCart;
      if (details?.showWishlist !== undefined) updated.showWishlist = details.showWishlist;
      break;
    }
    case 'update_footer': {
      if (details?.text) updated.footerText = details.text;
      if (details?.links) updated.footerLinks = details.links;
      break;
    }
    case 'update_categories': {
      updated.categories = details?.categories || [];
      break;
    }
    case 'update_border_radius': {
      updated.borderRadius = details?.radius || details?.borderRadius || target;
      break;
    }
    case 'add_testimonial': {
      const testimonial = {
        name: details?.name || 'عميل',
        text: details?.text || '',
        rating: details?.rating || 5,
      };
      updated.testimonials = [...(updated.testimonials || []), testimonial];
      break;
    }
    case 'update_testimonials': {
      if (details?.testimonials) updated.testimonials = details.testimonials;
      break;
    }
    case 'add_banner': {
      const banner = {
        text: details?.text || '',
        image: details?.image,
        link: details?.link,
      };
      updated.banners = [...(updated.banners || []), banner];
      break;
    }
    case 'update_banners': {
      if (details?.banners) updated.banners = details.banners;
      break;
    }
    case 'add_faq': {
      const faqItem = {
        question: details?.question || target || '',
        answer: details?.answer || '',
      };
      updated.faq = [...(updated.faq || []), faqItem];
      break;
    }
    case 'update_faq': {
      if (details?.faq) updated.faq = details.faq;
      break;
    }
    case 'update_policies': {
      updated.policies = { ...(updated.policies || {}), ...details };
      break;
    }
    case 'update_product_badge': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, badge: details?.badge }
            : p
        );
      }
      break;
    }
    case 'update_product_discount': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, discount: details?.discount }
            : p
        );
      }
      break;
    }
    case 'update_product_stock': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, inStock: details?.inStock }
            : p
        );
      }
      break;
    }
    case 'update_product_category': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, category: details?.category }
            : p
        );
      }
      break;
    }
    case 'update_product_description': {
      if (updated.products) {
        updated.products = updated.products.map(p =>
          p.name.toLowerCase().includes((target || '').toLowerCase())
            ? { ...p, description: details?.description }
            : p
        );
      }
      break;
    }
    case 'clear_all_products': {
      updated.products = [];
      break;
    }
    case 'reorder_products': {
      // details.order = array of product names in new order
      if (updated.products && details?.order) {
        const order: string[] = details.order;
        const sorted = [...updated.products].sort((a, b) => {
          const ai = order.findIndex(n => a.name.toLowerCase().includes(n.toLowerCase()));
          const bi = order.findIndex(n => b.name.toLowerCase().includes(n.toLowerCase()));
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
        updated.products = sorted;
      }
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
