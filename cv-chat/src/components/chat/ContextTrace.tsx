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
  fact: 'fact',
  profile: 'cv',
  project: 'project',
  memory: 'update',
};

export function ContextTrace({ trace }: { trace: ContextTraceData }) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

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
        Grounded in {trace.sources.length} sources
        <ChevronDownIcon
          className={cn('context-trace-chevron size-3', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <div
        id={listId}
        className={cn('context-trace-panel', isOpen && 'is-open')}
        aria-hidden={!isOpen}
      >
        <ul className="context-trace-list">
          {trace.sources.map((source, index) => (
            <li
              key={`${source.kind}-${source.id}`}
              className="context-trace-source"
              style={{ transitionDelay: isOpen ? `${Math.min(index, 12) * 25}ms` : '0ms' }}
            >
              <span className="context-trace-source-title">{source.title}</span>
              <span className="context-trace-source-kind">{KIND_LABELS[source.kind]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
