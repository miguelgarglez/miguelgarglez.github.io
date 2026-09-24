import { ChevronDownIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export type ContextTraceSource = {
  kind: 'fact' | 'profile' | 'project' | 'memory';
  id: string;
  title: string;
};

export type ContextTraceData = {
  intent: string;
  audience: string;
  sources: ContextTraceSource[];
};

const KIND_LABELS: Record<ContextTraceSource['kind'], string> = {
  fact: 'facts',
  profile: 'blocks',
  project: 'projects',
  memory: 'updates',
};

const KIND_ORDER: ContextTraceSource['kind'][] = ['fact', 'profile', 'project', 'memory'];

export function ContextTrace({ trace }: { trace: ContextTraceData }) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();
  const counts = KIND_ORDER.map((kind) => ({
    kind,
    count: trace.sources.filter((source) => source.kind === kind).length,
  })).filter((entry) => entry.count > 0);

  if (trace.sources.length === 0) return null;

  return (
    <div className="context-trace">
      <button
        type="button"
        className="context-trace-toggle"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="context-trace-dot" aria-hidden="true" />
        <span className="context-trace-label">
          Grounded in {trace.sources.length} sources
        </span>
        <span className="context-trace-bars" aria-hidden="true">
          {counts.map((entry) => (
            <span
              key={entry.kind}
              className={cn('context-trace-bar', `is-${entry.kind}`)}
              style={{ flexGrow: entry.count }}
            />
          ))}
        </span>
        <ChevronDownIcon
          className={cn('context-trace-chevron size-3.5', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <div id={listId} className="context-trace-panel" hidden={!isOpen}>
        <p className="context-trace-meta">
          <span>intent={trace.intent}</span>
          <span>audience={trace.audience}</span>
          {counts.map((entry) => (
            <span key={entry.kind}>
              {entry.count} {KIND_LABELS[entry.kind]}
            </span>
          ))}
        </p>
        <ul className="context-trace-list">
          {trace.sources.map((source, index) => (
            <li
              key={`${source.kind}-${source.id}`}
              className={cn('context-trace-source', `is-${source.kind}`)}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {source.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
