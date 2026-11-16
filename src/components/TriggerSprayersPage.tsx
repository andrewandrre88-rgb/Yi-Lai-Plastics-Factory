import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { TRIGGER_SERIES_SPECS } from '../data/triggerOptions';
import { LANG_LABELS, type LangCode } from '../i18n/translations';
import { SprayerConfiguratorSection } from './SprayerConfiguratorSection';

interface TriggerSprayersPageProps {
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigateHomeSection: (sectionId?: string) => void;
  onQuoteConfigured: (payload: {
    product: string;
    neck: string;
    colour: string;
    message: string;
  }) => void;
  t: (key: string) => string;
}

export function TriggerSprayersPage({
  lang,
  onChangeLang,
  onNavigateHomeSection,
  onQuoteConfigured,
  t,
}: TriggerSprayersPageProps) {
  return (
    <div className="bg-[var(--bg)]">
      {/* Top Hero / Blueprint Header */}
      <section className="grid-blueprint hero-radial-fade relative border-b border-[var(--line)] py-8 sm:py-12">
        <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-[var(--line)]">
            <button
              type="button"
              onClick={() => onNavigateHomeSection('products')}
              className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.06em] text-[var(--blue)] hover:text-[var(--red)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
              <span>{t('ts.backProducts')}</span>
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
            <button
              type="button"
              onClick={() => onNavigateHomeSection('products')}
              className="hover:text-[var(--blue)] cursor-pointer"
            >
              {t('nav.products')}
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--blue)]">{t('p1.title')}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-center">
            <div>
              <div className="font-mono-spec text-xs uppercase tracking-[0.12em] text-[var(--red)] mb-2">
                {t('ts.seriesTag')}
              </div>
              <h1 className="font-display font-black uppercase text-4xl sm:text-5xl lg:text-6xl leading-[0.94] tracking-tight text-[var(--ink)] mb-4">
                {t('ts.title')}
              </h1>
              <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl leading-relaxed mb-6">
                {t('ts.lead')}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('build-sprayer')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-sm sm:text-base px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
                >
                  <span>{t('ts.buildCta')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                </button>
                <a
                  href="/assets/aistudio/Yi_Lai_Plastics_Industry_Factory_CATALOG_b3ed4e35.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-transparent text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)] font-semibold text-sm sm:text-base px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>{t('hero.cta2')}</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[var(--surface)] border border-[var(--line)] rounded-[4px] p-4">
              <div className="border border-[var(--line)] rounded-[4px] p-3 flex items-center justify-center bg-white">
                <img
                  src="/images/prod-trigger-ts001.jpg"
                  alt="Standard plastic trigger sprayer TS001"
                  className="max-h-40 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="border border-[var(--line)] rounded-[4px] p-3 flex items-center justify-center bg-white">
                <img
                  src="/images/prod-trigger-ts014.jpg"
                  alt="Heavy duty trigger sprayer TS014"
                  className="max-h-40 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div
                className="col-span-2 pt-2 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2 font-mono-spec text-[11px] text-[var(--muted)]"
                dir="ltr"
              >
                <span>TS001 – TS021</span>
                <span>28/400 · 28/410 · 28/415</span>
                <span>PP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Series Specifications Table */}
      <section className="bg-[var(--bg)] border-b border-[var(--line)] py-12 sm:py-16">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <h2 className="font-display font-black uppercase text-3xl sm:text-4xl text-[var(--ink)] mb-6">
            {t('ts.specsHeading')}
          </h2>

          <div className="overflow-x-auto border border-[var(--line)] rounded-[4px] bg-[var(--surface)]">
            <table className="w-full text-left border-collapse" dir="ltr">
              <thead>
                <tr className="bg-[var(--blue)] text-[var(--btn-ink)] font-mono-spec text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Model Range</th>
                  <th className="px-4 py-3 font-medium">Series</th>
                  <th className="px-4 py-3 font-medium">Neck Size</th>
                  <th className="px-4 py-3 font-medium">Material</th>
                  <th className="px-4 py-3 font-medium">Nozzle Type</th>
                  <th className="px-4 py-3 font-medium">Dosage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-sm">
                {TRIGGER_SERIES_SPECS.map((row) => (
                  <tr key={row.range} className="hover:bg-[var(--bg)]">
                    <td className="px-4 py-3.5 font-mono-spec font-medium text-[var(--blue)] whitespace-nowrap">
                      {row.range}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--ink)] font-medium">{row.type}</td>
                    <td className="px-4 py-3.5 font-mono-spec text-xs text-[var(--muted)] whitespace-nowrap">
                      {row.neck}
                    </td>
                    <td className="px-4 py-3.5 font-mono-spec text-xs text-[var(--muted)]">
                      {row.material}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--muted)]">{row.nozzle}</td>
                    <td className="px-4 py-3.5 font-mono-spec text-xs text-[var(--ink)] whitespace-nowrap">
                      {row.dosage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Interactive "Build Your Own Sprayer" Configurator */}
      <SprayerConfiguratorSection
        lang={lang}
        onQuoteConfigured={onQuoteConfigured}
        t={t}
      />
    </div>
  );
}
