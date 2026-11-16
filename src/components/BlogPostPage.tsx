import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { BLOG_POSTS, type BlogPost } from '../data/blogPosts';
import { LANG_LABELS, type LangCode } from '../i18n/translations';

interface BlogPostPageProps {
  post: BlogPost;
  allPosts?: BlogPost[];
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onNavigateHomeSection: (sectionId?: string) => void;
  onOpenPost: (postId: string) => void;
  onQuoteTopic: (relatedProduct: string) => void;
  t: (key: string) => string;
}

export function BlogPostPage({
  post,
  allPosts = BLOG_POSTS,
  lang,
  onChangeLang,
  onNavigateHomeSection,
  onOpenPost,
  onQuoteTopic,
  t,
}: BlogPostPageProps) {
  const copy = post.content[lang] ?? post.content.en;
  const currentIndex = allPosts.findIndex((item) => item.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  return (
    <article className="bg-[var(--bg)]">
      {/* Top Blueprint Utility & Breadcrumb Band */}
      <div className="grid-blueprint hero-radial-fade relative border-b border-[var(--line)] py-8 sm:py-12">
        <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-[var(--line)]">
            <button
              type="button"
              onClick={() => onNavigateHomeSection('blog')}
              className="inline-flex items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.06em] text-[var(--blue)] hover:text-[var(--red)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
              <span>{t('blog.backToBlog')}</span>
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
              onClick={() => onNavigateHomeSection('blog')}
              className="hover:text-[var(--blue)] cursor-pointer"
            >
              {t('nav.blog')}
            </button>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--blue)]" dir="ltr">
              {post.refCode}
            </span>
          </nav>

          <div className="flex items-center gap-2 font-mono-spec text-xs uppercase tracking-[0.08em] text-[var(--red)] mb-3">
            <span>{copy.category}</span>
          </div>

          <h1 className="font-display font-black uppercase text-4xl sm:text-5xl lg:text-6xl leading-[0.94] tracking-tight text-[var(--ink)] max-w-4xl mb-4">
            {copy.title}
          </h1>

          <p className="text-lg text-[var(--muted)] max-w-3xl leading-relaxed">{copy.summary}</p>
        </div>
      </div>

      {/* Main Article Body + Sidebar */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-10 lg:gap-12 items-start">
          {/* Article Content */}
          <div className="space-y-6">
            <div
              dir="ltr"
              className="font-mono-spec text-xs text-[var(--blue)] bg-[var(--surface)] border border-dashed border-[var(--line)] rounded-[4px] px-4 py-3 leading-relaxed"
            >
              {copy.specTakeaway}
            </div>

            <div className="space-y-5 text-base sm:text-lg text-[var(--ink)] leading-relaxed">
              {copy.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Previous / Next Post Navigation */}
            <div className="pt-8 mt-10 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <button
                  type="button"
                  onClick={() => onOpenPost(prevPost.id)}
                  className="text-left rtl:text-right p-4 border border-[var(--line)] hover:border-[var(--blue)] rounded-[4px] bg-[var(--surface)] transition-colors cursor-pointer"
                >
                  <span className="block font-mono-spec text-[10px] uppercase tracking-[0.08em] text-[var(--muted)] mb-1">
                    {t('blog.prevPost')}
                  </span>
                  <span className="font-display font-bold uppercase text-lg text-[var(--ink)] leading-snug block">
                    {(prevPost.content[lang] ?? prevPost.content.en).title}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextPost && (
                <button
                  type="button"
                  onClick={() => onOpenPost(nextPost.id)}
                  className="text-left rtl:text-right p-4 border border-[var(--line)] hover:border-[var(--blue)] rounded-[4px] bg-[var(--surface)] transition-colors cursor-pointer"
                >
                  <span className="block font-mono-spec text-[10px] uppercase tracking-[0.08em] text-[var(--muted)] mb-1">
                    {t('blog.nextPost')}
                  </span>
                  <span className="font-display font-bold uppercase text-lg text-[var(--ink)] leading-snug block">
                    {(nextPost.content[lang] ?? nextPost.content.en).title}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Engineering Sidebar */}
          <aside className="lg:sticky lg:top-24 border border-[var(--line)] rounded-[4px] bg-[var(--surface)] overflow-hidden">
            {post.image && (
              <div className="bg-white border-b border-[var(--line)] p-6 flex items-center justify-center">
                <img
                  src={post.image}
                  alt={copy.title}
                  referrerPolicy="no-referrer"
                  className="max-h-48 w-auto object-contain"
                />
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <div className="font-mono-spec text-[10px] uppercase tracking-[0.1em] text-[var(--blue)] mb-1">
                  {t('blog.relatedSeries')}
                </div>
                <div className="font-display font-bold uppercase text-2xl text-[var(--ink)]">
                  {post.relatedProduct}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onQuoteTopic(post.relatedProduct)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--red)] text-white font-semibold text-sm px-5 py-3 rounded-[4px] hover:-translate-y-px transition-transform cursor-pointer"
              >
                <span>{t('blog.quoteCta')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
              </button>

              <a
                href="/assets/aistudio/Yi_Lai_Plastics_Industry_Factory_CATALOG_b3ed4e35.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-transparent text-[var(--ink)] ring-1 ring-inset ring-[var(--ink)] font-semibold text-sm px-5 py-2.5 rounded-[4px] hover:-translate-y-px transition-transform"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>{t('hero.cta2')}</span>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
