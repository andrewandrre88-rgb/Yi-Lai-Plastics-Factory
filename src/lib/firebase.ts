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
    modelRange: clampStr(input.modelRange, 64),
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
  assertMinLength(mutablePayload.modelRange, 2, 'Model Range');
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
