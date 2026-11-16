import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import {
  DEFAULT_CATALOG_FILE_NAME,
  DEFAULT_CATALOG_PDF_URL,
  resolveCatalogBlobUrl,
  type CmsCatalogConfigDoc,
} from '../lib/firebase';

interface CatalogLinkProps {
  catalogConfig?: CmsCatalogConfigDoc | null;
  defaultLabel: string;
  className: string;
  iconClassName?: string;
}

export function CatalogLink({
  catalogConfig,
  defaultLabel,
  className,
  iconClassName = 'w-4 h-4 shrink-0',
}: CatalogLinkProps) {
  const [downloading, setDownloading] = useState(false);

  const label = catalogConfig?.buttonLabel?.trim() || defaultLabel;
  const isChunked =
    catalogConfig?.mode === 'chunks' && (catalogConfig.chunkCount ?? 0) > 0;

  if (!isChunked) {
    const href =
      catalogConfig?.mode === 'url' && catalogConfig.pdfUrl
        ? catalogConfig.pdfUrl
        : DEFAULT_CATALOG_PDF_URL;

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <FileText className={iconClassName} aria-hidden="true" />
        <span>{label}</span>
      </a>
    );
  }

  const handleChunkDownload = async () => {
    if (downloading || !catalogConfig) return;
    setDownloading(true);
    try {
      const objectUrl = await resolveCatalogBlobUrl(catalogConfig);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = catalogConfig.fileName || DEFAULT_CATALOG_FILE_NAME;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download catalog PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleChunkDownload}
      disabled={downloading}
      aria-busy={downloading}
      className={`${className} cursor-pointer disabled:opacity-70`}
    >
      {downloading ? (
        <Loader2 className={`${iconClassName} animate-spin`} aria-hidden="true" />
      ) : (
        <FileText className={iconClassName} aria-hidden="true" />
      )}
      <span>{downloading ? 'Preparing PDF…' : label}</span>
    </button>
  );
}
