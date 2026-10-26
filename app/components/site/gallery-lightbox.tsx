"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";

type GalleryImage = {
  id: string | number;
  imageUrl: string;
  altText: string | null;
};

/**
 * Galeri gambar + lightbox. useState/useEffect sebelumnya ada di PortfolioDetail;
 * dipisah ke client component supaya halaman tetap Server Component. Markup &
 * perilaku (keyboard, swipe, focus tutup, overflow body) identik dengan lama.
 */
export function GalleryLightbox({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpenIndex(null);

  const showPrev = () =>
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));

  const showNext = () =>
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex, images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) showPrev();
      else showNext();
    }

    setTouchStartX(null);
  };

  const altFor = (img: GalleryImage, index: number) =>
    img.altText ?? `${title}, tampilan ${index + 1}`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Perbesar gambar ${index + 1} dari ${images.length}`}
            className="group aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-slate-100"
          >
            <img
              src={resizeImage(img.imageUrl, 400) ?? undefined}
              srcSet={buildSrcSet(img.imageUrl, 400) ?? undefined}
              sizes="(max-width: 639px) 50vw, 33vw"
              alt={altFor(img, index)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && images[openIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute right-4 top-4 p-2 text-white/80 hover:text-white"
          >
            <X size={28} aria-hidden="true" />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Sebelumnya"
              className="absolute left-2 p-2 text-white/80 hover:text-white md:left-6"
            >
              <ChevronLeft size={32} aria-hidden="true" />
            </button>
          )}

          <img
            src={resizeImage(images[openIndex].imageUrl, 1200) ?? undefined}
            alt={altFor(images[openIndex], openIndex)}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full select-none rounded-lg object-contain"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Berikutnya"
              className="absolute right-2 p-2 text-white/80 hover:text-white md:right-6"
            >
              <ChevronRight size={32} aria-hidden="true" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
              {openIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
