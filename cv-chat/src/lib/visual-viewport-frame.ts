export type VisualViewportLike = {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  height: number;
};

export type VisualViewportFrame = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type VisualViewportFallback = {
  width: number;
  height: number;
};

/**
 * Map visualViewport geometry into a fixed-position frame.
 *
 * Mobile browsers (especially iOS Safari) often keep the layout viewport tall
 * when the OS keyboard opens and pan/offset the visual viewport instead. Pinning
 * a chat shell to this frame keeps the header stable and the composer above the
 * keyboard without shifting the whole page like a document scroll.
 */
export function getVisualViewportFrame(
  viewport: VisualViewportLike | null | undefined,
  fallback: VisualViewportFallback
): VisualViewportFrame {
  if (!viewport) {
    return {
      top: 0,
      left: 0,
      width: Math.max(0, fallback.width),
      height: Math.max(0, fallback.height),
    };
  }

  return {
    top: Math.max(0, viewport.offsetTop),
    left: Math.max(0, viewport.offsetLeft),
    width: Math.max(0, viewport.width),
    height: Math.max(0, viewport.height),
  };
}

export function applyVisualViewportFrame(
  element: HTMLElement,
  frame: VisualViewportFrame
): void {
  element.style.top = `${frame.top}px`;
  element.style.left = `${frame.left}px`;
  element.style.width = `${frame.width}px`;
  element.style.height = `${frame.height}px`;
  element.style.right = "auto";
  element.style.bottom = "auto";
  element.style.minHeight = "0px";
}

export function clearVisualViewportFrame(element: HTMLElement): void {
  element.style.top = "";
  element.style.left = "";
  element.style.width = "";
  element.style.height = "";
  element.style.right = "";
  element.style.bottom = "";
  element.style.minHeight = "";
}
