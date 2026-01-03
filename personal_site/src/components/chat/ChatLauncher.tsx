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
  const [isCompact, setIsCompact] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // The panel stays mounted for open/close animations; we only hide it once the close animation ends.
  // These class groups keep timing, easing, and transforms consistent across both states.
  const panelBaseClass =
    'relative flex w-full flex-col bg-card motion-reduce:transition-none lg:p-3';
  const panelSizeClass =
    'h-full w-full lg:h-[560px] lg:w-[480px] lg:max-w-[520px]';
  const panelShellClass =
    'border-0 shadow-none rounded-none lg:rounded-[var(--radius-lg)] lg:border lg:shadow-[var(--shadow-card)]';
  const panelTransformClass = isCompact
    ? ''
    : 'origin-bottom-right transform-gpu';
  const panelMotionClass = isCompact
    ? 'transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]'
    : 'duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] [animation-fill-mode:both]';
  const panelOpenClass = isCompact
    ? 'pointer-events-auto opacity-100'
    : 'pointer-events-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2';
  const panelCloseClass = isCompact
    ? 'pointer-events-none opacity-0'
    : 'pointer-events-none animate-out fade-out-0 zoom-out-95 slide-out-to-bottom-2';
  const panelHiddenClass = isCompact
    ? 'opacity-0'
    : 'opacity-0 scale-95 translate-y-2';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsCompact(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    const shouldLock = isOpen && isCompact;
    document.body.classList.toggle('chat-page-open', shouldLock);
    return () => document.body.classList.remove('chat-page-open');
  }, [isCompact, isOpen]);

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
          isOpen && 'shadow-[var(--shadow-glow)]',
          isCompact && isOpen && 'pointer-events-none opacity-0 scale-90'
        )}
        aria-expanded={isOpen}
        aria-pressed={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-hidden={isCompact && isOpen}
        tabIndex={isCompact && isOpen ? -1 : 0}
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
            'fixed left-0 right-0 top-0 z-[9997] flex items-stretch justify-stretch p-0',
            'h-[100dvh] min-h-[100svh]',
            'lg:inset-auto lg:h-auto lg:min-h-0 lg:bottom-24 lg:right-6 lg:items-end lg:justify-end lg:p-0',
            !isOpen && 'pointer-events-none'
          )}
          aria-hidden={!isOpen}
        >
          <section
            id={panelId}
            role="dialog"
            aria-label="Chat with Miguel"
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
            <div className="mb-3 flex items-center justify-between px-4 pt-4 text-sm font-semibold text-foreground lg:p-0">
              <span>Chat with Miguel</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-all duration-300 ease-in-out will-change-transform cursor-pointer hover:scale-[1.08] hover:shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] lg:hidden"
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
