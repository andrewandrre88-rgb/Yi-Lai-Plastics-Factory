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
  ensureArrayLength5,
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
  const [copiedWeChatKey, setCopiedWeChatKey] = useState<string | null>(null);

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

  const whatsappNums = ensureArrayLength5(cfg.whatsappNumbers, (cfg as any).whatsappNumber);
  const businessWaNums = ensureArrayLength5(cfg.businessWhatsapps, (cfg as any).businessWhatsapp);
  const fbUrls = ensureArrayLength5(cfg.facebookUrls, (cfg as any).facebookUrl);
  const igUrls = ensureArrayLength5(cfg.instagramUrls, (cfg as any).instagramUrl);
  const ytUrls = ensureArrayLength5(cfg.youtubeUrls, (cfg as any).youtubeUrl);
  const liUrls = ensureArrayLength5(cfg.linkedinUrls, (cfg as any).linkedinUrl);
  const ttUrls = ensureArrayLength5(cfg.tiktokUrls, (cfg as any).tiktokUrl);
  const xUrls = ensureArrayLength5(cfg.xUrls, (cfg as any).xUrl);
  const aliUrls = ensureArrayLength5(cfg.alibabaUrls, (cfg as any).alibabaUrl);
  const tgUrls = ensureArrayLength5(cfg.telegramUrls, (cfg as any).telegramUrl);
  const extraUrls = ensureArrayLength5(cfg.websiteExtraUrls, (cfg as any).websiteExtraUrl);
  const extraLabels = ensureArrayLength5(cfg.websiteExtraLabels, (cfg as any).websiteExtraLabel);
  const wechatIds = ensureArrayLength5(cfg.wechatIds, (cfg as any).wechatId);

  const externalChannels: { key: string; label: string; url: string; badgeClass?: string }[] = [];

  whatsappNums.forEach((num, idx) => {
    const waUrl = resolveWhatsAppChatUrl(num, directWaInquiryText);
    if (waUrl) {
      externalChannels.push({
        key: `whatsapp-${idx}`,
        label: `WhatsApp ${idx + 1} (${num.trim()})`,
        url: waUrl,
        badgeClass: 'border-[#25D366]/60 bg-[#25D366]/10 text-[var(--ink)] hover:border-[#25D366]',
      });
    }
  });

  businessWaNums.forEach((num, idx) => {
    const bwaUrl = resolveWhatsAppChatUrl(num, directWaInquiryText);
    if (bwaUrl) {
      externalChannels.push({
        key: `business-wa-${idx}`,
        label: num.trim().startsWith('http') || num.trim().startsWith('wa.me')
          ? `Business WhatsApp ${idx + 1}`
          : `Business WhatsApp ${idx + 1} (${num.trim()})`,
        url: bwaUrl,
        badgeClass: 'border-[#128C7E]/60 bg-[#128C7E]/10 text-[var(--ink)] hover:border-[#128C7E]',
      });
    }
  });

  fbUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `facebook-${idx}`, label: `Facebook ${idx + 1}`, url }); });
  igUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `instagram-${idx}`, label: `Instagram ${idx + 1}`, url }); });
  ytUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `youtube-${idx}`, label: `YouTube ${idx + 1}`, url }); });
  liUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `linkedin-${idx}`, label: `LinkedIn ${idx + 1}`, url }); });
  ttUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `tiktok-${idx}`, label: `TikTok ${idx + 1}`, url }); });
  xUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `x-${idx}`, label: `X ${idx + 1}`, url }); });
  aliUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `alibaba-${idx}`, label: `Alibaba Store ${idx + 1}`, url }); });
  tgUrls.forEach((url, idx) => { if (url.trim()) externalChannels.push({ key: `telegram-${idx}`, label: `Telegram ${idx + 1}`, url }); });
  extraUrls.forEach((url, idx) => {
    if (url.trim()) {
      const label = extraLabels[idx]?.trim() || `Official Link ${idx + 1}`;
      externalChannels.push({ key: `extra-${idx}`, label, url });
    }
  });

  const validWeChats = wechatIds.map((id, idx) => ({ id: id.trim(), idx })).filter(item => item.id);
  const hasAnyOfficialChannel = externalChannels.length > 0 || validWeChats.length > 0;

  if ((!showChannels || !hasAnyOfficialChannel) && !showSharing) {
    return null;
  }

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

  const handleCopyWeChat = async (id: string, key: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedWeChatKey(key);
      window.setTimeout(() => setCopiedWeChatKey(null), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <div className="border border-[var(--line)] rounded-[4px] bg-[var(--bg)] p-4 sm:p-5 space-y-4">
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
                {ch.key.includes('whatsapp') ? (
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366] shrink-0" aria-hidden="true" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" aria-hidden="true" />
                )}
                <span>{ch.label}</span>
                <ExternalLink className="w-3 h-3 opacity-60 shrink-0" aria-hidden="true" />
              </a>
            ))}

            {validWeChats.map((wc) => {
              const key = `wechat-${wc.idx}`;
              const isCopied = copiedWeChatKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCopyWeChat(wc.id, key)}
                  dir="ltr"
                  title="Click to copy WeChat ID"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue)] font-mono-spec text-xs transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-[#138A36] shrink-0" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[var(--blue)] shrink-0" aria-hidden="true" />
                  )}
                  <span>
                    {isCopied ? 'WeChat ID Copied!' : `WeChat ${wc.idx + 1}: ${wc.id}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
