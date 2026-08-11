"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ListingGallery.module.css";

type GalleryImage = { id: string; url: string; alt: string | null };

export default function ListingGallery({ images, title, locale }: { images: GalleryImage[]; title: string; locale: "fr" | "en" }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStart = useRef<number | null>(null);

  const previous = () => setIndex((current) => (current - 1 + images.length) % images.length);
  const next = () => setIndex((current) => (current + 1) % images.length);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowLeft" && images.length > 1) previous();
      if (event.key === "ArrowRight" && images.length > 1) next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen, images.length]);

  if (!images.length) return null;

  function onTouchStart(event: React.TouchEvent) {
    touchStart.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    if (touchStart.current === null || images.length < 2) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const distance = end - touchStart.current;
    if (Math.abs(distance) > 45) distance > 0 ? previous() : next();
    touchStart.current = null;
  }

  const current = images[index];
  const alt = current.alt ?? `${title} — ${locale === "fr" ? "photo" : "photo"} ${index + 1}`;

  return <>
    <section className={styles.gallery} aria-label={locale === "fr" ? "Galerie photos" : "Photo gallery"} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button type="button" className={styles.mainImage} onClick={() => setFullscreen(true)} aria-label={locale === "fr" ? "Afficher la photo en plein écran" : "View photo full screen"}>
        <img src={current.url} alt={alt} />
      </button>
      {images.length > 1 && <>
        <button type="button" className={`${styles.arrow} ${styles.left}`} onClick={previous} aria-label={locale === "fr" ? "Photo précédente" : "Previous photo"}>‹</button>
        <button type="button" className={`${styles.arrow} ${styles.right}`} onClick={next} aria-label={locale === "fr" ? "Photo suivante" : "Next photo"}>›</button>
        <span className={styles.counter}>{index + 1} / {images.length}</span>
        <div className={styles.dots} aria-hidden="true">{images.map((image, dotIndex) => <button type="button" key={image.id} className={dotIndex === index ? styles.activeDot : styles.dot} onClick={() => setIndex(dotIndex)} tabIndex={-1} />)}</div>
        <div className={styles.thumbnails}>{images.map((image, thumbIndex) => <button type="button" key={image.id} className={thumbIndex === index ? styles.activeThumb : styles.thumb} onClick={() => setIndex(thumbIndex)}><img src={image.url} alt="" /></button>)}</div>
      </>}
    </section>
    {fullscreen && <div className={styles.fullscreen} role="dialog" aria-modal="true" aria-label={locale === "fr" ? "Galerie en plein écran" : "Full-screen gallery"} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button type="button" className={styles.close} onClick={() => setFullscreen(false)} aria-label={locale === "fr" ? "Fermer" : "Close"}>×</button>
      <img src={current.url} alt={alt} />
      {images.length > 1 && <><button type="button" className={`${styles.fullArrow} ${styles.left}`} onClick={previous}>‹</button><button type="button" className={`${styles.fullArrow} ${styles.right}`} onClick={next}>›</button><span className={styles.fullCounter}>{index + 1} / {images.length}</span></>}
    </div>}
  </>;
}
