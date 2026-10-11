"use client";

import { useEffect } from "react";

export function MotionObserver() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroVideo = document.querySelector<HTMLVideoElement>("[data-hero-video]");

    if (reduceMotion) {
      heroVideo?.pause();
      return;
    }

    const root = document.documentElement;
    const sections = document.querySelectorAll<HTMLElement>("main > section");
    root.classList.add("motion-ready");
    sections.forEach((section) => section.classList.add("revealSection"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    sections.forEach((section) => observer.observe(section));

    const videoObserver = heroVideo ? new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) {
        void heroVideo.play().catch(() => undefined);
      } else {
        heroVideo.pause();
      }
    }, { threshold: 0.01 }) : null;
    if (heroVideo) videoObserver?.observe(heroVideo);

    const syncVideoWithTab = () => {
      if (!heroVideo) return;
      if (document.hidden) heroVideo.pause();
      else if (heroVideo.getBoundingClientRect().bottom > 0) void heroVideo.play().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", syncVideoWithTab);

    return () => {
      observer.disconnect();
      videoObserver?.disconnect();
      document.removeEventListener("visibilitychange", syncVideoWithTab);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
