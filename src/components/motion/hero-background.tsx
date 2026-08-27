"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function HeroBackground() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 100]);
  const scale = reduceMotion ? 1 : 1.06;

  useEffect(() => {
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;

    if (reduceMotion || saveData) {
      videoRef.current?.pause();
    }
  }, [reduceMotion]);

  return (
    <motion.div
      className="hero-media"
      style={{ y: reduceMotion ? 0 : y, scale }}
      initial={reduceMotion ? false : { opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      {videoFailed ? (
        <img
          className="hero-fallback"
          src="/media/hero-amazonia-poster.webp"
          alt=""
        />
      ) : (
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/hero-amazonia-poster.webp"
          onError={() => setVideoFailed(true)}
        >
          <source src="/media/hero-amazonia.mp4" type="video/mp4" />
        </video>
      )}
    </motion.div>
  );
}
