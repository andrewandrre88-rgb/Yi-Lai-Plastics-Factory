import { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  MessageSquare,
  Share2,
} from 'lucide-react';
import {
  DEFAULT_SOCIAL_SETTING,
  formatSocialLinksTextSummary,
  resolveWhatsAppChatUrl,
  type CmsSocialSettingDoc,
  type CmsSocialSettingInput,
} from '../lib/firebase';
import { SITE_CANONICAL_ORIGIN } from '../lib/seo';

interface SocialLinksBarProps {
  socialSettings?: CmsSocialSettingDoc | CmsSocialSettingInput | null;
  contextType: 'product' | 'blog';
  itemTitle: string;
  itemSummary?: string;
  hashPath: string;
}

export function SocialLinksBar({
  socialSettings,
  contextType,
  itemTitle,
  itemSummary = '',
  hashPath,
}: SocialLinksBarProps) {
  const [copiedBundle, setCopiedBundle] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWeChat, setCopiedWeChat] = useState(false);

  const cfg: CmsSocialSettingInput = {
    ...DEFAULT_SOCIAL_SETTING,
    ...(socialSettings ?? {}),
  };

  const showChannels =
    contextType === 'product' ? cfg.showOnProducts : cfg.showOnBlogPosts;
  const showSharing = cfg.enableShareButtons;

  const pageUrl =
    typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/${hashPath.replace(/^\/+/, '')}`
      : `${SITE_CANONICAL_ORIGIN}/${hashPath.replace(/^\/+/, '')}`;

  const directWaInquiryText =
    contextType === 'product'
      ? `Hello Yi Lai Plastics, I am interested in "${itemTitle}" (${pageUrl}). Could you share pricing & sample details?`
      : `Hello Yi Lai Plastics, I read "${itemTitle}" (${pageUrl}) and would like technical / quote assistance.`;

  const whatsappDirectUrl = resolveWhatsAppChatUrl(cfg.whatsappNumber, directWaInquiryText);
  const businessWaDirectUrl = resolveWhatsAppChatUrl(cfg.businessWhatsapp, directWaInquiryText);

  const socialSummaryText = formatSocialLinksTextSummary(cfg);
  const fullShareCaption = [
    `${itemTitle} — Yi Lai Plastics Industry`,
    itemSummary ? itemSummary.trim() : '',
    `View details: ${pageUrl}`,
    socialSummaryText ? `\n${cfg.signatureHeading || 'Connect with us'}:\n${socialSummaryText}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const shareToWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(fullShareCaption)}`;
  const shareToFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    pageUrl
  )}&quote=${encodeURIComponent(`${itemTitle} — Yi Lai Plastics`)}`;
  const shareToLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    pageUrl
  )}`;
  const shareToXUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${itemTitle} — Yi Lai Plastics`
  )}&url=${encodeURIComponent(pageUrl)}`;

  const externalChannels: { key: string; label: string; url: string; badgeClass?: string }[] = [
    whatsappDirectUrl
      ? {
          key: 'whatsapp',
          label: `WhatsApp (${cfg.whatsappNumber.trim()})`,
          url: whatsappDirectUrl,
          badgeClass:
            'border-[#25D366]/60 bg-[#25D366]/10 text-[var(--ink)] hover:border-[#25D366]',
        }
      : null,
    businessWaDirectUrl
      ? {
          key: 'business-wa',
          label:
            cfg.businessWhatsapp.trim().startsWith('http') ||
            cfg.businessWhatsapp.trim().startsWith('wa.me')
              ? 'Business WhatsApp'
              : `Business WhatsApp (${cfg.businessWhatsapp.trim()})`,
          url: businessWaDirectUrl,
          badgeClass:
            'border-[#128C7E]/60 bg-[#128C7E]/10 text-[var(--ink)] hover:border-[#128C7E]',
        }
      : null,
    cfg.facebookUrl ? { key: 'facebook', label: 'Facebook', url: cfg.facebookUrl } : null,
    cfg.instagramUrl ? { key: 'instagram', label: 'Instagram', url: cfg.instagramUrl } : null,
    cfg.youtubeUrl ? { key: 'youtube', label: 'YouTube', url: cfg.youtubeUrl } : null,
    cfg.linkedinUrl ? { key: 'linkedin', label: 'LinkedIn', url: cfg.linkedinUrl } : null,
    cfg.tiktokUrl ? { key: 'tiktok', label: 'TikTok', url: cfg.tiktokUrl } : null,
    cfg.xUrl ? { key: 'x', label: 'X / Twitter', url: cfg.xUrl } : null,
    cfg.alibabaUrl ? { key: 'alibaba', label: 'Alibaba Store', url: cfg.alibabaUrl } : null,
    cfg.telegramUrl ? { key: 'telegram', label: 'Telegram', url: cfg.telegramUrl } : null,
    cfg.websiteExtraUrl
      ? {
          key: 'extra',
          label: cfg.websiteExtraLabel.trim() || 'Official Link',
          url: cfg.websiteExtraUrl,
        }
      : null,
  ].filter((v): v is NonNullable<typeof v> => v !== null);

  const hasAnyOfficialChannel = externalChannels.length > 0 || Boolean(cfg.wechatId.trim());

  if ((!showChannels || !hasAnyOfficialChannel) && !showSharing) {
    return null;
  }

  const handleCopyFullPost = async () => {
    try {
      await navigator.clipboard.writeText(fullShareCaption);
      setCopiedBundle(true);
      window.setTimeout(() => setCopiedBundle(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleCopyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleCopyWeChat = async () => {
    if (!cfg.wechatId.trim()) return;
    try {
      await navigator.clipboard.writeText(cfg.wechatId.trim());
      setCopiedWeChat(true);
      window.setTimeout(() => setCopiedWeChat(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="border border-[var(--line)] rounded-[4px] bg-[var(--bg)] p-4 sm:p-5 space-y-4">
      {/* Official Factory Social & Direct Messaging Links */}
      {showChannels && hasAnyOfficialChannel && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-spec text-[11px] uppercase tracking-[0.1em] text-[var(--blue)]">
              {cfg.signatureHeading || 'Connect & Follow Yi Lai Plastics'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {externalChannels.map((ch) => (
              <a
                key={ch.key}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border font-mono-spec text-xs transition-colors ${
                  ch.badgeClass ??
                  'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue)]'
                }`}
              >
                {ch.key === 'whatsapp' || ch.key === 'business-wa' ? (
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366] shrink-0" aria-hidden="true" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" aria-hidden="true" />
                )}
                <span>{ch.label}</span>
                <ExternalLink className="w-3 h-3 opacity-60 shrink-0" aria-hidden="true" />
              </a>
            ))}

            {cfg.wechatId.trim() && (
              <button
                type="button"
                onClick={handleCopyWeChat}
                dir="ltr"
                title="Click to copy WeChat ID"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue)] font-mono-spec text-xs transition-colors cursor-pointer"
              >
                {copiedWeChat ? (
                  <Check className="w-3.5 h-3.5 text-[#138A36] shrink-0" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" aria-hidden="true" />
                )}
                <span>
                  {copiedWeChat ? 'WeChat ID Copied!' : `WeChat: ${cfg.wechatId.trim()}`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share This Product / Blog Post + Copy Caption with Social Links */}
      {showSharing && (
        <div
          className={`space-y-2.5 ${
            showChannels && hasAnyOfficialChannel ? 'pt-3.5 border-t border-dashed border-[var(--line)]' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 font-mono-spec text-[10.5px] uppercase tracking-[0.1em] text-[var(--muted)]">
            <Share2 className="w-3.5 h-3.5 text-[var(--blue)]" aria-hidden="true" />
            <span>
              {contextType === 'product'
                ? 'Share Product & Factory Links'
                : 'Share Article & Factory Links'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFullPost}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--blue)] text-[var(--btn-ink)] font-mono-spec text-xs uppercase tracking-wider hover:-translate-y-px transition-transform cursor-pointer"
            >
              {copiedBundle ? (
                <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{copiedBundle ? 'Copied with Social Links!' : 'Copy Post + My Links'}</span>
            </button>

            <a
              href={shareToWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[#25D366] hover:text-[#25D366] font-mono-spec text-xs transition-colors"
            >
              <span>WhatsApp Share</span>
            </a>

            <a
              href={shareToFacebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue)] font-mono-spec text-xs transition-colors"
            >
              <span>Facebook</span>
            </a>

            <a
              href={shareToLinkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue)] font-mono-spec text-xs transition-colors"
            >
              <span>LinkedIn</span>
            </a>

            <a
              href={shareToXUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue)] font-mono-spec text-xs transition-colors"
            >
              <span>X</span>
            </a>

            <button
              type="button"
              onClick={handleCopyPageLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--blue)] hover:text-[var(--blue)] font-mono-spec text-xs transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-[#138A36] shrink-0" aria-hidden="true" />
              ) : (
                <Link2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{copiedLink ? 'Link Copied' : 'Copy URL'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
