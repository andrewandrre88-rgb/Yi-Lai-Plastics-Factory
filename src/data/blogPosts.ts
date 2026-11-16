import type { LangCode } from '../i18n/translations';

export interface BlogPostContent {
  category: string;
  title: string;
  summary: string;
  paragraphs: string[];
  specTakeaway: string;
}

export interface BlogPost {
  id: string;
  index: string;
  refCode: string;
  relatedProduct: string;
  image?: string;
  content: Record<LangCode, BlogPostContent>;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'neck-finish-guide',
    index: '01',
    refCode: 'NOTE 05.1',
    relatedProduct: 'Lotion pump (LPS001-LPS012)',
    image: '/images/prod-lotion-lps002.jpg',
    content: {
      en: {
        category: 'Neck Standards',
        title: 'How to Match Neck Finishes (20/410 to 45/410) to Your Bottle',
        summary:
          'Understanding the two-number neck code, collar styles, and what specs to send our engineering team before sampling.',
        specTakeaway: 'Standard finishes: 20/410 · 24/410 · 28/400 · 28/410 · 28/415 · 33/410 · 40/410 · 45/410',
        paragraphs: [
          'Every closure specification starts with two numbers separated by a slash, such as 28/410 or 24/410. The first number indicates the outer diameter of the bottle neck threads in millimetres, while the second number identifies the thread turn height and style (for example, 400 indicates a shallow single-turn thread, 410 indicates roughly 1.5 turns, and 415 indicates a taller neck profile).',
          'In our 2026 production range, standard and mini trigger sprayers (TS001–TS021, MTS001–MTS005) fit 28/400, 28/410, and 28/415 bottles. Fine mist sprayers and foundation pumps cover 20/410, 24/410, and 28/410 necks, lotion pumps span 24/410 through 33/400, and foam pumps are built for wider 33/410, 40/410, and 45/410 bottles.',
          'Before ordering production tooling or bulk quantities, send a neck drawing or sample bottle to yilaiplastics@gmail.com. Pairing the right thread pitch with smooth, ribbed, ratchet, or aluminum collars prevents cross-threading on high-speed filling lines.',
        ],
      },
      es: {
        category: 'Estándares de Cuello',
        title: 'Cómo elegir el tamaño de cuello correcto (20/410 a 45/410)',
        summary:
          'Qué significan los dos números del cuello roscado, tipos de collarín y qué medidas enviar antes de solicitar muestras.',
        specTakeaway: 'Medidas estándar: 20/410 · 24/410 · 28/400 · 28/410 · 28/415 · 33/410 · 40/410 · 45/410',
        paragraphs: [
          'Cada especificación de cierre comienza con dos números separados por una barra, como 28/410 o 24/410. El primer número indica el diámetro exterior de la rosca en milímetros y el segundo define la altura y vueltas de la rosca (400 es perfil bajo, 410 es medio y 415 es cuello alto).',
          'En nuestro catálogo 2026, los pulverizadores de gatillo (TS001–TS021 y MTS001–MTS005) cubren 28/400, 28/410 y 28/415. Los atomizadores de niebla fina cubren 20/410, 24/410 y 28/410; las bombas de loción van de 24/410 a 33/400; y las bombas de espuma se fabrican para cuellos anchos de 33/410, 40/410 y 45/410.',
          'Antes de confirmar un pedido, envíenos el plano del cuello o una muestra de su envase para verificar el ajuste hermético en línea de llenado.',
        ],
      },
      pt: {
        category: 'Padrões de Rosca',
        title: 'Como combinar o padrão de rosca (20/410 a 45/410) ao seu frasco',
        summary:
          'Entenda os dois números da rosca, os acabamentos de colar e quais medidas enviar à nossa equipe antes da produção.',
        specTakeaway: 'Medidas padrão: 20/410 · 24/410 · 28/400 · 28/410 · 28/415 · 33/410 · 40/410 · 45/410',
        paragraphs: [
          'Toda especificação de fechamento usa dois números separados por barra, como 28/410 ou 24/410. O primeiro número representa o diâmetro externo da rosca em milímetros, e o segundo indica a altura e o passo da rosca (400 perfil baixo, 410 padrão médio e 415 gargalo alto).',
          'Na linha 2026, os pulverizadores gatilho (TS001–TS021 e MTS001–MTS005) atendem roscas 28/400, 28/410 e 28/415. Válvulas névoa fina e para base atendem 20/410, 24/410 e 28/410; bombas de loção cobrem de 24/410 a 33/400; e bombas espumadoras operam em 33/410, 40/410 e 45/410.',
          'Envie o desenho técnico do gargalo ou foto do frasco antes do pedido para confirmarmos o encaixe perfeito com colar liso, frisado ou metálico.',
        ],
      },
      ar: {
        category: 'مقاسات العنق',
        title: 'كيفية مطابقة مقاسات العنق (20/410 إلى 45/410) مع عبوتكم',
        summary:
          'فهم أرقام مقاس العنق اللولبي، وأنواع الأطواق، والمواصفات المطلوب إرسالها لفريقنا قبل اعتماد العينات.',
        specTakeaway: 'المقاسات القياسية: 20/410 · 24/410 · 28/400 · 28/410 · 28/415 · 33/410 · 40/410 · 45/410',
        paragraphs: [
          'تبدأ كل مواصفة غطاء برقمين مثل 28/410 أو 24/410. يشير الرقم الأول إلى القطر الخارجي لعنق العبوة بالمليمتر، بينما يحدد الرقم الثاني ارتفاع اللولب وعدد الدورات (400 لولب منخفض، 410 قياسي متوسط، و415 عنق مرتفع).',
          'في كتالوج 2026، تناسب بخاخات الزناد (TS001–TS021 و MTS001–MTS005) مقاسات 28/400 و 28/410 و 28/415. بينما تغطي بخاخات الرذاذ الناعم ومضخات الأساس مقاسات 20/410 و 24/410 و 28/410، ومضخات اللوشن من 24/410 حتى 33/400، ومضخات الرغوة 33/410 و 40/410 و 45/410.',
          'قبل بدء الإنتاج الكمي، أرسلوا رسم عنق العبوة إلى بريدنا الإلكتروني لتأكيد الإغلاق المحكم على خطوط التعبئة.',
        ],
      },
      tr: {
        category: 'Boyun Standartları',
        title: 'Şişeniz İçin Doğru Boyun Ölçüsü Nasıl Seçilir (20/410 - 45/410)',
        summary:
          'İki rakamlı boyun kodunun anlamı, yaka tipleri ve numune öncesi mühendislik ekibimize göndermeniz gereken ölçüler.',
        specTakeaway: 'Standart ölçüler: 20/410 · 24/410 · 28/400 · 28/410 · 28/415 · 33/410 · 40/410 · 45/410',
        paragraphs: [
          'Her kapak ve pompa spesifikasyonu 28/410 veya 24/410 gibi eğik çizgiyle ayrılan iki sayı ile başlar. İlk sayı şişe boynu dış diş çapını milimetre cinsinden ifade ederken, ikinci sayı diş tur sayısını ve boyun yüksekliğini tanımlar (örneğin 400 alçak tek tur, 410 yaklaşık 1,5 tur ve 415 yüksek boyun profilidir).',
          '2026 üretim serimizde standart ve mini tetikli spreyler (TS001–TS021, MTS001–MTS005) 28/400, 28/410 ve 28/415 şişelere uyar. İnce sis spreyleri ve fondöten pompaları 20/410, 24/410 ve 28/410 boyunları kapsar; losyon pompaları 24/410 ile 33/400 arasında çalışır; köpük pompaları ise geniş 33/410, 40/410 ve 45/410 şişeler için üretilir.',
          'Seri üretim öncesi uyumu doğrulamak için boyun teknik çiziminizi veya numune şişenizi yilaiplastics@gmail.com adresine gönderin. Doğru diş adımını düz, tırtıklı, cırcırlı veya alüminyum yakalarla eşleştirmek hızlı dolum hatlarında sızıntıyı önler.',
        ],
      },
    },
  },
  {
    id: 'trigger-vs-fine-mist',
    index: '02',
    refCode: 'NOTE 05.2',
    relatedProduct: 'Trigger sprayer (TS001-TS021)',
    image: '/images/prod-trigger-ts001.jpg',
    content: {
      en: {
        category: 'Dispensing Specs',
        title: 'Trigger Sprayers vs. Fine Mist: Choosing Dosage & Nozzle Output',
        summary:
          'Comparing high-output trigger heads (0.8–1.0 ml/T) with compact fine mist atomizers (0.15–0.25 ml/stroke) for your formula.',
        specTakeaway: 'Trigger TS001–TS014: 0.8–1.0 ml/T · TS015–TS021: 0.10–0.12 ml/T · Fine Mist: 0.15–0.25 ml',
        paragraphs: [
          'Selecting between a trigger sprayer and a finger-press fine mist sprayer comes down to liquid volume per application, bottle size, and chemical compatibility. Standard household triggers such as TS001–TS014 deliver 0.8 to 1.0 ml per stroke and include rotating nozzles for Spray, Stream, Foam, or Off positions.',
          'For aggressive degreasers, workshop fluids, or agricultural solutions, chemical-resistant PP models (TS015–TS021) offer controlled 0.10–0.12 ml/T dosing with ergonomic grips. For travel sizes and lighter surface sprays, mini triggers (MTS001–MTS005) step output down to 0.15–0.25 ml.',
          'Cosmetic toners, perfumes, hair sprays, and alcohol sanitizers typically require fine mist sprayers (FMS001–FMS012), which atomize 0.15–0.25 ml per press into an even droplet cloud with optional clear or aluminum overcaps.',
        ],
      },
      es: {
        category: 'Dosificación',
        title: 'Pulverizadores de gatillo vs. niebla fina: dosis y boquilla',
        summary:
          'Comparativa entre cabezales de gatillo (0.8–1.0 ml/T) y atomizadores de niebla fina (0.15–0.25 ml) según su fórmula.',
        specTakeaway: 'Gatillo TS001–TS014: 0.8–1.0 ml/T · TS015–TS021: 0.10–0.12 ml/T · Niebla fina: 0.15–0.25 ml',
        paragraphs: [
          'Elegir entre un pulverizador de gatillo y un atomizador de dedo depende del volumen por aplicación, el tamaño de la botella y la resistencia química. Los modelos estándar TS001–TS014 entregan de 0.8 a 1.0 ml por pulsación con boquilla ajustable Spray, Chorro, Espuma u Off.',
          'Para desengrasantes o productos agrícolas más exigentes, la serie resistente a químicos (TS015–TS021) ofrece una dosis precisa de 0.10–0.12 ml/T. Para envases compactos, los mini gatillos MTS001–MTS005 dosifican 0.15–0.25 ml.',
          'En tónicos faciales, perfumes y sprays sanitizantes, los atomizadores de niebla fina (FMS001–FMS012) atomizan 0.15–0.25 ml en una nube uniforme sin goteos.',
        ],
      },
      pt: {
        category: 'Dosagem',
        title: 'Gatilho vs. Névoa Fina: escolhendo a vazão e o bico corretos',
        summary:
          'Compare gatilhos de limpeza (0.8–1.0 ml/T) com válvulas spray névoa fina (0.15–0.25 ml) para sua linha.',
        specTakeaway: 'Gatilho TS001–TS014: 0.8–1.0 ml/T · TS015–TS021: 0.10–0.12 ml/T · Névoa fina: 0.15–0.25 ml',
        paragraphs: [
          'A escolha entre pulverizador gatilho e válvula névoa fina depende da dosagem por acionamento e da fórmula. Os gatilhos padrão TS001–TS014 liberam de 0.8 a 1.0 ml por pulso e contam com bico ajustável para Névoa, Jato, Espuma ou Fechado.',
          'Para desengraxantes e uso agrícola, os modelos resistentes a químicos (TS015–TS021) trabalham com dosagem controlada de 0.10–0.12 ml/T. Já os mini gatilhos (MTS001–MTS005) entregam 0.15–0.25 ml em frascos compactos.',
          'Tônicos, perfumes, sprays capilares e higienizadores utilizam válvulas de névoa fina (FMS001–FMS012) com 0.15–0.25 ml por toque e opções de sobretampa plástica ou alumínio.',
        ],
      },
      ar: {
        category: 'مواصفات الضخ',
        title: 'بخاخات الزناد مقابل الرذاذ الناعم: اختيار الجرعة والفوهة المناسبة',
        summary:
          'مقارنة بين رؤوس الزناد القياسية (0.8–1.0 مل) وبخاخات الرذاذ الناعم التجميلية (0.15–0.25 مل).',
        specTakeaway: 'الزناد TS001–TS014: 0.8–1.0 مل · المقاوم للكيماويات TS015–TS021: 0.10–0.12 مل · الرذاذ الناعم: 0.15–0.25 مل',
        paragraphs: [
          'يعتمد الاختيار بين بخاخ الزناد وبخاخ الرذاذ الناعم على كمية السائل المطلوبة في كل ضغطة ونوع التركيبة الكيميائية. توفر موديلات الزناد القياسية (TS001–TS014) جرعة 0.8 إلى 1.0 مل مع فوهة دوارة لوضع الرش أو الخط المباشر أو الرغوة أو الإغلاق.',
          'للمنظفات الصناعية والمحاليل الزراعية، توفر الموديلات المقاومة للكيماويات (TS015–TS021) ضخاً دقيقاً بمقدار 0.10–0.12 مل، بينما توفر بخاخات الزناد الصغيرة (MTS001–MTS005) 0.15–0.25 مل للعبوات الصغيرة.',
          'أما منتجات التجميل والعطور والتونر ومعقمات الكحول فتستخدم عادة بخاخات الرذاذ الناعم (FMS001–FMS012) لتوزيع رذاذ خفيف ومتساوٍ بمقدار 0.15–0.25 مل.',
        ],
      },
      tr: {
        category: 'Dozaj Özellikleri',
        title: 'Tetikli Sprey mi İnce Sis mi: Dozaj ve Nozul Seçimi',
        summary:
          'Formülünüz için yüksek çıkışlı tetikli başlıklar (0.8–1.0 ml/T) ile kompakt ince sis atomizörlerinin (0.15–0.25 ml) karşılaştırması.',
        specTakeaway: 'Tetik TS001–TS014: 0.8–1.0 ml/T · TS015–TS021: 0.10–0.12 ml/T · İnce Sis: 0.15–0.25 ml',
        paragraphs: [
          'Tetikli sprey ile parmak basmalı ince sis spreyi arasındaki seçim; basım başına sıvı hacmine, şişe boyutuna ve kimyasal uyuma bağlıdır. TS001–TS014 gibi standart ev tipi tetikler her basımda 0.8–1.0 ml çıkış verir ve Sis, Jet, Köpük veya Kapalı konumları için döner nozul içerir.',
          'Ağır yağ çözücüler, atölye kimyasalları veya tarım çözümleri için kimyasala dayanıklı PP modeller (TS015–TS021) 0.10–0.12 ml/T kontrollü dozaj sunar. Seyahat boyları ve hafif yüzey spreylerinde mini tetikler (MTS001–MTS005) çıkışı 0.15–0.25 ml seviyesine indirir.',
          'Kozmetik tonikler, parfümler, saç spreyleri ve alkol bazlı dezenfektanlar ise her basımda 0.15–0.25 ml sıvıyı homojen bir sis bulutu halinde dağıtan ince sis spreylerini (FMS001–FMS012) gerektirir.',
        ],
      },
    },
  },
  {
    id: 'export-locking-and-diptube',
    index: '03',
    refCode: 'NOTE 05.3',
    relatedProduct: 'Foam pump (FP001-FP009)',
    image: '/images/prod-foam-fp009.jpg',
    content: {
      en: {
        category: 'Export Packaging',
        title: 'Lock Mechanisms & Dip Tube Cutting for Long-Distance Shipping',
        summary:
          'How Clip-Lock, Screw-Lock, Switch Lock heads and precision-cut dip tubes protect filled bottles during sea freight.',
        specTakeaway: 'Locks: Clip-Lock · Screw-Lock · Switch Lock (STOP/OPEN) · Custom straight or angled dip tube',
        paragraphs: [
          'For B2B brands shipping filled bottles across sea or road freight to the Middle East and South America, pump heads need reliable mechanical locking. Our lotion pumps (LPS001–LPS012) and foam pumps (FP001–FP009) are available with Clip-Lock rings, Screw-Lock stems, or twist Switch Lock (STOP/OPEN) heads.',
          'A twist Switch Lock lets the end user lock and unlock the pump repeatedly during travel without loose plastic clips, while a removable Clip-Lock keeps the actuator flush and lower in height for compact retail cartons.',
          'Alongside the lock style, specifying exact bottle height allows our automatic assembly lines to cut dip tubes to your container depth—straight cut for flat bases or angled cut so curved bottles reach the bottom corner without suction blockages.',
        ],
      },
      es: {
        category: 'Embalaje de Exportación',
        title: 'Sistemas de bloqueo y corte de tubo para envíos de exportación',
        summary:
          'Cómo elegir entre Clip-Lock, Screw-Lock o Switch Lock y el largo exacto del tubo de succión para evitar fugas en tránsito.',
        specTakeaway: 'Bloqueos: Clip-Lock · Screw-Lock · Switch Lock (STOP/OPEN) · Tubo recto o en bisel',
        paragraphs: [
          'Cuando las marcas transportan botellas ya llenas por vía marítima o terrestre, el cabezal de la bomba necesita un bloqueo mecánico seguro. Nuestras bombas de loción (LPS001–LPS012) y espuma (FP001–FP009) ofrecen tres sistemas: Clip-Lock, Screw-Lock y cabezal giratorio Switch Lock (STOP/OPEN).',
          'El cabezal Switch Lock permite abrir y cerrar la bomba repetidamente durante el viaje sin piezas sueltas, mientras que el Clip-Lock reduce la altura total en cajas de transporte.',
          'Al enviar la altura de su botella, cortamos el tubo de succión a medida, con extremo recto o en bisel para aprovechar el producto hasta el fondo.',
        ],
      },
      pt: {
        category: 'Logística e Exportação',
        title: 'Travas de segurança e corte do pescante para transporte',
        summary:
          'Diferenças entre Clip-Lock, Screw-Lock e Switch Lock, além do corte sob medida do tubo pescante para evitar vazamentos.',
        specTakeaway: 'Travas: Clip-Lock · Screw-Lock · Switch Lock (STOP/OPEN) · Pescante reto ou chanfrado',
        paragraphs: [
          'Para marcas que exportam frascos já envasados, o travamento da válvula durante o transporte é essencial. Nossas bombas de loção (LPS001–LPS012) e espuma (FP001–FP009) estão disponíveis com trava Clip-Lock, Rosca (Screw-Lock) ou giro Switch Lock (STOP/OPEN).',
          'A trava Switch Lock permite ao consumidor travar e destravar a bomba continuamente sem precisar de anel externo, enquanto o anel Clip-Lock mantém o perfil baixo na embalagem.',
          'Informando a altura interna do seu frasco, nossas linhas cortam o tubo pescante exatamente na medida necessária, com ponta reta ou chanfrada para alcançar até a última gota.',
        ],
      },
      ar: {
        category: 'تجهيز التصدير',
        title: 'أنظمة القفل وقص أنبوب الشفط لحماية العبوات أثناء الشحن',
        summary:
          'الفرق بين أقفال Clip-Lock و Screw-Lock و Switch Lock وأهمية قص أنبوب الشفط بدقة لمنع التسرب.',
        specTakeaway: 'الأقفال: Clip-Lock · Screw-Lock · Switch Lock (STOP/OPEN) · قص مستقيم أو مائل للأنبوب',
        paragraphs: [
          'عند شحن العبوات المعبأة بحراً أو براً إلى أسواق الشرق الأوسط وأمريكا الجنوبية، تحتاج رؤوس المضخات إلى قفل محكم. تتوفر مضخات اللوشن (LPS001–LPS012) ومضخات الرغوة (FP001–FP009) بثلاثة خيارات: حلقة Clip-Lock، أو قفل لولبي Screw-Lock، أو قفل دوار Switch Lock (STOP/OPEN).',
          'يتيح نظام Switch Lock للمستخدم فتح المضخة وإغلاقها بشكل متكرر أثناء السفر دون قطع منفصلة، بينما يحافظ Clip-Lock على ارتفاع منخفض للمضخة داخل كراتين الشحن.',
          'كما تقوم خطوط التجميع الآلي لدينا بقص أنبوب الشفط وفق ارتفاع عبوتكم بالضبط، بطرف مستقيم أو مائل للوصول إلى آخر قطرة.',
        ],
      },
      tr: {
        category: 'İhracat Ambalajı',
        title: 'Uzun Mesafe Sevkiyatlarda Kilit Sistemleri ve Daldırma Borusu Kesimi',
        summary:
          'Clip-Lock, Screw-Lock, Switch Lock başlıkları ve hassas daldırma borusu kesiminin dolum sonrası deniz taşımacılığında ürünleri nasıl koruduğu.',
        specTakeaway: 'Kilitler: Clip-Lock · Screw-Lock · Switch Lock (STOP/OPEN) · Düz veya açılı daldırma borusu',
        paragraphs: [
          'Orta Doğu ve Güney Amerika pazarlarına dolu şişe sevk eden markalar için pompa başlıklarında güvenilir mekanik kilitleme gerekir. Losyon pompalarımız (LPS001–LPS012) ve köpük pompalarımız (FP001–FP009); Clip-Lock halkası, vidalı Screw-Lock veya çevirmeli Switch Lock (STOP/OPEN) seçenekleriyle üretilir.',
          'Çevirmeli Switch Lock, tüketicinin seyahat sırasında harici plastik klipse ihtiyaç duymadan pompayı tekrar tekrar kilitlemesini sağlarken, çıkarılabilir Clip-Lock ise perakende kolilerinde başlık yüksekliğini alçak tutar.',
          'Kilit tipinin yanı sıra tam şişe yüksekliğinin paylaşılması, otomatik montaj hatlarımızın daldırma borusunu kabın derinliğine göre düz veya kavisli tabanlarda son damlaya ulaşacak şekilde açılı kesmesine olanak tanır.',
        ],
      },
    },
  },
];
