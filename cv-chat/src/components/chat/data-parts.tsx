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
  TwitterIcon,
  type LucideIcon,
} from 'lucide-react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
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

const kickerClass =
  'font-mono text-[10.5px] uppercase tracking-[0.04em] text-[color:var(--primary)]';

const cardClass =
  'rounded-[var(--radius-md)] border border-[color:var(--border-muted)] bg-background';

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
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={pillLinkClass}>
      <Icon className="size-3.5" aria-hidden />
      {children}
    </a>
  );
}

function ProjectLinks({ links }: { links: ProjectCard['links'] }) {
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((link) => {
        const meta = projectLinkMeta[link.kind];
        return (
          <PillLink key={link.kind} href={link.url} icon={meta.icon}>
            {meta.label}
          </PillLink>
        );
      })}
    </div>
  );
}

function StackPills({ stack }: { stack: string[] }) {
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
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <span className="mr-0.5 inline-flex items-center gap-1.5">
        <SparklesIcon
          className="size-3.5 text-[color:var(--primary)]"
          aria-hidden
        />
        Grounded in
      </span>
      {data.items.map((item) => (
        <span
          key={item.id}
          className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px]"
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ProjectCardView({
  project,
  open,
  onToggle,
}: {
  project: ProjectCard;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        cardClass,
        'flex shrink-0 snap-start flex-col gap-2.5 p-3.5 transition-[border-color,box-shadow] duration-200 hover:border-[color:color-mix(in_srgb,var(--primary)_70%,var(--border))] hover:shadow-[var(--shadow-card)] sm:w-auto',
        open ? 'w-[92%] sm:col-span-2' : 'w-[78%]'
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex cursor-pointer flex-col gap-1.5 rounded-[var(--radius-sm)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
      >
        <span className={cn(kickerClass, 'flex items-center justify-between')}>
          <span>
            {project.year} · {project.status}
          </span>
          <ChevronDownIcon
            className={cn('size-3.5 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </span>
        <span className="text-[0.92rem] font-semibold text-foreground">
          {project.name}
        </span>
        <span
          className={cn(
            'text-[0.82rem] leading-relaxed text-muted-foreground',
            !open && 'line-clamp-3'
          )}
        >
          {open ? project.summary : project.description}
        </span>
      </button>
      {open && (
        <ul className="list-disc space-y-1 pl-4 text-[0.82rem] leading-relaxed text-muted-foreground">
          {project.capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-col gap-2.5">
        <StackPills stack={project.stack} />
        <ProjectLinks links={project.links} />
      </div>
    </article>
  );
}

function ProjectsPart({ data }: { data: CvChatDataParts['projects'] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-1.5 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
      {data.items.map((project) => (
        <ProjectCardView
          key={project.slug}
          project={project}
          open={openSlug === project.slug}
          onToggle={() =>
            setOpenSlug((current) =>
              current === project.slug ? null : project.slug
            )
          }
        />
      ))}
    </div>
  );
}

function TimelinePart({ data }: { data: CvChatDataParts['timeline'] }) {
  return (
    <ol className={cn(cardClass, 'px-4 pb-1.5 pt-4')}>
      {data.items.map((role) => (
        <li
          key={`${role.title}-${role.company}`}
          className="relative pb-4 pl-6.5 before:absolute before:bottom-0 before:left-[5px] before:top-[18px] before:w-px before:bg-border last:before:hidden"
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

function ContactPart({ data }: { data: ContactCard }) {
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
    <div className={cn(cardClass, 'grid grid-cols-[auto_1fr] items-center gap-3.5 p-4')}>
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
        <PillLink href={data.linkedin} icon={LinkedinIcon}>
          LinkedIn
        </PillLink>
        <PillLink href={data.x} icon={TwitterIcon}>
          X
        </PillLink>
      </div>
    </div>
  );
}

function FollowupsPart({ data }: { data: CvChatDataParts['followups'] }) {
  const { isBusy, sendPrompt } = useContext(ChatActionsContext);
  if (!data.prompts.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {data.prompts.map((prompt) => (
        <button
          type="button"
          key={prompt}
          disabled={isBusy}
          onClick={() => sendPrompt(prompt)}
          className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-[color:var(--primary)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50"
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
