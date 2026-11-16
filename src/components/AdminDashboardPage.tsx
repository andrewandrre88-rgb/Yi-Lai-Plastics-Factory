import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowLeft,
  Check,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  Globe,
  Link2,
  Lock,
  LogOut,
  Package,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { PRODUCT_FAMILIES } from '../data/catalog';
import { BLOG_POSTS } from '../data/blogPosts';
import {
  DEFAULT_CATALOG_FILE_NAME,
  MASKED_ADMIN_EMAIL,
  MAX_CATALOG_PDF_BYTES,
  formatFileSize,
  isAuthorizedAdmin,
  maskEmailAddress,
  removeBlogPost,
  removeProduct,
  removeSeoSetting,
  resetCatalogToDefault,
  sanitizeSlugId,
  saveBlogPost,
  saveCatalogExternalUrl,
  saveProduct,
  saveSeoSetting,
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeAllBlogPostsAdmin,
  subscribeAllProductsAdmin,
  uploadCatalogPdfFile,
  type CatalogUploadProgress,
  type CmsBlogPostDoc,
  type CmsBlogPostInput,
  type CmsCatalogConfigDoc,
  type CmsProductDoc,
  type CmsProductInput,
  type CmsSeoSettingDoc,
  type CmsSeoSettingInput,
  type ProductCategory,
  type SeoPageKey,
} from '../lib/firebase';
import { DEFAULT_SEO_PRESETS } from '../lib/seo';
import { CatalogLink } from './CatalogLink';
import { ImageUploadField, MultiImageUploadField } from './ImageUploadField';

interface AdminDashboardPageProps {
  user: User | null;
  authReady: boolean;
  seoSettings: Record<string, CmsSeoSettingDoc>;
  catalogConfig: CmsCatalogConfigDoc | null;
  onNavigateHomeSection: (sectionId?: string) => void;
  onOpenPostPage: (postId: string) => void;
  onOpenProductPage: (productId: string) => void;
  t: (key: string) => string;
}

type AdminTab = 'products' | 'blog' | 'seo' | 'catalog';

const SAMPLE_IMAGE_PATHS = [
  { label: 'Trigger TS001', path: '/images/prod-trigger-ts001.jpg' },
  { label: 'Trigger TS014', path: '/images/prod-trigger-ts014.jpg' },
  { label: 'Mini Trigger', path: '/images/prod-mini-mts001.jpg' },
  { label: 'Lotion LPS002', path: '/images/prod-lotion-lps002.jpg' },
  { label: 'Fine Mist', path: '/images/prod-mist-fms008.jpg' },
  { label: 'Foam FP001', path: '/images/prod-foam-fp001.jpg' },
  { label: 'Foundation', path: '/images/prod-foundation-fnp001.jpg' },
  { label: 'Factory Yard', path: '/images/factory-building.jpg' },
];

const EMPTY_PRODUCT_FORM: CmsProductInput = {
  id: '',
  category: 'trigger',
  figCode: 'FIG 1.8',
  modelRange: '',
  title: '',
  uses: '',
  neckSizes: '28/400 · 28/410 · 28/415',
  neckToConfirm: false,
  dosage: '0.8 – 1.0 ml/T',
  material: 'PP',
  featureSpec: '',
  image: '/images/prod-trigger-ts001.jpg',
  images: ['/images/prod-trigger-ts001.jpg'],
  altText: '',
  quoteValue: '',
  published: true,
};

const EMPTY_BLOG_FORM: CmsBlogPostInput = {
  id: '',
  index: '04',
  refCode: 'NOTE 05.4',
  category: 'Packaging Guide',
  title: '',
  summary: '',
  specTakeaway: '',
  paragraphs: [''],
  relatedProduct: 'Trigger sprayer (TS001-TS021)',
  image: '/images/prod-trigger-ts001.jpg',
  seoTitle: '',
  seoDescription: '',
  published: true,
};

const SEO_PAGE_KEYS: { key: SeoPageKey; label: string }[] = [
  { key: 'global', label: 'Global Defaults' },
  { key: 'home', label: 'Home Page' },
  { key: 'factory', label: 'Yi Lai Factory (#/factory)' },
  { key: 'use-cases', label: 'Use Cases (#/use-cases)' },
  { key: 'trigger-sprayers', label: 'Trigger Sprayers (#/products/trigger-sprayers)' },
];

export function AdminDashboardPage({
  user,
  authReady,
  seoSettings,
  catalogConfig,
  onNavigateHomeSection,
  onOpenPostPage,
  onOpenProductPage,
  t,
}: AdminDashboardPageProps) {
  const isAdmin = isAuthorizedAdmin(user);

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Admin live Firestore lists
  const [adminProducts, setAdminProducts] = useState<CmsProductDoc[]>([]);
  const [adminPosts, setAdminPosts] = useState<CmsBlogPostDoc[]>([]);
  const [statusNotice, setStatusNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Product Form
  const [productForm, setProductForm] = useState<CmsProductInput>(EMPTY_PRODUCT_FORM);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<string | null>(null);

  // Blog Form
  const [blogForm, setBlogForm] = useState<CmsBlogPostInput>(EMPTY_BLOG_FORM);
  const [blogBodyText, setBlogBodyText] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [confirmDeletePost, setConfirmDeletePost] = useState<string | null>(null);

  // SEO Form
  const [selectedSeoKey, setSelectedSeoKey] = useState<SeoPageKey>('global');
  const [seoForm, setSeoForm] = useState<CmsSeoSettingInput>(DEFAULT_SEO_PRESETS.global);
  const [savingSeo, setSavingSeo] = useState(false);

  // Catalog PDF Form
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [catalogButtonLabel, setCatalogButtonLabel] = useState('');
  const [catalogExternalUrl, setCatalogExternalUrl] = useState('');
  const [catalogExternalName, setCatalogExternalName] = useState('');
  const [catalogProgress, setCatalogProgress] = useState<CatalogUploadProgress | null>(null);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [dragOverCatalog, setDragOverCatalog] = useState(false);

  // Automatically sign out unauthorized non-admin Google accounts cleanly
  useEffect(() => {
    if (!authReady || !user) return;
    if (!isAuthorizedAdmin(user)) {
      const attempted = user.email ? maskEmailAddress(user.email) : 'unknown account';
      setAuthError(
        `Access denied for ${attempted}. Only ${MASKED_ADMIN_EMAIL} is permitted to manage Yi Lai CMS data.`
      );
      void signOutAdmin();
    } else {
      setAuthError(null);
    }
  }, [authReady, user]);

  // Attach admin-all Firestore listeners strictly when auth is ready & admin verified
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setAdminProducts([]);
      setAdminPosts([]);
      return;
    }

    const unsubProducts = subscribeAllProductsAdmin(
      (items) => setAdminProducts(items),
      (err) => setStatusNotice({ type: 'err', text: err.message })
    );
    const unsubPosts = subscribeAllBlogPostsAdmin(
      (items) => setAdminPosts(items),
      (err) => setStatusNotice({ type: 'err', text: err.message })
    );

    return () => {
      unsubProducts();
      unsubPosts();
    };
  }, [authReady, isAdmin]);

  // Sync SEO editor form when switching SEO page keys or receiving live updates
  useEffect(() => {
    const existing = seoSettings[selectedSeoKey];
    if (existing) {
      setSeoForm({
        id: selectedSeoKey,
        pageKey: existing.pageKey,
        title: existing.title,
        description: existing.description,
        keywords: existing.keywords,
        ogTitle: existing.ogTitle,
        ogDescription: existing.ogDescription,
        ogSiteName: existing.ogSiteName,
        ogImage: existing.ogImage,
        twitterCard: existing.twitterCard,
        canonicalBaseUrl: existing.canonicalBaseUrl,
        schemaOrgName: existing.schemaOrgName,
        schemaOrgDescription: existing.schemaOrgDescription,
        isPublic: true,
      });
    } else {
      setSeoForm({ ...DEFAULT_SEO_PRESETS[selectedSeoKey] });
    }
  }, [selectedSeoKey, seoSettings]);

  // Sync Catalog PDF form fields from live Firestore config
  useEffect(() => {
    if (!catalogConfig) return;
    setCatalogButtonLabel(catalogConfig.buttonLabel || '');
    if (catalogConfig.mode === 'url') {
      setCatalogExternalUrl(catalogConfig.pdfUrl || '');
      setCatalogExternalName(catalogConfig.fileName || '');
    }
  }, [catalogConfig]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      const signedInUser = await signInAdminWithGoogle();
      if (!isAuthorizedAdmin(signedInUser)) {
        const attempted = signedInUser.email ? maskEmailAddress(signedInUser.email) : 'this account';
        setAuthError(
          `Access denied for ${attempted}. Only ${MASKED_ADMIN_EMAIL} can log in.`
        );
        await signOutAdmin();
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Google sign-in cancelled or failed.';
      const errCode = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
      if (errCode === 'auth/unauthorized-domain' || rawMessage.includes('auth/unauthorized-domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setAuthError(
          `Firebase blocked sign-in from "${currentHost}" (auth/unauthorized-domain). Add "${currentHost}" in Firebase Console (project gen-lang-client-0738073213) → Authentication → Settings → Authorized domains.`
        );
      } else {
        setAuthError(rawMessage);
      }
    } finally {
      setSigningIn(false);
    }
  };

  // ==================== PRODUCT HANDLERS ====================
  const handleProductTitleChange = (val: string) => {
    setProductForm((prev) => ({
      ...prev,
      title: val,
      id: editingProductId ? prev.id : sanitizeSlugId(val),
      quoteValue: prev.quoteValue || val,
      altText: prev.altText || `Yi Lai Plastics ${val}`,
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);
    const slug = editingProductId || sanitizeSlugId(productForm.id || productForm.title);
    if (!slug) {
      setStatusNotice({ type: 'err', text: 'Please enter a valid slug ID (letters, numbers, hyphens).' });
      return;
    }
    setSavingProduct(true);
    try {
      await saveProduct({
        ...productForm,
        id: slug,
        image: productForm.images[0] ?? productForm.image,
        images: productForm.images,
        altText: productForm.altText.trim() || `Yi Lai Plastics ${productForm.title}`,
        quoteValue: productForm.quoteValue.trim() || `${productForm.title} (${productForm.modelRange})`,
      });
      setStatusNotice({
        type: 'ok',
        text: `Product "${productForm.title}" saved to Firestore (#/products/${slug}).`,
      });
      setEditingProductId(null);
      setProductForm({
        ...EMPTY_PRODUCT_FORM,
        figCode: `FIG 1.${PRODUCT_FAMILIES.length + adminProducts.length + 1}`,
      });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save product.',
      });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProduct = (item: CmsProductDoc) => {
    const gallery =
      item.images && item.images.length > 0
        ? item.images
        : item.image
          ? [item.image]
          : [];
    setEditingProductId(item.id);
    setProductForm({
      id: item.id,
      category: item.category,
      figCode: item.figCode,
      modelRange: item.modelRange,
      title: item.title,
      uses: item.uses,
      neckSizes: item.neckSizes,
      neckToConfirm: item.neckToConfirm,
      dosage: item.dosage,
      material: item.material,
      featureSpec: item.featureSpec,
      image: gallery[0] ?? '',
      images: gallery,
      altText: item.altText,
      quoteValue: item.quoteValue,
      published: item.published,
    });
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleProductPublish = async (item: CmsProductDoc) => {
    try {
      await saveProduct({
        ...item,
        published: !item.published,
      });
      setStatusNotice({
        type: 'ok',
        text: `"${item.title}" is now ${!item.published ? 'Published' : 'Draft'}.`,
      });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to toggle publish state.',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await removeProduct(id);
      setConfirmDeleteProduct(null);
      if (editingProductId === id) {
        setEditingProductId(null);
        setProductForm(EMPTY_PRODUCT_FORM);
      }
      setStatusNotice({ type: 'ok', text: `Product "${id}" deleted from Firestore.` });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to delete product.',
      });
    }
  };

  const handleCloneCatalogProduct = (builtinId: string) => {
    const found = PRODUCT_FAMILIES.find((p) => p.id === builtinId);
    if (!found) return;
    const gallery = [found.image, found.altImage].filter((v): v is string => Boolean(v));
    setEditingProductId(found.id);
    setProductForm({
      id: found.id,
      category: found.category,
      figCode: found.figCode,
      modelRange: found.modelRange,
      title: t(found.titleKey),
      uses: t(found.usesKey),
      neckSizes: found.neckSizes,
      neckToConfirm: Boolean(found.neckToConfirm),
      dosage: found.dosage,
      material: found.material,
      featureSpec: found.featureSpec,
      image: gallery[0] ?? '',
      images: gallery,
      altText: t(found.altKey),
      quoteValue: found.quoteValue,
      published: true,
    });
  };

  // ==================== BLOG HANDLERS ====================
  const handleBlogTitleChange = (val: string) => {
    setBlogForm((prev) => ({
      ...prev,
      title: val,
      id: editingPostId ? prev.id : sanitizeSlugId(val),
    }));
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);
    const slug = editingPostId || sanitizeSlugId(blogForm.id || blogForm.title);
    if (!slug) {
      setStatusNotice({ type: 'err', text: 'Please enter a valid URL slug ID for the blog post.' });
      return;
    }
    const paragraphs = blogBodyText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paragraphs.length === 0) {
      setStatusNotice({ type: 'err', text: 'Enter at least one article paragraph.' });
      return;
    }

    setSavingBlog(true);
    try {
      await saveBlogPost({
        ...blogForm,
        id: slug,
        paragraphs,
      });
      setStatusNotice({
        type: 'ok',
        text: `Blog post "${blogForm.title}" saved to Firestore (${slug}).`,
      });
      setEditingPostId(null);
      setBlogForm({
        ...EMPTY_BLOG_FORM,
        index: String(BLOG_POSTS.length + adminPosts.length + 1).padStart(2, '0'),
        refCode: `NOTE 05.${BLOG_POSTS.length + adminPosts.length + 1}`,
      });
      setBlogBodyText('');
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save blog post.',
      });
    } finally {
      setSavingBlog(false);
    }
  };

  const handleEditBlog = (post: CmsBlogPostDoc) => {
    setEditingPostId(post.id);
    setBlogForm({
      id: post.id,
      index: post.index,
      refCode: post.refCode,
      category: post.category,
      title: post.title,
      summary: post.summary,
      specTakeaway: post.specTakeaway,
      paragraphs: post.paragraphs,
      relatedProduct: post.relatedProduct,
      image: post.image,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      published: post.published,
    });
    setBlogBodyText(post.paragraphs.join('\n\n'));
    setActiveTab('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloneBuiltinBlog = (postId: string) => {
    const found = BLOG_POSTS.find((p) => p.id === postId);
    if (!found) return;
    const en = found.content.en;
    setEditingPostId(found.id);
    setBlogForm({
      id: found.id,
      index: found.index,
      refCode: found.refCode,
      category: en.category,
      title: en.title,
      summary: en.summary,
      specTakeaway: en.specTakeaway,
      paragraphs: en.paragraphs,
      relatedProduct: found.relatedProduct,
      image: found.image || '',
      seoTitle: en.title.slice(0, 120),
      seoDescription: en.summary.slice(0, 240),
      published: true,
    });
    setBlogBodyText(en.paragraphs.join('\n\n'));
  };

  const handleToggleBlogPublish = async (post: CmsBlogPostDoc) => {
    try {
      await saveBlogPost({
        ...post,
        published: !post.published,
      });
      setStatusNotice({
        type: 'ok',
        text: `"${post.title}" is now ${!post.published ? 'Published' : 'Draft'}.`,
      });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to toggle post visibility.',
      });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      await removeBlogPost(id);
      setConfirmDeletePost(null);
      if (editingPostId === id) {
        setEditingPostId(null);
        setBlogForm(EMPTY_BLOG_FORM);
        setBlogBodyText('');
      }
      setStatusNotice({ type: 'ok', text: `Blog post "${id}" deleted from Firestore.` });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to delete blog post.',
      });
    }
  };

  // ==================== SEO HANDLERS ====================
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);
    setSavingSeo(true);
    try {
      await saveSeoSetting({
        ...seoForm,
        id: selectedSeoKey,
        pageKey: selectedSeoKey,
        isPublic: true,
      });
      setStatusNotice({
        type: 'ok',
        text: `SEO metadata for "${selectedSeoKey}" saved and live.`,
      });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save SEO settings.',
      });
    } finally {
      setSavingSeo(false);
    }
  };

  const handleResetSeo = async () => {
    if (seoSettings[selectedSeoKey]) {
      try {
        await removeSeoSetting(selectedSeoKey);
        setSeoForm({ ...DEFAULT_SEO_PRESETS[selectedSeoKey] });
        setStatusNotice({
          type: 'ok',
          text: `Removed Firestore SEO override for "${selectedSeoKey}"; reverted to defaults.`,
        });
      } catch (err) {
        setStatusNotice({
          type: 'err',
          text: err instanceof Error ? err.message : 'Failed to reset SEO override.',
        });
      }
    } else {
      setSeoForm({ ...DEFAULT_SEO_PRESETS[selectedSeoKey] });
    }
  };

  // ==================== CATALOG PDF HANDLERS ====================
  const handlePickCatalogFile = (file: File | null) => {
    if (!file) return;
    setStatusNotice(null);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setStatusNotice({ type: 'err', text: 'Only .pdf files are accepted for the product catalog.' });
      return;
    }
    if (file.size > MAX_CATALOG_PDF_BYTES) {
      setStatusNotice({
        type: 'err',
        text: `Selected PDF (${formatFileSize(file.size)}) exceeds the 31 MB upload limit. Please compress it or paste an External PDF URL below.`,
      });
      return;
    }
    setSelectedPdfFile(file);
  };

  const handleUploadCatalogPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile) {
      setStatusNotice({ type: 'err', text: 'Select a PDF file first before uploading.' });
      return;
    }
    setStatusNotice(null);
    setSavingCatalog(true);
    setCatalogProgress({ stage: 'preparing', completedChunks: 0, totalChunks: 1, percent: 2 });
    try {
      await uploadCatalogPdfFile(selectedPdfFile, catalogButtonLabel, (progress) => {
        setCatalogProgress(progress);
      });
      setStatusNotice({
        type: 'ok',
        text: `Catalog "${selectedPdfFile.name}" (${formatFileSize(selectedPdfFile.size)}) uploaded and live across every download button.`,
      });
      setSelectedPdfFile(null);
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to upload catalog PDF.',
      });
    } finally {
      setSavingCatalog(false);
      setCatalogProgress(null);
    }
  };

  const handleSaveCatalogUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);
    setSavingCatalog(true);
    try {
      await saveCatalogExternalUrl(catalogExternalUrl, catalogButtonLabel, catalogExternalName);
      setStatusNotice({
        type: 'ok',
        text: 'External catalog PDF URL saved and active across the website.',
      });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save catalog URL.',
      });
    } finally {
      setSavingCatalog(false);
    }
  };

  const handleResetCatalogDefault = async () => {
    setStatusNotice(null);
    setSavingCatalog(true);
    try {
      await resetCatalogToDefault('');
      setCatalogButtonLabel('');
      setCatalogExternalUrl('');
      setCatalogExternalName('');
      setSelectedPdfFile(null);
      setStatusNotice({
        type: 'ok',
        text: 'Catalog reverted to the built-in 2026 Yi Lai Factory PDF.',
      });
    } catch (err) {
      setStatusNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to reset catalog.',
      });
    } finally {
      setSavingCatalog(false);
    }
  };

  // ==================== AUTH GATE VIEW ====================
  if (!authReady) {
    return (
      <section className="grid-blueprint border-b border-[var(--line)] py-20">
        <div className="max-w-[680px] mx-auto px-4 text-center">
          <div className="font-mono-spec text-xs uppercase tracking-widest text-[var(--blue)]">
            Initializing Firebase Auth…
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="grid-blueprint border-b border-[var(--line)] py-14 sm:py-24">
        <div className="max-w-[600px] mx-auto px-4 sm:px-8">
          <button
            type="button"
            onClick={() => onNavigateHomeSection()}
            className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.06em] text-[var(--blue)] hover:text-[var(--red)] transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
            <span>Back to storefront</span>
          </button>

          <div className="bg-[var(--surface)] border-[1.5px] border-[var(--blue)] rounded overflow-hidden shadow-xs">
            <div className="bg-[var(--blue)] text-[var(--btn-ink)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span className="font-mono-spec text-xs uppercase tracking-[0.1em]">
                  Yi Lai Plastics · Owner Admin Portal
                </span>
              </div>
              <span className="font-mono-spec text-[10px] uppercase tracking-wider opacity-85" dir="ltr">
                FIRESTORE CMS
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h1 className="font-display font-black uppercase text-3xl sm:text-4xl text-[var(--ink)] leading-none mb-2">
                  Admin Sign In
                </h1>
                <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                  Manage live B2B product families, technical blog guides, and page SEO/OpenGraph metadata stored in Firebase Firestore.
                </p>
              </div>

              <div className="bg-[var(--bg)] border border-[var(--line)] rounded p-4 text-xs font-mono-spec text-[var(--muted)] space-y-1">
                <div className="text-[var(--blue)] uppercase tracking-wider">Owner Access Policy</div>
                <div>
                  Only verified Google account <strong className="text-[var(--ink)]">{MASKED_ADMIN_EMAIL}</strong> is authorized by Firestore Security Rules.
                </div>
              </div>

              {authError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 bg-[color-mix(in_srgb,var(--red)_10%,var(--surface))] border border-[var(--red)] text-[var(--red)] rounded p-4 text-sm"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[var(--red)]" aria-hidden="true" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="button"
                disabled={signingIn}
                onClick={handleGoogleSignIn}
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[var(--red)] hover:opacity-90 disabled:opacity-60 text-[var(--btn-ink)] font-display font-bold uppercase tracking-wider text-base px-6 py-3.5 rounded transition-opacity cursor-pointer"
              >
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>{signingIn ? 'Verifying Google Account…' : 'Sign in with Google (Owner)'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==================== AUTHENTICATED DASHBOARD VIEW ====================
  const seoTitleLen = seoForm.title.trim().length;
  const seoDescLen = seoForm.description.trim().length;

  return (
    <div className="bg-[var(--bg)]">
      {/* Top Blueprint Header Band */}
      <section className="grid-blueprint relative border-b border-[var(--line)] py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-[var(--line)]">
            <button
              type="button"
              onClick={() => onNavigateHomeSection()}
              className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.06em] text-[var(--blue)] hover:text-[var(--red)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
              <span>Back to storefront</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <div
                dir="ltr"
                className="font-mono-spec text-xs text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded px-3 py-1.5 flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5 text-[#138A36] dark:text-[#4ade80]" aria-hidden="true" />
                <span>{user?.email ? maskEmailAddress(user.email) : MASKED_ADMIN_EMAIL}</span>
              </div>

              <button
                type="button"
                onClick={() => void signOutAdmin()}
                className="inline-flex items-center gap-1.5 font-mono-spec text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--red)] bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--red)] px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="font-mono-spec text-xs uppercase tracking-[0.12em] text-[var(--red)] mb-1.5">
                Firebase Firestore CMS · Owner Console
              </div>
              <h1 className="font-display font-black uppercase text-3xl sm:text-4xl lg:text-5xl leading-none text-[var(--ink)]">
                Catalog, Blog &amp; SEO Dashboard
              </h1>
            </div>

            {/* Live Counters */}
            <div className="grid grid-cols-3 border-[1.5px] border-[var(--blue)] bg-[var(--surface)] rounded overflow-hidden shrink-0">
              <div className="px-4 py-2.5 border-r border-[var(--blue)]">
                <div className="font-mono-spec text-[10px] uppercase text-[var(--muted)]">Products</div>
                <div className="font-display font-black text-2xl text-[var(--blue)] leading-tight">
                  {adminProducts.length}
                </div>
              </div>
              <div className="px-4 py-2.5 border-r border-[var(--blue)]">
                <div className="font-mono-spec text-[10px] uppercase text-[var(--muted)]">Blog Posts</div>
                <div className="font-display font-black text-2xl text-[var(--blue)] leading-tight">
                  {adminPosts.length}
                </div>
              </div>
              <div className="px-4 py-2.5">
                <div className="font-mono-spec text-[10px] uppercase text-[var(--muted)]">SEO Rules</div>
                <div className="font-display font-black text-2xl text-[var(--blue)] leading-tight">
                  {Object.keys(seoSettings).length}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Section Tabs */}
          <div
            role="tablist"
            aria-label="Admin management sections"
            className="mt-7 flex flex-wrap gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded font-mono-spec text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[var(--blue)] text-[var(--btn-ink)]'
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
              }`}
            >
              <Package className="w-4 h-4" aria-hidden="true" />
              <span>01 · Products ({adminProducts.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'blog'}
              onClick={() => setActiveTab('blog')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded font-mono-spec text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-[var(--blue)] text-[var(--btn-ink)]'
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
              }`}
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>02 · Blog Posts ({adminPosts.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'seo'}
              onClick={() => setActiveTab('seo')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded font-mono-spec text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'seo'
                  ? 'bg-[var(--blue)] text-[var(--btn-ink)]'
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
              }`}
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span>03 · SEO Metadata</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'catalog'}
              onClick={() => setActiveTab('catalog')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded font-mono-spec text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[var(--blue)] text-[var(--btn-ink)]'
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
              }`}
            >
              <FileUp className="w-4 h-4" aria-hidden="true" />
              <span>04 · Catalog PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Workspace */}
      <section className="py-10 sm:py-12 border-b border-[var(--line)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {statusNotice && (
            <div
              role="status"
              className={`mb-6 px-4 py-3 rounded border text-sm flex items-center justify-between gap-4 ${
                statusNotice.type === 'ok'
                  ? 'bg-[color-mix(in_srgb,#138A36_12%,var(--surface))] border-[#138A36] text-[#138A36] dark:text-[#4ade80]'
                  : 'bg-[color-mix(in_srgb,var(--red)_10%,var(--surface))] border-[var(--red)] text-[var(--red)]'
              }`}
            >
              <span>{statusNotice.text}</span>
              <button
                type="button"
                onClick={() => setStatusNotice(null)}
                className="font-mono-spec text-xs uppercase underline cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ===================== TAB 1: PRODUCTS ===================== */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
              {/* Product Editor Form */}
              <form
                onSubmit={handleSaveProduct}
                className="bg-[var(--surface)] border border-[var(--line)] rounded p-6 sm:p-7 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
                  <div>
                    <div className="font-mono-spec text-[11px] uppercase tracking-wider text-[var(--blue)]">
                      {editingProductId ? `Editing: ${editingProductId}` : 'Add New Product Family'}
                    </div>
                    <h2 className="font-display font-bold uppercase text-2xl text-[var(--ink)]">
                      {editingProductId ? 'Update Product in Firestore' : 'Publish Product to Catalog'}
                    </h2>
                  </div>

                  {!editingProductId ? (
                    <select
                      aria-label="Override built-in 2026 catalog series"
                      value=""
                      onChange={(e) => handleCloneCatalogProduct(e.target.value)}
                      className="px-3 py-1.5 rounded border border-[var(--line)] bg-[var(--bg)] font-mono-spec text-xs text-[var(--muted)]"
                    >
                      <option value="">Override 2026 catalog item…</option>
                      {PRODUCT_FAMILIES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.figCode} — {t(p.titleKey)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm(EMPTY_PRODUCT_FORM);
                      }}
                      className="inline-flex items-center gap-1.5 font-mono-spec text-xs uppercase text-[var(--red)] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>New Product</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      value={productForm.title}
                      onChange={(e) => handleProductTitleChange(e.target.value)}
                      placeholder="e.g. Heavy-Duty Chemical Trigger"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Slug ID * (a-z, 0-9, hyphens)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={128}
                      disabled={Boolean(editingProductId)}
                      value={productForm.id}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, id: sanitizeSlugId(e.target.value) }))
                      }
                      placeholder="heavy-duty-trigger"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)] disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Category Tab *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          category: e.target.value as ProductCategory,
                        }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] text-sm bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--blue)]"
                    >
                      <option value="trigger">Trigger Sprayers</option>
                      <option value="lotion">Lotion &amp; Foundation Pumps</option>
                      <option value="mist">Fine Mist Sprayers</option>
                      <option value="foam">Foam Pumps</option>
                      <option value="caps">Bottle Caps &amp; Closures</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                        Fig Code *
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={24}
                        value={productForm.figCode}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, figCode: e.target.value }))
                        }
                        placeholder="FIG 1.8"
                        className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                        Model Range *
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={64}
                        value={productForm.modelRange}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, modelRange: e.target.value }))
                        }
                        placeholder="TS022 – TS026"
                        className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                    Typical Uses *
                  </label>
                  <textarea
                    required
                    rows={2}
                    minLength={4}
                    maxLength={500}
                    value={productForm.uses}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, uses: e.target.value }))}
                    placeholder="Industrial degreasers, acid/alkaline cleaners, workshop chemicals."
                    className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Neck Sizes *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={productForm.neckSizes}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, neckSizes: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                    <label className="mt-1.5 inline-flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.neckToConfirm}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, neckToConfirm: e.target.checked }))
                        }
                      />
                      <span>Flag neck size as TO CONFIRM</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Dosage / Output *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={productForm.dosage}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, dosage: e.target.value }))
                      }
                      placeholder="0.9 – 1.1 ml / stroke"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Material *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={productForm.material}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, material: e.target.value }))
                      }
                      placeholder="PP + Viton chemical seal"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Key Details *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      value={productForm.featureSpec}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, featureSpec: e.target.value }))
                      }
                      placeholder="Spray / Stream / Off · Ratchet 28/400"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                </div>

                <MultiImageUploadField
                  label="Product Images (Upload up to 6 Photos, Paths, or HTTPS URLs)"
                  images={productForm.images}
                  onChange={(nextImages) =>
                    setProductForm((prev) => ({
                      ...prev,
                      images: nextImages,
                      image: nextImages[0] ?? '',
                    }))
                  }
                  samplePaths={SAMPLE_IMAGE_PATHS}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      SEO Image Alt Text *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={productForm.altText}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, altText: e.target.value }))
                      }
                      placeholder="Yi Lai Plastics heavy duty trigger sprayer"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Quote Form Pre-fill Label *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={productForm.quoteValue}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, quoteValue: e.target.value }))
                      }
                      placeholder="Chemical Trigger Sprayer (TS022-TS026)"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)]">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.published}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, published: e.target.checked }))
                      }
                    />
                    <span>Published on live storefront</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="inline-flex items-center gap-2 bg-[var(--red)] hover:opacity-90 disabled:opacity-60 text-[var(--btn-ink)] font-display font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded transition-opacity cursor-pointer"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {savingProduct
                        ? 'Saving…'
                        : editingProductId
                          ? 'Update Product'
                          : 'Save Product'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Firestore Products List */}
              <div className="space-y-4">
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-5">
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--line)]">
                    <div>
                      <div className="font-mono-spec text-[10px] uppercase tracking-wider text-[var(--blue)]">
                        Firestore Collection: /products
                      </div>
                      <h3 className="font-display font-bold uppercase text-xl text-[var(--ink)]">
                        Managed Products ({adminProducts.length})
                      </h3>
                    </div>
                  </div>

                  {adminProducts.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[var(--muted)] border border-dashed border-[var(--line)] rounded">
                      No custom Firestore products yet. Use the form on the left to add a new product series or override an existing 2026 catalog card.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminProducts.map((item) => (
                        <div
                          key={item.id}
                          className="border border-[var(--line)] rounded p-4 bg-[var(--bg)] flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-mono-spec text-[11px] uppercase text-[var(--blue)]" dir="ltr">
                                {item.figCode} · {item.modelRange} ·{' '}
                                <span className={item.published ? 'text-[#138A36] dark:text-[#4ade80]' : 'text-[#9A5B00] dark:text-[#fbbf24]'}>
                                  {item.published ? 'PUBLISHED' : 'DRAFT'}
                                </span>
                              </div>
                              <div className="font-display font-bold uppercase text-xl text-[var(--ink)]">
                                {item.title}
                              </div>
                              <div className="font-mono-spec text-[11px] text-[var(--muted)]">
                                #/products/{item.id} · {item.neckSizes} ·{' '}
                                {(item.images?.length || (item.image ? 1 : 0))} photo(s)
                              </div>
                            </div>

                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.altText}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-contain bg-[var(--surface)] border border-[var(--line)] rounded p-1 shrink-0"
                              />
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--line)]">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(item)}
                              className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--blue)] text-[var(--blue)] px-2.5 py-1 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" aria-hidden="true" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenProductPage(item.id)}
                              className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--blue)] text-[var(--muted)] px-2.5 py-1 rounded cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                              <span>Open Page</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleToggleProductPublish(item)}
                              className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--blue)] text-[var(--muted)] px-2.5 py-1 rounded cursor-pointer"
                            >
                              {item.published ? (
                                <>
                                  <EyeOff className="w-3 h-3" aria-hidden="true" />
                                  <span>Unpublish</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" aria-hidden="true" />
                                  <span>Publish</span>
                                </>
                              )}
                            </button>

                            {confirmDeleteProduct === item.id ? (
                              <div className="inline-flex items-center gap-1.5 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteProduct(item.id)}
                                  className="font-mono-spec text-[11px] uppercase bg-[var(--red)] text-[var(--btn-ink)] px-2.5 py-1 rounded cursor-pointer"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteProduct(null)}
                                  className="font-mono-spec text-[11px] uppercase text-[var(--muted)] px-2 py-1 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteProduct(item.id)}
                                className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase text-[var(--red)] hover:bg-[color-mix(in_srgb,var(--red)_10%,var(--surface))] border border-transparent hover:border-[var(--red)] px-2.5 py-1 rounded ml-auto cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: BLOG POSTS ===================== */}
          {activeTab === 'blog' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
              <form
                onSubmit={handleSaveBlog}
                className="bg-[var(--surface)] border border-[var(--line)] rounded p-6 sm:p-7 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
                  <div>
                    <div className="font-mono-spec text-[11px] uppercase tracking-wider text-[var(--blue)]">
                      {editingPostId ? `Editing: ${editingPostId}` : 'Create Technical Blog Guide'}
                    </div>
                    <h2 className="font-display font-bold uppercase text-2xl text-[var(--ink)]">
                      {editingPostId ? 'Update Blog Post in Firestore' : 'Publish Blog Article'}
                    </h2>
                  </div>

                  {!editingPostId ? (
                    <select
                      aria-label="Clone built-in blog guide"
                      value=""
                      onChange={(e) => handleCloneBuiltinBlog(e.target.value)}
                      className="px-3 py-1.5 rounded border border-[var(--line)] bg-[var(--bg)] font-mono-spec text-xs text-[var(--muted)]"
                    >
                      <option value="">Override built-in guide…</option>
                      {BLOG_POSTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.refCode} — {p.content.en.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPostId(null);
                        setBlogForm(EMPTY_BLOG_FORM);
                        setBlogBodyText('');
                      }}
                      className="inline-flex items-center gap-1.5 font-mono-spec text-xs uppercase text-[var(--red)] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>New Article</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Article Headline *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={4}
                      maxLength={160}
                      value={blogForm.title}
                      onChange={(e) => handleBlogTitleChange(e.target.value)}
                      placeholder="e.g. Choosing Chemical-Resistant Seals for Degreaser Sprayers"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      URL Slug ID *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={128}
                      disabled={Boolean(editingPostId)}
                      value={blogForm.id}
                      onChange={(e) =>
                        setBlogForm((prev) => ({ ...prev, id: sanitizeSlugId(e.target.value) }))
                      }
                      placeholder="chemical-resistant-seals-guide"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)] disabled:opacity-70"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={64}
                      value={blogForm.category}
                      onChange={(e) =>
                        setBlogForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      placeholder="Chemical Compatibility"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                        Index *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={blogForm.index}
                        onChange={(e) =>
                          setBlogForm((prev) => ({ ...prev, index: e.target.value }))
                        }
                        placeholder="04"
                        className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                        Ref Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={32}
                        value={blogForm.refCode}
                        onChange={(e) =>
                          setBlogForm((prev) => ({ ...prev, refCode: e.target.value }))
                        }
                        placeholder="NOTE 05.4"
                        className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-sm focus:outline-none focus:border-[var(--blue)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Related Product Series *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={blogForm.relatedProduct}
                      onChange={(e) =>
                        setBlogForm((prev) => ({ ...prev, relatedProduct: e.target.value }))
                      }
                      placeholder="Trigger sprayer (TS001-TS021)"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                    Summary (10–400 chars) *
                  </label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={400}
                    rows={2}
                    value={blogForm.summary}
                    onChange={(e) => setBlogForm((prev) => ({ ...prev, summary: e.target.value }))}
                    placeholder="Concise overview shown on blog cards and article header."
                    className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div>
                  <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                    Monospace Spec Takeaway *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={280}
                    value={blogForm.specTakeaway}
                    onChange={(e) =>
                      setBlogForm((prev) => ({ ...prev, specTakeaway: e.target.value }))
                    }
                    placeholder="Necks: 28/400 · 28/410 · Seal options: PP / chemical resistant"
                    className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-xs focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div>
                  <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                    Article Body Paragraphs * (Separate paragraphs with a blank line)
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={blogBodyText}
                    onChange={(e) => setBlogBodyText(e.target.value)}
                    placeholder="Write paragraph 1 here...&#10;&#10;Leave an empty line before paragraph 2..."
                    className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <ImageUploadField
                  label="Article Image (Upload from Device, Path, or HTTPS URL)"
                  value={blogForm.image}
                  onChange={(nextUrl) =>
                    setBlogForm((prev) => ({ ...prev, image: nextUrl }))
                  }
                  samplePaths={SAMPLE_IMAGE_PATHS}
                />

                <div className="p-4 bg-[var(--bg)] border border-[var(--line)] rounded space-y-3">
                  <div className="font-mono-spec text-[11px] uppercase tracking-wider text-[var(--blue)]">
                    Optional Per-Post SEO Overrides
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      maxLength={120}
                      value={blogForm.seoTitle}
                      onChange={(e) =>
                        setBlogForm((prev) => ({ ...prev, seoTitle: e.target.value }))
                      }
                      placeholder="Custom <title> when viewing this post (optional)"
                      className="w-full px-3 py-2 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                    <input
                      type="text"
                      maxLength={240}
                      value={blogForm.seoDescription}
                      onChange={(e) =>
                        setBlogForm((prev) => ({ ...prev, seoDescription: e.target.value }))
                      }
                      placeholder="Custom meta description when viewing this post (optional)"
                      className="w-full px-3 py-2 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)]">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blogForm.published}
                      onChange={(e) =>
                        setBlogForm((prev) => ({ ...prev, published: e.target.checked }))
                      }
                    />
                    <span>Published on live blog</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingBlog}
                    className="inline-flex items-center gap-2 bg-[var(--red)] hover:opacity-90 disabled:opacity-60 text-[var(--btn-ink)] font-display font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded transition-opacity cursor-pointer"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {savingBlog ? 'Saving…' : editingPostId ? 'Update Post' : 'Publish Post'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Firestore Blog Posts List */}
              <div className="space-y-4">
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-5">
                  <div className="pb-3 mb-4 border-b border-[var(--line)]">
                    <div className="font-mono-spec text-[10px] uppercase tracking-wider text-[var(--blue)]">
                      Firestore Collection: /blog_posts
                    </div>
                    <h3 className="font-display font-bold uppercase text-xl text-[var(--ink)]">
                      Managed Blog Posts ({adminPosts.length})
                    </h3>
                  </div>

                  {adminPosts.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[var(--muted)] border border-dashed border-[var(--line)] rounded">
                      No Firestore blog articles yet. Publish a new technical guide on the left to add it to Section 05 and its own dedicated `#/blog/...` page.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminPosts.map((post) => (
                        <div
                          key={post.id}
                          className="border border-[var(--line)] rounded p-4 bg-[var(--bg)] flex flex-col gap-3"
                        >
                          <div>
                            <div className="font-mono-spec text-[11px] uppercase text-[var(--blue)]" dir="ltr">
                              {post.refCode} · {post.category} ·{' '}
                              <span className={post.published ? 'text-[#138A36] dark:text-[#4ade80]' : 'text-[#9A5B00] dark:text-[#fbbf24]'}>
                                {post.published ? 'PUBLISHED' : 'DRAFT'}
                              </span>
                            </div>
                            <div className="font-display font-bold uppercase text-xl text-[var(--ink)] mt-0.5">
                              {post.title}
                            </div>
                            <div className="font-mono-spec text-[11px] text-[var(--muted)]">
                              #/blog/{post.id}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--line)]">
                            <button
                              type="button"
                              onClick={() => handleEditBlog(post)}
                              className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--blue)] text-[var(--blue)] px-2.5 py-1 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" aria-hidden="true" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenPostPage(post.id)}
                              className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--blue)] text-[var(--muted)] px-2.5 py-1 rounded cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                              <span>Open</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleToggleBlogPublish(post)}
                              className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--blue)] text-[var(--muted)] px-2.5 py-1 rounded cursor-pointer"
                            >
                              {post.published ? (
                                <>
                                  <EyeOff className="w-3 h-3" aria-hidden="true" />
                                  <span>Draft</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" aria-hidden="true" />
                                  <span>Publish</span>
                                </>
                              )}
                            </button>

                            {confirmDeletePost === post.id ? (
                              <div className="inline-flex items-center gap-1.5 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteBlog(post.id)}
                                  className="font-mono-spec text-[11px] uppercase bg-[var(--red)] text-[var(--btn-ink)] px-2.5 py-1 rounded cursor-pointer"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePost(null)}
                                  className="font-mono-spec text-[11px] uppercase text-[var(--muted)] px-2 py-1 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePost(post.id)}
                                className="inline-flex items-center gap-1 font-mono-spec text-[11px] uppercase text-[var(--red)] hover:bg-[color-mix(in_srgb,var(--red)_10%,var(--surface))] border border-transparent hover:border-[var(--red)] px-2.5 py-1 rounded ml-auto cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: SEO METADATA ===================== */}
          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
              <form
                onSubmit={handleSaveSeo}
                className="bg-[var(--surface)] border border-[var(--line)] rounded p-6 sm:p-7 space-y-5"
              >
                <div className="pb-4 border-b border-[var(--line)]">
                  <div className="font-mono-spec text-[11px] uppercase tracking-wider text-[var(--blue)] mb-2">
                    Firestore Collection: /seo_settings
                  </div>
                  <h2 className="font-display font-bold uppercase text-2xl text-[var(--ink)] mb-3">
                    Select Target Route Scope
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {SEO_PAGE_KEYS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedSeoKey(item.key)}
                        className={`px-3 py-1.5 rounded font-mono-spec text-xs uppercase transition-colors cursor-pointer ${
                          selectedSeoKey === item.key
                            ? 'bg-[var(--blue)] text-[var(--btn-ink)]'
                            : 'bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)]'
                        }`}
                      >
                        {item.label}
                        {seoSettings[item.key] ? ' · Custom' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono-spec text-[11px] uppercase text-[var(--muted)]">
                      Document Title (`&lt;title&gt;`) *
                    </label>
                    <span
                      className={`font-mono-spec text-[11px] ${
                        seoTitleLen >= 30 && seoTitleLen <= 65
                          ? 'text-[#138A36] dark:text-[#4ade80]'
                          : 'text-[#9A5B00] dark:text-[#fbbf24]'
                      }`}
                    >
                      {seoTitleLen} chars (target 30–60)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    minLength={10}
                    maxLength={120}
                    value={seoForm.title}
                    onChange={(e) => setSeoForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono-spec text-[11px] uppercase text-[var(--muted)]">
                      Meta Description *
                    </label>
                    <span
                      className={`font-mono-spec text-[11px] ${
                        seoDescLen >= 120 && seoDescLen <= 165
                          ? 'text-[#138A36] dark:text-[#4ade80]'
                          : 'text-[#9A5B00] dark:text-[#fbbf24]'
                      }`}
                    >
                      {seoDescLen} chars (target 120–160)
                    </span>
                  </div>
                  <textarea
                    required
                    minLength={20}
                    maxLength={320}
                    rows={3}
                    value={seoForm.description}
                    onChange={(e) =>
                      setSeoForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div>
                  <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    maxLength={400}
                    value={seoForm.keywords}
                    onChange={(e) => setSeoForm((prev) => ({ ...prev, keywords: e.target.value }))}
                    className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      OpenGraph Title (`og:title`)
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={seoForm.ogTitle}
                      onChange={(e) =>
                        setSeoForm((prev) => ({ ...prev, ogTitle: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      OpenGraph Site Name (`og:site_name`) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={seoForm.ogSiteName}
                      onChange={(e) =>
                        setSeoForm((prev) => ({ ...prev, ogSiteName: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      OpenGraph Description (`og:description`)
                    </label>
                    <textarea
                      rows={2}
                      maxLength={320}
                      value={seoForm.ogDescription}
                      onChange={(e) =>
                        setSeoForm((prev) => ({ ...prev, ogDescription: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Social Share Image (`og:image`)
                    </label>
                    <input
                      type="text"
                      maxLength={500}
                      value={seoForm.ogImage}
                      onChange={(e) =>
                        setSeoForm((prev) => ({ ...prev, ogImage: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-xs focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Twitter Card Format
                    </label>
                    <select
                      value={seoForm.twitterCard}
                      onChange={(e) =>
                        setSeoForm((prev) => ({
                          ...prev,
                          twitterCard: e.target.value as 'summary_large_image' | 'summary',
                        }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] text-sm bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:border-[var(--blue)]"
                    >
                      <option value="summary_large_image">summary_large_image</option>
                      <option value="summary">summary</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Schema.org Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={seoForm.schemaOrgName}
                      onChange={(e) =>
                        setSeoForm((prev) => ({ ...prev, schemaOrgName: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Canonical Base URL (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={300}
                      value={seoForm.canonicalBaseUrl}
                      onChange={(e) =>
                        setSeoForm((prev) => ({ ...prev, canonicalBaseUrl: e.target.value }))
                      }
                      placeholder="https://yilaiplastics.online"
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-xs focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)] mb-1">
                      Schema.org Organization Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      maxLength={400}
                      value={seoForm.schemaOrgDescription}
                      onChange={(e) =>
                        setSeoForm((prev) => ({ ...prev, schemaOrgDescription: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--blue)]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => void handleResetSeo()}
                    className="inline-flex items-center gap-1.5 font-mono-spec text-xs uppercase text-[var(--muted)] hover:text-[var(--red)] border border-[var(--line)] hover:border-[var(--red)] px-3.5 py-2 rounded cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Revert to Default</span>
                  </button>

                  <button
                    type="submit"
                    disabled={savingSeo}
                    className="inline-flex items-center gap-2 bg-[var(--red)] hover:opacity-90 disabled:opacity-60 text-[var(--btn-ink)] font-display font-bold uppercase tracking-wider text-sm px-5 py-2.5 rounded transition-opacity cursor-pointer"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>{savingSeo ? 'Saving SEO…' : 'Save SEO Settings'}</span>
                  </button>
                </div>
              </form>

              {/* Live SERP & Social Share Card Preview */}
              <div className="space-y-5">
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-6">
                  <div className="font-mono-spec text-[10px] uppercase tracking-[0.1em] text-[var(--blue)] mb-3">
                    Search Engine Snippet Preview ({selectedSeoKey})
                  </div>
                  <div className="p-4 border border-[var(--line)] rounded bg-[var(--bg)] space-y-1">
                    <div className="text-xs font-mono-spec text-[var(--muted)] truncate" dir="ltr">
                      {seoForm.canonicalBaseUrl || 'https://yilaiplastics.online'}
                    </div>
                    <div className="text-lg font-medium text-[var(--blue)] leading-snug">
                      {seoForm.title || 'Page Title'}
                    </div>
                    <div className="text-xs text-[var(--muted)] leading-relaxed">
                      {seoForm.description || 'Meta description snippet.'}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--line)] rounded overflow-hidden">
                  <div className="px-6 pt-5 pb-3">
                    <div className="font-mono-spec text-[10px] uppercase tracking-[0.1em] text-[var(--blue)]">
                      OpenGraph Social Card Preview
                    </div>
                  </div>
                  {seoForm.ogImage && (
                    <div className="h-44 bg-[var(--bg)] border-y border-[var(--line)] flex items-center justify-center p-4">
                      <img
                        src={seoForm.ogImage}
                        alt="OpenGraph share preview"
                        referrerPolicy="no-referrer"
                        className="max-h-36 w-auto object-contain"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-1">
                    <div className="font-mono-spec text-[10px] uppercase text-[var(--muted)]">
                      {seoForm.ogSiteName}
                    </div>
                    <div className="font-display font-bold uppercase text-xl text-[var(--ink)]">
                      {seoForm.ogTitle || seoForm.title}
                    </div>
                    <div className="text-xs text-[var(--muted)] leading-relaxed">
                      {seoForm.ogDescription || seoForm.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: CATALOG PDF UPLOAD & RE-UPLOAD ===================== */}
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
              {/* Left Column: Direct PDF Upload / Re-upload Form */}
              <div className="space-y-6">
                <form
                  onSubmit={handleUploadCatalogPdf}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded p-6 sm:p-7 space-y-5"
                >
                  <div className="pb-4 border-b border-[var(--line)]">
                    <div className="font-mono-spec text-[11px] uppercase tracking-wider text-[var(--blue)]">
                      Replace or Re-upload Storefront PDF
                    </div>
                    <h2 className="font-display font-bold uppercase text-2xl text-[var(--ink)]">
                      Upload New Catalog PDF
                    </h2>
                    <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                      Every &ldquo;Download Catalog&rdquo; CTA across the hero, footer, factory page, product sheets, and engineering notes updates immediately after upload.
                    </p>
                  </div>

                  {/* Drag & Drop / File Picker */}
                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase tracking-wider text-[var(--muted)] mb-2">
                      Catalog PDF File (.pdf · Up to 31 MB)
                    </label>
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverCatalog(true);
                      }}
                      onDragLeave={() => setDragOverCatalog(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverCatalog(false);
                        const dropped = e.dataTransfer.files?.[0] ?? null;
                        handlePickCatalogFile(dropped);
                      }}
                      className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded p-7 transition-colors cursor-pointer ${
                        dragOverCatalog
                          ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_8%,var(--surface))]'
                          : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--blue)]'
                      }`}
                    >
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        disabled={savingCatalog}
                        onChange={(e) => {
                          handlePickCatalogFile(e.target.files?.[0] ?? null);
                          e.target.value = '';
                        }}
                      />
                      <Upload className="w-7 h-7 text-[var(--blue)] mb-2.5" aria-hidden="true" />
                      {selectedPdfFile ? (
                        <div className="space-y-1">
                          <div className="font-mono-spec text-xs font-semibold text-[var(--ink)] break-all">
                            {selectedPdfFile.name}
                          </div>
                          <div className="font-mono-spec text-[11px] text-[var(--blue)]">
                            {formatFileSize(selectedPdfFile.size)} · Ready to upload (click to choose another)
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-[var(--ink)]">
                            Drop your updated PDF catalog here or click to browse
                          </div>
                          <div className="font-mono-spec text-[11px] text-[var(--muted)]">
                            Old uploaded versions are cleaned up automatically once the new file is live.
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      Optional Custom Button Label (leave blank for translated default)
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={catalogButtonLabel}
                      onChange={(e) => setCatalogButtonLabel(e.target.value)}
                      placeholder="e.g. Download 2027 Catalog (PDF)"
                      className="w-full px-3.5 py-2.5 border border-[var(--line)] rounded bg-[var(--bg)] text-sm text-[var(--ink)]"
                    />
                  </div>

                  {catalogProgress && (
                    <div className="p-4 rounded border border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_7%,var(--surface))] space-y-2">
                      <div className="flex items-center justify-between font-mono-spec text-xs text-[var(--blue)]">
                        <span>
                          {catalogProgress.stage === 'preparing' && 'Reading PDF file…'}
                          {catalogProgress.stage === 'uploading' &&
                            `Uploading part ${catalogProgress.completedChunks} of ${catalogProgress.totalChunks}…`}
                          {catalogProgress.stage === 'finalizing' && 'Publishing live catalog pointer…'}
                          {catalogProgress.stage === 'cleaning' && 'Cleaning up superseded version…'}
                        </span>
                        <span>{catalogProgress.percent}%</span>
                      </div>
                      <div className="h-2 rounded bg-[var(--bg)] border border-[var(--line)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--blue)] transition-all duration-200"
                          style={{ width: `${catalogProgress.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={savingCatalog || !selectedPdfFile}
                      className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-sm px-6 py-3 rounded hover:-translate-y-px transition-transform disabled:opacity-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {savingCatalog
                          ? 'Uploading Catalog…'
                          : catalogConfig?.mode === 'chunks'
                            ? 'Re-upload & Replace Catalog PDF'
                            : 'Upload & Publish Catalog PDF'}
                      </span>
                    </button>

                    {selectedPdfFile && !savingCatalog && (
                      <button
                        type="button"
                        onClick={() => setSelectedPdfFile(null)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-[var(--line)] font-mono-spec text-xs uppercase text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                </form>

                {/* Optional External URL Form */}
                <form
                  onSubmit={handleSaveCatalogUrl}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded p-6 sm:p-7 space-y-4"
                >
                  <div className="pb-3 border-b border-[var(--line)]">
                    <div className="font-mono-spec text-[11px] uppercase tracking-wider text-[var(--muted)]">
                      Alternative Option · Large Files (&gt; 31 MB) or CDN
                    </div>
                    <h3 className="font-display font-bold uppercase text-xl text-[var(--ink)] flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-[var(--blue)]" aria-hidden="true" />
                      <span>Link External Hosted PDF URL</span>
                    </h3>
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      Direct PDF URL (https://… or /assets/…)
                    </label>
                    <input
                      type="text"
                      value={catalogExternalUrl}
                      onChange={(e) => setCatalogExternalUrl(e.target.value)}
                      placeholder="https://cdn.yilaiplastics.online/Yi_Lai_Catalog_2027.pdf"
                      className="w-full px-3.5 py-2.5 border border-[var(--line)] rounded bg-[var(--bg)] text-sm text-[var(--ink)]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-spec text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      Display File Name (optional)
                    </label>
                    <input
                      type="text"
                      maxLength={160}
                      value={catalogExternalName}
                      onChange={(e) => setCatalogExternalName(e.target.value)}
                      placeholder="Yi_Lai_Catalog_2027.pdf"
                      className="w-full px-3.5 py-2.5 border border-[var(--line)] rounded bg-[var(--bg)] text-sm text-[var(--ink)]"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingCatalog || !catalogExternalUrl.trim()}
                    className="inline-flex items-center gap-2 bg-[var(--blue)] text-[var(--btn-ink)] font-semibold text-sm px-5 py-2.5 rounded hover:-translate-y-px transition-transform disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>Use External PDF URL</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Live Active Catalog Status & Test Download */}
              <div className="space-y-5">
                <div className="bg-[var(--surface)] border-[1.5px] border-[var(--blue)] rounded p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                    <div>
                      <div className="font-mono-spec text-[10px] uppercase tracking-[0.1em] text-[var(--blue)]">
                        Currently Active on Website
                      </div>
                      <h3 className="font-display font-bold uppercase text-xl text-[var(--ink)]">
                        Live Catalog Status
                      </h3>
                    </div>
                    <span className="font-mono-spec text-[10px] uppercase px-2.5 py-1 rounded border border-[var(--blue)] text-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))]">
                      {catalogConfig?.mode === 'chunks'
                        ? 'Uploaded PDF'
                        : catalogConfig?.mode === 'url'
                          ? 'External URL'
                          : 'Built-in 2026'}
                    </span>
                  </div>

                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-[var(--line)]">
                      <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">File Name</dt>
                      <dd className="font-mono-spec text-xs text-[var(--ink)] text-right break-all" dir="ltr">
                        {catalogConfig?.fileName || DEFAULT_CATALOG_FILE_NAME}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-[var(--line)]">
                      <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">File Size</dt>
                      <dd className="font-mono-spec text-xs text-[var(--ink)]">
                        {catalogConfig?.fileSizeBytes
                          ? formatFileSize(catalogConfig.fileSizeBytes)
                          : catalogConfig?.mode === 'url'
                            ? 'External Host'
                            : '23.0 MB (Built-in)'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-[var(--line)]">
                      <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">Button Label</dt>
                      <dd className="text-xs text-[var(--ink)] text-right">
                        {catalogConfig?.buttonLabel?.trim() || `${t('hero.cta2')} (Auto-translated)`}
                      </dd>
                    </div>
                    {catalogConfig?.mode === 'url' && catalogConfig.pdfUrl && (
                      <div className="py-1.5 border-b border-dashed border-[var(--line)]">
                        <dt className="font-mono-spec text-xs uppercase text-[var(--muted)] mb-1">Active URL</dt>
                        <dd className="font-mono-spec text-[11px] text-[var(--blue)] break-all" dir="ltr">
                          {catalogConfig.pdfUrl}
                        </dd>
                      </div>
                    )}
                    {catalogConfig?.mode === 'chunks' && (
                      <div className="flex justify-between gap-3 py-1.5 border-b border-dashed border-[var(--line)]">
                        <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">Version / Parts</dt>
                        <dd className="font-mono-spec text-xs text-[var(--ink)]" dir="ltr">
                          {catalogConfig.versionId} ({catalogConfig.chunkCount} chunks)
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <CatalogLink
                      catalogConfig={catalogConfig}
                      defaultLabel="Test Live Catalog Download"
                      className="inline-flex items-center gap-2 bg-[var(--blue)] text-[var(--btn-ink)] font-semibold text-sm px-5 py-2.5 rounded hover:-translate-y-px transition-transform"
                    />

                    {catalogConfig && catalogConfig.mode !== 'default' && (
                      <button
                        type="button"
                        disabled={savingCatalog}
                        onClick={handleResetCatalogDefault}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-[var(--line)] font-mono-spec text-xs uppercase text-[var(--muted)] hover:border-[var(--red)] hover:text-[var(--red)] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Revert to Built-in PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--line)] rounded p-5 space-y-2 text-xs text-[var(--muted)] leading-relaxed">
                  <div className="font-mono-spec text-[11px] uppercase tracking-wider text-[var(--ink)]">
                    Where this catalog appears
                  </div>
                  <p>
                    Updating here automatically replaces the PDF served in the Home Hero, Website Footer, Factory Page, Trigger Sprayers Configurator, Product Detail Sheets, Use Cases Directory, and Technical Blog Notes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
