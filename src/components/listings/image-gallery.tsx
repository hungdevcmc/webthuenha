"use client";

import { SafeImage } from "./safe-image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import type { ListingImage } from "@/lib/listings/types";
import { cn } from "@/lib/cn";

type Props = { images: ListingImage[]; title: string };

export function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const go = (delta: number) => setActive((i) => (count === 0 ? 0 : (i + delta + count) % count));

  // Đồng bộ chỉ số ảnh khi người dùng vuốt trên điện thoại
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setActive((prev) => (prev === index ? prev : index));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Cuộn tới ảnh đang chọn (khi bấm thumbnail)
  const scrollTo = (index: number) => {
    setActive(index);
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
  };

  // Phím tắt trong lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-stone-100 text-stone-400 sm:aspect-[16/9]">
        <ImageOff className="size-10" aria-hidden="true" />
        <span className="sr-only">Chưa có ảnh</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          className="snap-x-gallery flex aspect-[4/3] overflow-x-auto rounded-2xl bg-stone-100 sm:aspect-[16/9]"
          aria-roledescription="thư viện ảnh"
        >
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightbox(true)}
              className="relative h-full w-full shrink-0 cursor-zoom-in focus-visible:outline-none"
              aria-label={`Phóng to ảnh ${index + 1} / ${count}`}
            >
              <SafeImage
                src={img.url}
                alt={`${title} – ảnh ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 800px, 100vw"
                priority={index === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollTo((active - 1 + count) % count)}
              className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white sm:flex"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo((active + 1) % count)}
              className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white sm:flex"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white" aria-live="polite">
              {active + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Ảnh thu nhỏ">
          {images.map((img, index) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative block h-16 w-20 overflow-hidden rounded-lg border-2 transition-colors",
                  index === active ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100",
                )}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
              >
                <SafeImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ảnh ${active + 1} / ${count}`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setLightbox(false)}
        >
          <div className="flex items-center justify-between p-3 text-white">
            <span className="text-sm">
              {active + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Đóng"
              autoFocus
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <SafeImage
              src={images[active].url}
              alt={`${title} – ảnh ${active + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="size-7" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                  aria-label="Ảnh sau"
                >
                  <ChevronRight className="size-7" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
