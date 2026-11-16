import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Camera,
  Check,
  Copy,
  FileText,
  Globe,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Phone,
  RefreshCw,
  Share2,
  Video,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { SprayerBlueprint } from './components/SprayerBlueprint';
import { ProductDrawing, resolveDrawingVariant } from './components/ProductDrawings';
import { BlogPostPage } from './components/BlogPostPage';
import { TriggerSprayersPage } from './components/TriggerSprayersPage';
import { UseCasesPage } from './components/UseCasesPage';
import { FactoryPage } from './components/FactoryPage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { ProductDetailPage, type ProductDetailData } from './components/ProductDetailPage';
import { SprayerConfiguratorSection } from './components/SprayerConfiguratorSection';
import {
  CUSTOM_SWATCHES,
  NECK_SIZES_LIST,
  PRODUCT_FAMILIES,
  type ProductCategoryId,
  type ProductFamily,
} from './data/catalog';
import { BLOG_POSTS, type BlogPost } from './data/blogPosts';
import { type UseCaseItem } from './data/useCases';
import { LANG_LABELS, TRANSLATIONS, type LangCode } from './i18n/translations';
import {
  isAuthorizedAdmin,
  subscribeAuthState,
  subscribePublicSeoSettings,
  subscribePublishedBlogPosts,
  subscribePublishedProducts,
  testConnection,
  type CmsBlogPostDoc,
  type CmsProductDoc,
  type CmsSeoSettingDoc,
  type SeoPageKey,
} from './lib/firebase';
import { applySeoToDocument } from './lib/seo';

const FACTORY_EMAIL = 'yilaiplastics@gmail.com';
const FACTORY_PHONE = '+86 137 5705 0848';
const FACTORY_WHATSAPP_URL = 'https://wa.me/8613757050848';
const CATALOG_PDF_URL = '/assets/aistudio/Yi_Lai_Plastics_Industry_Factory_CATALOG_b3ed4e35.pdf';
const LOGO_URL = '/assets/aistudio/Untitled_design_51d75519.png';

type DisplayProduct = Omit<ProductFamily, 'titleKey' | 'usesKey' | 'altKey'> & {
  titleKey?: string;
  usesKey?: string;
  altKey?: string;
  directTitle?: string;
  directUses?: string;
  directAlt?: string;
  images?: string[];
};

type DisplayBlogPost = BlogPost & {
  seoTitle?: string;
  seoDescription?: string;
};

function getPostIdFromHash(hash: string): string | null {
  const match = /^#\/blog\/([^/?#]+)/.exec(hash);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

function getProductIdFromHash(hash: string): string | null {
  const match = /^#\/products\/([^/?#]+)/.exec(hash);
  if (!match) return null;
  const slug = decodeURIComponent(match[1]);
  return slug === 'trigger-sprayers' ? null : slug;
}

function isTriggerPageHash(hash: string): boolean {
  return /^#\/products\/trigger-sprayers(?:\/|\?|#|$)/.test(hash);
}

function isUseCasesPageHash(hash: string): boolean {
  return /^#\/use-cases(?:\/|\?|#|$)/.test(hash);
}

function isFactoryPageHash(hash: string): boolean {
  return /^#\/factory(?:\/|\?|#|$)/.test(hash);
}

function isAdminPageHash(hash: string): boolean {
  return /^#\/admin(?:\/|\?|#|$)/.test(hash);
}

function ToConfirmTag({ label = 'TO CONFIRM' }: { label?: string }) {
  return (
    <span
      dir="ltr"
      className="inline-block font-mono-spec text-[10px] uppercase tracking-[0.06em] bg-[#FFF1D6] text-[#9A5B00] border border-dashed border-[#B86E00] px-1.5 py-0.5 rounded-sm align-middle whitespace-nowrap"
    >
      {label}
    </span>
  );
}

function SectionHeading({
  kicker,
  title,
  lead,
  inverted = false,
}: {
  kicker: string;
  title: string;
  lead: string;
  inverted?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-end mb-11">
      <div>
        <span
          className={`block font-mono-spec text-[12.5px] uppercase tracking-[0.08em] mb-3 ${
            inverted
              ? 'text-[color-mix(in_srgb,var(--bg)_70%,var(--ink))]'
              : 'text-[var(--muted)]'
          }`}
        >
          {kicker}
        </span>
        <h2
          className={`font-display font-black uppercase text-[clamp(44px,6.2vw,84px)] leading-[0.92] tracking-[0.005em] ${
            inverted ? 'text-[var(--bg)]' : 'text-[var(--ink)]'
          }`}
        >
          {title}
        </h2>
      </div>
      <p
        className={`max-w-[58ch] text-base sm:text-lg leading-relaxed ${
          inverted
            ? 'text-[color-mix(in_srgb,var(--bg)_74%,var(--ink))]'
            : 'text-[var(--muted)]'
        }`}
      >
        {lead}
      </p>
    </div>
  );
}

function CountUpNumber({ target }: { target: number }) {
  const [value, setValue] = useState(target);
  const ref = useRef<HTMLSpanElement | null>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const start = performance.now();
            const duration = 900;
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(target * eased));
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="font-mono-spec tabular-nums">
      {value}
    </span>
  );
}

export default function App() {
  const [lang, setLang] = useState<LangCode>(() => {
    if (typeof window === 'undefined') return 'en';
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'en' || param === 'es' || param === 'pt' || param === 'ar' || param === 'tr') {
      return param;
    }
    try {
      const saved = window.localStorage.getItem('yl-lang');
      if (saved === 'en' || saved === 'es' || saved === 'pt' || saved === 'ar' || saved === 'tr') {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return 'en';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategoryId>('all');
  const [cardPhotoIndex, setCardPhotoIndex] = useState<Record<string, number>>({});
  const [activePostId, setActivePostId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return getPostIdFromHash(window.location.hash);
  });
  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return getProductIdFromHash(window.location.hash);
  });
  const [isTriggerPage, setIsTriggerPage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isTriggerPageHash(window.location.hash);
  });
  const [isUseCasesPage, setIsUseCasesPage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isUseCasesPageHash(window.location.hash);
  });
  const [isFactoryPage, setIsFactoryPage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isFactoryPageHash(window.location.hash);
  });
  const [isAdminPage, setIsAdminPage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isAdminPageHash(window.location.hash);
  });

  // Firebase Auth & live Firestore CMS state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cmsProducts, setCmsProducts] = useState<CmsProductDoc[]>([]);
  const [cmsBlogPosts, setCmsBlogPosts] = useState<CmsBlogPostDoc[]>([]);
  const [seoSettings, setSeoSettings] = useState<Record<string, CmsSeoSettingDoc>>({});

  // Quote form state
  const [product, setProduct] = useState('');
  const [neck, setNeck] = useState('');
  const [qty, setQty] = useState('10000');
  const [colorHex, setColorHex] = useState('#1648c9');
  const [colour, setColour] = useState('');
  const [country, setCountry] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const mistCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const t = (key: string) => TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;

  // Boot Firebase connectivity test, Auth state listener, and public Firestore subscriptions
  useEffect(() => {
    void testConnection();
    const unsubAuth = subscribeAuthState((u) => {
      setAuthUser(u);
      setAuthReady(true);
    });
    const unsubProducts = subscribePublishedProducts(
      (items) => setCmsProducts(items),
      (err) => console.error('Public products listener error:', err)
    );
    const unsubPosts = subscribePublishedBlogPosts(
      (items) => setCmsBlogPosts(items),
      (err) => console.error('Public blog listener error:', err)
    );
    const unsubSeo = subscribePublicSeoSettings(
      (map) => setSeoSettings(map),
      (err) => console.error('Public SEO listener error:', err)
    );
    return () => {
      unsubAuth();
      unsubProducts();
      unsubPosts();
      unsubSeo();
    };
  }, []);

  const mergedProducts = useMemo<DisplayProduct[]>(() => {
    const cmsById = new Map(cmsProducts.map((item) => [item.id, item]));
    const baseList: DisplayProduct[] = PRODUCT_FAMILIES.map((item) => {
      const override = cmsById.get(item.id);
      if (!override) {
        const builtinImages = [item.image, item.altImage].filter((v): v is string => Boolean(v));
        return {
          ...item,
          images: builtinImages,
        };
      }
      cmsById.delete(item.id);
      const overrideImages =
        override.images && override.images.length > 0
          ? override.images
          : override.image
            ? [override.image]
            : [item.image, item.altImage].filter((v): v is string => Boolean(v));
      return {
        id: override.id,
        category: override.category,
        figCode: override.figCode,
        modelRange: override.modelRange,
        directTitle: override.title,
        directUses: override.uses,
        neckSizes: override.neckSizes,
        neckToConfirm: override.neckToConfirm,
        dosage: override.dosage,
        material: override.material,
        featureSpec: override.featureSpec,
        image: overrideImages[0] || item.image,
        altImage: overrideImages[1] || item.altImage,
        images: overrideImages,
        directAlt: override.altText,
        quoteValue: override.quoteValue,
      };
    });
    const extras: DisplayProduct[] = Array.from(cmsById.values()).map((extra) => {
      const gallery =
        extra.images && extra.images.length > 0
          ? extra.images
          : extra.image
            ? [extra.image]
            : [];
      return {
        id: extra.id,
        category: extra.category,
        figCode: extra.figCode,
        modelRange: extra.modelRange,
        directTitle: extra.title,
        directUses: extra.uses,
        neckSizes: extra.neckSizes,
        neckToConfirm: extra.neckToConfirm,
        dosage: extra.dosage,
        material: extra.material,
        featureSpec: extra.featureSpec,
        image: gallery[0] || undefined,
        altImage: gallery[1] || undefined,
        images: gallery,
        directAlt: extra.altText,
        quoteValue: extra.quoteValue,
      };
    });
    return [...baseList, ...extras];
  }, [cmsProducts]);

  const mergedBlogPosts = useMemo<DisplayBlogPost[]>(() => {
    const toDisplayPost = (cms: CmsBlogPostDoc): DisplayBlogPost => {
      const copy = {
        category: cms.category,
        title: cms.title,
        summary: cms.summary,
        paragraphs: cms.paragraphs,
        specTakeaway: cms.specTakeaway,
      };
      return {
        id: cms.id,
        index: cms.index,
        refCode: cms.refCode,
        relatedProduct: cms.relatedProduct,
        image: cms.image || undefined,
        seoTitle: cms.seoTitle || undefined,
        seoDescription: cms.seoDescription || undefined,
        content: {
          en: copy,
          es: copy,
          pt: copy,
          ar: copy,
          tr: copy,
        },
      };
    };

    const cmsById = new Map(cmsBlogPosts.map((p) => [p.id, p]));
    const baseList: DisplayBlogPost[] = BLOG_POSTS.map((post) => {
      const override = cmsById.get(post.id);
      if (!override) return post;
      cmsById.delete(post.id);
      return toDisplayPost(override);
    });
    const extras = Array.from(cmsById.values()).map(toDisplayPost);
    return [...baseList, ...extras];
  }, [cmsBlogPosts]);

  const activePost = activePostId
    ? mergedBlogPosts.find((post) => post.id === activePostId) ?? null
    : null;

  const toProductDetailData = (item: DisplayProduct): ProductDetailData => {
    const title = item.directTitle ?? (item.titleKey ? t(item.titleKey) : item.id);
    const uses = item.directUses ?? (item.usesKey ? t(item.usesKey) : '');
    const altText = item.directAlt ?? (item.altKey ? t(item.altKey) : title);
    const images =
      item.images && item.images.length > 0
        ? item.images
        : [item.image, item.altImage].filter((v): v is string => Boolean(v));
    return {
      id: item.id,
      category: item.category,
      figCode: item.figCode,
      modelRange: item.modelRange,
      title,
      uses,
      neckSizes: item.neckSizes,
      neckToConfirm: item.neckToConfirm,
      dosage: item.dosage,
      material: item.material,
      featureSpec: item.featureSpec,
      images,
      altText,
      quoteValue: item.quoteValue,
    };
  };

  const activeProduct = activeProductId
    ? mergedProducts.find((item) => item.id === activeProductId) ?? null
    : null;
  const activeProductDetail = activeProduct ? toProductDetailData(activeProduct) : null;
  const relatedProductsDetail: ProductDetailData[] = activeProductDetail
    ? mergedProducts
        .filter((item) => item.id !== activeProductDetail.id)
        .slice(0, 3)
        .map(toProductDetailData)
    : [];

  // Dynamic SEO metadata sync across active route & live Firestore updates
  useEffect(() => {
    if (isAdminPage) {
      document.title = 'Owner Admin Console | Yi Lai Plastics Industry';
      return;
    }
    const routeKey: SeoPageKey = isFactoryPage
      ? 'factory'
      : isUseCasesPage
        ? 'use-cases'
        : isTriggerPage
          ? 'trigger-sprayers'
          : 'home';

    if (activeProductDetail) {
      applySeoToDocument(routeKey, seoSettings, {
        title: `${activeProductDetail.title} (${activeProductDetail.modelRange}) | Yi Lai Plastics`,
        description: activeProductDetail.uses,
        image: activeProductDetail.images[0],
      });
      return;
    }

    if (activePost) {
      const copy = activePost.content[lang] ?? activePost.content.en;
      applySeoToDocument(routeKey, seoSettings, {
        title: activePost.seoTitle || `${copy.title} | Yi Lai Plastics`,
        description: activePost.seoDescription || copy.summary,
        image: activePost.image,
      });
      return;
    }
    applySeoToDocument(routeKey, seoSettings);
  }, [
    isAdminPage,
    isFactoryPage,
    isUseCasesPage,
    isTriggerPage,
    activeProductDetail,
    activePost,
    lang,
    seoSettings,
  ]);

  useEffect(() => {
    const isRtl = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem('yl-lang', lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    const onHashChange = () => {
      const nextHash = window.location.hash;
      const nextId = getPostIdFromHash(nextHash);
      const nextProductId = getProductIdFromHash(nextHash);
      const nextTrigger = isTriggerPageHash(nextHash);
      const nextUseCases = isUseCasesPageHash(nextHash);
      const nextFactory = isFactoryPageHash(nextHash);
      const nextAdmin = isAdminPageHash(nextHash);
      setActivePostId(nextId);
      setActiveProductId(nextProductId);
      setIsTriggerPage(nextTrigger);
      setIsUseCasesPage(nextUseCases);
      setIsFactoryPage(nextFactory);
      setIsAdminPage(nextAdmin);
      if (nextId || nextProductId || nextTrigger || nextUseCases || nextFactory || nextAdmin) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openPostPage = (postId: string) => {
    setMobileMenuOpen(false);
    setActiveProductId(null);
    setIsTriggerPage(false);
    setIsUseCasesPage(false);
    setIsFactoryPage(false);
    setIsAdminPage(false);
    window.location.hash = `#/blog/${postId}`;
    setActivePostId(postId);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openTriggerSprayersPage = () => {
    setMobileMenuOpen(false);
    setActivePostId(null);
    setActiveProductId(null);
    setIsUseCasesPage(false);
    setIsFactoryPage(false);
    setIsAdminPage(false);
    window.location.hash = '#/products/trigger-sprayers';
    setIsTriggerPage(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openProductPage = (productId: string) => {
    if (productId === 'trigger-sprayers') {
      openTriggerSprayersPage();
      return;
    }
    setMobileMenuOpen(false);
    setActivePostId(null);
    setIsTriggerPage(false);
    setIsUseCasesPage(false);
    setIsFactoryPage(false);
    setIsAdminPage(false);
    window.location.hash = `#/products/${productId}`;
    setActiveProductId(productId);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openUseCasesPage = () => {
    setMobileMenuOpen(false);
    setActivePostId(null);
    setActiveProductId(null);
    setIsTriggerPage(false);
    setIsFactoryPage(false);
    setIsAdminPage(false);
    window.location.hash = '#/use-cases';
    setIsUseCasesPage(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openFactoryPage = () => {
    setMobileMenuOpen(false);
    setActivePostId(null);
    setActiveProductId(null);
    setIsTriggerPage(false);
    setIsUseCasesPage(false);
    setIsAdminPage(false);
    window.location.hash = '#/factory';
    setIsFactoryPage(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openAdminPage = () => {
    setMobileMenuOpen(false);
    setActivePostId(null);
    setActiveProductId(null);
    setIsTriggerPage(false);
    setIsUseCasesPage(false);
    setIsFactoryPage(false);
    window.location.hash = '#/admin';
    setIsAdminPage(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const navigateToHomeSection = (sectionId?: string) => {
    setMobileMenuOpen(false);
    if (
      activePostId ||
      activeProductId ||
      isTriggerPage ||
      isUseCasesPage ||
      isFactoryPage ||
      isAdminPage
    ) {
      setActivePostId(null);
      setActiveProductId(null);
      setIsTriggerPage(false);
      setIsUseCasesPage(false);
      setIsFactoryPage(false);
      setIsAdminPage(false);
      window.location.hash = sectionId ? `#${sectionId}` : '#top';
      window.requestAnimationFrame(() => {
        if (sectionId) {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      return;
    }
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredProducts =
    activeCategory === 'all'
      ? mergedProducts
      : mergedProducts.filter((item) => item.category === activeCategory);

  const handleSelectProductForQuote = (quoteValue: string, neckSizes?: string) => {
    setProduct(quoteValue);
    if (neckSizes) {
      setNeck(neckSizes);
    }
    setFormErrors((prev) => ({ ...prev, product: false }));
    navigateToHomeSection('quote');
  };

  const handleConfiguredTriggerQuote = (payload: {
    product: string;
    neck: string;
    colour: string;
    message: string;
  }) => {
    setProduct(payload.product);
    setNeck(payload.neck);
    setColour(payload.colour);
    setMessage(payload.message);
    setFormErrors((prev) => ({ ...prev, product: false }));
    navigateToHomeSection('quote');
  };

  const handleUseCaseQuote = (useCase: UseCaseItem) => {
    setProduct(useCase.quoteProduct);
    setNeck(useCase.recommendedNeck);
    setMessage(`Application: ${useCase.title.en} (${useCase.series})`);
    setFormErrors((prev) => ({ ...prev, product: false }));
    navigateToHomeSection('quote');
  };

  const liveQuoteDraft = useMemo(() => {
    const selectedLabel = product.trim() || 'Trigger sprayer (TS001-TS021)';
    const neckLabel = neck.trim() || '28/410';
    const numericQty = parseInt(qty.replace(/[^\d]/g, ''), 10);
    const qtyLabel =
      numericQty > 0
        ? `${numericQty.toLocaleString('en-US')} pcs`
        : qty.trim() || 'To be confirmed';
    const hexUpper = colorHex.toUpperCase();
    const colorLine = colour.trim() ? `${colour.trim()} (${hexUpper})` : hexUpper;

    const lines = [
      'Hello Yi Lai Plastics,',
      '',
      'Please quote the following:',
      '',
      `Product: ${selectedLabel}`,
      `Neck finish: ${neckLabel}`,
      `Quantity: ${qtyLabel}`,
      `Colour: ${colorLine}`,
    ];
    if (country.trim()) lines.push(`Ship to: ${country.trim()}`);
    if (message.trim()) lines.push(`Notes: ${message.trim()}`);
    lines.push('', 'Please send price, lead time and sample availability.', '');
    const sig = [name.trim(), company.trim()].filter(Boolean).join(', ');
    lines.push(sig || '[Your name, company]');

    const body = lines.join('\n');
    const subject = `Inquiry: ${selectedLabel} (${neckLabel})`;
    const mailto = `mailto:${FACTORY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const whatsappUrl = `${FACTORY_WHATSAPP_URL}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`;
    return { selectedLabel, neckLabel, subject, body, mailto, whatsappUrl };
  }, [product, neck, qty, colorHex, colour, country, name, company, message]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, boolean> = {
      product: !product.trim(),
      qty: !qty.trim(),
      country: !country.trim(),
      name: !name.trim(),
    };
    setFormErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    window.location.href = liveQuoteDraft.mailto;
  };

  const handleCopyPrepared = async () => {
    try {
      await navigator.clipboard.writeText(liveQuoteDraft.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const categories: { id: ProductCategoryId; label: string }[] = [
    { id: 'all', label: t('filter.all') },
    { id: 'trigger', label: t('filter.trigger') },
    { id: 'lotion', label: t('filter.lotion') },
    { id: 'mist', label: t('filter.mist') },
    { id: 'foam', label: t('filter.foam') },
    { id: 'caps', label: t('filter.caps') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* ===================== HEADER (3-Zone Top Bar Contract) ===================== */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--line)]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 min-h-[64px] py-3 flex items-center justify-between gap-5">
          {/* Zone 1: Single-line geometric mark + Brand */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateToHomeSection();
            }}
            className="flex items-center gap-3 text-[var(--ink)] no-underline whitespace-nowrap shrink-0"
          >
            <img
              src={LOGO_URL}
              alt="Yi Lai Plastics Industry logo"
              className="w-10 h-10 object-contain rounded-[4px] bg-white p-0.5 border border-[var(--line)] shrink-0"
            />
            <span className="font-display font-black text-[26px] leading-none uppercase tracking-[0.01em] whitespace-nowrap">
              YI LAI PLASTICS
            </span>
          </a>

          {/* Zone 2: Clean Typography Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-5 text-[15px] font-medium text-[var(--ink)]"
          >
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('products');
              }}
              className="hover:text-[var(--blue)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.products')}
            </a>
            <a
              href="#/use-cases"
              onClick={(e) => {
                e.preventDefault();
                openUseCasesPage();
              }}
              className={`hover:text-[var(--blue)] transition-colors whitespace-nowrap shrink-0 ${
                isUseCasesPage ? 'text-[var(--blue)] font-semibold' : ''
              }`}
            >
              {t('nav.useCases')}
            </a>
            <a
              href="#/factory"
              onClick={(e) => {
                e.preventDefault();
                openFactoryPage();
              }}
              className={`hover:text-[var(--blue)] transition-colors whitespace-nowrap shrink-0 ${
                isFactoryPage ? 'text-[var(--blue)] font-semibold' : ''
              }`}
            >
              {t('nav.factory')}
            </a>
            <a
              href="#process"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('process');
              }}
              className="hover:text-[var(--blue)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.process')}
            </a>
            <a
              href="#custom"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('custom');
              }}
              className="hover:text-[var(--blue)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.custom')}
            </a>
            <a
              href="#blog"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('blog');
              }}
              className="hover:text-[var(--blue)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.blog')}
            </a>
            <a
              href="#social"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('social');
              }}
              className="hover:text-[var(--blue)] transition-colors whitespace-nowrap shrink-0"
            >
              {t('nav.social')}
            </a>
          </nav>

          {/* Zone 3: Owner Admin Link + Primary CTA + Mobile Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="#/admin"
              onClick={(e) => {
                e.preventDefault();
                openAdminPage();
              }}
              title="Owner Admin Dashboard"
              className={`hidden sm:inline-flex items-center gap-1.5 border font-mono-spec text-xs uppercase tracking-wider px-3 py-2 rounded-[4px] transition-colors whitespace-nowrap shrink-0 ${
                isAdminPage || isAuthorizedAdmin(authUser)
                  ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))] text-[var(--blue)]'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isAuthorizedAdmin(authUser) ? 'CMS' : 'Admin'}</span>
            </a>

            <a
              href="#quote"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('quote');
              }}
              className="hidden sm:inline-flex items-center gap-2 bg-[var(--blue)] text-[var(--btn-ink)] font-semibold text-[15px] px-5 py-2.5 rounded-[4px] hover:-translate-y-px active:translate-y-px transition-transform whitespace-nowrap shrink-0"
            >
              <span>{t('nav.quote')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 border border-[var(--line)] bg-[var(--surface)] rounded-[4px] text-[var(--ink)] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 space-y-2">
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('products');
              }}
              className="block py-2.5 text-base font-medium text-[var(--ink)] border-b border-[var(--line)]"
            >
              {t('nav.products')}
            </a>
            <a
              href="#/use-cases"
              onClick={(e) => {
                e.preventDefault();
                openUseCasesPage();
              }}
              className="block py-2.5 text-base font-medium text-[var(--ink)] border-b border-[var(--line)]"
            >
              {t('nav.useCases')}
            </a>
            <a
              href="#/factory"
              onClick={(e) => {
                e.preventDefault();
                openFactoryPage();
              }}
              className="block py-2.5 text-base font-medium text-[var(--ink)] border-b border-[var(--line)]"
            >
              {t('nav.factory')}
            </a>
            <a
              href="#process"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('process');
              }}
              className="block py-2.5 text-base font-medium text-[var(--ink)] border-b border-[var(--line)]"
            >
              {t('nav.process')}
            </a>
            <a
              href="#custom"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('custom');
              }}
              className="block py-2.5 text-base font-medium text-[var(--ink)] border-b border-[var(--line)]"
            >
              {t('nav.custom')}
            </a>
            <a
              href="#blog"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('blog');
              }}
              className="block py-2.5 text-base font-medium text-[var(--ink)] border-b border-[var(--line)]"
            >
              {t('nav.blog')}
            </a>
            <a
              href="#social"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('social');
              }}
              className="block py-2.5 text-base font-medium text-[var(--ink)] border-b border-[var(--line)]"
            >
              {t('nav.social')}
            </a>
            <a
              href="#/admin"
              onClick={(e) => {
                e.preventDefault();
                openAdminPage();
              }}
              className="flex items-center gap-2 py-2.5 text-base font-medium text-[var(--blue)] border-b border-[var(--line)]"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Admin Dashboard</span>
            </a>
            <a
              href="#quote"
              onClick={(e) => {
                e.preventDefault();
                navigateToHomeSection('quote');
              }}
              className="mt-3 block w-full text-center bg-[var(--red)] text-white font-display font-bold uppercase tracking-wider py-3 rounded-[4px]"
            >
              {t('nav.quote')}
            </a>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {isAdminPage ? (
          <AdminDashboardPage
            user={authUser}
            authReady={authReady}
            seoSettings={seoSettings}
            onNavigateHomeSection={navigateToHomeSection}
            onOpenPostPage={openPostPage}
            onOpenProductPage={openProductPage}
            t={t}
          />
        ) : isFactoryPage ? (
          <FactoryPage
            lang={lang}
            onChangeLang={setLang}
            onNavigateHomeSection={navigateToHomeSection}
            t={t}
          />
        ) : isUseCasesPage ? (
          <UseCasesPage
            lang={lang}
            onChangeLang={setLang}
            onNavigateHomeSection={navigateToHomeSection}
            onQuoteUseCase={handleUseCaseQuote}
            t={t}
          />
        ) : isTriggerPage ? (
          <TriggerSprayersPage
            lang={lang}
            onChangeLang={setLang}
            onNavigateHomeSection={navigateToHomeSection}
            onQuoteConfigured={handleConfiguredTriggerQuote}
            t={t}
          />
        ) : activeProductDetail ? (
          <ProductDetailPage
            product={activeProductDetail}
            relatedProducts={relatedProductsDetail}
            lang={lang}
            onChangeLang={setLang}
            onNavigateHomeSection={navigateToHomeSection}
            onOpenProductPage={openProductPage}
            onQuoteProduct={handleSelectProductForQuote}
            t={t}
          />
        ) : activePost ? (
          <BlogPostPage
            post={activePost}
            allPosts={mergedBlogPosts}
            lang={lang}
            onChangeLang={setLang}
            onNavigateHomeSection={navigateToHomeSection}
            onOpenPost={openPostPage}
            onQuoteTopic={handleSelectProductForQuote}
            t={t}
          />
        ) : (
          <>
        {/* ===================== HERO WITH CANVAS MIST ===================== */}
        <section
          ref={heroSectionRef}
          className="relative overflow-hidden border-b border-[var(--line)] grid-blueprint hero-radial-fade py-10 sm:py-14"
        >
          <canvas
            ref={mistCanvasRef}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6">
            {/* Hero Utility Bar: Location + Language Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-10 border-b border-[var(--line)]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-spec text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
                <span className="text-[var(--blue)] font-medium">{t('hero.location')}</span>
                <span aria-hidden="true">·</span>
                <span>{t('hero.slogan')}</span>
              </div>

              <div
                role="group"
                aria-label="Language"
                className="inline-flex border border-[var(--line)] rounded-[4px] bg-[var(--surface)] overflow-hidden"
              >
                {LANG_LABELS.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    lang={item.code}
                    onClick={() => setLang(item.code)}
                    aria-pressed={lang === item.code}
                    className={`px-3 min-h-[34px] font-mono-spec text-xs border-r last:border-r-0 border-[var(--line)] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      lang === item.code
                        ? 'bg-[var(--blue)] text-[var(--btn-ink)] font-medium'
                        : 'text-[var(--muted)] hover:text-[var(--blue)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.22fr_0.78fr] gap-8 lg:gap-10 items-center">
              <div>
                <span className="block font-mono-spec text-[12.5px] uppercase tracking-[0.08em] text-[var(--muted)] mb-3">
                  {t('meta.years')} · {t('meta.machines')} · {t('hero.location')}
                </span>
                <h1 className="font-display font-black uppercase text-[clamp(56px,9.6vw,140px)] leading-[0.92] tracking-[0.005em] text-[var(--ink)] mb-5">
                  {t('hero.h1.a')}
                  <em className="not-italic text-[var(--red)]">{t('hero.h1.em')}</em>
                  {t('hero.h1.b')}
                </h1>

                <p className="max-w-[56ch] text-base sm:text-lg text-[var(--ink)] leading-relaxed">
                  {t('hero.lead')}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-7">
                  <a
                    href="#quote"
                    className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-[15px] px-5 py-3.5 rounded-[4px] hover:-translate-y-px active:translate-y-px transition-transform whitespace-nowrap shrink-0"
                  >
                    <span>{t('hero.cta1')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                  </a>

                  <a
                    href={CATALOG_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-transparent text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)] font-semibold text-[15px] px-5 py-3.5 rounded-[4px] hover:-translate-y-px active:translate-y-px transition-transform whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    <span>{t('hero.cta2')}</span>
                  </a>
                </div>
              </div>

              {/* Interactive Canvas-Connected Sprayer Rig */}
              <SprayerBlueprint
                heroContainerRef={heroSectionRef}
                canvasRef={mistCanvasRef}
                hintLabel={t('sheet.hint')}
                sprayLabel={t('sheet.mode.spray')}
                streamLabel={t('sheet.mode.stream')}
                figLabel={t('sheet.fig')}
                strokesLabel={t('sheet.strokes')}
              />
            </div>
          </div>
        </section>

        {/* ===================== 01. PRODUCTS (FLUSH ARCHITECTURAL GRID) ===================== */}
        <section id="products" className="py-20 sm:py-24 bg-[var(--bg)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker={t('products.kicker')}
              title={t('products.title')}
              lead={t('products.lead')}
            />

            {/* Category Filter Tabs */}
            <div
              role="group"
              aria-label="Filter product families"
              className="flex flex-wrap items-center gap-2 mb-7"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                  className={`px-3.5 py-2 rounded-[4px] font-mono-spec text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-[var(--blue)] text-[var(--btn-ink)] font-medium'
                      : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Flush Outer-Bordered Product Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--line)] bg-[var(--surface)]">
              {filteredProducts.map((item) => {
                const gallery =
                  item.images && item.images.length > 0
                    ? item.images
                    : [item.image, item.altImage].filter((v): v is string => Boolean(v));
                const activeIdx = gallery.length > 0 ? (cardPhotoIndex[item.id] ?? 0) % gallery.length : 0;
                const currentImg = gallery[activeIdx];
                const cardTitle = item.directTitle ?? (item.titleKey ? t(item.titleKey) : item.id);
                const cardUses = item.directUses ?? (item.usesKey ? t(item.usesKey) : '');
                const cardAlt = item.directAlt ?? (item.altKey ? t(item.altKey) : cardTitle);

                return (
                  <article
                    key={item.id}
                    className="yl-product-card p-6 border-r border-b border-[var(--line)] flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          dir="ltr"
                          className="font-mono-spec text-[11px] uppercase tracking-[0.08em] text-[var(--blue)]"
                        >
                          {item.figCode} · {item.modelRange}
                        </span>
                        {gallery.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setCardPhotoIndex((prev) => ({
                                ...prev,
                                [item.id]: ((prev[item.id] ?? 0) + 1) % gallery.length,
                              }))
                            }
                            title={t('card.altView')}
                            aria-label={`${t('card.altView')} — ${cardTitle}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--blue)] text-[var(--muted)] hover:text-[var(--blue)] font-mono-spec text-[10px] uppercase cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" aria-hidden="true" />
                            <span>
                              {activeIdx + 1}/{gallery.length}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 items-start">
                        <a
                          href={`#/products/${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            openProductPage(item.id);
                          }}
                          aria-label={`View ${cardTitle} page`}
                          className="w-28 h-28 rounded-[4px] bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                        >
                          {currentImg ? (
                            <img
                              src={currentImg}
                              alt={cardAlt}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover block"
                            />
                          ) : (
                            <ProductDrawing
                              variant={resolveDrawingVariant(item.category)}
                              className="w-20 h-24 p-2"
                            />
                          )}
                        </a>

                        <div>
                          <h3 className="font-display font-bold uppercase text-[28px] leading-[1] text-[var(--ink)] mb-2">
                            <a
                              href={`#/products/${item.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                openProductPage(item.id);
                              }}
                              className="hover:text-[var(--blue)] transition-colors"
                            >
                              {cardTitle}
                            </a>
                          </h3>
                          <p className="text-[15px] text-[var(--muted)] leading-snug">
                            {cardUses}
                          </p>
                        </div>
                      </div>

                      {/* Dashed Engineering Spec Rows */}
                      <ul className="mt-4 pt-1 font-mono-spec text-[12px] text-[var(--ink)]">
                        <li className="flex justify-between gap-3 py-1.5 border-t border-dashed border-[var(--line)]">
                          <span className="text-[var(--muted)] uppercase shrink-0">{t('spec.neck')}</span>
                          <span className="text-right" dir="ltr">
                            {item.neckToConfirm ? <ToConfirmTag /> : item.neckSizes}
                          </span>
                        </li>
                        <li className="flex justify-between gap-3 py-1.5 border-t border-dashed border-[var(--line)]">
                          <span className="text-[var(--muted)] uppercase shrink-0">{t('spec.dosage')}</span>
                          <span className="text-right" dir="ltr">
                            {item.dosage}
                          </span>
                        </li>
                        <li className="flex justify-between gap-3 py-1.5 border-t border-dashed border-[var(--line)]">
                          <span className="text-[var(--muted)] uppercase shrink-0">{t('spec.material')}</span>
                          <span className="text-[var(--muted)] text-right" dir="ltr">
                            {item.material}
                          </span>
                        </li>
                        <li className="flex justify-between gap-3 py-1.5 border-t border-dashed border-[var(--line)]">
                          <span className="text-[var(--muted)] uppercase shrink-0">{t('spec.output')}</span>
                          <span className="text-[var(--muted)] text-right" dir="ltr">
                            {item.featureSpec}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectProductForQuote(item.quoteValue, item.neckToConfirm ? '' : item.neckSizes)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--blue)] hover:text-[var(--red)] transition-colors cursor-pointer"
                      >
                        <span>{t('card.quote')}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                      </button>

                      <a
                        href={`#/products/${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          openProductPage(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 font-mono-spec text-xs uppercase tracking-wider text-[var(--ink)] hover:text-[var(--blue)] border border-[var(--line)] hover:border-[var(--blue)] px-2.5 py-1 rounded-[4px] transition-colors whitespace-nowrap"
                      >
                        <span>{t('card.moreInfo')}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="mt-4 text-sm text-[var(--muted)] font-mono-spec">
              Neck finish reads as diameter in millimetres / thread style. A 28/410 closure fits a 28 mm neck with a 410 thread.
            </p>
          </div>
        </section>

        {/* ===================== INTERACTIVE TRIGGER SPRAYER CONFIGURATOR ===================== */}
        <SprayerConfiguratorSection
          lang={lang}
          onQuoteConfigured={handleConfiguredTriggerQuote}
          t={t}
        />

        {/* ===================== 02. FACTORY (HIGH-CONTRAST INVERTED INK PLATE) ===================== */}
        <section id="factory" className="py-20 sm:py-24 bg-[var(--ink)] text-[var(--bg)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker={t('factory.kicker')}
              title={t('factory.title')}
              lead={t('factory.lead')}
              inverted
            />

            {/* 4 Architectural Plate Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-[color-mix(in_srgb,var(--bg)_25%,var(--ink))] mb-12">
              <div className="pt-6 pb-4 pr-4 border-b lg:border-b-0 border-r border-[color-mix(in_srgb,var(--bg)_25%,var(--ink))]">
                <div className="font-display font-black text-[clamp(56px,8vw,116px)] leading-[0.85] tabular-nums" dir="ltr">
                  <CountUpNumber target={15} />
                  <i className="not-italic text-[var(--red)]">+</i>
                </div>
                <span className="block font-mono-spec text-[12.5px] uppercase tracking-[0.08em] mt-3 text-[color-mix(in_srgb,var(--bg)_72%,var(--ink))]">
                  {t('stat.years')}
                </span>
              </div>

              <div className="pt-6 pb-4 px-5 border-b lg:border-b-0 lg:border-r border-[color-mix(in_srgb,var(--bg)_25%,var(--ink))]">
                <div className="font-display font-black text-[clamp(56px,8vw,116px)] leading-[0.85] tabular-nums" dir="ltr">
                  <CountUpNumber target={200} />
                  <i className="not-italic text-[var(--red)]">+</i>
                </div>
                <span className="block font-mono-spec text-[12.5px] uppercase tracking-[0.08em] mt-3 text-[color-mix(in_srgb,var(--bg)_72%,var(--ink))]">
                  {t('stat.employees')}
                </span>
              </div>

              <div className="pt-6 pb-4 pr-4 lg:pl-5 border-r border-[color-mix(in_srgb,var(--bg)_25%,var(--ink))]">
                <div className="font-display font-black text-[clamp(56px,8vw,116px)] leading-[0.85] tabular-nums" dir="ltr">
                  <CountUpNumber target={65} />
                  <i className="not-italic text-[var(--red)]">+</i>
                </div>
                <span className="block font-mono-spec text-[12.5px] uppercase tracking-[0.08em] mt-3 text-[color-mix(in_srgb,var(--bg)_72%,var(--ink))]">
                  {t('stat.machines')}
                </span>
              </div>

              <div className="pt-6 pb-4 pl-5">
                <div className="font-display font-black text-[clamp(56px,8vw,116px)] leading-[0.85] tabular-nums" dir="ltr">
                  <CountUpNumber target={13} />
                  <i className="not-italic text-[var(--red)]">+</i>
                </div>
                <span className="block font-mono-spec text-[12.5px] uppercase tracking-[0.08em] mt-3 text-[color-mix(in_srgb,var(--bg)_72%,var(--ink))]">
                  {t('stat.lines')}
                </span>
              </div>
            </div>

            {/* Factory Narrative + Real Building Photo */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start pt-6 border-t border-[color-mix(in_srgb,var(--bg)_20%,var(--ink))]">
              <div className="space-y-4 text-base sm:text-lg text-[color-mix(in_srgb,var(--bg)_82%,var(--ink))] leading-relaxed">
                <p>{t('factory.p1')}</p>
                <p>{t('factory.p2')}</p>

                <div className="pt-4 border-t border-[color-mix(in_srgb,var(--bg)_20%,var(--ink))] space-y-2.5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-spec uppercase text-xs text-[color-mix(in_srgb,var(--bg)_65%,var(--ink))]">
                      {t('factory.certLabel')}:
                    </span>
                    <ToConfirmTag />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-spec uppercase text-xs text-[color-mix(in_srgb,var(--bg)_65%,var(--ink))]">
                      {t('factory.workshopNote')}:
                    </span>
                    <ToConfirmTag />
                  </div>
                </div>

                <div className="pt-3">
                  <a
                    href="#/factory"
                    onClick={(e) => {
                      e.preventDefault();
                      openFactoryPage();
                    }}
                    className="inline-flex items-center gap-2 bg-[var(--bg)] text-[var(--ink)] font-semibold text-sm px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform"
                  >
                    <span>{t('factoryPage.profileCta')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <figure className="border border-[color-mix(in_srgb,var(--bg)_25%,var(--ink))] rounded-[4px] overflow-hidden bg-[var(--surface)] text-[var(--ink)]">
                <img
                  src="/images/factory-building.jpg"
                  alt={t('factory.caption')}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[360px] object-cover"
                />
                <figcaption className="px-4 py-3 border-t border-[var(--line)] bg-[var(--surface)] font-mono-spec text-[11px] text-[var(--muted)]">
                  {t('factory.caption')}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ===================== 03. PROCESS (RED-NODE TIMELINE RAIL) ===================== */}
        <section id="process" className="py-20 sm:py-24 bg-[var(--bg)] border-b border-[var(--line)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker={t('process.kicker')}
              title={t('process.title')}
              lead={t('process.lead')}
            />

            <ol className="yl-steps grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 m-0 p-0">
              <li className="pt-6 lg:pr-6">
                <h3 className="font-display font-bold uppercase text-[30px] leading-none text-[var(--ink)] mb-2">
                  {t('step1.title')}
                </h3>
                <p className="text-[15.5px] text-[var(--muted)] leading-relaxed max-w-[30ch]">
                  {t('step1.p')}
                </p>
              </li>

              <li className="pt-6 lg:pr-6">
                <h3 className="font-display font-bold uppercase text-[30px] leading-none text-[var(--ink)] mb-2">
                  {t('step2.title')}
                </h3>
                <p className="text-[15.5px] text-[var(--muted)] leading-relaxed max-w-[30ch]">
                  {t('step2.p')}
                </p>
              </li>

              <li className="pt-6 lg:pr-6">
                <h3 className="font-display font-bold uppercase text-[30px] leading-none text-[var(--ink)] mb-2">
                  {t('step3.title')}
                </h3>
                <p className="text-[15.5px] text-[var(--muted)] leading-relaxed max-w-[30ch]">
                  {t('step3.p')}
                </p>
              </li>

              <li className="pt-6">
                <h3 className="font-display font-bold uppercase text-[30px] leading-none text-[var(--ink)] mb-2">
                  {t('step4.title')}
                </h3>
                <p className="text-[15.5px] text-[var(--muted)] leading-relaxed max-w-[30ch]">
                  {t('step4.p')}
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ===================== 04. CUSTOMISATION ===================== */}
        <section id="custom" className="py-20 sm:py-24 bg-[var(--bg)] border-b border-[var(--line)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker={t('custom.kicker')}
              title={t('custom.title')}
              lead={t('custom.lead')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-[var(--line)] bg-[var(--surface)]">
              {/* Colours */}
              <div className="border-r border-b border-[var(--line)] p-6 flex flex-col">
                <h3 className="font-display font-bold uppercase text-[28px] leading-none text-[var(--ink)] mb-2">
                  {t('c1.title')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-5">{t('c1.p')}</p>
                <div className="mt-auto grid grid-cols-5 gap-2" aria-label="Custom colour samples">
                  {CUSTOM_SWATCHES.map((sw) => (
                    <span
                      key={sw.name}
                      title={sw.name}
                      className={`h-7 rounded-sm block ${
                        sw.border ? 'border border-[var(--line)]' : 'border border-black/15'
                      }`}
                      style={{ backgroundColor: sw.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Neck sizes */}
              <div className="border-r border-b border-[var(--line)] p-6 flex flex-col">
                <h3 className="font-display font-bold uppercase text-[28px] leading-none text-[var(--ink)] mb-2">
                  {t('c2.title')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4">{t('c2.p')}</p>
                <div
                  dir="ltr"
                  className="mt-auto grid grid-cols-3 border-t border-l border-[var(--line)] font-mono-spec text-xs text-[var(--blue)]"
                >
                  {NECK_SIZES_LIST.map((size) => (
                    <div
                      key={size}
                      className="px-2 py-1.5 border-r border-b border-[var(--line)] text-center bg-[var(--bg)]"
                    >
                      {size}
                    </div>
                  ))}
                  <div className="px-2 py-1.5 border-r border-b border-[var(--line)] text-center bg-[var(--surface)] text-[var(--muted)]">
                    Custom
                  </div>
                </div>
              </div>

              {/* Dip tube length */}
              <div className="border-r border-b border-[var(--line)] p-6 flex flex-col">
                <h3 className="font-display font-bold uppercase text-[28px] leading-none text-[var(--ink)] mb-2">
                  {t('c3.title')}
                </h3>
                <div className="flex items-end gap-4 mt-2 flex-1">
                  <div dir="ltr" className="shrink-0">
                    <svg
                      viewBox="0 0 74 124"
                      className="w-[72px] h-[120px]"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 20q0-8 8-8h26q8 0 8 8v84q0 8-8 8H22q-8 0-8-8z"
                        fill="var(--bg)"
                        stroke="var(--blue)"
                        strokeWidth="2"
                      />
                      <line x1="35" y1="6" x2="35" y2="103" stroke="var(--blue)" strokeWidth="3" />
                      <path d="M30 101l5 7 5-7" fill="none" stroke="var(--blue)" strokeWidth="1.8" />
                      <line x1="60" y1="6" x2="60" y2="112" stroke="var(--muted)" strokeWidth="1" />
                      <path d="M60 6l-3 7h6zM60 112l-3-7h6z" fill="var(--muted)" />
                      <text x="64" y="64" className="font-mono-spec" fontSize="10" fill="var(--blue)">
                        L
                      </text>
                    </svg>
                  </div>
                  <p className="text-[15px] text-[var(--muted)] leading-relaxed">{t('c3.p')}</p>
                </div>
              </div>

              {/* Components, Printing & Packing */}
              <div className="border-r border-b border-[var(--line)] p-6 flex flex-col">
                <h3 className="font-display font-bold uppercase text-[28px] leading-none text-[var(--ink)] mb-2">
                  {t('c4.title')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4">{t('c4.p')}</p>
                <div className="mt-auto pt-3 border-t border-dashed border-[var(--line)] space-y-1.5 text-xs">
                  <div className="font-mono-spec text-[var(--muted)]">{t('c4.confirm')}:</div>
                  <div>
                    <ToConfirmTag />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 05. BLOG & TECHNICAL GUIDES ===================== */}
        <section id="blog" className="py-20 sm:py-24 bg-[var(--bg)] border-b border-[var(--line)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker={t('blog.kicker')}
              title={t('blog.title')}
              lead={t('blog.lead')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[var(--line)] bg-[var(--surface)]">
              {mergedBlogPosts.map((post) => {
                const postCopy = post.content[lang] ?? post.content.en;
                return (
                  <article
                    key={post.id}
                    className="yl-product-card border-r border-b border-[var(--line)] flex flex-col"
                  >
                    {post.image && (
                      <div className="h-44 bg-[var(--bg)] border-b border-[var(--line)] flex items-center justify-center p-4">
                        <img
                          src={post.image}
                          alt={postCopy.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="max-h-36 w-auto object-contain"
                        />
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 font-mono-spec text-[11px] uppercase tracking-[0.06em] text-[var(--muted)] mb-3">
                        <span className="text-[var(--blue)]" dir="ltr">
                          {post.refCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{postCopy.category}</span>
                      </div>

                      <h3 className="font-display font-bold uppercase text-[26px] leading-[1.02] text-[var(--ink)] mb-3">
                        {postCopy.title}
                      </h3>

                      <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4">
                        {postCopy.summary}
                      </p>

                      <div className="mt-auto pt-3.5 border-t border-dashed border-[var(--line)]">
                        <p className="font-mono-spec text-[11px] text-[var(--muted)] leading-relaxed mb-3" dir="ltr">
                          {postCopy.specTakeaway}
                        </p>
                        <a
                          href={`#/blog/${post.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            openPostPage(post.id);
                          }}
                          className="w-full flex items-center justify-between text-sm font-semibold text-[var(--blue)] hover:text-[var(--red)] transition-colors pt-2 border-t border-[var(--line)]"
                        >
                          <span>{t('blog.read')}</span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-mono-spec text-[var(--muted)]">
              <span>{t('blog.archiveNote')}:</span>
              <ToConfirmTag />
            </div>
          </div>
        </section>

        {/* ===================== 06. SOCIAL MEDIA & DIRECT CHANNELS ===================== */}
        <section id="social" className="py-20 sm:py-24 bg-[var(--bg)] border-b border-[var(--line)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker={t('social.kicker')}
              title={t('social.title')}
              lead={t('social.lead')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--line)] bg-[var(--surface)]">
              {/* CH 06.1: WhatsApp */}
              <div className="border-r border-b border-[var(--line)] p-6 bg-[color-mix(in_srgb,var(--blue)_6%,var(--surface))] flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--blue)]" dir="ltr">
                    CH 06.1
                  </span>
                  <MessageSquare className="w-5 h-5 text-[var(--blue)]" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold uppercase text-[26px] leading-none text-[var(--ink)] mb-2">
                  {t('social.waTitle')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4 flex-1">
                  {t('social.waDesc')}
                </p>
                <div className="pt-3.5 border-t border-[var(--line)] flex items-center justify-between gap-3">
                  <span className="font-mono-spec text-xs text-[var(--ink)]" dir="ltr">
                    {FACTORY_PHONE}
                  </span>
                  <a
                    href={FACTORY_WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono-spec text-xs uppercase tracking-wider bg-[var(--blue)] text-[var(--btn-ink)] px-3 py-1.5 rounded-[4px] transition-transform hover:-translate-y-px whitespace-nowrap"
                  >
                    <span>{t('social.waCta')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* CH 06.2: WeChat */}
              <div className="yl-product-card border-r border-b border-[var(--line)] p-6 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]" dir="ltr">
                    CH 06.2
                  </span>
                  <Share2 className="w-5 h-5 text-[var(--blue)]" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold uppercase text-[26px] leading-none text-[var(--ink)] mb-2">
                  {t('social.wcTitle')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4 flex-1">
                  {t('social.wcDesc')}
                </p>
                <div className="pt-3.5 border-t border-dashed border-[var(--line)] flex items-center justify-between gap-3">
                  <ToConfirmTag />
                  <a
                    href={`mailto:${FACTORY_EMAIL}?subject=${encodeURIComponent('WeChat ID Request — Yi Lai Plastics')}`}
                    className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase text-[var(--blue)] hover:text-[var(--red)]"
                  >
                    <span>{t('social.emailFallback')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* CH 06.3: LinkedIn */}
              <div className="yl-product-card border-r border-b border-[var(--line)] p-6 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]" dir="ltr">
                    CH 06.3
                  </span>
                  <Building2 className="w-5 h-5 text-[var(--blue)]" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold uppercase text-[26px] leading-none text-[var(--ink)] mb-2">
                  {t('social.liTitle')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4 flex-1">
                  {t('social.liDesc')}
                </p>
                <div className="pt-3.5 border-t border-dashed border-[var(--line)] flex items-center justify-between gap-3">
                  <ToConfirmTag />
                  <a
                    href={`mailto:${FACTORY_EMAIL}?subject=${encodeURIComponent('LinkedIn Profile Request — Yi Lai Plastics')}`}
                    className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase text-[var(--blue)] hover:text-[var(--red)]"
                  >
                    <span>{t('social.emailFallback')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* CH 06.4: Alibaba */}
              <div className="yl-product-card border-r border-b border-[var(--line)] p-6 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]" dir="ltr">
                    CH 06.4
                  </span>
                  <Globe className="w-5 h-5 text-[var(--blue)]" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold uppercase text-[26px] leading-none text-[var(--ink)] mb-2">
                  {t('social.aliTitle')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4 flex-1">
                  {t('social.aliDesc')}
                </p>
                <div className="pt-3.5 border-t border-dashed border-[var(--line)] flex items-center justify-between gap-3">
                  <ToConfirmTag />
                  <a
                    href={`mailto:${FACTORY_EMAIL}?subject=${encodeURIComponent('Alibaba Storefront Link Request — Yi Lai Plastics')}`}
                    className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase text-[var(--blue)] hover:text-[var(--red)]"
                  >
                    <span>{t('social.emailFallback')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* CH 06.5: Instagram & TikTok */}
              <div className="yl-product-card border-r border-b border-[var(--line)] p-6 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]" dir="ltr">
                    CH 06.5
                  </span>
                  <Camera className="w-5 h-5 text-[var(--blue)]" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold uppercase text-[26px] leading-none text-[var(--ink)] mb-2">
                  {t('social.igTitle')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4 flex-1">
                  {t('social.igDesc')}
                </p>
                <div className="pt-3.5 border-t border-dashed border-[var(--line)] flex items-center justify-between gap-3">
                  <ToConfirmTag />
                  <a
                    href={`mailto:${FACTORY_EMAIL}?subject=${encodeURIComponent('Social Media Handle Request — Yi Lai Plastics')}`}
                    className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase text-[var(--blue)] hover:text-[var(--red)]"
                  >
                    <span>{t('social.emailFallback')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* CH 06.6: YouTube */}
              <div className="yl-product-card border-r border-b border-[var(--line)] p-6 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]" dir="ltr">
                    CH 06.6
                  </span>
                  <Video className="w-5 h-5 text-[var(--blue)]" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold uppercase text-[26px] leading-none text-[var(--ink)] mb-2">
                  {t('social.ytTitle')}
                </h3>
                <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4 flex-1">
                  {t('social.ytDesc')}
                </p>
                <div className="pt-3.5 border-t border-dashed border-[var(--line)] flex items-center justify-between gap-3">
                  <ToConfirmTag />
                  <a
                    href={`mailto:${FACTORY_EMAIL}?subject=${encodeURIComponent('YouTube Channel Request — Yi Lai Plastics')}`}
                    className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase text-[var(--blue)] hover:text-[var(--red)]"
                  >
                    <span>{t('social.emailFallback')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== 07. LIVE SPLIT INQUIRY BUILDER ===================== */}
        <section id="quote" className="py-20 sm:py-24 bg-[var(--bg)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <SectionHeading
              kicker={t('quote.kicker')}
              title={t('quote.title')}
              lead={t('quote.lead')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] border border-[var(--line)] bg-[var(--surface)]">
              {/* Left Form Fields */}
              <form
                onSubmit={handleFormSubmit}
                noValidate
                className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="q-product"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.product')} <span className="text-[var(--red)]">*</span>
                  </label>
                  <select
                    id="q-product"
                    value={product}
                    onChange={(e) => {
                      setProduct(e.target.value);
                      setFormErrors((p) => ({ ...p, product: false }));
                    }}
                    aria-invalid={formErrors.product}
                    className={`w-full px-3 py-2.5 rounded-[4px] border bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)] ${
                      formErrors.product ? 'border-[var(--red)]' : 'border-[var(--line)]'
                    }`}
                  >
                    <option value="">{t('f.select')}</option>
                    {mergedProducts.map((p) => (
                      <option key={p.id} value={p.quoteValue}>
                        {p.directTitle ?? (p.titleKey ? t(p.titleKey) : p.id)} ({p.modelRange})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="q-neck"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.neck')}
                  </label>
                  <input
                    id="q-neck"
                    type="text"
                    value={neck}
                    onChange={(e) => setNeck(e.target.value)}
                    placeholder={t('f.neck.ph')}
                    className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="q-qty"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.qty')} <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    id="q-qty"
                    type="text"
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => {
                      setQty(e.target.value);
                      setFormErrors((p) => ({ ...p, qty: false }));
                    }}
                    placeholder={t('f.qty.ph')}
                    aria-invalid={formErrors.qty}
                    className={`w-full px-3 py-2.5 rounded-[4px] border bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)] ${
                      formErrors.qty ? 'border-[var(--red)]' : 'border-[var(--line)]'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="q-colour"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.colour')}
                  </label>
                  <div className="grid grid-cols-[56px_1fr] gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      aria-label="Pick a colour swatch"
                      className="h-[44px] w-full p-1 rounded-[4px] border border-[var(--line)] bg-[var(--bg)] cursor-pointer"
                    />
                    <input
                      id="q-colour"
                      type="text"
                      value={colour}
                      onChange={(e) => setColour(e.target.value)}
                      placeholder={t('f.colour.ph')}
                      className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="q-name"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.name')} <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    id="q-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFormErrors((p) => ({ ...p, name: false }));
                    }}
                    aria-invalid={formErrors.name}
                    className={`w-full px-3 py-2.5 rounded-[4px] border bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)] ${
                      formErrors.name ? 'border-[var(--red)]' : 'border-[var(--line)]'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="q-company"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.company')}
                  </label>
                  <input
                    id="q-company"
                    type="text"
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label
                    htmlFor="q-country"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.country')} <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    id="q-country"
                    type="text"
                    autoComplete="country-name"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setFormErrors((p) => ({ ...p, country: false }));
                    }}
                    placeholder={t('f.country.ph')}
                    aria-invalid={formErrors.country}
                    className={`w-full px-3 py-2.5 rounded-[4px] border bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)] ${
                      formErrors.country ? 'border-[var(--red)]' : 'border-[var(--line)]'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label
                    htmlFor="q-message"
                    className="font-mono-spec text-[11.5px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {t('f.message')}
                  </label>
                  <textarea
                    id="q-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('f.message.ph')}
                    className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-[15px] focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                {Object.values(formErrors).some(Boolean) && (
                  <p role="alert" className="sm:col-span-2 text-sm font-medium text-[var(--red)]">
                    {t('f.error')}
                  </p>
                )}

                <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-[15px] px-5 py-3 rounded-[4px] hover:-translate-y-px active:translate-y-px transition-transform cursor-pointer"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span>{t('f.submit')}</span>
                  </button>
                  <span className="text-xs text-[var(--muted)]">{t('f.note')}</span>
                </div>
              </form>

              {/* Right Live Preview + Copy/Email/WhatsApp Panel */}
              <div className="border-t lg:border-t-0 lg:border-l border-[var(--line)] p-6 sm:p-8 flex flex-col gap-5">
                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 items-center">
                  <ProductDrawing
                    variant={resolveDrawingVariant(liveQuoteDraft.selectedLabel)}
                    accentHex={colorHex}
                    className="w-[110px] h-[146px]"
                  />
                  <div>
                    <span className="block font-mono-spec text-[12px] uppercase tracking-[0.08em] text-[var(--muted)]">
                      Your selection
                    </span>
                    <b className="block font-display font-black uppercase text-[32px] leading-none text-[var(--ink)] mt-1 mb-1.5">
                      {liveQuoteDraft.selectedLabel}
                    </b>
                    <span className="font-mono-spec text-xs text-[var(--blue)]" dir="ltr">
                      {liveQuoteDraft.neckLabel}
                    </span>
                  </div>
                </div>

                <pre
                  dir="ltr"
                  aria-live="polite"
                  className="font-mono-spec text-[12.5px] leading-relaxed whitespace-pre-wrap break-words bg-[var(--bg)] border border-dashed border-[var(--line)] rounded-[4px] p-4 text-[var(--ink)] m-0"
                >
                  {liveQuoteDraft.body}
                </pre>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyPrepared}
                    className="inline-flex items-center gap-2 bg-[var(--blue)] text-[var(--btn-ink)] font-semibold text-sm px-4 py-2.5 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? t('f.copied') : t('f.copy')}</span>
                  </button>

                  <a
                    href={liveQuoteDraft.mailto}
                    className="inline-flex items-center gap-2 bg-transparent text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)] font-semibold text-sm px-4 py-2.5 rounded-[4px] hover:-translate-y-px transition-transform"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open in email</span>
                  </a>

                  <a
                    href={liveQuoteDraft.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-transparent text-[var(--blue)] ring-1 ring-inset ring-[var(--blue)] font-semibold text-sm px-4 py-2.5 rounded-[4px] hover:-translate-y-px transition-transform"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t('f.whatsappBtn')}</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div>
                    <span className="block font-mono-spec text-[11px] uppercase text-[var(--muted)]">
                      {t('inq.email')}
                    </span>
                    <a
                      href={`mailto:${FACTORY_EMAIL}`}
                      dir="ltr"
                      className="font-mono-spec text-sm text-[var(--ink)] hover:text-[var(--blue)]"
                    >
                      {FACTORY_EMAIL}
                    </a>
                  </div>
                  <div>
                    <span className="block font-mono-spec text-[11px] uppercase text-[var(--muted)]">
                      {t('inq.phone')}
                    </span>
                    <a
                      href="tel:+8613757050848"
                      dir="ltr"
                      className="font-mono-spec text-sm text-[var(--ink)] hover:text-[var(--blue)]"
                    >
                      {FACTORY_PHONE}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-[var(--line)] bg-[var(--bg)] py-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[var(--line)] bg-[var(--surface)]">
            <div className="p-5 border-b lg:border-b-0 sm:border-r border-[var(--line)]">
              <div className="flex items-center gap-2.5 mb-2.5">
                <svg className="w-8 h-8 shrink-0" viewBox="0 0 38 38" aria-hidden="true">
                  <rect width="38" height="38" rx="4" fill="var(--blue)" />
                  <path d="M9 9l10 12L29 9" fill="none" stroke="var(--btn-ink)" strokeWidth="4.5" />
                  <rect x="16.7" y="20" width="4.6" height="10" fill="var(--red)" />
                </svg>
                <div>
                  <strong className="font-display font-black text-lg uppercase leading-none block text-[var(--ink)]">
                    YI LAI PLASTICS
                  </strong>
                  <span className="font-mono-spec text-[10px] text-[var(--muted)]">
                    {t('hero.slogan')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{t('foot.legal')}</p>
            </div>

            <div className="p-5 border-b lg:border-b-0 lg:border-r border-[var(--line)]">
              <div className="font-mono-spec text-[10px] uppercase tracking-[0.12em] text-[var(--blue)] mb-2">
                {t('foot.addrTitle')}
              </div>
              <p className="text-sm text-[var(--ink)] mb-2">{t('foot.addr')}</p>
              <div className="text-xs text-[var(--muted)] flex items-center gap-2">
                <span>{t('foot.street')}:</span>
                <ToConfirmTag />
              </div>
            </div>

            <div className="p-5 border-b sm:border-b-0 sm:border-r border-[var(--line)]">
              <div className="font-mono-spec text-[10px] uppercase tracking-[0.12em] text-[var(--blue)] mb-2">
                {t('foot.contactTitle')}
              </div>
              <div className="space-y-1.5 text-sm">
                <a
                  href={`mailto:${FACTORY_EMAIL}`}
                  dir="ltr"
                  className="block text-[var(--ink)] hover:text-[var(--blue)]"
                >
                  {FACTORY_EMAIL}
                </a>
                <a
                  href="tel:+8613757050848"
                  dir="ltr"
                  className="block text-[var(--ink)] hover:text-[var(--blue)]"
                >
                  Tel: {FACTORY_PHONE}
                </a>
                <a
                  href={FACTORY_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-flex items-center gap-1.5 text-[var(--ink)] hover:text-[#25D366] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.82 14.07c-.24.68-1.41 1.3-1.95 1.38-.52.08-1.18.11-1.9-.12-.44-.14-1-.33-1.71-.64-3.01-1.3-4.97-4.33-5.12-4.53-.15-.2-1.22-1.62-1.22-3.09s.77-2.2 1.05-2.5c.28-.3.6-.38.8-.38.2 0 .4 0 .58.01.18.01.43-.07.67.51.24.6.84 2.06.92 2.21.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.45.53-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.45 1.51.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.58.35.07.12.07.72-.17 1.4z" />
                  </svg>
                  <span>WhatsApp: {FACTORY_PHONE}</span>
                </a>
              </div>
            </div>

            <div className="p-5">
              <div className="font-mono-spec text-[10px] uppercase tracking-[0.12em] text-[var(--blue)] mb-2">
                {t('foot.linksTitle')}
              </div>
              <div className="space-y-2 text-sm">
                <a
                  href={CATALOG_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--blue)] font-medium hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('foot.catalogLink')}</span>
                </a>
                <div className="text-xs text-[var(--muted)] flex flex-wrap items-center gap-2">
                  <span>{t('foot.social')}:</span>
                  <ToConfirmTag />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-2 font-mono-spec text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
            <span>© {new Date().getFullYear()} Yi Lai Plastics Industry</span>
            <div className="flex items-center gap-4">
              <a
                href="#/admin"
                onClick={(e) => {
                  e.preventDefault();
                  openAdminPage();
                }}
                className="inline-flex items-center gap-1 hover:text-[var(--blue)] transition-colors"
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                <span>Admin</span>
              </a>
              <span>{t('foot.rights')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick-Chat Button */}
      {!isAdminPage && (
        <a
          href={FACTORY_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Yi Lai Plastics on WhatsApp"
          title={`WhatsApp: ${FACTORY_PHONE}`}
          className="fixed bottom-5 end-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 transition-transform"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.82 14.07c-.24.68-1.41 1.3-1.95 1.38-.52.08-1.18.11-1.9-.12-.44-.14-1-.33-1.71-.64-3.01-1.3-4.97-4.33-5.12-4.53-.15-.2-1.22-1.62-1.22-3.09s.77-2.2 1.05-2.5c.28-.3.6-.38.8-.38.2 0 .4 0 .58.01.18.01.43-.07.67.51.24.6.84 2.06.92 2.21.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.45.53-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.45 1.51.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.58.35.07.12.07.72-.17 1.4z" />
          </svg>
        </a>
      )}
    </div>
  );
}
