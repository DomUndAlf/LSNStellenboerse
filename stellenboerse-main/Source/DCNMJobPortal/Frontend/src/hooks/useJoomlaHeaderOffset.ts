import { useState, useEffect } from "react";

/**
 * Custom hook to detect and track Joomla sticky header height.
 * Returns the header height in pixels that can be used to offset fixed UI elements.
 * If no header is found, returns 0 (safe for standalone React app deployment).
 */
export function useJoomlaHeaderOffset(): number {
  const [headerOffset, setHeaderOffset] = useState<number>(0);

  useEffect(() => {
    const measureHeader = () => {
      // Try multiple times with delays to handle dynamic loading
      const attemptMeasure = () => {
        // Primary selector: Astroid sticky header by ID
        let header = document.getElementById("astroid-sticky-header");

        // Fallback: Try by class name
        if (!header) {
          header = document.querySelector(".astroid-header-sticky") as HTMLElement;
        }

        // Additional fallback: any sticky/fixed header
        if (!header) {
          header = document.querySelector("header.sticky, header.fixed") as HTMLElement;
        }

        if (header) {
          const rect = header.getBoundingClientRect();
          // Only measure if header is visible at top of viewport
          if (rect.top === 0 && rect.height > 0) {
            setHeaderOffset(rect.height);
            return true;
          }
        }
        setHeaderOffset(0);
        return false;
      };

      // Try immediately
      if (!attemptMeasure()) {
        // Try after short delay for DOM updates
        setTimeout(attemptMeasure, 100);
        // Try after longer delay for animations
        setTimeout(attemptMeasure, 500);
      }
    };

    // Initial measurement
    measureHeader();

    // Re-measure on window resize, scroll, and orientation change
    const handleUpdate = () => {
      measureHeader();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate);
    window.addEventListener("orientationchange", handleUpdate);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("orientationchange", handleUpdate);
    };
  }, []);

  return headerOffset;
}
