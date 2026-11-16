import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { REAL_USE_CASES, type UseCaseItem } from '../data/useCases';
import { LANG_LABELS, type LangCode } from '../i18n/translations';
import type { CmsCatalogConfigDoc } from '../lib/firebase';
import { CatalogLink } from './CatalogLink';

interface UseCasesPageProps {
  lang: LangCode;
  catalogConfig?: CmsCatalogConfigDoc | null;
  onChangeLang: (lang: LangCode) => void;
  onNavigateHomeSection: (sectionId?: string) => void;
  onQuoteUseCase: (useCase: UseCaseItem) => void;
  t: (key: string) => string;
}

export function UseCasesPage({
  lang,
  catalogConfig,
  onChangeLang,
  onNavigateHomeSection,
  onQuoteUseCase,
  t,
}: UseCasesPageProps) {
  const [selectedId, setSelectedId] = useState<string>('all');

  const visibleCases =
    selectedId === 'all'
      ? REAL_USE_CASES
      : REAL_USE_CASES.filter((item) => item.id === selectedId);

  return (
    <div className="bg-[var(--bg)]">
      {/* Top Blueprint Header Band */}
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
            <span className="text-[var(--blue)]">{t('nav.useCases')}</span>
          </nav>

          <div className="font-mono-spec text-xs uppercase tracking-[0.12em] text-[var(--red)] mb-2">
            {t('useCases.pageKicker')}
          </div>
          <h1 className="font-display font-black uppercase text-5xl sm:text-6xl leading-[0.92] tracking-tight text-[var(--ink)] max-w-4xl mb-4">
            {t('useCases.title')}
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-3xl leading-relaxed mb-7">
            {t('useCases.lead')}
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

            <CatalogLink
              catalogConfig={catalogConfig}
              defaultLabel={t('hero.cta2')}
              className="inline-flex items-center gap-2 bg-transparent text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)] font-semibold text-sm sm:text-base px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform"
            />
          </div>
        </div>
      </section>

      {/* Main Use Cases Directory */}
      <section className="bg-[var(--bg)] border-b border-[var(--line)] py-14 sm:py-16">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          {/* Interactive Sector Filter Bar */}
          <div
            role="group"
            aria-label="Filter real use cases by industry"
            className="flex flex-wrap items-center gap-2 mb-8"
          >
            <button
              type="button"
              onClick={() => setSelectedId('all')}
              aria-pressed={selectedId === 'all'}
              className={`px-3.5 py-2 rounded-[4px] font-mono-spec text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedId === 'all'
                  ? 'bg-[var(--blue)] text-[var(--btn-ink)] font-medium'
                  : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
              }`}
            >
              {t('useCases.filterAll')}
            </button>
            {REAL_USE_CASES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={selectedId === item.id}
                className={`px-3.5 py-2 rounded-[4px] font-mono-spec text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedId === item.id
                    ? 'bg-[var(--blue)] text-[var(--btn-ink)] font-medium'
                    : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
                }`}
              >
                {item.sector[lang]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--line)] bg-[var(--surface)]">
            {visibleCases.map((item) => (
              <article
                key={item.id}
                className="yl-product-card border-r border-b border-[var(--line)] flex flex-col"
              >
                <div className="bg-white border-b border-[var(--line)] px-5 py-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div
                      className="font-mono-spec text-[11px] uppercase tracking-[0.08em] text-[#D92B25]"
                      dir="ltr"
                    >
                      {item.refCode} · {item.series}
                    </div>
                    <div className="font-mono-spec text-xs text-[#54607F] mt-0.5 truncate">
                      {item.sector[lang]}
                    </div>
                  </div>
                  <img
                    src={item.image}
                    alt={t(item.altKey)}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 object-contain shrink-0"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="font-display font-bold uppercase text-2xl leading-tight text-[var(--ink)] mb-2">
                    {item.title[lang]}
                  </h2>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                    {item.description[lang]}
                  </p>

                  <dl className="mt-auto pt-3 border-t border-dashed border-[var(--line)] space-y-2 text-xs">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono-spec uppercase text-[var(--muted)] shrink-0">
                        {t('useCases.bottleLabel')}
                      </dt>
                      <dd className="font-mono-spec text-[var(--ink)] text-right rtl:text-left">
                        {item.bottleFit[lang]}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono-spec uppercase text-[var(--muted)] shrink-0">
                        {t('spec.neck')}
                      </dt>
                      <dd className="font-mono-spec text-[var(--ink)] text-right" dir="ltr">
                        {item.recommendedNeck}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono-spec uppercase text-[var(--muted)] shrink-0">
                        {t('spec.dosage')}
                      </dt>
                      <dd className="font-mono-spec text-[var(--ink)] text-right" dir="ltr">
                        {item.dosage}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => onQuoteUseCase(item)}
                    className="mt-4 pt-3 border-t border-[var(--line)] w-full flex items-center justify-between text-sm font-semibold text-[var(--blue)] hover:text-[var(--red)] transition-colors cursor-pointer"
                  >
                    <span>{t('useCases.quoteBtn')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-spec text-[var(--muted)]">
              <span>{t('useCases.clientNote')}:</span>
              <span
                dir="ltr"
                className="inline-block font-mono-spec text-[10px] uppercase tracking-[0.06em] bg-[#FFF1D6] text-[#9A5B00] border border-dashed border-[#B86E00] px-1.5 py-0.5 rounded-sm align-middle whitespace-nowrap"
              >
                TO CONFIRM
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateHomeSection('quote')}
              className="inline-flex items-center gap-2 bg-[var(--blue)] text-[var(--btn-ink)] font-semibold text-sm px-5 py-2.5 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
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
