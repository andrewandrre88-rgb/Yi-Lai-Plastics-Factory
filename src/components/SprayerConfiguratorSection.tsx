import { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { CUSTOM_SWATCHES } from '../data/catalog';
import {
  CLOSURE_OPTIONS,
  NOZZLE_OPTIONS,
  TRIGGER_OPTIONS,
} from '../data/triggerOptions';
import type { LangCode } from '../i18n/translations';

interface SprayerConfiguratorSectionProps {
  lang: LangCode;
  onQuoteConfigured: (payload: {
    product: string;
    neck: string;
    colour: string;
    message: string;
  }) => void;
  t: (key: string) => string;
}

export function SprayerConfiguratorSection({
  lang,
  onQuoteConfigured,
  t,
}: SprayerConfiguratorSectionProps) {
  const [selectedNozzle, setSelectedNozzle] = useState('N3');
  const [selectedTrigger, setSelectedTrigger] = useState('T2');
  const [selectedClosure, setSelectedClosure] = useState('C2');
  const [selectedColor, setSelectedColor] = useState('Brand Blue');
  const [copiedCode, setCopiedCode] = useState(false);

  const nozzleObj =
    NOZZLE_OPTIONS.find((item) => item.code === selectedNozzle) ?? NOZZLE_OPTIONS[2];
  const triggerObj =
    TRIGGER_OPTIONS.find((item) => item.code === selectedTrigger) ?? TRIGGER_OPTIONS[1];
  const closureObj =
    CLOSURE_OPTIONS.find((item) => item.code === selectedClosure) ?? CLOSURE_OPTIONS[1];

  const configCode = `${nozzleObj.code} + ${triggerObj.code} + ${closureObj.code}`;

  const handleCopySpec = async () => {
    const summary = `${configCode} | Neck: ${closureObj.neckFinish ?? '28/410'} | Color: ${selectedColor}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleRequestQuote = () => {
    onQuoteConfigured({
      product: 'Trigger sprayer (TS001-TS021)',
      neck: closureObj.neckFinish ?? '28/410',
      colour: selectedColor,
      message: `Custom Trigger Sprayer Spec: ${configCode}\n- Nozzle: ${nozzleObj.code} (${nozzleObj.label.en})\n- Trigger: ${triggerObj.code} (${triggerObj.label.en})\n- Closure: ${closureObj.code} (${closureObj.label.en})`,
    });
  };

  return (
    <section
      id="build-sprayer"
      className="py-20 sm:py-24 bg-[var(--bg)] border-t border-b border-[var(--line)]"
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-end">
          <div>
            <span className="block font-mono-spec text-[12.5px] uppercase tracking-[0.08em] text-[var(--muted)] mb-3">
              {t('ts.configKicker')}
            </span>
            <h2 className="font-display font-black uppercase text-[clamp(40px,5.6vw,72px)] leading-[0.92] text-[var(--ink)]">
              {t('ts.configTitle')}
            </h2>
          </div>
          <p className="max-w-[56ch] text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            {t('ts.configLead')}
          </p>
        </div>

        {/* 1. Nozzle Options (N1–N6) */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-1 bg-[var(--blue)]" aria-hidden="true" />
            <h3 className="font-mono-spec text-sm font-medium uppercase tracking-[0.1em] text-[var(--blue)]">
              {t('ts.nozzleTitle')}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {NOZZLE_OPTIONS.map((opt) => {
              const active = selectedNozzle === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setSelectedNozzle(opt.code)}
                  aria-pressed={active}
                  className={`p-3 rounded-[4px] border text-center flex flex-col items-center gap-2.5 transition-colors cursor-pointer ${
                    active
                      ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))] ring-1 ring-[var(--blue)]'
                      : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--blue)]'
                  }`}
                >
                  <img
                    src={opt.image}
                    alt={`${opt.code}: ${opt.label[lang]}`}
                    className="w-full aspect-square object-cover rounded-[4px] bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    dir="ltr"
                    className={`font-mono-spec text-xs font-medium px-2 py-0.5 rounded-[2px] ${
                      active
                        ? 'bg-[var(--red)] text-white'
                        : 'bg-[var(--ink)] text-[var(--bg)]'
                    }`}
                  >
                    {opt.code}
                  </span>
                  <span className="text-xs font-semibold text-[var(--ink)] leading-snug">
                    {opt.label[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Trigger Options (T1–T6) */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-1 bg-[var(--blue)]" aria-hidden="true" />
            <h3 className="font-mono-spec text-sm font-medium uppercase tracking-[0.1em] text-[var(--blue)]">
              {t('ts.triggerTitle')}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {TRIGGER_OPTIONS.map((opt) => {
              const active = selectedTrigger === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setSelectedTrigger(opt.code)}
                  aria-pressed={active}
                  className={`p-3 rounded-[4px] border text-center flex flex-col items-center gap-2.5 transition-colors cursor-pointer ${
                    active
                      ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))] ring-1 ring-[var(--blue)]'
                      : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--blue)]'
                  }`}
                >
                  <img
                    src={opt.image}
                    alt={`${opt.code}: ${opt.label[lang]}`}
                    className="w-full aspect-square object-cover rounded-[4px] bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    dir="ltr"
                    className={`font-mono-spec text-xs font-medium px-2 py-0.5 rounded-[2px] ${
                      active
                        ? 'bg-[var(--red)] text-white'
                        : 'bg-[var(--ink)] text-[var(--bg)]'
                    }`}
                  >
                    {opt.code}
                  </span>
                  <span className="text-xs font-semibold text-[var(--ink)] leading-snug">
                    {opt.label[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Closure Options (C1–C5) */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-1 bg-[var(--blue)]" aria-hidden="true" />
            <h3 className="font-mono-spec text-sm font-medium uppercase tracking-[0.1em] text-[var(--blue)]">
              {t('ts.closureTitle')}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {CLOSURE_OPTIONS.map((opt) => {
              const active = selectedClosure === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setSelectedClosure(opt.code)}
                  aria-pressed={active}
                  className={`p-3 rounded-[4px] border text-center flex flex-col items-center gap-2.5 transition-colors cursor-pointer ${
                    active
                      ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))] ring-1 ring-[var(--blue)]'
                      : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--blue)]'
                  }`}
                >
                  <img
                    src={opt.image}
                    alt={`${opt.code}: ${opt.label[lang]}`}
                    className="w-full aspect-square object-cover rounded-[4px] bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    dir="ltr"
                    className={`font-mono-spec text-xs font-medium px-2 py-0.5 rounded-[2px] ${
                      active
                        ? 'bg-[var(--red)] text-white'
                        : 'bg-[var(--ink)] text-[var(--bg)]'
                    }`}
                  >
                    {opt.code}
                  </span>
                  <span className="text-xs font-semibold text-[var(--ink)] leading-snug">
                    {opt.label[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Color Selection */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-1 bg-[var(--blue)]" aria-hidden="true" />
            <h3 className="font-mono-spec text-sm font-medium uppercase tracking-[0.1em] text-[var(--blue)]">
              {t('ts.colorTitle')}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {CUSTOM_SWATCHES.map((sw) => {
              const active = selectedColor === sw.name;
              return (
                <button
                  key={sw.name}
                  type="button"
                  onClick={() => setSelectedColor(sw.name)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-[4px] border text-xs font-medium cursor-pointer transition-colors ${
                    active
                      ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_10%,var(--surface))] text-[var(--blue)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--blue)]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: sw.hex }}
                  />
                  <span>{sw.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live "Build Your Own Sprayer" Summary & Quote Handoff */}
        <div className="border border-[var(--line)] rounded-[4px] bg-[var(--surface)] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="font-mono-spec text-xs uppercase tracking-[0.08em] text-[var(--muted)] mb-1">
              {t('ts.summaryLabel')}
            </div>
            <div
              dir="ltr"
              className="font-display font-black text-3xl sm:text-4xl text-[var(--blue)] tracking-tight mb-2"
            >
              {configCode}
            </div>
            <p className="text-sm text-[var(--muted)]">
              {nozzleObj.label[lang]} · {triggerObj.label[lang]} · {closureObj.label[lang]} ·{' '}
              {selectedColor}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopySpec}
              className="inline-flex items-center gap-2 px-4 py-3 border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--blue)] text-[var(--ink)] rounded-[4px] font-mono-spec text-xs uppercase cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? t('f.copied') : t('ts.copySpec')}</span>
            </button>

            <button
              type="button"
              onClick={handleRequestQuote}
              className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-base px-6 py-3 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
            >
              <span>{t('ts.quoteSpec')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
