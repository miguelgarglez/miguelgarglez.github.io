import type { DataUIPart } from 'ai';
import {
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  CornerDownRightIcon,
  ExternalLinkIcon,
  GithubIcon,
  LinkedinIcon,
  MapPinIcon,
  SparklesIcon,
  type LucideIcon,
} from 'lucide-react';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useStickToBottomContext } from 'use-stick-to-bottom';
import { cn } from '@/lib/utils';
import type {
  ContactCard,
  CvChatDataPartType,
  CvChatDataParts,
  ProjectCard,
  ProjectLinkKind,
} from '../../../../shared/chat-parts';

type ChatActions = {
  isBusy: boolean;
  sendPrompt: (prompt: string) => void;
};

export const ChatActionsContext = createContext<ChatActions>({
  isBusy: true,
  sendPrompt: () => undefined,
});

export type BrandIcon = { body: string; width: number; height: number };

export const BrandIconsContext = createContext<{ x?: BrandIcon }>({});

export const kickerClass =
  'font-mono text-[10.5px] uppercase tracking-[0.04em] text-[color:var(--primary)]';

const cardClass =
  'rounded-[var(--radius-md)] border border-[color:var(--border-muted)] bg-background';

const easeOutStrong = 'ease-[cubic-bezier(0.23,1,0.32,1)]';

// Keep in sync with the accordion's grid-template-rows duration below.
const ACCORDION_MS = 280;

const enterStyle = (index: number, delayMs = 0) =>
  ({
    '--cv-enter-index': index,
    '--cv-enter-delay': `${delayMs}ms`,
  }) as CSSProperties;

const pillLinkClass =
  'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-foreground no-underline transition-colors hover:border-[color:var(--primary)] hover:bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]';

const projectLinkMeta: Record<
  ProjectLinkKind,
  { label: string; icon: LucideIcon }
> = {
  live: { label: 'Live', icon: ExternalLinkIcon },
  repo: { label: 'Repo', icon: GithubIcon },
  'case-study': { label: 'Case study', icon: BookOpenIcon },
};

function PillLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={pillLinkClass}>
      {icon}
      {children}
    </a>
  );
}

function BrandIconSvg({ icon }: { icon: BrandIcon }) {
  return (
    <svg
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      fill="currentColor"
      aria-hidden
      className="size-3.5"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

export function ProjectLinks({ links }: { links: ProjectCard['links'] }) {
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((link) => {
        const { label, icon: Icon } = projectLinkMeta[link.kind];
        return (
          <PillLink
            key={link.kind}
            href={link.url}
            icon={<Icon className="size-3.5" aria-hidden />}
          >
            {label}
          </PillLink>
        );
      })}
    </div>
  );
}

export function StackPills({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {stack.map((item) => (
        <span
          key={item}
          className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SourcesPart({ data }: { data: CvChatDataParts['sources'] }) {
  if (!data.items.length) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      style={{ '--cv-enter-stagger': '30ms' } as CSSProperties}
    >
      <span className="cv-chat-enter mr-0.5 inline-flex items-center gap-1.5">
        <SparklesIcon
          className="size-3.5 text-[color:var(--primary)]"
          aria-hidden
        />
        Grounded in
      </span>
      {data.items.map((item, index) => (
        <span
          key={item.id}
          className="cv-chat-enter rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px]"
          style={enterStyle(index + 1)}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ProjectThumb({ project }: { project: ProjectCard }) {
  const thumbClass =
    'size-13 shrink-0 rounded-[var(--radius-sm)] border border-[color:var(--border-muted)] bg-muted';
  if (!project.image) {
    return (
      <span
        aria-hidden
        className={cn(
          thumbClass,
          'grid place-items-center font-mono text-base text-muted-foreground'
        )}
      >
        {project.name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={project.image.src}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn(thumbClass, 'object-cover object-top')}
    />
  );
}

function revealRow(row: HTMLElement, reduceMotion: boolean) {
  const scroller = row.closest('[role="log"]');
  if (!scroller) return;
  const rowBottom = row.getBoundingClientRect().bottom;
  if (rowBottom <= scroller.getBoundingClientRect().bottom) return;
  row.scrollIntoView({
    block: 'nearest',
    behavior: reduceMotion ? 'auto' : 'smooth',
  });
}

function ProjectRow({
  project,
  index,
  open,
  onToggle,
}: {
  project: ProjectCard;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const rowRef = useRef<HTMLLIElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // React 18 has no `inert` prop; this keeps collapsed links out of the tab order.
    panelRef.current?.toggleAttribute('inert', !open);
    if (!open) return;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const id = window.setTimeout(
      () => rowRef.current && revealRow(rowRef.current, reduceMotion),
      reduceMotion ? 0 : ACCORDION_MS
    );
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <li
      ref={rowRef}
      style={enterStyle(index)}
      className={cn(
        'cv-chat-enter relative border-t border-[color:var(--border-muted)] first:border-t-0',
        // The ring lives on the whole row, inset so the list's rounded overflow does not clip it.
        'after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:shadow-[inset_0_0_0_2px_var(--focus-ring)] first:after:rounded-t-[calc(var(--radius-md)-1px)] last:after:rounded-b-[calc(var(--radius-md)-1px)] has-[>button:focus-visible]:after:opacity-100'
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start gap-3 px-3.5 py-3 text-left transition-colors duration-150 ease-out [--focus-radius:0px] hover:bg-[color:color-mix(in_srgb,var(--primary)_5%,transparent)] active:bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] focus-visible:shadow-none!"
      >
        <ProjectThumb project={project} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={kickerClass}>
            {project.year} · {project.status}
          </span>
          <span className="text-[0.92rem] font-semibold text-foreground">
            {project.name}
          </span>
          <span className="line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground">
            {project.description}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
            easeOutStrong,
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        id={panelId}
        ref={panelRef}
        className={cn(
          'grid transition-[grid-template-rows] duration-280 motion-reduce:transition-none',
          easeOutStrong,
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'flex flex-col gap-3 px-3.5 pb-4 pt-0.5 transition-[opacity,translate] motion-reduce:translate-none motion-reduce:transition-none sm:pl-[4.875rem]',
              easeOutStrong,
              open
                ? 'translate-y-0 opacity-100 delay-80 duration-220'
                : 'translate-y-1 opacity-0 duration-120'
            )}
          >
            <p className="text-[0.84rem] leading-relaxed text-foreground">
              {project.summary}
            </p>
            {project.capabilities.length > 0 && (
              <ul className="list-disc space-y-1 pl-4 text-[0.82rem] leading-relaxed text-muted-foreground">
                {project.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            )}
            <StackPills stack={project.stack} />
            <ProjectLinks links={project.links} />
          </div>
        </div>
      </div>
    </li>
  );
}

function ProjectsPart({ data }: { data: CvChatDataParts['projects'] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const { stopScroll } = useStickToBottomContext();

  const toggle = (slug: string) => {
    // Otherwise the pinned log follows the growth and drags the tapped row
    // upward; revealRow scrolls only as far as needed and re-pins at the bottom.
    if (openSlug !== slug) stopScroll();
    setOpenSlug((current) => (current === slug ? null : slug));
  };

  return (
    <ul className={cn(cardClass, 'cv-chat-fade-in overflow-hidden')}>
      {data.items.map((project, index) => (
        <ProjectRow
          key={project.slug}
          project={project}
          index={index}
          open={openSlug === project.slug}
          onToggle={() => toggle(project.slug)}
        />
      ))}
    </ul>
  );
}

export function TimelinePart({ data }: { data: CvChatDataParts['timeline'] }) {
  return (
    <ol className={cn(cardClass, 'px-4 pb-1.5 pt-4')}>
      {data.items.map((role, index) => (
        <li
          key={`${role.title}-${role.company}`}
          style={enterStyle(index)}
          className="cv-chat-enter relative pb-4 pl-6.5 before:absolute before:bottom-0 before:left-[5px] before:top-[18px] before:w-px before:bg-border last:before:hidden"
        >
          <span
            aria-hidden
            className={cn(
              'absolute left-0 top-[5px] size-[11px] rounded-full border-2 border-border bg-background',
              role.current &&
                'border-[color:var(--primary)] bg-[color:var(--primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_22%,transparent)]'
            )}
          />
          <div className="flex items-baseline justify-between gap-2.5">
            <span className="text-[0.9rem] font-semibold text-foreground">
              {role.title}
              {role.current && (
                <span className="ml-1.5 rounded-md bg-[color:color-mix(in_srgb,var(--primary)_18%,transparent)] px-1.5 py-0.5 align-[2px] font-mono text-[10px] text-[color:var(--primary)]">
                  Now
                </span>
              )}
            </span>
            <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
              {role.period}
            </span>
          </div>
          <div className="text-[0.82rem] text-[color:var(--primary)]">
            {role.company}
          </div>
          <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground">
            {role.summary}
          </p>
        </li>
      ))}
    </ol>
  );
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function ContactPart({ data }: { data: ContactCard }) {
  const { x: xIcon } = useContext(BrandIconsContext);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copyEmail = () => {
    navigator.clipboard
      ?.writeText(data.email)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  return (
    <div
      className={cn(
        cardClass,
        'cv-chat-enter grid grid-cols-[auto_1fr] items-center gap-3.5 p-4'
      )}
    >
      <div
        aria-hidden
        className="grid size-12 place-items-center rounded-full bg-[linear-gradient(135deg,var(--primary),color-mix(in_srgb,var(--primary)_40%,var(--secondary)))] font-semibold text-[color:var(--primary-foreground)]"
      >
        {initialsOf(data.name)}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-foreground">{data.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPinIcon className="size-3.5" aria-hidden />
          {data.location}
        </div>
      </div>
      <div className="col-span-full flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={copyEmail}
          className={cn(
            pillLinkClass,
            'cursor-pointer',
            copied &&
              'border-[color:var(--success)] text-[color:var(--success)] hover:border-[color:var(--success)]'
          )}
          aria-label={copied ? 'Email copied' : `Copy email ${data.email}`}
        >
          {copied ? (
            <CheckIcon className="size-3.5" aria-hidden />
          ) : (
            <CopyIcon className="size-3.5" aria-hidden />
          )}
          {copied ? 'Copied' : data.email}
        </button>
        <PillLink
          href={data.linkedin}
          icon={<LinkedinIcon className="size-3.5" aria-hidden />}
        >
          LinkedIn
        </PillLink>
        <PillLink href={data.x} icon={xIcon && <BrandIconSvg icon={xIcon} />}>
          X
        </PillLink>
      </div>
    </div>
  );
}

// Lets the answer's card land first when follow-ups arrive in the same frame.
const FOLLOWUPS_DELAY_MS = 180;

function FollowupsPart({ data }: { data: CvChatDataParts['followups'] }) {
  const { isBusy, sendPrompt } = useContext(ChatActionsContext);
  if (!data.prompts.length) return null;
  return (
    <div
      className="flex flex-wrap gap-1.5"
      style={{ '--cv-enter-stagger': '40ms' } as CSSProperties}
    >
      {data.prompts.map((prompt, index) => (
        <button
          type="button"
          key={prompt}
          disabled={isBusy}
          onClick={() => sendPrompt(prompt)}
          style={enterStyle(index, FOLLOWUPS_DELAY_MS)}
          className="cv-chat-enter inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-[color:var(--primary)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50"
        >
          <CornerDownRightIcon className="size-3.5 shrink-0" aria-hidden />
          {prompt}
        </button>
      ))}
    </div>
  );
}

const dataPartRenderers: {
  [K in CvChatDataPartType]: ComponentType<{ data: CvChatDataParts[K] }>;
} = {
  sources: SourcesPart,
  projects: ProjectsPart,
  timeline: TimelinePart,
  contact: ContactPart,
  followups: FollowupsPart,
};

export function DataPart({ part }: { part: DataUIPart<CvChatDataParts> }) {
  const type = part.type.slice('data-'.length) as CvChatDataPartType;
  const Renderer = dataPartRenderers[type] as
    | ComponentType<{ data: unknown }>
    | undefined;
  return Renderer ? <Renderer data={part.data} /> : null;
}
