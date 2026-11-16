import type { CmsSeoSettingDoc, CmsSeoSettingInput, SeoPageKey } from './firebase';

export const DEFAULT_SEO_PRESETS: Record<SeoPageKey, CmsSeoSettingInput> = {
  global: {
    id: 'global',
    pageKey: 'global',
    title: 'Trigger Sprayer Manufacturer & Lotion Pump Supplier China | Yi Lai Plastics',
    description:
      'Yi Lai Plastics Industry manufactures trigger sprayers, lotion pumps, fine mist sprayers, foam pumps and bottle caps in Yuyao, Ningbo, China. Request a quote.',
    keywords:
      'trigger sprayer manufacturer, lotion pump supplier China, fine mist sprayer factory, foam pump manufacturer, plastic bottle caps supplier, dispensing pumps Ningbo',
    ogTitle: 'Yi Lai Plastics Industry — Trigger Sprayers, Lotion Pumps & Closures',
    ogDescription:
      '15+ years, 200+ employees, 65+ injection machines, 13+ automatic lines in Yuyao, Ningbo, China. Request a B2B quote today.',
    ogSiteName: 'Yi Lai Plastics Industry',
    ogImage: '/assets/aistudio/Untitled_design_51d75519.png',
    twitterCard: 'summary_large_image',
    canonicalBaseUrl: '',
    schemaOrgName: 'Yi Lai Plastics Industry',
    schemaOrgDescription:
      'Manufacturer of trigger sprayers, lotion pumps, fine mist sprayers, foam pumps, foundation pumps and bottle caps.',
    isPublic: true,
  },
  home: {
    id: 'home',
    pageKey: 'home',
    title: 'Trigger Sprayer Manufacturer & Lotion Pump Supplier China | Yi Lai Plastics',
    description:
      'Yi Lai Plastics Industry manufactures trigger sprayers, lotion pumps, fine mist sprayers, foam pumps and bottle caps in Yuyao, Ningbo, China. Request a quote.',
    keywords:
      'trigger sprayer manufacturer, lotion pump supplier China, fine mist sprayer factory, foam pump manufacturer, Yuyao packaging factory',
    ogTitle: 'Yi Lai Plastics Industry — Trigger Sprayers, Lotion Pumps & Closures',
    ogDescription:
      'Precision dispensing pumps & sprayers moulded to spec in Yuyao, Ningbo, China for Middle East, South America and global buyers.',
    ogSiteName: 'Yi Lai Plastics Industry',
    ogImage: '/assets/aistudio/Untitled_design_51d75519.png',
    twitterCard: 'summary_large_image',
    canonicalBaseUrl: '',
    schemaOrgName: 'Yi Lai Plastics Industry',
    schemaOrgDescription:
      'Manufacturer of trigger sprayers, lotion pumps, fine mist sprayers, foam pumps, foundation pumps and bottle caps.',
    isPublic: true,
  },
  factory: {
    id: 'factory',
    pageKey: 'factory',
    title: 'Yuyao Dispensing Pump & Sprayer Factory Profile | Yi Lai Plastics',
    description:
      'Ningbo Yilaipulin Plastic Industry Co., Ltd. operates 65+ injection machines and 13+ automatic lines with 200+ staff in Yuyao, Ningbo, Zhejiang, China.',
    keywords:
      'Ningbo sprayer factory, Yuyao plastic injection manufacturer, dispensing pump OEM China, Ningbo Yilaipulin',
    ogTitle: 'Yi Lai Factory — Yuyao, Ningbo Manufacturing Profile',
    ogDescription:
      '15+ years experience, 65+ injection machines, and 13+ automatic production lines exporting from Ningbo Port.',
    ogSiteName: 'Yi Lai Plastics Industry',
    ogImage: '/images/factory-building.jpg',
    twitterCard: 'summary_large_image',
    canonicalBaseUrl: '',
    schemaOrgName: 'Ningbo Yilaipulin Plastic Industry Co., Ltd.',
    schemaOrgDescription:
      'Yuyao, Ningbo manufacturing facility operating 65+ injection moulding machines and 13+ automatic assembly lines.',
    isPublic: true,
  },
  'use-cases': {
    id: 'use-cases',
    pageKey: 'use-cases',
    title: 'Dispensing Pump & Sprayer Industry Use Cases | Yi Lai Plastics',
    description:
      'Explore real B2B bottle pairing use cases for household cleaners, cosmetics, personal care, salons and workshop fluids across 20/410 to 45/410 necks.',
    keywords:
      'trigger sprayer use cases, cosmetic lotion pump bottle matching, foam pump packaging applications',
    ogTitle: 'Real Industry Use Cases | Yi Lai Plastics Industry',
    ogDescription:
      'Match trigger sprayers, lotion pumps, fine mist atomizers and foam pumps to your bottle neck finish and formula.',
    ogSiteName: 'Yi Lai Plastics Industry',
    ogImage: '/images/prod-trigger-ts001.jpg',
    twitterCard: 'summary_large_image',
    canonicalBaseUrl: '',
    schemaOrgName: 'Yi Lai Plastics Industry',
    schemaOrgDescription:
      'Packaging application matching guide for household, cosmetic, personal care and industrial chemical bottles.',
    isPublic: true,
  },
  'trigger-sprayers': {
    id: 'trigger-sprayers',
    pageKey: 'trigger-sprayers',
    title: 'TS001–TS021 Trigger Sprayers & Modular Configurator | Yi Lai Plastics',
    description:
      'Configure TS001–TS021 trigger sprayers with N1–N6 nozzles, T1–T6 trigger levers and C1–C5 28 mm closures. Request an OEM B2B factory quote today.',
    keywords:
      'TS001 trigger sprayer, 28/410 trigger sprayer configurator, chemical resistant trigger sprayer China',
    ogTitle: 'Trigger Sprayers & Modular Options (TS001–TS021) | Yi Lai Plastics',
    ogDescription:
      'Build your custom trigger sprayer with N1–N6 nozzles, T1–T6 levers and 28/400, 28/410 or 28/415 closures.',
    ogSiteName: 'Yi Lai Plastics Industry',
    ogImage: '/images/prod-trigger-ts001.jpg',
    twitterCard: 'summary_large_image',
    canonicalBaseUrl: '',
    schemaOrgName: 'Yi Lai Plastics Industry',
    schemaOrgDescription:
      'Modular trigger sprayer assembly series TS001–TS021 with interchangeable nozzles, triggers and 28 mm closures.',
    isPublic: true,
  },
};

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applySeoToDocument(
  pageKey: SeoPageKey,
  seoMap: Record<string, CmsSeoSettingDoc>,
  postOverride?: { title?: string; description?: string; image?: string }
): void {
  if (typeof document === 'undefined') return;

  const globalCfg = seoMap.global ?? DEFAULT_SEO_PRESETS.global;
  const routeCfg = seoMap[pageKey] ?? DEFAULT_SEO_PRESETS[pageKey] ?? globalCfg;

  const resolvedTitle = postOverride?.title?.trim() || routeCfg.title || globalCfg.title;
  const resolvedDescription =
    postOverride?.description?.trim() || routeCfg.description || globalCfg.description;
  const resolvedKeywords = routeCfg.keywords || globalCfg.keywords;
  const resolvedOgTitle = postOverride?.title?.trim() || routeCfg.ogTitle || resolvedTitle;
  const resolvedOgDesc =
    postOverride?.description?.trim() || routeCfg.ogDescription || resolvedDescription;
  const resolvedSiteName = routeCfg.ogSiteName || globalCfg.ogSiteName;
  const resolvedImage = postOverride?.image?.trim() || routeCfg.ogImage || globalCfg.ogImage;
  const resolvedTwitterCard = routeCfg.twitterCard || globalCfg.twitterCard || 'summary_large_image';
  const baseCanonical =
    routeCfg.canonicalBaseUrl ||
    globalCfg.canonicalBaseUrl ||
    (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');

  document.title = resolvedTitle;

  upsertMetaTag('name', 'description', resolvedDescription);
  upsertMetaTag('name', 'keywords', resolvedKeywords);
  upsertMetaTag('property', 'og:title', resolvedOgTitle);
  upsertMetaTag('property', 'og:description', resolvedOgDesc);
  upsertMetaTag('property', 'og:site_name', resolvedSiteName);
  upsertMetaTag('property', 'og:image', resolvedImage);
  if (baseCanonical) {
    upsertMetaTag('property', 'og:url', baseCanonical);
  }
  upsertMetaTag('name', 'twitter:card', resolvedTwitterCard);
  upsertMetaTag('name', 'twitter:title', resolvedOgTitle);
  upsertMetaTag('name', 'twitter:description', resolvedOgDesc);

  if (baseCanonical) {
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', baseCanonical);
  }

  const ldScript = document.head.querySelector('script[type="application/ld+json"]');
  if (ldScript) {
    try {
      const parsed = JSON.parse(ldScript.textContent || '{}') as Record<string, unknown>;
      parsed.name = routeCfg.schemaOrgName || globalCfg.schemaOrgName || parsed.name;
      parsed.description =
        routeCfg.schemaOrgDescription || globalCfg.schemaOrgDescription || parsed.description;
      if (baseCanonical) {
        parsed.url = baseCanonical;
      }
      ldScript.textContent = JSON.stringify(parsed, null, 2);
    } catch {
      // Keep original JSON-LD if malformed
    }
  }
}
