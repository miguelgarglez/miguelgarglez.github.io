import { ArrowUpRightIcon } from 'lucide-react';
import { kickerClass } from './data-parts';

const prompts = [
  'What kind of engineer is Miguel?',
  'What has Miguel built at Santander?',
  'How does Miguel use AI in engineering?',
  'What has Miguel built outside work?',
];

export function EditorialEmptyState({
  onPick,
}: {
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4.5 pt-[8vh] text-left">
      <p className={kickerClass}>AI assistant · grounded in his CV</p>
      <h3 className="max-w-[12ch] text-[clamp(2.3rem,5vw,3.8rem)] font-light leading-[0.98] tracking-[-0.055em] text-foreground">
        Ask anything about Miguel's work.
      </h3>
      <p className="text-base text-muted-foreground">
        Experience, skills, side projects, and how he works.
      </p>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {prompts.map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => onPick(prompt)}
            className="flex cursor-pointer items-center justify-between gap-2.5 rounded-[var(--radius-md)] border border-border bg-card p-4 text-left text-sm text-foreground transition-colors hover:border-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
          >
            {prompt}
            <ArrowUpRightIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </button>
        ))}
      </div>
    </div>
  );
}
