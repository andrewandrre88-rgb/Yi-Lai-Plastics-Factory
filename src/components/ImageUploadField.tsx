import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  samplePaths: { label: string; path: string }[];
  placeholder?: string;
}

const MAX_DATA_URI_LENGTH = 320000;
const MAX_GALLERY_TOTAL_CHARS = 680000;

async function compressImageFileToDataUrl(
  file: File,
  maxChars: number = MAX_DATA_URI_LENGTH
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
}> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Please upload a JPG, PNG, WebP, or GIF image.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode selected image file.'));
      el.src = objectUrl;
    });

    const maxEdges = [900, 720, 560, 420, 320];
    const qualities = [0.85, 0.74, 0.62, 0.5, 0.4];

    for (const maxEdge of maxEdges) {
      const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
      const width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
      const height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Browser canvas is unavailable for image processing.');
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for (const mime of ['image/webp', 'image/jpeg'] as const) {
        for (const q of qualities) {
          const dataUrl = canvas.toDataURL(mime, q);
          if (
            dataUrl.startsWith('data:image/webp;base64,') ||
            dataUrl.startsWith('data:image/jpeg;base64,')
          ) {
            if (dataUrl.length <= maxChars) {
              return {
                dataUrl,
                width,
                height,
                sizeKb: Math.round((dataUrl.length * 0.75) / 1024),
              };
            }
          }
        }
      }
    }

    throw new Error('Image is still too large after compression. Try a smaller photo.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ImageUploadField({
  label,
  value,
  onChange,
  samplePaths,
  placeholder = '/images/prod-trigger-ts001.jpg or https://...',
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadMeta, setUploadMeta] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isUploadedDataUrl = value.startsWith('data:image/');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setProcessing(true);
    try {
      const result = await compressImageFileToDataUrl(file);
      onChange(result.dataUrl);
      setUploadMeta(`${file.name} · ${result.width}×${result.height}px · ${result.sizeKb} KB`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process image.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange('');
    setUploadMeta(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)]">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 font-mono-spec text-[10px] uppercase text-[var(--red)] hover:underline cursor-pointer"
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
            <span>Remove image</span>
          </button>
        )}
      </div>

      {/* Upload Dropzone + Live Thumbnail Preview */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFile = e.dataTransfer.files?.[0];
          void handleFile(droppedFile);
        }}
        className={`border-[1.5px] border-dashed rounded p-4 transition-colors flex flex-col sm:flex-row items-center gap-4 ${
          isDragging
            ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_12%,var(--surface))]'
            : 'border-[var(--line)] bg-[var(--bg)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        {value ? (
          <div className="w-20 h-20 bg-[var(--surface)] border border-[var(--line)] rounded flex items-center justify-center p-1.5 shrink-0">
            <img
              src={value}
              alt="Selected preview"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-[var(--surface)] border border-[var(--line)] rounded flex items-center justify-center text-[var(--muted)] shrink-0">
            <ImagePlus className="w-6 h-6" aria-hidden="true" />
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              disabled={processing}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-[var(--blue)] hover:opacity-90 disabled:opacity-60 text-[var(--btn-ink)] font-mono-spec text-xs uppercase tracking-wider px-3.5 py-2 rounded transition-opacity cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{processing ? 'Optimizing…' : 'Upload Image'}</span>
            </button>
            <span className="font-mono-spec text-[11px] text-[var(--muted)]">
              or drag &amp; drop JPG, PNG, WebP
            </span>
          </div>

          {uploadMeta && isUploadedDataUrl && (
            <div className="font-mono-spec text-[11px] text-[#138A36] dark:text-[#4ade80] truncate">
              Ready for Firestore: {uploadMeta}
            </div>
          )}
          {!uploadMeta && isUploadedDataUrl && (
            <div className="font-mono-spec text-[11px] text-[#138A36] dark:text-[#4ade80]">
              Uploaded image stored ({Math.round((value.length * 0.75) / 1024)} KB)
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="text-xs font-medium text-[var(--red)]">
          {uploadError}
        </p>
      )}

      {/* Optional URL / Path fallback input */}
      <input
        type="text"
        maxLength={500}
        value={isUploadedDataUrl ? '' : value}
        onChange={(e) => {
          setUploadMeta(null);
          setUploadError(null);
          onChange(e.target.value);
        }}
        placeholder={
          isUploadedDataUrl
            ? 'Uploaded image active — paste a URL here to replace it'
            : placeholder
        }
        className="w-full px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-xs focus:outline-none focus:border-[var(--blue)]"
      />

      {/* Quick-pick existing catalog assets */}
      <div className="flex flex-wrap gap-1.5">
        {samplePaths.map((sample) => (
          <button
            key={sample.path}
            type="button"
            onClick={() => {
              setUploadMeta(null);
              setUploadError(null);
              onChange(sample.path);
            }}
            className="px-2 py-1 rounded border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--blue)] font-mono-spec text-[10px] text-[var(--muted)] cursor-pointer"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface MultiImageUploadFieldProps {
  label: string;
  images: string[];
  onChange: (nextImages: string[]) => void;
  samplePaths: { label: string; path: string }[];
  maxImages?: number;
}

export function MultiImageUploadField({
  label,
  images,
  onChange,
  samplePaths,
  maxImages = 6,
}: MultiImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const totalChars = images.reduce((sum, img) => sum + img.length, 0);
  const totalKb = Math.round((totalChars * 0.75) / 1024);

  const handleFiles = async (fileList: FileList | File[] | null | undefined) => {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) return;

    setUploadError(null);
    setUploadStatus(null);

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setUploadError(`Maximum ${maxImages} images per product reached. Remove one to add another.`);
      return;
    }

    const batch = files.slice(0, availableSlots);
    setProcessing(true);

    try {
      const nextList = [...images];
      let usedChars = totalChars;

      for (let i = 0; i < batch.length; i += 1) {
        const file = batch[i];
        const remainingSlots = Math.max(1, batch.length - i);
        const remainingBudget = Math.max(45000, MAX_GALLERY_TOTAL_CHARS - usedChars);
        const perFileBudget = Math.min(200000, Math.floor(remainingBudget / remainingSlots));

        const result = await compressImageFileToDataUrl(file, perFileBudget);
        nextList.push(result.dataUrl);
        usedChars += result.dataUrl.length;
      }

      onChange(nextList);
      const skippedCount = files.length - batch.length;
      setUploadStatus(
        skippedCount > 0
          ? `Added ${batch.length} image(s) (${skippedCount} skipped due to ${maxImages}-image limit).`
          : `Added ${batch.length} image(s) to product gallery.`
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process selected images.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAppendUrl = (rawUrl: string) => {
    const clean = rawUrl.trim();
    if (!clean) return;
    setUploadError(null);
    setUploadStatus(null);

    if (!clean.startsWith('/') && !clean.startsWith('https://')) {
      setUploadError('Image URL must start with "/" (local asset) or "https://".');
      return;
    }
    if (images.length >= maxImages) {
      setUploadError(`Maximum ${maxImages} images per product.`);
      return;
    }
    if (images.includes(clean)) {
      setUploadStatus('This image is already in the gallery.');
      setUrlInput('');
      return;
    }
    onChange([...images, clean]);
    setUrlInput('');
  };

  const handleSetPrimary = (idx: number) => {
    if (idx <= 0 || idx >= images.length) return;
    const chosen = images[idx];
    const rest = images.filter((_, i) => i !== idx);
    onChange([chosen, ...rest]);
  };

  const handleRemoveAt = (idx: number) => {
    setUploadError(null);
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block font-mono-spec text-[11px] uppercase text-[var(--muted)]">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <span className="font-mono-spec text-[10px] uppercase text-[var(--muted)]">
            {images.length}/{maxImages} images · {totalKb} KB
          </span>
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setUploadStatus(null);
                setUploadError(null);
              }}
              className="inline-flex items-center gap-1 font-mono-spec text-[10px] uppercase text-[var(--red)] hover:underline cursor-pointer"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-file Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`border-[1.5px] border-dashed rounded p-4 transition-colors space-y-3 ${
          isDragging ? 'border-[var(--blue)] bg-[color-mix(in_srgb,var(--blue)_12%,var(--surface))]' : 'border-[var(--line)] bg-[var(--bg)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={processing || images.length >= maxImages}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-[var(--blue)] hover:opacity-90 disabled:opacity-60 text-[var(--btn-ink)] font-mono-spec text-xs uppercase tracking-wider px-3.5 py-2 rounded transition-opacity cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {processing
                  ? 'Optimizing…'
                  : images.length >= maxImages
                    ? `Gallery Full (${maxImages})`
                    : 'Upload Multiple Images'}
              </span>
            </button>
            <span className="font-mono-spec text-[11px] text-[var(--muted)]">
              Select or drag &amp; drop up to {maxImages} JPG, PNG, WebP files
            </span>
          </div>
        </div>

        {/* Uploaded Gallery Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {images.map((src, idx) => (
              <div
                key={`${idx}-${src.slice(0, 32)}`}
                className={`relative bg-[var(--surface)] border rounded p-2 flex flex-col gap-2 ${
                  idx === 0 ? 'border-[var(--blue)] ring-1 ring-[var(--blue)]/20' : 'border-[var(--line)]'
                }`}
              >
                <div className="h-24 bg-[var(--surface)] rounded flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src={src}
                    alt={`Product gallery ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-1 text-[10px] font-mono-spec">
                  {idx === 0 ? (
                    <span className="text-[var(--blue)] font-semibold uppercase">Primary #{idx + 1}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="text-[var(--muted)] hover:text-[var(--blue)] uppercase underline cursor-pointer"
                    >
                      Make Primary
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveAt(idx)}
                    aria-label={`Remove image ${idx + 1}`}
                    className="text-[var(--red)] hover:underline uppercase cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 flex items-center justify-center gap-2 text-xs text-[var(--muted)] bg-[var(--surface)] border border-[var(--line)] rounded">
            <ImagePlus className="w-4 h-4" aria-hidden="true" />
            <span>No product images yet. Upload files above or add a URL below.</span>
          </div>
        )}
      </div>

      {uploadStatus && (
        <p className="font-mono-spec text-[11px] text-[#138A36] dark:text-[#4ade80]">{uploadStatus}</p>
      )}
      {uploadError && (
        <p role="alert" className="text-xs font-medium text-[var(--red)]">
          {uploadError}
        </p>
      )}

      {/* Append URL / Path Input */}
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={500}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAppendUrl(urlInput);
            }
          }}
          placeholder="/images/prod-trigger-ts001.jpg or https://..."
          className="flex-1 px-3 py-2 rounded border-[1.5px] border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono-spec text-xs focus:outline-none focus:border-[var(--blue)]"
        />
        <button
          type="button"
          onClick={() => handleAppendUrl(urlInput)}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="px-3.5 py-2 rounded border-[1.5px] border-[var(--blue)] text-[var(--blue)] hover:bg-[color-mix(in_srgb,var(--blue)_12%,var(--surface))] disabled:opacity-50 font-mono-spec text-xs uppercase cursor-pointer shrink-0"
        >
          + Add URL
        </button>
      </div>

      {/* Quick-pick existing catalog assets */}
      <div className="flex flex-wrap gap-1.5">
        {samplePaths.map((sample) => (
          <button
            key={sample.path}
            type="button"
            onClick={() => handleAppendUrl(sample.path)}
            className="px-2 py-1 rounded border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--blue)] font-mono-spec text-[10px] text-[var(--muted)] cursor-pointer"
          >
            + {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
