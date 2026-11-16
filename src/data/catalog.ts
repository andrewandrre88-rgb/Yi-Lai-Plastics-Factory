export type ProductCategoryId =
  | 'all'
  | 'trigger'
  | 'lotion'
  | 'mist'
  | 'foam'
  | 'caps';

export interface ProductFamily {
  id: string;
  category: Exclude<ProductCategoryId, 'all'>;
  figCode: string;
  modelRange: string;
  titleKey: string;
  usesKey: string;
  neckSizes: string;
  neckToConfirm?: boolean;
  dosage: string;
  material: string;
  featureSpec: string;
  image?: string;
  altImage?: string;
  altKey: string;
  quoteValue: string;
}

export const PRODUCT_FAMILIES: ProductFamily[] = [
  {
    id: 'trigger-sprayers',
    category: 'trigger',
    figCode: 'FIG 1.1',
    modelRange: 'TS001 – TS021',
    titleKey: 'p1.title',
    usesKey: 'p1.uses',
    neckSizes: '28/400 · 28/410 · 28/415',
    dosage: '0.8 – 1.0 ml/T (0.10 – 0.12 ml/T TS015+)',
    material: 'PP (Chemical-resistant options)',
    featureSpec: 'Spray / Stream / Foam / Off',
    image: '/images/prod-trigger-ts001.jpg',
    altImage: '/images/prod-trigger-ts014.jpg',
    altKey: 'p1.alt',
    quoteValue: 'Trigger sprayer (TS001-TS021)',
  },
  {
    id: 'mini-trigger-sprayers',
    category: 'trigger',
    figCode: 'FIG 1.2',
    modelRange: 'MTS001 – MTS005',
    titleKey: 'p2.title',
    usesKey: 'p2.uses',
    neckSizes: '28/400 · 28/410 · 28/415',
    dosage: '0.15 – 0.25 ml',
    material: 'PP',
    featureSpec: 'Fine spray · ON/OFF lock collar',
    image: '/images/prod-mini-mts001.jpg',
    altKey: 'p2.alt',
    quoteValue: 'Mini trigger sprayer (MTS001-MTS005)',
  },
  {
    id: 'lotion-pumps',
    category: 'lotion',
    figCode: 'FIG 1.3',
    modelRange: 'LPS001 – LPS012',
    titleKey: 'p3.title',
    usesKey: 'p3.uses',
    neckSizes: '24/410 · 24/415 · 28/400 · 28/410 · 30/410 · 33/400',
    dosage: '0.15 – 0.25 ml / stroke',
    material: 'PP (Smooth, ribbed or metal collar)',
    featureSpec: 'Clip-Lock · Screw-Lock · Switch Lock',
    image: '/images/prod-lotion-lps002.jpg',
    altImage: '/images/prod-lotion-lps012.jpg',
    altKey: 'p3.alt',
    quoteValue: 'Lotion pump (LPS001-LPS012)',
  },
  {
    id: 'fine-mist-sprayers',
    category: 'mist',
    figCode: 'FIG 1.4',
    modelRange: 'FMS001 – FMS012',
    titleKey: 'p4.title',
    usesKey: 'p4.uses',
    neckSizes: '20/410 · 24/410 · 28/410',
    dosage: '0.15 – 0.25 ml / stroke',
    material: 'PP · Aluminum-Plastic options',
    featureSpec: 'Ultra-fine mist · Clear or metal overcap',
    image: '/images/prod-mist-fms008.jpg',
    altImage: '/images/prod-mist-fms002.jpg',
    altKey: 'p4.alt',
    quoteValue: 'Fine mist sprayer (FMS001-FMS012)',
  },
  {
    id: 'foam-pumps',
    category: 'foam',
    figCode: 'FIG 1.5',
    modelRange: 'FP001 – FP009',
    titleKey: 'p5.title',
    usesKey: 'p5.uses',
    neckSizes: '33/410 · 40/410 · 45/410',
    dosage: '0.15 – 0.25 ml / stroke',
    material: 'PP · Stainless steel / Matte / Brush options',
    featureSpec: 'Rich instant foam · No propellant',
    image: '/images/prod-foam-fp001.jpg',
    altImage: '/images/prod-foam-fp009.jpg',
    altKey: 'p5.alt',
    quoteValue: 'Foam pump (FP001-FP009)',
  },
  {
    id: 'foundation-pumps',
    category: 'lotion',
    figCode: 'FIG 1.6',
    modelRange: 'FNP001 – FNP002',
    titleKey: 'p6.title',
    usesKey: 'p6.uses',
    neckSizes: '20/410 · 24/410',
    dosage: '0.15 – 0.25 ml / stroke',
    material: 'PP · Matte silver aluminum collar',
    featureSpec: 'Precise angled nozzle · Dome or ring overcap',
    image: '/images/prod-foundation-fnp001.jpg',
    altImage: '/images/prod-foundation-fnp002.jpg',
    altKey: 'p6.alt',
    quoteValue: 'Foundation / treatment pump (FNP001-FNP002)',
  },
  {
    id: 'bottle-caps',
    category: 'caps',
    figCode: 'FIG 1.7',
    modelRange: 'Series 09 & 10',
    titleKey: 'p7.title',
    usesKey: 'p7.uses',
    neckSizes: '[TO CONFIRM]',
    neckToConfirm: true,
    dosage: 'Closure / Flip-open / Pull-up',
    material: 'PP',
    featureSpec: 'Screw caps · Push-pull caps · Perfume sprayers',
    altKey: 'p7.alt',
    quoteValue: 'Bottle caps & push-pull closures',
  },
];

export const NECK_SIZES_LIST = [
  '20/410',
  '24/410',
  '24/415',
  '28/400',
  '28/410',
  '28/415',
  '30/410',
  '33/400',
  '33/410',
  '40/410',
  '45/410',
];

export const CUSTOM_SWATCHES = [
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Black', hex: '#0D1526' },
  { name: 'Brand Blue', hex: '#0048D6' },
  { name: 'Red', hex: '#D8001A' },
  { name: 'Green', hex: '#2BA84A' },
  { name: 'Yellow', hex: '#F2B705' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Purple', hex: '#8A5CF6' },
  { name: 'Grey', hex: '#94A3B8' },
  { name: 'Sky Blue', hex: '#38BDF8' },
];
