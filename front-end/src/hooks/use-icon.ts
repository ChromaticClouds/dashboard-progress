import { useCallback, useEffect, useRef } from "react";
import { useIconIndexStore, useSectionRefStore } from "@stores/use-icon-index.store";

export const useIcon = () => {
  const { iconIndex, setIconIndex } = useIconIndexStore();
  const { sectionRefs } = useSectionRefStore();

  const observerRef = useRef<IntersectionObserver | null>(null);

  const iconClick = (index: number) => {
    const sectionElement = sectionRefs.current[index];
    if (sectionElement) sectionElement.scrollIntoView({ behavior: "smooth" });
    setIconIndex(iconIndex);
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        const firstVisibleEntry = visibleEntries[0];
        const index = sectionRefs.current.indexOf(firstVisibleEntry.target);
        if (index !== -1) {
          setIconIndex(index);
        }
      }
    }, { threshold: 0.4 });
  
    return () => {
      observerRef.current?.disconnect();
    };
  }, [setIconIndex]);

  const setSectionRef = useCallback((node: Element | null, index: number) => {
    if (node) {
      sectionRefs.current[index] = node;
      observerRef.current?.observe(node);
    }
  }, []);

  return { iconIndex, iconClick, setSectionRef }
}