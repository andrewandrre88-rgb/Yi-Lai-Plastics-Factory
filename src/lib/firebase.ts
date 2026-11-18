import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { ProductCategoryId } from '../data/catalog';

export const ADMIN_EMAIL = 'andrewandrre88@gmail.com';

export function maskEmailAddress(email: string): string {
  const trimmed = email.trim();
  const atIdx = trimmed.indexOf('@');
  if (atIdx <= 0) return '******';
  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);
  const dotIdx = domain.lastIndexOf('.');
  const visibleLocal = local.slice(0, Math.min(2, local.length));
  const tld = dotIdx > 0 ? domain.slice(dotIdx) : '';
  return `${visibleLocal}******@******${tld}`;
}

export const MASKED_ADMIN_EMAIL = maskEmailAddress(ADMIN_EMAIL);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export function isAuthorizedAdmin(user: User | null): boolean {
  if (!user || !user.emailVerified || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function signInAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// ==================== CMS DATA SHAPES ====================
export type ProductCategory = Exclude<ProductCategoryId, 'all'>;
export type SeoPageKey = 'global' | 'home' | 'factory' | 'use-cases' | 'trigger-sprayers';

export interface CmsProductInput {
  id: string;
  category: ProductCategory;
  figCode: string;
  modelRange: string;
  title: string;
  uses: string;
  neckSizes: string;
  neckToConfirm: boolean;
  dosage: string;
  material: string;
  featureSpec: string;
  image: string;
  images: string[];
  altText: string;
  quoteValue: string;
  published: boolean;
}

export interface CmsProductDoc extends CmsProductInput {
  authorUid: string;
}

export interface CmsBlogPostInput {
  id: string;
  index: string;
  refCode: string;
  category: string;
  title: string;
  summary: string;
  specTakeaway: string;
  paragraphs: string[];
  relatedProduct: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
}

export interface CmsBlogPostDoc extends CmsBlogPostInput {
  authorUid: string;
}

export interface CmsSeoSettingInput {
  id: SeoPageKey;
  pageKey: SeoPageKey;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogSiteName: string;
  ogImage: string;
  twitterCard: 'summary_large_image' | 'summary';
  canonicalBaseUrl: string;
  schemaOrgName: string;
  schemaOrgDescription: string;
  isPublic: boolean;
}

export interface CmsSeoSettingDoc extends CmsSeoSettingInput {
  authorUid: string;
}

export type CatalogSourceMode = 'default' | 'url' | 'chunks';

export interface CmsCatalogConfigDoc {
  id: 'catalog';
  mode: CatalogSourceMode;
  buttonLabel: string;
  fileName: string;
  fileSizeBytes: number;
  pdfUrl: string;
  versionId: string;
  chunkCount: number;
  isPublic: boolean;
  authorUid: string;
}

export interface CatalogUploadProgress {
  stage: 'preparing' | 'uploading' | 'finalizing' | 'cleaning';
  completedChunks: number;
  totalChunks: number;
  percent: number;
}

export const DEFAULT_CATALOG_PDF_URL =
  '/assets/aistudio/Yi_Lai_Plastics_Industry_Factory_CATALOG_b3ed4e35.pdf';
export const DEFAULT_CATALOG_FILE_NAME = 'Yi_Lai_Plastics_Industry_Factory_CATALOG.pdf';
export const MAX_CATALOG_PDF_BYTES = 31 * 1024 * 1024; // 31 MB max (~85 chunks * 375 KB)
const CATALOG_CHUNK_RAW_BYTES = 375000; // exact multiple of 3 -> 500,000 base64 chars

// ==================== DEFENSIVE SANITIZERS ====================
const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export function sanitizeSlugId(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 128);
  return VALID_ID_REGEX.test(cleaned) ? cleaned : '';
}

function clampStr(val: string, maxLength: number): string {
  return val.trim().slice(0, maxLength);
}

function sanitizeImageOrUrl(val: string, maxLength: number): string {
  const trimmed = val.trim().slice(0, maxLength);
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return '';
}

const DATA_IMAGE_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;

function sanitizeImageSource(val: string): string {
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (DATA_IMAGE_REGEX.test(trimmed)) {
    if (trimmed.length > 350000) {
      throw new Error('Uploaded image exceeds the 350 KB compressed limit.');
    }
    return trimmed;
  }
  return sanitizeImageOrUrl(trimmed, 500);
}

function normalizeProductDoc(id: string, raw: Omit<CmsProductDoc, 'id'>): CmsProductDoc {
  const rawImages = Array.isArray(raw.images) ? raw.images.filter((v): v is string => typeof v === 'string' && v.trim().length > 0) : [];
  const images = rawImages.length > 0 ? rawImages.slice(0, 6) : raw.image ? [raw.image] : [];
  return {
    ...raw,
    id,
    image: raw.image || images[0] || '',
    images,
  };
}

// ==================== LISTENERS ====================
export function subscribePublishedProducts(
  onData: (items: CmsProductDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'products';
  const q = query(collection(db, path), where('published', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CmsProductDoc[] = snapshot.docs.map((d) =>
        normalizeProductDoc(d.id, d.data() as Omit<CmsProductDoc, 'id'>)
      );
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeAllProductsAdmin(
  onData: (items: CmsProductDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: CmsProductDoc[] = snapshot.docs.map((d) =>
        normalizeProductDoc(d.id, d.data() as Omit<CmsProductDoc, 'id'>)
      );
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribePublishedBlogPosts(
  onData: (items: CmsBlogPostDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'blog_posts';
  const q = query(collection(db, path), where('published', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CmsBlogPostDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CmsBlogPostDoc, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribeAllBlogPostsAdmin(
  onData: (items: CmsBlogPostDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'blog_posts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: CmsBlogPostDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CmsBlogPostDoc, 'id'>),
      }));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribePublicSeoSettings(
  onData: (items: Record<string, CmsSeoSettingDoc>) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'seo_settings';
  const q = query(collection(db, path), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const map: Record<string, CmsSeoSettingDoc> = {};
      for (const d of snapshot.docs) {
        map[d.id] = {
          id: d.id as SeoPageKey,
          ...(d.data() as Omit<CmsSeoSettingDoc, 'id'>),
        };
      }
      onData(map);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export function subscribePublicCatalogConfig(
  onData: (config: CmsCatalogConfigDoc | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'site_config';
  const q = query(collection(db, path), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const catalogDoc = snapshot.docs.find((d) => d.id === 'catalog');
      if (!catalogDoc) {
        onData(null);
        return;
      }
      onData({
        id: 'catalog',
        ...(catalogDoc.data() as Omit<CmsCatalogConfigDoc, 'id'>),
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

// ==================== CRUD WRITES (ADMIN ONLY) ====================
function assertMinLength(val: string, min: number, label: string): void {
  if (val.length < min) {
    throw new Error(`${label} must be at least ${min} characters.`);
  }
}

export async function saveProduct(input: CmsProductInput): Promise<void> {
  const user = auth.currentUser;
  if (!isAuthorizedAdmin(user) || !user) {
    throw new Error('Unauthorized: Admin sign-in required.');
  }
  const safeId = sanitizeSlugId(input.id);
  if (!safeId) {
    throw new Error('Invalid product ID slug (use letters, numbers, hyphens or underscores).');
  }

  const cleanedImages = (input.images || [])
    .map((img) => sanitizeImageSource(img))
    .filter((img) => img.length > 0)
    .slice(0, 6);

  const primaryImage = cleanedImages[0] ?? sanitizeImageSource(input.image);
  const finalImages =
    cleanedImages.length > 0 ? cleanedImages : primaryImage ? [primaryImage] : [];

  const totalImageChars = finalImages.reduce((sum, img) => sum + img.length, 0);
  if (totalImageChars > 720000) {
    throw new Error(
      'Combined uploaded images are too large for one product document. Remove an image or upload smaller files.'
    );
  }

  const mutablePayload = {
    category: input.category,
    figCode: clampStr(input.figCode, 24),
    modelRange: clampStr(input.modelRange || '', 64),
    title: clampStr(input.title, 120),
    uses: clampStr(input.uses, 500),
    neckSizes: clampStr(input.neckSizes, 120),
    neckToConfirm: Boolean(input.neckToConfirm),
    dosage: clampStr(input.dosage, 80),
    material: clampStr(input.material, 120),
    featureSpec: clampStr(input.featureSpec, 160),
    image: primaryImage,
    images: finalImages,
    altText: clampStr(input.altText, 200),
    quoteValue: clampStr(input.quoteValue, 120),
    published: Boolean(input.published),
  };

  assertMinLength(mutablePayload.figCode, 2, 'Fig Code');
  assertMinLength(mutablePayload.title, 2, 'Product Title');
  assertMinLength(mutablePayload.uses, 4, 'Typical Uses');
  assertMinLength(mutablePayload.neckSizes, 1, 'Neck Sizes');
  assertMinLength(mutablePayload.dosage, 1, 'Dosage / Output');
  assertMinLength(mutablePayload.material, 1, 'Material');
  assertMinLength(mutablePayload.featureSpec, 1, 'Key Details');
  assertMinLength(mutablePayload.altText, 2, 'SEO Image Alt Text');
  assertMinLength(mutablePayload.quoteValue, 2, 'Quote Form Pre-fill Label');

  const docPath = `products/${safeId}`;
  const docRef = doc(db, 'products', safeId);

  let exists = false;
  try {
    const existingSnap = await getDoc(docRef);
    exists = existingSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  try {
    if (exists) {
      await updateDoc(docRef, {
        ...mutablePayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...mutablePayload,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, exists ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function removeProduct(productId: string): Promise<void> {
  const safeId = sanitizeSlugId(productId);
  const docPath = `products/${safeId}`;
  try {
    await deleteDoc(doc(db, 'products', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function saveBlogPost(input: CmsBlogPostInput): Promise<void> {
  const user = auth.currentUser;
  if (!isAuthorizedAdmin(user) || !user) {
    throw new Error('Unauthorized: Admin sign-in required.');
  }
  const safeId = sanitizeSlugId(input.id);
  if (!safeId) {
    throw new Error('Invalid blog post slug ID.');
  }

  const cleanParagraphs = input.paragraphs
    .map((p) => clampStr(p, 4000))
    .filter((p) => p.length > 0)
    .slice(0, 20);

  if (cleanParagraphs.length === 0) {
    throw new Error('At least one body paragraph is required.');
  }

  const mutablePayload = {
    index: clampStr(input.index, 12),
    refCode: clampStr(input.refCode, 32),
    category: clampStr(input.category, 64),
    title: clampStr(input.title, 160),
    summary: clampStr(input.summary, 400),
    specTakeaway: clampStr(input.specTakeaway, 280),
    paragraphs: cleanParagraphs,
    relatedProduct: clampStr(input.relatedProduct, 120),
    image: sanitizeImageSource(input.image),
    seoTitle: clampStr(input.seoTitle, 120),
    seoDescription: clampStr(input.seoDescription, 240),
    published: Boolean(input.published),
  };

  assertMinLength(mutablePayload.index, 1, 'Index Number');
  assertMinLength(mutablePayload.refCode, 2, 'Ref Code');
  assertMinLength(mutablePayload.category, 2, 'Category');
  assertMinLength(mutablePayload.title, 4, 'Article Title');
  assertMinLength(mutablePayload.summary, 10, 'Summary');
  assertMinLength(mutablePayload.specTakeaway, 2, 'Technical Spec Takeaway');
  assertMinLength(mutablePayload.relatedProduct, 2, 'Related Product');

  const docPath = `blog_posts/${safeId}`;
  const docRef = doc(db, 'blog_posts', safeId);

  let exists = false;
  try {
    const existingSnap = await getDoc(docRef);
    exists = existingSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  try {
    if (exists) {
      await updateDoc(docRef, {
        ...mutablePayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...mutablePayload,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, exists ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function removeBlogPost(postId: string): Promise<void> {
  const safeId = sanitizeSlugId(postId);
  const docPath = `blog_posts/${safeId}`;
  try {
    await deleteDoc(doc(db, 'blog_posts', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function saveSeoSetting(input: CmsSeoSettingInput): Promise<void> {
  const user = auth.currentUser;
  if (!isAuthorizedAdmin(user) || !user) {
    throw new Error('Unauthorized: Admin sign-in required.');
  }
  const safeId = sanitizeSlugId(input.id);
  if (!safeId) {
    throw new Error('Invalid SEO setting ID.');
  }

  const mutablePayload = {
    pageKey: input.pageKey,
    title: clampStr(input.title, 120),
    description: clampStr(input.description, 320),
    keywords: clampStr(input.keywords, 400),
    ogTitle: clampStr(input.ogTitle, 120),
    ogDescription: clampStr(input.ogDescription, 320),
    ogSiteName: clampStr(input.ogSiteName, 80),
    ogImage: sanitizeImageOrUrl(input.ogImage, 500),
    twitterCard: input.twitterCard,
    canonicalBaseUrl: sanitizeImageOrUrl(input.canonicalBaseUrl, 300),
    schemaOrgName: clampStr(input.schemaOrgName, 120),
    schemaOrgDescription: clampStr(input.schemaOrgDescription, 400),
    isPublic: true,
  };

  assertMinLength(mutablePayload.title, 10, 'Document Title');
  assertMinLength(mutablePayload.description, 20, 'Meta Description');
  assertMinLength(mutablePayload.ogSiteName, 2, 'OpenGraph Site Name');
  assertMinLength(mutablePayload.schemaOrgName, 2, 'Schema.org Organization Name');
  assertMinLength(mutablePayload.schemaOrgDescription, 10, 'Schema.org Organization Description');

  const docPath = `seo_settings/${safeId}`;
  const docRef = doc(db, 'seo_settings', safeId);

  let exists = false;
  try {
    const existingSnap = await getDoc(docRef);
    exists = existingSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  try {
    if (exists) {
      await updateDoc(docRef, {
        ...mutablePayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...mutablePayload,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, exists ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function removeSeoSetting(settingId: SeoPageKey): Promise<void> {
  const safeId = sanitizeSlugId(settingId);
  const docPath = `seo_settings/${safeId}`;
  try {
    await deleteDoc(doc(db, 'seo_settings', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==================== CATALOG PDF STORAGE & RE-UPLOAD ====================
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const sliceSize = 0x8000;
  for (let i = 0; i < bytes.length; i += sliceSize) {
    const slice = bytes.subarray(i, i + sliceSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const catalogBlobCache = new Map<string, string>();

export async function resolveCatalogBlobUrl(config: CmsCatalogConfigDoc): Promise<string> {
  if (config.mode !== 'chunks' || config.chunkCount <= 0) {
    return config.pdfUrl || DEFAULT_CATALOG_PDF_URL;
  }

  const cached = catalogBlobCache.get(config.versionId);
  if (cached) return cached;

  const chunkParts: Uint8Array[] = new Array(config.chunkCount);
  const batchSize = 8;

  for (let start = 0; start < config.chunkCount; start += batchSize) {
    const indices: number[] = [];
    for (let i = start; i < Math.min(start + batchSize, config.chunkCount); i += 1) {
      indices.push(i);
    }

    await Promise.all(
      indices.map(async (chunkIndex) => {
        const chunkId = `${config.versionId}_${chunkIndex}`;
        const chunkPath = `catalog_chunks/${chunkId}`;
        try {
          const snap = await getDoc(doc(db, 'catalog_chunks', chunkId));
          if (!snap.exists()) {
            throw new Error(`Missing catalog chunk ${chunkIndex + 1} of ${config.chunkCount}.`);
          }
          const rawData = snap.data() as { data?: string };
          if (!rawData.data || typeof rawData.data !== 'string') {
            throw new Error(`Invalid catalog chunk ${chunkIndex + 1}.`);
          }
          chunkParts[chunkIndex] = base64ToUint8Array(rawData.data);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, chunkPath);
        }
      })
    );
  }

  const blob = new Blob(chunkParts as BlobPart[], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  catalogBlobCache.set(config.versionId, objectUrl);
  return objectUrl;
}

async function cleanupCatalogChunks(versionId: string, chunkCount: number): Promise<void> {
  if (!versionId || chunkCount <= 0) return;
  const batchSize = 10;
  for (let start = 0; start < chunkCount; start += batchSize) {
    const deletes: Promise<void>[] = [];
    for (let i = start; i < Math.min(start + batchSize, chunkCount); i += 1) {
      const chunkId = `${versionId}_${i}`;
      deletes.push(deleteDoc(doc(db, 'catalog_chunks', chunkId)).catch(() => undefined));
    }
    await Promise.all(deletes);
  }
}

async function upsertCatalogConfigDoc(payload: {
  mode: CatalogSourceMode;
  buttonLabel: string;
  fileName: string;
  fileSizeBytes: number;
  pdfUrl: string;
  versionId: string;
  chunkCount: number;
  authorUid: string;
}): Promise<{ prevMode?: CatalogSourceMode; prevVersionId?: string; prevChunkCount?: number }> {
  const docPath = 'site_config/catalog';
  const docRef = doc(db, 'site_config', 'catalog');

  let exists = false;
  let prevMode: CatalogSourceMode | undefined;
  let prevVersionId: string | undefined;
  let prevChunkCount: number | undefined;

  try {
    const existingSnap = await getDoc(docRef);
    exists = existingSnap.exists();
    if (exists) {
      const data = existingSnap.data() as Partial<CmsCatalogConfigDoc>;
      prevMode = data.mode;
      prevVersionId = data.versionId;
      prevChunkCount = data.chunkCount;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  const mutablePayload = {
    mode: payload.mode,
    buttonLabel: clampStr(payload.buttonLabel, 80),
    fileName: clampStr(payload.fileName, 160) || DEFAULT_CATALOG_FILE_NAME,
    fileSizeBytes: Math.max(0, Math.min(40000000, Math.round(payload.fileSizeBytes))),
    pdfUrl: payload.pdfUrl,
    versionId: payload.versionId,
    chunkCount: Math.max(0, Math.min(85, Math.round(payload.chunkCount))),
    isPublic: true,
  };

  try {
    if (exists) {
      await updateDoc(docRef, {
        ...mutablePayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...mutablePayload,
        authorUid: payload.authorUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, exists ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }

  return { prevMode, prevVersionId, prevChunkCount };
}

export async function uploadCatalogPdfFile(
  file: File,
  buttonLabel: string,
  onProgress?: (progress: CatalogUploadProgress) => void
): Promise<void> {
  const user = auth.currentUser;
  if (!isAuthorizedAdmin(user) || !user) {
    throw new Error('Unauthorized: Admin sign-in required.');
  }

  const lowerName = file.name.toLowerCase();
  const isPdfMime = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
  if (!isPdfMime) {
    throw new Error('Please choose a valid .pdf catalog file.');
  }
  if (file.size <= 0) {
    throw new Error('Selected PDF file is empty.');
  }
  if (file.size > MAX_CATALOG_PDF_BYTES) {
    throw new Error(
      `PDF is ${formatFileSize(file.size)}, which exceeds the 31 MB direct upload limit. Compress the PDF or use External PDF URL mode.`
    );
  }

  onProgress?.({ stage: 'preparing', completedChunks: 0, totalChunks: 1, percent: 4 });

  const buffer = await file.arrayBuffer();
  const allBytes = new Uint8Array(buffer);
  const totalChunks = Math.max(1, Math.ceil(allBytes.length / CATALOG_CHUNK_RAW_BYTES));
  if (totalChunks > 85) {
    throw new Error('PDF exceeds maximum chunk capacity (85 parts).');
  }

  const versionId = `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const batchSize = 4;
  let uploadedChunks = 0;

  for (let start = 0; start < totalChunks; start += batchSize) {
    const indices: number[] = [];
    for (let i = start; i < Math.min(start + batchSize, totalChunks); i += 1) {
      indices.push(i);
    }

    await Promise.all(
      indices.map(async (chunkIndex) => {
        const byteStart = chunkIndex * CATALOG_CHUNK_RAW_BYTES;
        const byteEnd = Math.min(byteStart + CATALOG_CHUNK_RAW_BYTES, allBytes.length);
        const base64Part = uint8ArrayToBase64(allBytes.subarray(byteStart, byteEnd));
        const chunkId = `${versionId}_${chunkIndex}`;
        const chunkPath = `catalog_chunks/${chunkId}`;

        try {
          await setDoc(doc(db, 'catalog_chunks', chunkId), {
            versionId,
            chunkIndex,
            data: base64Part,
            isPublic: true,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, chunkPath);
        }

        uploadedChunks += 1;
        onProgress?.({
          stage: 'uploading',
          completedChunks: uploadedChunks,
          totalChunks,
          percent: Math.min(92, Math.round((uploadedChunks / totalChunks) * 88) + 5),
        });
      })
    );
  }

  onProgress?.({
    stage: 'finalizing',
    completedChunks: totalChunks,
    totalChunks,
    percent: 95,
  });

  const cleanFileName =
    file.name.replace(/[^\w.\- ()]+/g, '_').trim().slice(0, 160) || DEFAULT_CATALOG_FILE_NAME;

  const previous = await upsertCatalogConfigDoc({
    mode: 'chunks',
    buttonLabel,
    fileName: cleanFileName,
    fileSizeBytes: file.size,
    pdfUrl: '',
    versionId,
    chunkCount: totalChunks,
    authorUid: user.uid,
  });

  if (
    previous.prevMode === 'chunks' &&
    previous.prevVersionId &&
    previous.prevVersionId !== versionId &&
    previous.prevChunkCount &&
    previous.prevChunkCount > 0
  ) {
    catalogBlobCache.delete(previous.prevVersionId);
    onProgress?.({
      stage: 'cleaning',
      completedChunks: totalChunks,
      totalChunks,
      percent: 98,
    });
    await cleanupCatalogChunks(previous.prevVersionId, previous.prevChunkCount);
  }

  onProgress?.({
    stage: 'cleaning',
    completedChunks: totalChunks,
    totalChunks,
    percent: 100,
  });
}

export async function saveCatalogExternalUrl(
  pdfUrl: string,
  buttonLabel: string,
  fileName?: string
): Promise<void> {
  const user = auth.currentUser;
  if (!isAuthorizedAdmin(user) || !user) {
    throw new Error('Unauthorized: Admin sign-in required.');
  }
  const cleanUrl = sanitizeImageOrUrl(pdfUrl, 500);
  if (!cleanUrl) {
    throw new Error('Please enter a valid PDF URL starting with https:// or /.');
  }

  const derivedName =
    clampStr(fileName || '', 160) ||
    clampStr(cleanUrl.split('/').pop()?.split('?')[0] || '', 160) ||
    'Yi_Lai_Catalog.pdf';

  const previous = await upsertCatalogConfigDoc({
    mode: 'url',
    buttonLabel,
    fileName: derivedName,
    fileSizeBytes: 0,
    pdfUrl: cleanUrl,
    versionId: `url_${Date.now().toString(36)}`,
    chunkCount: 0,
    authorUid: user.uid,
  });

  if (
    previous.prevMode === 'chunks' &&
    previous.prevVersionId &&
    previous.prevChunkCount &&
    previous.prevChunkCount > 0
  ) {
    catalogBlobCache.delete(previous.prevVersionId);
    await cleanupCatalogChunks(previous.prevVersionId, previous.prevChunkCount);
  }
}

export async function resetCatalogToDefault(buttonLabel = ''): Promise<void> {
  const user = auth.currentUser;
  if (!isAuthorizedAdmin(user) || !user) {
    throw new Error('Unauthorized: Admin sign-in required.');
  }

  const previous = await upsertCatalogConfigDoc({
    mode: 'default',
    buttonLabel,
    fileName: DEFAULT_CATALOG_FILE_NAME,
    fileSizeBytes: 23800000,
    pdfUrl: DEFAULT_CATALOG_PDF_URL,
    versionId: 'default_2026',
    chunkCount: 0,
    authorUid: user.uid,
  });

  if (
    previous.prevMode === 'chunks' &&
    previous.prevVersionId &&
    previous.prevChunkCount &&
    previous.prevChunkCount > 0
  ) {
    catalogBlobCache.delete(previous.prevVersionId);
    await cleanupCatalogChunks(previous.prevVersionId, previous.prevChunkCount);
  }
}

// ==================== SOCIAL MEDIA & DIRECT MESSAGING LINKS ====================
export interface CmsSocialSettingInput {
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  xUrl: string;
  alibabaUrl: string;
  telegramUrl: string;
  websiteExtraUrl: string;
  websiteExtraLabel: string;
  wechatId: string;
  whatsappNumber: string;
  businessWhatsapp: string;
  signatureHeading: string;
  showOnProducts: boolean;
  showOnBlogPosts: boolean;
  enableShareButtons: boolean;
  isPublic: boolean;
}

export interface CmsSocialSettingDoc extends CmsSocialSettingInput {
  id: 'official';
  authorUid: string;
}

export const DEFAULT_SOCIAL_SETTING: CmsSocialSettingInput = {
  facebookUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
  tiktokUrl: '',
  xUrl: '',
  alibabaUrl: '',
  telegramUrl: '',
  websiteExtraUrl: '',
  websiteExtraLabel: '',
  wechatId: '',
  whatsappNumber: '+86 137 5705 0848',
  businessWhatsapp: '',
  signatureHeading: 'Connect & Follow Yi Lai Plastics',
  showOnProducts: true,
  showOnBlogPosts: true,
  enableShareButtons: true,
  isPublic: true,
};

export function normalizeHttpsSocialUrl(raw: string, handlePrefixUrl?: string): string {
  const trimmed = raw.trim().slice(0, 300);
  if (!trimmed) return '';
  if (trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice(7)}`.slice(0, 300);
  }
  if (trimmed.startsWith('@') && handlePrefixUrl) {
    const cleanHandle = trimmed.slice(1).replace(/^\/+/, '');
    return cleanHandle ? `${handlePrefixUrl}${cleanHandle}`.slice(0, 300) : '';
  }
  if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+\//.test(trimmed) || /^www\./i.test(trimmed)) {
    return `https://${trimmed}`.slice(0, 300);
  }
  return '';
}

export function resolveWhatsAppChatUrl(rawNumberOrLink: string, prefillText?: string): string {
  const trimmed = rawNumberOrLink.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed) || /^wa\.me\//i.test(trimmed)) {
    const base = trimmed.startsWith('http://')
      ? `https://${trimmed.slice(7)}`
      : trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    if (!prefillText) return base;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}text=${encodeURIComponent(prefillText)}`;
  }

  const digits = trimmed.replace(/\D+/g, '');
  if (digits.length < 6) return '';
  return prefillText
    ? `https://wa.me/${digits}?text=${encodeURIComponent(prefillText)}`
    : `https://wa.me/${digits}`;
}

export function formatSocialLinksTextSummary(
  social?: CmsSocialSettingInput | CmsSocialSettingDoc | null
): string {
  const active = social ?? DEFAULT_SOCIAL_SETTING;
  const lines: string[] = [];
  if (active.whatsappNumber.trim()) {
    const waUrl = resolveWhatsAppChatUrl(active.whatsappNumber);
    lines.push(`WhatsApp: ${active.whatsappNumber.trim()}${waUrl ? ` (${waUrl})` : ''}`);
  }
  if (active.businessWhatsapp.trim()) {
    const bwaUrl = resolveWhatsAppChatUrl(active.businessWhatsapp);
    lines.push(
      `Business WhatsApp: ${active.businessWhatsapp.trim()}${
        bwaUrl && bwaUrl !== active.businessWhatsapp.trim() ? ` (${bwaUrl})` : ''
      }`
    );
  }
  if (active.facebookUrl.trim()) lines.push(`Facebook: ${active.facebookUrl.trim()}`);
  if (active.instagramUrl.trim()) lines.push(`Instagram: ${active.instagramUrl.trim()}`);
  if (active.youtubeUrl.trim()) lines.push(`YouTube: ${active.youtubeUrl.trim()}`);
  if (active.linkedinUrl.trim()) lines.push(`LinkedIn: ${active.linkedinUrl.trim()}`);
  if (active.tiktokUrl.trim()) lines.push(`TikTok: ${active.tiktokUrl.trim()}`);
  if (active.xUrl.trim()) lines.push(`X: ${active.xUrl.trim()}`);
  if (active.alibabaUrl.trim()) lines.push(`Alibaba: ${active.alibabaUrl.trim()}`);
  if (active.telegramUrl.trim()) lines.push(`Telegram: ${active.telegramUrl.trim()}`);
  if (active.wechatId.trim()) lines.push(`WeChat ID: ${active.wechatId.trim()}`);
  if (active.websiteExtraUrl.trim()) {
    const label = active.websiteExtraLabel.trim() || 'Website';
    lines.push(`${label}: ${active.websiteExtraUrl.trim()}`);
  }
  return lines.join('\n');
}

export function subscribePublicSocialSettings(
  onData: (config: CmsSocialSettingDoc | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'social_settings';
  const q = query(collection(db, path), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const officialDoc = snapshot.docs.find((d) => d.id === 'official') ?? snapshot.docs[0];
      if (!officialDoc) {
        onData(null);
        return;
      }
      onData({
        id: 'official',
        ...(officialDoc.data() as Omit<CmsSocialSettingDoc, 'id'>),
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped as Error);
      }
    }
  );
}

export async function saveSocialSetting(input: CmsSocialSettingInput): Promise<void> {
  const user = auth.currentUser;
  if (!isAuthorizedAdmin(user) || !user) {
    throw new Error('Unauthorized: Admin sign-in required.');
  }

  const cleanBusinessWa = input.businessWhatsapp.trim();
  const normalizedBusinessWa =
    cleanBusinessWa.startsWith('http://')
      ? `https://${cleanBusinessWa.slice(7)}`.slice(0, 300)
      : cleanBusinessWa.startsWith('wa.me/')
        ? `https://${cleanBusinessWa}`.slice(0, 300)
        : clampStr(cleanBusinessWa, 300);

  const mutablePayload = {
    facebookUrl: normalizeHttpsSocialUrl(input.facebookUrl, 'https://facebook.com/'),
    instagramUrl: normalizeHttpsSocialUrl(input.instagramUrl, 'https://instagram.com/'),
    youtubeUrl: normalizeHttpsSocialUrl(input.youtubeUrl, 'https://youtube.com/@'),
    linkedinUrl: normalizeHttpsSocialUrl(input.linkedinUrl, 'https://linkedin.com/in/'),
    tiktokUrl: normalizeHttpsSocialUrl(input.tiktokUrl, 'https://tiktok.com/@'),
    xUrl: normalizeHttpsSocialUrl(input.xUrl, 'https://x.com/'),
    alibabaUrl: normalizeHttpsSocialUrl(input.alibabaUrl),
    telegramUrl: normalizeHttpsSocialUrl(input.telegramUrl, 'https://t.me/'),
    websiteExtraUrl: normalizeHttpsSocialUrl(input.websiteExtraUrl),
    websiteExtraLabel: clampStr(input.websiteExtraLabel, 60),
    wechatId: clampStr(input.wechatId, 120),
    whatsappNumber: clampStr(input.whatsappNumber, 60),
    businessWhatsapp: normalizedBusinessWa,
    signatureHeading: clampStr(input.signatureHeading, 140) || DEFAULT_SOCIAL_SETTING.signatureHeading,
    showOnProducts: Boolean(input.showOnProducts),
    showOnBlogPosts: Boolean(input.showOnBlogPosts),
    enableShareButtons: Boolean(input.enableShareButtons),
    isPublic: true,
  };

  const urlFields: [string, string][] = [
    ['Facebook URL', input.facebookUrl],
    ['Instagram URL', input.instagramUrl],
    ['YouTube URL', input.youtubeUrl],
    ['LinkedIn URL', input.linkedinUrl],
    ['TikTok URL', input.tiktokUrl],
    ['X / Twitter URL', input.xUrl],
    ['Alibaba URL', input.alibabaUrl],
    ['Telegram URL', input.telegramUrl],
    ['Custom Link URL', input.websiteExtraUrl],
  ];
  const mappedValues = [
    mutablePayload.facebookUrl,
    mutablePayload.instagramUrl,
    mutablePayload.youtubeUrl,
    mutablePayload.linkedinUrl,
    mutablePayload.tiktokUrl,
    mutablePayload.xUrl,
    mutablePayload.alibabaUrl,
    mutablePayload.telegramUrl,
    mutablePayload.websiteExtraUrl,
  ];
  for (let i = 0; i < urlFields.length; i += 1) {
    const [label, rawVal] = urlFields[i];
    if (rawVal.trim() && !mappedValues[i]) {
      throw new Error(`${label} must be a valid https:// URL (e.g. https://...).`);
    }
  }

  const docPath = 'social_settings/official';
  const docRef = doc(db, 'social_settings', 'official');

  let exists = false;
  try {
    const existingSnap = await getDoc(docRef);
    exists = existingSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  try {
    if (exists) {
      await updateDoc(docRef, {
        ...mutablePayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...mutablePayload,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, exists ? OperationType.UPDATE : OperationType.CREATE, docPath);
  }
}

export async function removeSocialSetting(): Promise<void> {
  const docPath = 'social_settings/official';
  try {
    await deleteDoc(doc(db, 'social_settings', 'official'));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}


