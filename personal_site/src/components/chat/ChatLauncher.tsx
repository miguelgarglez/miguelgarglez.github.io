import { MessageSquareIcon, XIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Chat from './Chat';

type ChatLauncherProps = {
  apiUrl: string;
};

export default function ChatLauncher({ apiUrl }: ChatLauncherProps) {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // The panel stays mounted for open/close animations; we only hide it once the close animation ends.
  // These class groups keep timing, easing, and transforms consistent across both states.
  const panelBaseClass =
    'relative flex w-full max-w-[520px] flex-col origin-bottom-right transform-gpu rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-card)] motion-reduce:transition-none';
  const panelSizeClass = 'h-[78vh] sm:h-[560px] sm:w-[480px]';
  const panelMotionClass =
    'duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [animation-fill-mode:both]';
  const panelOpenClass =
    'pointer-events-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2';
  const panelCloseClass =
    'pointer-events-none animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-2';
  const panelHiddenClass = 'opacity-0 scale-95 translate-y-2';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('chat-overlay-open', isOpen);
    return () => document.body.classList.remove('chat-overlay-open');
  }, [isOpen]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (isOpen) {
      panel.removeAttribute('inert');
      return;
    }
    panel.setAttribute('inert', '');
  }, [hasOpened, isOpen]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (isOpen) {
      overlay.removeAttribute('inert');
      return;
    }
    overlay.setAttribute('inert', '');
  }, [hasOpened, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const focusChat = () => {
        const textarea = panelRef.current?.querySelector('textarea');
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.focus();
        }
      };
      requestAnimationFrame(focusChat);
      return;
    }

    if (hasOpened) {
      buttonRef.current?.focus();
    }
  }, [hasOpened, isOpen]);

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (!hasOpened) {
      setHasOpened(true);
      setIsHidden(false);
      requestAnimationFrame(() => setIsOpen(true));
      return;
    }

    setIsHidden(false);
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          'fixed bottom-6 right-6 z-[9998] grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-card)] transition-all duration-300 ease-in-out will-change-transform',
          'cursor-pointer hover:scale-[1.08] hover:shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]',
          isOpen && 'shadow-[var(--shadow-glow)]'
        )}
        aria-expanded={isOpen}
        aria-pressed={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        onClick={toggleOpen}
        ref={buttonRef}
      >
        <span
          className={cn(
            'absolute inset-0 grid place-items-center transition-[transform,opacity,filter] duration-350 ease-[cubic-bezier(0.23,1,0.32,1)]',
            isOpen
              ? 'scale-85 opacity-0 blur-[5px]'
              : 'scale-100 opacity-100 blur-0'
          )}
          aria-hidden={isOpen}
        >
          <MessageSquareIcon className="size-5" />
        </span>
        <span
          className={cn(
            'absolute inset-0 grid place-items-center transition-[transform,opacity,filter] duration-350 ease-[cubic-bezier(0.23,1,0.32,1)]',
            isOpen
              ? 'scale-100 opacity-100 blur-0'
              : 'scale-85 opacity-0 blur-[5px]'
          )}
          aria-hidden={!isOpen}
        >
          <XIcon className="size-5" />
        </span>
      </button>

      {hasOpened && (
        <div
          className={cn(
            'fixed inset-0 z-[9997] flex items-center justify-center p-4 sm:inset-auto sm:bottom-24 sm:right-6 sm:items-end sm:justify-end sm:p-0',
            !isOpen && 'pointer-events-none'
          )}
          aria-hidden={!isOpen}
          ref={overlayRef}
        >
          <div
            className={cn(
              'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] sm:hidden motion-reduce:transition-none',
              isOpen ? 'opacity-100' : 'opacity-0'
            )}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <section
            id={panelId}
            role="dialog"
            aria-label="Chat with Miguel"
            aria-modal={isMobile || undefined}
            aria-hidden={!isOpen}
            className={cn(
              panelBaseClass,
              panelSizeClass,
              panelMotionClass,
              // Keep the panel mounted so the close animation can finish before hiding it.
              isOpen ? panelOpenClass : panelCloseClass,
              isHidden && panelHiddenClass
            )}
            ref={panelRef}
            onAnimationEnd={(event) => {
              if (event.currentTarget !== event.target) return;
              if (!isOpen) {
                setIsHidden(true);
              }
            }}
          >
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-foreground">
              <span>Chat with Miguel</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-all duration-300 ease-in-out will-change-transform cursor-pointer hover:scale-[1.08] hover:shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] sm:hidden"
                aria-label="Close chat"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <Chat
              apiUrl={apiUrl}
              className="flex-1 min-h-0 h-auto"
              autoFocus={isOpen}
            />
          </section>
        </div>
      )}
    </>
  );
}
