import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
} from 'lucide-react';
import { LANG_LABELS, type LangCode } from '../i18n/translations';
import { ProductDrawing, resolveDrawingVariant } from './ProductDrawings';

const CATALOG_PDF_URL =
  '/assets/aistudio/Yi_Lai_Plastics_Industry_Factory_CATALOG_b3ed4e35.pdf';

export interface ProductDetailData {
  id: string;
  category: string;
  figCode: string;
  modelRange: string;
  title: string;
  uses: string;
  neckSizes: string;
  neckToConfirm?: boolean;
  dosage: string;
  material: string;
  featureSpec: string;
  images: string[];
  altText: string;
  quoteValue: string;
}

interface ProductDetailPageProps {
  product: ProductDetailData;
  relatedProducts: ProductDetailData[];
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigateHomeSection: (sectionId?: string) => void;
  onOpenProductPage: (productId: string) => void;
  onQuoteProduct: (quoteValue: string, neckSizes?: string) => void;
  t: (key: string) => string;
}

export function ProductDetailPage({
  product,
  relatedProducts,
  lang,
  onChangeLang,
  onNavigateHomeSection,
  onOpenProductPage,
  onQuoteProduct,
  t,
}: ProductDetailPageProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  const gallery = product.images.length > 0 ? product.images : [];
  const safeIndex = activeIndex < gallery.length ? activeIndex : 0;
  const activeImage = gallery[safeIndex] ?? null;

  const handlePrev = () => {
    if (gallery.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNext = () => {
    if (gallery.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % gallery.length);
  };

  return (
    <div className="bg-[var(--bg)]">
      {/* Top Blueprint Header & Product Showcase */}
      <section className="grid-blueprint hero-radial-fade relative border-b border-[var(--line)] py-8 sm:py-12">
        <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6">
          {/* Utility Bar */}
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

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.06em] text-[var(--muted)] mb-6"
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
            <span className="text-[var(--blue)] font-medium">{product.title}</span>
          </nav>

          {/* 2-Column Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-8 lg:gap-12 items-start">
            {/* Left: Multi-Image Interactive Gallery */}
            <div className="space-y-3">
              <div className="relative bg-[var(--surface)] border border-[var(--line)] rounded-[4px] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[var(--line)] bg-[var(--bg)] flex items-center justify-between gap-2">
                  <span
                    className="font-mono-spec text-[11px] uppercase tracking-[0.08em] text-[var(--blue)]"
                    dir="ltr"
                  >
                    {product.figCode} · {product.modelRange}
                  </span>
                  {gallery.length > 0 && (
                    <span className="font-mono-spec text-[11px] text-[var(--muted)]" dir="ltr">
                      VIEW {safeIndex + 1} / {gallery.length}
                    </span>
                  )}
                </div>

                <div className="relative h-[320px] sm:h-[420px] bg-white flex items-center justify-center p-6">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={`${product.altText} — view ${safeIndex + 1}`}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <ProductDrawing
                      variant={resolveDrawingVariant(product.category)}
                      className="w-44 h-56"
                      label={product.altText}
                    />
                  )}

                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous product image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[4px] bg-[var(--surface)]/95 border border-[var(--line)] hover:border-[var(--blue)] text-[var(--ink)] hover:text-[var(--blue)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next product image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[4px] bg-[var(--surface)]/95 border border-[var(--line)] hover:border-[var(--blue)] text-[var(--ink)] hover:text-[var(--blue)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {gallery.length > 1 && (
                <div
                  className="grid grid-cols-4 sm:grid-cols-6 gap-2.5"
                  role="list"
                  aria-label="Product image thumbnails"
                >
                  {gallery.map((src, idx) => (
                    <button
                      key={`${idx}-${src.slice(0, 24)}`}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Show product photo ${idx + 1}`}
                      aria-current={idx === safeIndex ? 'true' : undefined}
                      className={`h-20 bg-white rounded-[4px] border p-1.5 flex items-center justify-center transition-colors cursor-pointer ${
                        idx === safeIndex
                          ? 'border-[var(--blue)] ring-2 ring-[var(--blue)]/25'
                          : 'border-[var(--line)] hover:border-[var(--blue)]'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`${product.title} thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Specifications & Factory Actions */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[4px] p-6 sm:p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.12em] text-[var(--red)] mb-2">
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{product.category.toUpperCase()} SERIES · YI LAI PLASTICS</span>
                </div>
                <h1 className="font-display font-black uppercase text-4xl sm:text-5xl leading-[0.94] tracking-tight text-[var(--ink)] mb-4">
                  {product.title}
                </h1>
                <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
                  {product.uses}
                </p>
              </div>

              {/* Tabular Technical Spec Sheet */}
              <div className="border-t border-b border-[var(--line)] py-5">
                <div className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--blue)] mb-3">
                  Technical Specification Sheet
                </div>
                <dl className="divide-y divide-dashed divide-[var(--line)] text-sm">
                  <div className="py-2.5 flex items-baseline justify-between gap-4">
                    <dt className="font-mono-spec text-xs uppercase text-[var(--muted)] shrink-0">
                      Model Range
                    </dt>
                    <dd className="font-mono-spec font-medium text-[var(--ink)] text-right" dir="ltr">
                      {product.modelRange}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-baseline justify-between gap-4">
                    <dt className="font-mono-spec text-xs uppercase text-[var(--muted)] shrink-0">
                      {t('spec.neck')}
                    </dt>
                    <dd className="font-mono-spec text-[var(--ink)] text-right" dir="ltr">
                      {product.neckToConfirm ? (
                        <span className="inline-block font-mono-spec text-[10px] uppercase tracking-[0.06em] bg-[#FFF1D6] text-[#9A5B00] border border-dashed border-[#B86E00] px-1.5 py-0.5 rounded-sm">
                          TO CONFIRM
                        </span>
                      ) : (
                        product.neckSizes
                      )}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-baseline justify-between gap-4">
                    <dt className="font-mono-spec text-xs uppercase text-[var(--muted)] shrink-0">
                      {t('spec.dosage')}
                    </dt>
                    <dd className="font-mono-spec text-[var(--ink)] text-right" dir="ltr">
                      {product.dosage}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-baseline justify-between gap-4">
                    <dt className="font-mono-spec text-xs uppercase text-[var(--muted)] shrink-0">
                      {t('spec.material')}
                    </dt>
                    <dd className="font-mono-spec text-[var(--muted)] text-right" dir="ltr">
                      {product.material}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-baseline justify-between gap-4">
                    <dt className="font-mono-spec text-xs uppercase text-[var(--muted)] shrink-0">
                      {t('spec.output')}
                    </dt>
                    <dd className="font-mono-spec text-[var(--muted)] text-right" dir="ltr">
                      {product.featureSpec}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-baseline justify-between gap-4">
                    <dt className="font-mono-spec text-xs uppercase text-[var(--muted)] shrink-0">
                      OEM Options
                    </dt>
                    <dd className="font-mono-spec text-[var(--muted)] text-right">
                      Custom Pantone color · Custom dip tube length
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() =>
                    onQuoteProduct(
                      product.quoteValue,
                      product.neckToConfirm ? '' : product.neckSizes
                    )
                  }
                  className="inline-flex items-center gap-2 bg-[var(--red)] text-white font-semibold text-base px-6 py-3.5 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
                >
                  <span>{t('card.quote')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                </button>

                <a
                  href={CATALOG_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-transparent text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)] font-semibold text-sm px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>{t('hero.cta2')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Product Families */}
      {relatedProducts.length > 0 && (
        <section className="bg-[var(--bg)] py-14 sm:py-16 border-b border-[var(--line)]">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <div className="font-mono-spec text-xs uppercase tracking-[0.12em] text-[var(--blue)] mb-1.5">
                  YI LAI DISPENSING CATALOG
                </div>
                <h2 className="font-display font-black uppercase text-3xl sm:text-4xl text-[var(--ink)]">
                  More Packaging Solutions
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onNavigateHomeSection('products')}
                className="font-mono-spec text-xs uppercase tracking-wider text-[var(--blue)] hover:text-[var(--red)] cursor-pointer"
              >
                View All Products →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[var(--line)] bg-[var(--surface)]">
              {relatedProducts.map((rel) => (
                <a
                  key={rel.id}
                  href={`#/products/${rel.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenProductPage(rel.id);
                  }}
                  className="yl-product-card border-r border-b border-[var(--line)] flex flex-col group"
                >
                  <div className="h-44 bg-white border-b border-[var(--line)] flex items-center justify-center p-4 relative">
                    <span
                      dir="ltr"
                      className="absolute top-2.5 left-3 font-mono-spec text-[10px] text-[#1648C9]"
                    >
                      {rel.figCode} · {rel.modelRange}
                    </span>
                    {rel.images[0] ? (
                      <img
                        src={rel.images[0]}
                        alt={rel.altText}
                        referrerPolicy="no-referrer"
                        className="max-h-32 w-auto object-contain mt-3"
                      />
                    ) : (
                      <ProductDrawing
                        variant={resolveDrawingVariant(rel.category)}
                        className="w-20 h-28"
                      />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-bold uppercase text-2xl text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors mb-1">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mb-3">{rel.uses}</p>
                    <div className="mt-auto font-mono-spec text-[11px] uppercase text-[var(--blue)] flex items-center gap-1">
                      <span>{t('card.moreInfo')}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
