import type { LangCode } from '../i18n/translations';

export interface SprayerPartOption {
  code: string;
  image: string;
  neckFinish?: string;
  label: Record<LangCode, string>;
}

export const NOZZLE_OPTIONS: SprayerPartOption[] = [
  {
    code: 'N1',
    image: '/assets/aistudio/32fdbaf5fe63d19e6ec57afae722eec0_1710c8a0.png',
    label: {
      en: 'Spray / Spray',
      es: 'Spray / Spray',
      pt: 'Spray / Spray',
      ar: 'رذاذ / رذاذ',
      tr: 'Sis / Sis',
    },
  },
  {
    code: 'N2',
    image: '/assets/aistudio/02f0e16514e144175d2c9fad12338e22_c6f88267.png',
    label: {
      en: 'Plastic Mesh / Foam',
      es: 'Malla Plástica / Espuma',
      pt: 'Tela Plástica / Espuma',
      ar: 'شبكة بلاستيكية / رغوة',
      tr: 'Plastik Elek / Köpük',
    },
  },
  {
    code: 'N3',
    image: '/assets/aistudio/5fbd9b2df579f86f5946b77a38e704d7_7b91cedd.png',
    label: {
      en: 'Spray / Stream',
      es: 'Spray / Chorro',
      pt: 'Spray / Jato',
      ar: 'رذاذ / خط مباشر',
      tr: 'Sis / Jet',
    },
  },
  {
    code: 'N4',
    image: '/assets/aistudio/06aca746a64415f8a7b3310d083fa82a_19f180d8.png',
    label: {
      en: 'Plastic Foam',
      es: 'Espuma Plástica',
      pt: 'Espuma Plástica',
      ar: 'رغوة بلاستيكية',
      tr: 'Plastik Köpük',
    },
  },
  {
    code: 'N5',
    image: '/assets/aistudio/301dd7087b4e8a051e14c049648af761_f74db365.png',
    label: {
      en: 'Spray / Stream',
      es: 'Spray / Chorro',
      pt: 'Spray / Jato',
      ar: 'رذاذ / خط مباشر',
      tr: 'Sis / Jet',
    },
  },
  {
    code: 'N6',
    image: '/assets/aistudio/8309639751db9b14ce6a039bcf660273_88fcf942.png',
    label: {
      en: 'Foam / Spray',
      es: 'Espuma / Spray',
      pt: 'Espuma / Spray',
      ar: 'رغوة / رذاذ',
      tr: 'Köpük / Sis',
    },
  },
];

export const TRIGGER_OPTIONS: SprayerPartOption[] = [
  {
    code: 'T1',
    image: '/assets/aistudio/6b05426fb16c939d027c9ba867a46071_f576e1e2.png',
    label: {
      en: 'Normal Trigger',
      es: 'Gatillo Normal',
      pt: 'Gatilho Normal',
      ar: 'زناد قياسي',
      tr: 'Standart Tetik',
    },
  },
  {
    code: 'T2',
    image: '/assets/aistudio/a1895c6444074484aea5eafe36747711_c34a3e7a.png',
    label: {
      en: 'Two Finger Trigger',
      es: 'Gatillo Dos Dedos',
      pt: 'Gatilho Dois Dedos',
      ar: 'زناد بإصبعين',
      tr: 'İki Parmak Tetik',
    },
  },
  {
    code: 'T3',
    image: '/assets/aistudio/95a0faebc4319b52944107446d058552_02790c6f.png',
    label: {
      en: 'Big Trigger',
      es: 'Gatillo Grande',
      pt: 'Gatilho Grande',
      ar: 'زناد كبير',
      tr: 'Büyük Tetik',
    },
  },
  {
    code: 'T4',
    image: '/assets/aistudio/7a4d7104313882d3adb15c82215d07a2_219d2f28.png',
    label: {
      en: 'New Two Finger Trigger',
      es: 'Nuevo Gatillo Dos Dedos',
      pt: 'Novo Gatilho Dois Dedos',
      ar: 'زناد جديد بإصبعين',
      tr: 'Yeni İki Parmak Tetik',
    },
  },
  {
    code: 'T5',
    image: '/assets/aistudio/0d8d6d5a88e2eab8c13d3ebbb58be363_df43b6d1.png',
    label: {
      en: 'Frosted Trigger',
      es: 'Gatillo Esmerilado',
      pt: 'Gatilho Fosco',
      ar: 'زناد مطفي',
      tr: 'Mat / Buzlu Tetik',
    },
  },
  {
    code: 'T6',
    image: '/assets/aistudio/3be4d7d9f4cd60856b9398a93b1d835e_a301fa98.png',
    label: {
      en: 'Three Finger Trigger',
      es: 'Gatillo Tres Dedos',
      pt: 'Gatilho Três Dedos',
      ar: 'زناد بثلاثة أصابع',
      tr: 'Üç Parmak Tetik',
    },
  },
];

export const CLOSURE_OPTIONS: SprayerPartOption[] = [
  {
    code: 'C1',
    image: '/assets/aistudio/938d3ddd8a4812f6b029005d8fb76373_acfca6c6.png',
    neckFinish: '28/415',
    label: {
      en: '28/415',
      es: '28/415',
      pt: '28/415',
      ar: '28/415',
      tr: '28/415',
    },
  },
  {
    code: 'C2',
    image: '/assets/aistudio/895040ec2cae6628dc094d401e0e7121_d2d4f750.png',
    neckFinish: '28/410',
    label: {
      en: '28/410',
      es: '28/410',
      pt: '28/410',
      ar: '28/410',
      tr: '28/410',
    },
  },
  {
    code: 'C3',
    image: '/assets/aistudio/def4fce3fbcc762f7b77088cb5a2393d_dd857109.png',
    neckFinish: '28/410',
    label: {
      en: '28/410 Ratchet',
      es: '28/410 Trinquete',
      pt: '28/410 Catraca',
      ar: '28/410 بقفل مسنن',
      tr: '28/410 Cırcırlı',
    },
  },
  {
    code: 'C4',
    image: '/assets/aistudio/8599be23989770a0ea046942c1140929_aa281c75.png',
    neckFinish: '28/400',
    label: {
      en: '28/400',
      es: '28/400',
      pt: '28/400',
      ar: '28/400',
      tr: '28/400',
    },
  },
  {
    code: 'C5',
    image: '/assets/aistudio/e2ddd9bd3f8222bfb712e5389d157b79_024c0b46.png',
    neckFinish: '28/400',
    label: {
      en: '28/400',
      es: '28/400',
      pt: '28/400',
      ar: '28/400',
      tr: '28/400',
    },
  },
];

export const TRIGGER_SERIES_SPECS = [
  {
    range: 'TS001 – TS004',
    type: 'Standard & Foam Trigger Sprayers',
    neck: '28/400 · 28/410 · 28/415',
    material: 'PP',
    nozzle: 'Spray / Stream · Foam / Spray',
    dosage: '0.9 – 1.0 cc',
  },
  {
    range: 'TS005 – TS014',
    type: 'All-Plastic & Heavy Duty Trigger Sprayers',
    neck: '28/400 · 28/410 · 28/415',
    material: 'PP',
    nozzle: 'Stream / Spray · Foam (TS007)',
    dosage: '0.8 – 0.9 ml/T',
  },
  {
    range: 'TS015 – TS021',
    type: 'Chemical & Agriculture Resistant / Kao Gun',
    neck: '28/400 · 28/410 · 28/415',
    material: 'PP',
    nozzle: 'Stream / Spray',
    dosage: '0.10 – 0.12 ml/T',
  },
];
