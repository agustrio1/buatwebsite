import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

export function ImageUploadField({
  name,
  label,
  hint,
  defaultValue,
  aspect = "aspect-video",
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | null;
  aspect?: string;
}) {
  const [value, setValue] = useState<string | null>(defaultValue ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string };

      if (data?.url) {
        setValue(data.url);
      } else {
        setError("Upload gagal, coba lagi");
      }
    } catch {
      setError("Upload gagal, coba lagi");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function handleRemove() {
    setValue(null);
    setError(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-700">{label}</label>

      <input type="hidden" name={name} value={value ?? ""} />

      <div
        className={`relative ${aspect} w-full max-w-xs rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
          value ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/30"
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-contain p-2" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white shadow-sm transition-colors"
              aria-label="Hapus gambar"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 size={22} className="animate-spin text-brand-500" />
                <span className="text-xs font-medium">Mengupload...</span>
              </>
            ) : (
              <>
                <ImagePlus size={22} />
                <span className="text-xs font-medium">Klik untuk pilih gambar</span>
              </>
            )}
          </button>
        )}
      </div>

      {value && !isUploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Ganti gambar
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}