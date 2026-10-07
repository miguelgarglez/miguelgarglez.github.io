import { ArrowRightIcon } from 'lucide-react';
import type { ProjectCard } from '../../../../shared/chat-parts';
import { cn } from '@/lib/utils';
import { boardKindLabel, type BoardItem } from './board';
import {
  ContactPart,
  kickerClass,
  ProjectLinks,
  StackPills,
  TimelinePart,
} from './data-parts';

export type BoardFocusProps = {
  focusedKey: string | null;
  onFocus: (key: string) => void;
};

const focusRingClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]';

export function BoardRefs({
  items,
  focusedKey,
  onFocus,
}: BoardFocusProps & { items: BoardItem[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <button
          type="button"
          key={item.key}
          aria-current={item.key === focusedKey || undefined}
          onClick={() => onFocus(item.key)}
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border-muted)] bg-background px-3 py-2 text-left text-[0.84rem] transition-colors hover:border-[color:var(--primary)] aria-[current=true]:border-[color:var(--primary)]',
            focusRingClass
          )}
        >
          <span className={cn(kickerClass, 'min-w-[5.75rem]')}>
            {boardKindLabel[item.kind]}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
            {item.title}
          </span>
          <ArrowRightIcon
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

function FocusHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <>
      <p className={kickerClass}>{kicker}</p>
      <h3 className="mt-1.5 text-2xl font-medium tracking-[-0.03em] text-foreground">
        {title}
      </h3>
    </>
  );
}

function ProjectFocus({ project }: { project: ProjectCard }) {
  return (
    <>
      {project.image ? (
        <img
          src={project.image.src}
          alt={project.image.alt}
          loading="lazy"
          className="h-48 w-full border-b border-[color:var(--border-muted)] object-cover object-top"
        />
      ) : (
        <div
          aria-hidden
          className="h-36 bg-[radial-gradient(circle_at_20%_30%,color-mix(in_srgb,var(--primary)_45%,transparent),transparent_55%),radial-gradient(circle_at_85%_70%,color-mix(in_srgb,var(--secondary)_35%,transparent),transparent_50%)] bg-muted"
        />
      )}
      <div className="flex flex-col gap-4 p-5.5">
        <div>
          <FocusHeading
            kicker={`${project.year} · ${project.status} · ${project.role}`}
            title={project.name}
          />
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
        </div>
        <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {project.capabilities.map((capability) => (
            <li
              key={capability}
              className="border-t border-border pt-2 text-[0.85rem] leading-normal text-muted-foreground"
            >
              {capability}
            </li>
          ))}
        </ul>
        <StackPills stack={project.stack} />
        <ProjectLinks links={project.links} />
      </div>
    </>
  );
}

function BoardFocusCard({ item }: { item: BoardItem }) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card animate-in fade-in-0 slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
      {item.kind === 'project' ? (
        <ProjectFocus project={item.project} />
      ) : (
        <div className="flex flex-col gap-4 p-5.5">
          <FocusHeading kicker={boardKindLabel[item.kind]} title={item.title} />
          {item.kind === 'timeline' ? (
            <TimelinePart data={{ items: item.roles }} />
          ) : (
            <ContactPart data={item.contact} />
          )}
        </div>
      )}
    </article>
  );
}

export function ChatBoard({
  items,
  focusedKey,
  onFocus,
}: BoardFocusProps & { items: BoardItem[] }) {
  const focused = items.find((item) => item.key === focusedKey) ?? items[0];
  const others = items.filter((item) => item !== focused);

  return (
    <aside
      aria-label="Board"
      className="min-h-0 overflow-y-auto border-l border-[color:var(--border-muted)] bg-[color:color-mix(in_srgb,var(--bg)_60%,var(--bg-light))]"
    >
      <div className="flex max-w-[920px] flex-col gap-4.5 px-6.5 pb-10 pt-5.5">
        <header className="flex items-baseline justify-between gap-3">
          <div>
            <p className={kickerClass}>Surfaced in this conversation</p>
            <h2 className="mt-1.5 text-[1.9rem] font-normal tracking-[-0.04em] text-foreground">
              Board
            </h2>
          </div>
          <span className={cn(kickerClass, 'text-muted-foreground')}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </header>
        {focused && <BoardFocusCard key={focused.key} item={focused} />}
        {others.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5">
            {others.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => onFocus(item.key)}
                className={cn(
                  'cursor-pointer rounded-[var(--radius-md)] border border-[color:var(--border-muted)] bg-card p-3 text-left text-[0.82rem] transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-[color:var(--primary)]',
                  focusRingClass
                )}
              >
                <span className={cn(kickerClass, 'block')}>
                  {boardKindLabel[item.kind]}
                </span>
                <span className="mt-1 block font-semibold text-foreground">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
