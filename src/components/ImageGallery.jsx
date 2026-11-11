import { useEffect, useState } from 'react';
import { fileUrl } from '../services/api';

/** Large image with thumbnail strip and prev/next controls. */
export default function ImageGallery({ images = [], alt = 'Property' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [images.length]);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-surface text-neutral-400">
        No photos available
      </div>
    );
  }

  const go = (dir) => setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface">
        <img src={fileUrl(images[index])} alt={`${alt} ${index + 1}`} className="h-full w-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card hover:bg-white"
            >
              <svg className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card hover:bg-white"
            >
              <svg className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setIndex(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === index ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={fileUrl(img)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
