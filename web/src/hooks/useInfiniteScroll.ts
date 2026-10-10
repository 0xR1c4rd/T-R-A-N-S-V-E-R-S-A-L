import { useEffect, useRef, type RefObject } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  rootMargin?: string;
}

/**
 * Détecte quand un élément "sentinelle" (placé en bas d'une liste) devient
 * visible à l'écran, et appelle `onIntersect` dans ce cas. Utilisé pour
 * charger automatiquement la page suivante d'un catalogue au scroll,
 * plutôt que d'utiliser des boutons Précédent/Suivant.
 */
export function useInfiniteScroll(
  onIntersect: () => void,
  { hasMore, isLoading, rootMargin = "200px" }: UseInfiniteScrollOptions
): RefObject<HTMLDivElement> {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const element = sentinelRef.current;
    if (element === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting === true) {
          onIntersect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onIntersect, hasMore, isLoading, rootMargin]);

  return sentinelRef;
}