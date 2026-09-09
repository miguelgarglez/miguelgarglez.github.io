import { MessageSquareIcon, XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  applyVisualViewportFrame,
  clearVisualViewportFrame,
  getVisualViewportFrame,
} from "@/lib/visual-viewport-frame";
import { cn } from "@/lib/utils";
import Chat from "./Chat";

type ChatLauncherProps = {
  primaryApiUrl: string;
  secondaryApiUrl?: string;
};

export default function ChatLauncher({
  primaryApiUrl,
  secondaryApiUrl,
}: ChatLauncherProps) {
  const COMPACT_CLOSE_DELAY_MS = 220;
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [suggestedPrompt, setSuggestedPrompt] = useState("");
  const [forceLauncherFocus, setForceLauncherFocus] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const lockedScrollYRef = useRef(0);

  // Once opened, the panel stays mounted for the lifetime of the page. Hiding the
  // shell instead of unmounting Chat preserves its in-memory conversation state.
  // These class groups keep timing, easing, and transforms consistent across states.
  const panelBaseClass =
    "relative flex w-full max-w-full flex-col bg-card motion-reduce:transition-none lg:p-3";
  const panelSizeClass =
    "h-full w-full lg:h-[min(700px,calc(100dvh-7.5rem))] lg:max-h-[700px] lg:w-[min(600px,calc(100vw-3rem))] lg:max-w-[600px]";
  const panelShellClass =
    "border-0 shadow-none rounded-none lg:rounded-[var(--radius-lg)] lg:border lg:shadow-[var(--shadow-card)]";
  const panelTransformClass = isCompact
    ? ""
    : "origin-bottom-right transform-gpu";
  const panelMotionClass = isCompact
    ? "transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
    : "duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [animation-fill-mode:both]";
  const panelOpenClass = isCompact
    ? "pointer-events-auto opacity-100"
    : "pointer-events-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2";
  const panelCloseClass = isCompact
    ? "pointer-events-none opacity-0"
    : "pointer-events-none animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-2";
  const panelHiddenClass = isCompact
    ? "opacity-0"
    : "opacity-0 scale-95 translate-y-2";
  const shouldRenderPanel = hasOpened;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const closePanel = ({ restoreFocusVisible = false } = {}) => {
    if (!isOpen) return;

    clearCloseTimeout();
    setForceLauncherFocus(restoreFocusVisible);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsOpen(false);

    if (isCompact) {
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsHidden(true);
        closeTimeoutRef.current = null;
      }, COMPACT_CLOSE_DELAY_MS);
    }
  };

  const openPanel = () => {
    if (isOpen) return;

    clearCloseTimeout();
    setForceLauncherFocus(false);

    if (!hasOpened) {
      setHasOpened(true);
      setIsHidden(false);
      setIsOpen(true);
      return;
    }

    setIsHidden(false);
    setIsOpen(true);
  };

  const togglePanel = () => {
    if (isOpen) {
      closePanel();
      return;
    }

    openPanel();
  };

  useEffect(() => {
    // Safari can mis-report this breakpoint after the page-content visibility toggle.
    // If we revisit the bug, this is the first place to harden the compact-mode decision.
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsCompact(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  useEffect(() => {
    const shouldLock = isOpen && isCompact;
    if (!shouldLock) {
      document.body.classList.remove("chat-page-open");
      document.body.style.top = "";
      return;
    }

    lockedScrollYRef.current = window.scrollY;
    document.body.classList.add("chat-page-open");
    document.body.style.top = `-${lockedScrollYRef.current}px`;

    return () => {
      document.body.classList.remove("chat-page-open");
      document.body.style.top = "";
      window.scrollTo(0, lockedScrollYRef.current);
    };
  }, [isCompact, isOpen]);

  // Keep the compact chat shell pinned to the visual viewport so the OS keyboard
  // only shrinks the chat column (header stays put, composer rises) instead of
  // panning the whole fixed page the way Safari does by default.
  useEffect(() => {
    if (!hasOpened || !isCompact) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    // While fully hidden, drop inline geometry so desktop/layout CSS can take over
    // cleanly on the next open. Keep syncing during the close fade so keyboard
    // dismiss does not jump the shell back to a stale full-height frame.
    if (!isOpen && isHidden) {
      clearVisualViewportFrame(overlay);
      return;
    }

    const syncFrame = () => {
      const frame = getVisualViewportFrame(window.visualViewport, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      applyVisualViewportFrame(overlay, frame);
    };

    syncFrame();

    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener("resize", syncFrame);
    visualViewport?.addEventListener("scroll", syncFrame);
    window.addEventListener("resize", syncFrame);
    window.addEventListener("orientationchange", syncFrame);

    return () => {
      visualViewport?.removeEventListener("resize", syncFrame);
      visualViewport?.removeEventListener("scroll", syncFrame);
      window.removeEventListener("resize", syncFrame);
      window.removeEventListener("orientationchange", syncFrame);
      clearVisualViewportFrame(overlay);
    };
  }, [hasOpened, isCompact, isHidden, isOpen]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (isOpen) {
      clearCloseTimeout();
      panel.removeAttribute("inert");
      return;
    }
    panel.setAttribute("inert", "");
  }, [hasOpened, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel({ restoreFocusVisible: true });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCompact, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const focusChat = () => {
        const textarea = panelRef.current?.querySelector("textarea");
        if (textarea instanceof HTMLTextAreaElement) {
          // preventScroll avoids the browser's default "scroll focused input into
          // view" pan, which is what makes the whole chat page jump on mobile.
          textarea.focus({ preventScroll: true });
        }
      };
      requestAnimationFrame(focusChat);
      return;
    }

    if (hasOpened) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  }, [hasOpened, isOpen]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      if (isOpen) {
        closePanel({ restoreFocusVisible: true });
        return;
      }
      togglePanel();
    };

    const handleOpen = () => openPanel();
    const handleClose = () => closePanel();
    const handleToggle = () => togglePanel();
    const handlePrompt = (event: Event) => {
      const prompt =
        event instanceof CustomEvent &&
        typeof event.detail?.prompt === "string"
          ? event.detail.prompt
          : "";
      if (prompt.trim()) {
        setSuggestedPrompt(prompt);
      }
      openPanel();
    };

    window.addEventListener("keydown", handleShortcut);
    window.addEventListener("cv-chat:open", handleOpen as EventListener);
    window.addEventListener("cv-chat:close", handleClose as EventListener);
    window.addEventListener("cv-chat:toggle", handleToggle as EventListener);
    window.addEventListener("cv-chat:prompt", handlePrompt);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("cv-chat:open", handleOpen as EventListener);
      window.removeEventListener("cv-chat:close", handleClose as EventListener);
      window.removeEventListener(
        "cv-chat:toggle",
        handleToggle as EventListener,
      );
      window.removeEventListener("cv-chat:prompt", handlePrompt);
    };
  }, [isOpen, hasOpened, isCompact]);

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed bottom-[calc(var(--safe-area-bottom)+1.5rem)] right-[calc(var(--safe-area-right)+1.5rem)] z-[9998] grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-card)] transition-all duration-300 ease-in-out will-change-transform lg:bottom-6 lg:right-6",
          "[--focus-radius:999px] cursor-pointer hover:scale-[1.08] hover:shadow-[var(--shadow-glow)] focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]",
          forceLauncherFocus &&
            "rounded-full ring-2 ring-[color:var(--focus-ring)] ring-offset-2 ring-offset-[color:var(--bg)]",
          isOpen && "shadow-[var(--shadow-glow)]",
          isCompact && isOpen && "pointer-events-none opacity-0 scale-90",
        )}
        aria-expanded={isOpen}
        aria-pressed={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Close agent" : "Open agent"}
        aria-hidden={isCompact && isOpen}
        tabIndex={isCompact && isOpen ? -1 : 0}
        onClick={togglePanel}
        onBlur={() => setForceLauncherFocus(false)}
        ref={buttonRef}
      >
        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-[transform,opacity,filter] duration-350 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isOpen
              ? "scale-85 opacity-0 blur-[5px]"
              : "scale-100 opacity-100 blur-0",
          )}
          aria-hidden={isOpen}
        >
          <MessageSquareIcon className="size-5" />
        </span>
        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-[transform,opacity,filter] duration-350 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isOpen
              ? "scale-100 opacity-100 blur-0"
              : "scale-85 opacity-0 blur-[5px]",
          )}
          aria-hidden={!isOpen}
        >
          <XIcon className="size-5" />
        </span>
      </button>

      {shouldRenderPanel && (
        <div
          ref={overlayRef}
          className={cn(
            "fixed left-0 right-0 top-0 z-[9997] flex items-stretch justify-stretch overscroll-none p-0",
            // Avoid min-h-[100svh]: on iOS it can keep the shell taller than the
            // keyboard-visible visual viewport and force a whole-page pan.
            "h-[100dvh]",
            "lg:inset-auto lg:h-auto lg:min-h-0 lg:bottom-24 lg:right-6 lg:max-w-[calc(100vw-3rem)] lg:items-end lg:justify-end lg:p-0",
            !isOpen && "pointer-events-none",
          )}
          aria-hidden={!isOpen}
        >
          <section
            id={panelId}
            role="dialog"
            aria-label="Chat with Miguel's AI assistant"
            aria-modal={isCompact || undefined}
            aria-hidden={!isOpen}
            className={cn(
              panelBaseClass,
              panelSizeClass,
              panelShellClass,
              panelTransformClass,
              panelMotionClass,
              // Keep the panel mounted so the close animation can finish before hiding it.
              isOpen ? panelOpenClass : panelCloseClass,
              isHidden && panelHiddenClass,
            )}
            ref={panelRef}
            onAnimationEnd={(event) => {
              if (event.currentTarget !== event.target) return;
              if (!isOpen && !isCompact) {
                setIsHidden(true);
              }
            }}
          >
            <div className="mb-3 flex items-center justify-between px-4 pt-4 text-sm font-semibold text-foreground lg:p-0">
              <span>Chat with Miguel's AI assistant</span>
              <button
                type="button"
                onClick={closePanel}
                className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition-all duration-300 ease-in-out will-change-transform [--focus-radius:999px] cursor-pointer hover:scale-[1.08] hover:shadow-[var(--shadow-glow)] focus-visible:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] lg:hidden"
                aria-label="Close chat"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <Chat
              primaryApiUrl={primaryApiUrl}
              secondaryApiUrl={secondaryApiUrl}
              className="flex-1 min-h-0 h-auto"
              autoFocus={isOpen}
              suggestedPrompt={suggestedPrompt}
            />
          </section>
        </div>
      )}
    </>
  );
}
