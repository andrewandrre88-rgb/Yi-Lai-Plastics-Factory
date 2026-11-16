import { ArrowLeft, ArrowRight, FileText, Mail, MessageSquare } from 'lucide-react';
import { LANG_LABELS, type LangCode } from '../i18n/translations';

interface FactoryPageProps {
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigateHomeSection: (sectionId?: string) => void;
  t: (key: string) => string;
}

const CATALOG_PDF_URL = '/assets/aistudio/Yi_Lai_Plastics_Industry_Factory_CATALOG_b3ed4e35.pdf';
const FACTORY_EMAIL = 'yilaiplastics@gmail.com';
const FACTORY_PHONE = '+86 137 5705 0848';
const FACTORY_WHATSAPP_URL = 'https://wa.me/8613757050848';

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

export function FactoryPage({
  lang,
  onChangeLang,
  onNavigateHomeSection,
  t,
}: FactoryPageProps) {
  const credentials = [
    { ref: 'REF 2.1', value: '15', label: t('stat.years') },
    { ref: 'REF 2.2', value: '200', label: t('stat.employees') },
    { ref: 'REF 2.3', value: '65', label: t('stat.machines') },
    { ref: 'REF 2.4', value: '13', label: t('stat.lines') },
  ];

  const stages = [
    { title: t('step1.title'), desc: t('step1.p') },
    { title: t('step2.title'), desc: t('step2.p') },
    { title: t('step3.title'), desc: t('step3.p') },
    { title: t('step4.title'), desc: t('step4.p') },
  ];

  return (
    <div className="bg-[var(--bg)]">
      {/* Top Blueprint Header Band */}
      <section className="grid-blueprint hero-radial-fade relative border-b border-[var(--line)] py-8 sm:py-12">
        <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-[var(--line)]">
            <button
              type="button"
              onClick={() => onNavigateHomeSection()}
              className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.06em] text-[var(--blue)] hover:text-[var(--red)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
              <span>{t('factoryPage.backHome')}</span>
            </button>

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
                  onClick={() => onChangeLang(item.code)}
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

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.06em] text-[var(--muted)] mb-4"
          >
            <button
              type="button"
              onClick={() => onNavigateHomeSection()}
              className="hover:text-[var(--blue)] cursor-pointer"
            >
              {t('blog.breadcrumbHome')}
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--blue)]">{t('nav.factory')}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
            <div>
              <div className="font-mono-spec text-xs uppercase tracking-[0.12em] text-[var(--red)] mb-2">
                {t('factoryPage.kicker')}
              </div>
              <h1 className="font-display font-black uppercase text-5xl sm:text-6xl leading-[0.92] tracking-tight text-[var(--ink)] mb-4">
                {t('factory.title')}
              </h1>
              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed mb-7">
                {t('factory.lead')}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateHomeSection('quote')}
                  className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-sm sm:text-base px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
                >
                  <span>{t('hero.cta1')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                </button>

                <a
                  href={CATALOG_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-transparent text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)] font-semibold text-sm sm:text-base px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>{t('hero.cta2')}</span>
                </a>
              </div>
            </div>

            <figure className="border border-[var(--line)] rounded-[4px] overflow-hidden bg-[var(--surface)]">
              <img
                src="/images/factory-building.jpg"
                alt={t('factory.caption')}
                referrerPolicy="no-referrer"
                className="w-full max-h-[340px] object-cover"
              />
              <figcaption className="px-4 py-3 border-t border-[var(--line)] bg-[var(--surface)] font-mono-spec text-[11px] text-[var(--muted)]">
                {t('factory.caption')}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Inverted Ink Metrics Band */}
      <section className="bg-[var(--ink)] text-[var(--bg)] py-16">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-[color-mix(in_srgb,var(--bg)_25%,var(--ink))] mb-12">
            {credentials.map((item, idx) => (
              <div
                key={item.ref}
                className={`pt-6 pb-4 px-4 border-[color-mix(in_srgb,var(--bg)_25%,var(--ink))] ${
                  idx < 2 ? 'border-b lg:border-b-0' : ''
                } ${idx % 2 === 0 ? 'border-r' : ''} ${
                  idx === 1 ? 'lg:border-r' : ''
                } ${idx === 0 ? 'pl-0' : ''}`}
              >
                <div
                  className="font-mono-spec text-[10px] tracking-[0.12em] text-[color-mix(in_srgb,var(--bg)_65%,var(--ink))] mb-2"
                  dir="ltr"
                >
                  {item.ref}
                </div>
                <div
                  className="font-display font-black text-5xl sm:text-7xl leading-[0.85] tabular-nums"
                  dir="ltr"
                >
                  {item.value}
                  <i className="not-italic text-[var(--red)]">+</i>
                </div>
                <div className="font-mono-spec text-xs uppercase tracking-[0.06em] text-[color-mix(in_srgb,var(--bg)_72%,var(--ink))] mt-3">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
            <div className="bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-[4px] p-6 sm:p-8 space-y-4 text-base sm:text-lg leading-relaxed">
              <p>{t('factory.p1')}</p>
              <p className="text-[var(--muted)]">{t('factory.p2')}</p>
              <div className="pt-4 border-t border-[var(--line)] flex flex-wrap gap-3">
                <a
                  href={`mailto:${FACTORY_EMAIL}`}
                  dir="ltr"
                  className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-wider text-[var(--blue)] hover:text-[var(--red)] border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2 rounded-[4px] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{FACTORY_EMAIL}</span>
                </a>
                <a
                  href={FACTORY_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-wider text-[var(--blue)] hover:text-[var(--red)] border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2 rounded-[4px] transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{FACTORY_PHONE}</span>
                </a>
              </div>
            </div>

            {/* Facility Verification Sheet */}
            <div className="bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-[4px] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--line)] bg-[var(--blue)] text-[var(--btn-ink)]">
                <div className="font-mono-spec text-[11px] uppercase tracking-[0.1em]">
                  {t('factoryPage.specsTitle')}
                </div>
              </div>
              <dl className="divide-y divide-[var(--line)] text-sm">
                <div className="px-5 py-3.5 flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('factoryPage.legalLabel')}
                  </dt>
                  <dd className="font-medium text-[var(--ink)] text-right rtl:text-left" dir="ltr">
                    {t('foot.legal')}
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('factoryPage.locationLabel')}
                  </dt>
                  <dd className="text-[var(--ink)] text-right rtl:text-left">
                    {t('foot.addr')}
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('factoryPage.portLabel')}
                  </dt>
                  <dd className="text-[var(--ink)] text-right rtl:text-left">
                    {t('factoryPage.portValue')}
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('factoryPage.marketsLabel')}
                  </dt>
                  <dd className="text-[var(--ink)] text-right rtl:text-left">
                    {t('factoryPage.marketsValue')}
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('factoryPage.materialsLabel')}
                  </dt>
                  <dd className="text-[var(--ink)] text-right rtl:text-left">
                    {t('factoryPage.materialsValue')}
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('foot.street')}
                  </dt>
                  <dd>
                    <ToConfirmTag />
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('factory.certLabel')}
                  </dt>
                  <dd>
                    <ToConfirmTag />
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('inq.sampleNote')}
                  </dt>
                  <dd>
                    <ToConfirmTag />
                  </dd>
                </div>
                <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <dt className="font-mono-spec text-xs uppercase text-[var(--muted)]">
                    {t('factory.workshopNote')}
                  </dt>
                  <dd>
                    <ToConfirmTag />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* In-House Production Workflow */}
      <section className="bg-[var(--bg)] border-b border-[var(--line)] py-16">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <div className="font-mono-spec text-[11px] uppercase tracking-[0.14em] text-[var(--blue)] mb-2">
              {t('process.kicker')}
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-[var(--ink)] mb-2">
              {t('factoryPage.processTitle')}
            </h2>
            <p className="text-base text-[var(--muted)] max-w-2xl">
              {t('factoryPage.processLead')}
            </p>
          </div>

          <ol className="yl-steps grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 m-0 p-0">
            {stages.map((stage) => (
              <li key={stage.title} className="pt-6 lg:pr-6">
                <h3 className="font-display font-bold uppercase text-3xl text-[var(--ink)] mb-2">
                  {stage.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{stage.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigateHomeSection('products')}
              className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-wider text-[var(--blue)] hover:text-[var(--red)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
              <span>{t('ts.backProducts')}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateHomeSection('quote')}
              className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-sm sm:text-base px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
            >
              <span>{t('nav.quote')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
