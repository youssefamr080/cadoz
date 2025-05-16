import { useEffect, RefObject } from 'react';

interface KeyboardNavigationProps {
  containerRef: RefObject<HTMLElement>;
  itemSelector: string;
  selectedIndex: number;
  setSelectedIndex: (index: number | ((prevIndex: number) => number)) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  isActive?: boolean;
}

/**
 * A custom hook that provides keyboard navigation for a list of items
 * @param props Configuration options for keyboard navigation
 */
export function useKeyboardNavigation({
  containerRef,
  itemSelector,
  selectedIndex,
  setSelectedIndex,
  onEnter,
  onEscape,
  isActive = true
}: KeyboardNavigationProps): void {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = containerRef.current.querySelectorAll(itemSelector);
      if (!items.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prevIndex: number) => {
            const nextIndex = prevIndex + 1;
            return nextIndex >= items.length ? 0 : nextIndex;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prevIndex: number) => {
            const nextIndex = prevIndex - 1;
            return nextIndex < 0 ? items.length - 1 : nextIndex;
          });
          break;

        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < items.length && onEnter) {
            e.preventDefault();
            onEnter();
          }
          break;

        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, itemSelector, selectedIndex, setSelectedIndex, onEnter, onEscape, isActive]);

  // Scroll selected item into view
  useEffect(() => {
    if (!isActive || selectedIndex < 0 || !containerRef.current) return;

    const items = containerRef.current.querySelectorAll(itemSelector);
    if (selectedIndex >= items.length) return;

    const selectedItem = items[selectedIndex] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex, containerRef, itemSelector, isActive]);
}
