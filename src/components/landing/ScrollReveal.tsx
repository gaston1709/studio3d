"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps a section and reveals it (slide-up + fade via the `.reveal` keyframe)
 * the first time it enters the viewport. Under reduced motion it renders
 * visible immediately with no observer.
 */
export default function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduce || !el) {
      // No observer needed: reveal immediately (also covers reduced motion).
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
