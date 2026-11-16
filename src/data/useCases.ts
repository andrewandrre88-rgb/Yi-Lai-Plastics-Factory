import type { LangCode } from '../i18n/translations';

export interface UseCaseItem {
  id: string;
  refCode: string;
  series: string;
  quoteProduct: string;
  recommendedNeck: string;
  dosage: string;
  image: string;
  altKey: string;
  title: Record<LangCode, string>;
  sector: Record<LangCode, string>;
  description: Record<LangCode, string>;
  bottleFit: Record<LangCode, string>;
}

export const REAL_USE_CASES: UseCaseItem[] = [
  {
    id: 'household-cleaning',
    refCode: 'CASE 02.1',
    series: 'TS001 – TS004',
    quoteProduct: 'Trigger sprayer (TS001-TS021)',
    recommendedNeck: '28/410',
    dosage: '0.8 – 1.0 ml/T',
    image: '/images/prod-trigger-ts001.jpg',
    altKey: 'p1.alt',
    title: {
      en: 'Household & kitchen surface sprays',
      es: 'Limpiadores de hogar y cocina',
      pt: 'Limpadores domésticos e cozinha',
      ar: 'بخاخات تنظيف المنزل والمطبخ',
      tr: 'Ev ve mutfak yüzey spreyleri',
    },
    sector: {
      en: 'Home Care · Cleaning',
      es: 'Hogar · Limpieza',
      pt: 'Limpeza Doméstica',
      ar: 'العناية المنزلية',
      tr: 'Ev Bakımı · Temizlik',
    },
    description: {
      en: 'All-purpose cleaners, glass sprays, bathroom descalers, and kitchen degreasers requiring high-output spray, stream, or foam switching.',
      es: 'Limpiadores multiusos, limpiacristales, baños y desengrasantes de cocina que requieren boquilla giratoria Spray, Chorro o Espuma.',
      pt: 'Multiusos, limpa-vidros, banheiro e desengordurantes de cozinha com bico giratório para Névoa, Jato ou Espuma.',
      ar: 'منظفات متعددة الاستخدامات، ومنظفات الزجاج، والحمامات، ومزيلات الدهون التي تتطلب رشاً قوياً أو خطاً مباشراً أو رغوة.',
      tr: 'Yüksek çıkışlı sis, jet veya köpük ayarı gerektiren çok amaçlı temizleyiciler, cam spreyleri, banyo ve mutfak yağ çözücüleri.',
    },
    bottleFit: {
      en: 'PET / HDPE trigger bottles · 28/400, 28/410, 28/415',
      es: 'Botellas PET / HDPE · Cuellos 28/400, 28/410, 28/415',
      pt: 'Frascos PET / HDPE · Roscas 28/400, 28/410, 28/415',
      ar: 'عبوات PET / HDPE · مقاسات 28/400 و 28/410 و 28/415',
      tr: 'PET / HDPE şişeler · 28/400, 28/410, 28/415',
    },
  },
  {
    id: 'personal-care-lotion',
    refCode: 'CASE 02.2',
    series: 'LPS001 – LPS012',
    quoteProduct: 'Lotion pump (LPS001-LPS012)',
    recommendedNeck: '28/410',
    dosage: '0.15 – 0.25 ml / stroke',
    image: '/images/prod-lotion-lps002.jpg',
    altKey: 'p3.alt',
    title: {
      en: 'Body lotion, liquid soap & hair care',
      es: 'Loción corporal, jabón líquido y champú',
      pt: 'Hidratante corporal, sabonete e shampoo',
      ar: 'لوشن الجسم والصابون السائل والشامبو',
      tr: 'Vücut losyonu, sıvı sabun ve şampuan',
    },
    sector: {
      en: 'Personal Care · Bath',
      es: 'Cuidado Personal · Baño',
      pt: 'Higiene Pessoal',
      ar: 'العناية الشخصية',
      tr: 'Kişisel Bakım · Banyo',
    },
    description: {
      en: 'Everyday shower gels, shampoos, conditioners, and hand soaps configured with Clip-Lock, Screw-Lock, or twist Switch Lock heads for export transit.',
      es: 'Geles de ducha, champús, acondicionadores y jabones líquidos con bloqueo Clip-Lock, Rosca o Switch Lock para exportación.',
      pt: 'Géis de banho, shampoos, condicionadores e sabonetes líquidos com trava Clip-Lock, Rosca ou Switch Lock para transporte.',
      ar: 'جل الاستحمام والشامبو والبلسم والصابون السائل مع خيارات قفل Clip أو Screw أو Switch Lock لحماية الشحن.',
      tr: 'İhracat taşımacılığına uygun Clip-Lock, Screw-Lock veya çevirmeli Switch Lock başlıklı duş jelleri, şampuanlar ve sıvı sabunlar.',
    },
    bottleFit: {
      en: 'Cosmetic bottles · 24/410 to 33/400 · Custom dip tube',
      es: 'Envases cosméticos · 24/410 a 33/400 · Tubo a medida',
      pt: 'Frascos cosméticos · 24/410 a 33/400 · Pescante sob medida',
      ar: 'عبوات تجميلية · 24/410 إلى 33/400 · أنبوب حسب الطول',
      tr: 'Kozmetik şişeler · 24/410 - 33/400 · Özel daldırma borusu',
    },
  },
  {
    id: 'fine-mist-cosmetics',
    refCode: 'CASE 02.3',
    series: 'FMS001 – FMS012',
    quoteProduct: 'Fine mist sprayer (FMS001-FMS012)',
    recommendedNeck: '24/410',
    dosage: '0.15 – 0.25 ml / stroke',
    image: '/images/prod-mist-fms008.jpg',
    altKey: 'p4.alt',
    title: {
      en: 'Facial toners, body mists & alcohol sprays',
      es: 'Tónicos faciales, brumas y alcohol en spray',
      pt: 'Tônicos faciais, body splash e higienizadores',
      ar: 'تونر الوجه ومعطرات الجسم وبخاخات التعقيم',
      tr: 'Yüz tonikleri, vücut mistleri ve alkol spreyleri',
    },
    sector: {
      en: 'Beauty · Fragrance · Hygiene',
      es: 'Belleza · Fragancias · Higiene',
      pt: 'Beleza · Perfumaria',
      ar: 'التجميل والعطور',
      tr: 'Güzellik · Parfüm · Hijyen',
    },
    description: {
      en: 'Even micro-droplet atomization for skincare mists, hair leave-in sprays, perfumes, and pocket hand sanitisers with clear or aluminum overcaps.',
      es: 'Atomización fina y uniforme para brumas faciales, sprays capilares, perfumes y desinfectantes con tapa transparente o de aluminio.',
      pt: 'Névoa fina e uniforme para tônicos, finalizadores capilares, perfumes e higienizadores com sobretampa cristal ou alumínio.',
      ar: 'توزيع رذاذ ناعم ومتساوٍ لمستحضرات العناية بالبشرة والشعر والعطور والمعقمات مع غطاء شفاف أو ألمنيوم.',
      tr: 'Şeffaf veya alüminyum kapaklı cilt bakım mistleri, saç spreyleri, parfümler ve el dezenfektanları için homojen ince sis püskürtme.',
    },
    bottleFit: {
      en: 'Compact & cosmetic bottles · 20/410, 24/410, 28/410',
      es: 'Envases compactos · 20/410, 24/410, 28/410',
      pt: 'Frascos compactos · 20/410, 24/410, 28/410',
      ar: 'عبوات صغيرة وتجميلية · 20/410 و 24/410 و 28/410',
      tr: 'Kompakt kozmetik şişeler · 20/410, 24/410, 28/410',
    },
  },
  {
    id: 'foaming-cleansers',
    refCode: 'CASE 02.4',
    series: 'FP001 – FP009',
    quoteProduct: 'Foam pump (FP001-FP009)',
    recommendedNeck: '40/410',
    dosage: '0.15 – 0.25 ml / stroke',
    image: '/images/prod-foam-fp001.jpg',
    altKey: 'p5.alt',
    title: {
      en: 'Foaming facial wash, hand soap & baby care',
      es: 'Espuma limpiadora facial, manos y cuidado infantil',
      pt: 'Sabonete em espuma, limpeza facial e linha infantil',
      ar: 'غسول الوجه الرغوي وصابون اليدين والعناية بالأطفال',
      tr: 'Köpük yüz yıkama, el sabunu ve bebek bakımı',
    },
    sector: {
      en: 'Skincare · Kids & Baby',
      es: 'Cuidado Facial · Infantil',
      pt: 'Skincare · Infantil',
      ar: 'العناية بالبشرة والأطفال',
      tr: 'Cilt Bakımı · Bebek Bakımı',
    },
    description: {
      en: 'Propellant-free air-liquid mixing chambers creating rich instant lather for facial cleansers, hair mousse, and alcohol-free foam sanitisers.',
      es: 'Cámaras de mezcla aire-líquido sin propelentes que generan espuma densa al instante para limpieza facial, mousse y línea infantil.',
      pt: 'Câmara de mistura ar-líquido sem propelente para gerar espuma cremosa imediata em sabonetes faciais, mousse e linha infantil.',
      ar: 'مضخات خالية من الغاز تخلط الهواء بالسائل لإنتاج رغوة غنية فورية لغسول الوجه ورغوة الشعر ومنتجات الأطفال.',
      tr: 'Yüz temizleyiciler, saç köpüğü ve alkolsüz dezenfektanlar için itici gazsız anında yoğun köpük üreten hava-sıvı karışım mekanizması.',
    },
    bottleFit: {
      en: 'Wide-neck foamer bottles · 33/410, 40/410, 45/410',
      es: 'Botellas de cuello ancho · 33/410, 40/410, 45/410',
      pt: 'Frascos de rosca larga · 33/410, 40/410, 45/410',
      ar: 'عبوات واسعة العنق · 33/410 و 40/410 و 45/410',
      tr: 'Geniş ağızlı köpük şişeleri · 33/410, 40/410, 45/410',
    },
  },
  {
    id: 'serums-foundation',
    refCode: 'CASE 02.5',
    series: 'FNP001 – FNP002',
    quoteProduct: 'Foundation / treatment pump (FNP001-FNP002)',
    recommendedNeck: '20/410',
    dosage: '0.15 – 0.25 ml / stroke',
    image: '/images/prod-foundation-fnp001.jpg',
    altKey: 'p6.alt',
    title: {
      en: 'Liquid foundation, BB creams & face serums',
      es: 'Base líquida, cremas BB y sérums faciales',
      pt: 'Base líquida, cremes BB e séruns faciais',
      ar: 'كريم الأساس السائل وكريمات BB وسيروم الوجه',
      tr: 'Sıvı fondöten, BB krem ve yüz serumları',
    },
    sector: {
      en: 'Color Cosmetics · Treatment',
      es: 'Maquillaje · Tratamiento',
      pt: 'Maquiagem · Tratamento',
      ar: 'مستحضرات التجميل',
      tr: 'Renkli Kozmetik · Bakım',
    },
    description: {
      en: 'Controlled micro-dosing for viscous makeup, eye creams, sunscreens, and hair oils paired with matte aluminum collars and protective dome overcaps.',
      es: 'Dosificación controlada para maquillaje fluido, contornos de ojos y sérums con cuello de aluminio mate y sobretapa protectora.',
      pt: 'Dosagem precisa para bases, cremes para olhos, protetor solar e óleos com colar em alumínio fosco e tampa protetora.',
      ar: 'جرعات دقيقة للمكياج السائل وكريمات العين وزيوت الشعر مع ياقة ألمنيوم مطفية وغطاء حماية.',
      tr: 'Mat alüminyum yaka ve koruyucu kapaklı yoğun kıvamlı fondöten, göz kremi, güneş koruyucu ve saç yağları için hassas mikro dozaj.',
    },
    bottleFit: {
      en: 'Glass & plastic serum bottles · 20/410, 24/410',
      es: 'Frascos de vidrio y plástico · 20/410, 24/410',
      pt: 'Frascos de vidro e plástico · 20/410, 24/410',
      ar: 'عبوات سيروم زجاجية وبلاستيكية · 20/410 و 24/410',
      tr: 'Cam ve plastik serum şişeleri · 20/410, 24/410',
    },
  },
  {
    id: 'industrial-auto-garden',
    refCode: 'CASE 02.6',
    series: 'TS015 – TS021',
    quoteProduct: 'Trigger sprayer (TS001-TS021)',
    recommendedNeck: '28/400',
    dosage: '0.10 – 0.12 ml/T',
    image: '/images/prod-trigger-ts014.jpg',
    altKey: 'p1.alt',
    title: {
      en: 'Auto detailing, chemical degreasers & garden care',
      es: 'Detailing automotriz, desengrasantes y jardín',
      pt: 'Estética automotiva, desengraxantes e jardim',
      ar: 'العناية بالسيارات ومزيلات الشحوم والزراعة',
      tr: 'Oto bakım, kimyasal yağ çözücüler ve bahçe',
    },
    sector: {
      en: 'Automotive · Industrial · Agro',
      es: 'Automotriz · Industrial · Agro',
      pt: 'Automotivo · Industrial · Agro',
      ar: 'السيارات والصناعة والزراعة',
      tr: 'Otomotiv · Endüstriyel · Tarım',
    },
    description: {
      en: 'Heavy-duty and chemical-resistant PP trigger assemblies engineered for wheel cleaners, workshop solvents, pest control, and foliar plant care.',
      es: 'Pulverizadores reforzados resistentes a químicos para limpiallantas, solventes de taller, control de plagas y cuidado agrícola.',
      pt: 'Gatilhos reforçados resistentes a químicos para limpa-rodas, solventes de oficina, controle de pragas e jardinagem.',
      ar: 'بخاخات زناد ثقيلة ومقاومة للكيماويات لمنظفات السيارات ومذيبات الورش والمبيدات والرش الزراعي.',
      tr: 'Jant temizleyiciler, atölye solventleri, haşere kontrolü ve bitki bakımı için ağır hizmet tipi kimyasala dayanıklı PP tetikler.',
    },
    bottleFit: {
      en: 'Heavy-duty chemical bottles · 28/400, 28/410, 28/415',
      es: 'Envases químicos · 28/400, 28/410, 28/415',
      pt: 'Frascos químicos reforçados · 28/400, 28/410, 28/415',
      ar: 'عبوات كيماويات ثقيلة · 28/400 و 28/410 و 28/415',
      tr: 'Ağır hizmet kimyasal şişeler · 28/400, 28/410, 28/415',
    },
  },
];
