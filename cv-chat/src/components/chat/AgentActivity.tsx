import { useEffect, useState } from 'react';
import { FileSearch, ListChecks, MessageSquareText, Sparkles } from 'lucide-react';
import { Loader } from '@/components/ai-elements/loader';

const EN_MESSAGES = [
  { icon: FileSearch, text: "Reviewing Miguel's profile..." },
  { icon: ListChecks, text: 'Selecting relevant context...' },
  { icon: Sparkles, text: 'Checking projects and recent signals...' },
  { icon: MessageSquareText, text: 'Preparing a grounded answer...' },
];

const ES_MESSAGES = [
  { icon: FileSearch, text: 'Revisando el perfil de Miguel...' },
  { icon: ListChecks, text: 'Seleccionando contexto relevante...' },
  { icon: Sparkles, text: 'Consultando proyectos y señales recientes...' },
  { icon: MessageSquareText, text: 'Preparando una respuesta basada en contexto...' },
];

type AgentActivityProps = {
  language: 'es' | 'en';
};

export function AgentActivity({ language }: AgentActivityProps) {
  const messages = language === 'es' ? ES_MESSAGES : EN_MESSAGES;
  const [index, setIndex] = useState(0);
  const ActiveIcon = messages[index].icon;

  useEffect(() => {
    setIndex(0);
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 900);

    return () => window.clearInterval(id);
  }, [messages.length, language]);

  return (
    <div className="flex w-fit max-w-full items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
      <span className="relative grid size-5 place-items-center text-primary">
        <Loader className="absolute size-5 opacity-35" />
        <ActiveIcon className="size-3.5" aria-hidden="true" />
      </span>
      <span>{messages[index].text}</span>
    </div>
  );
}

export function looksSpanish(value: string) {
  return /[¿¡áéíóúñ]|\b(que|quien|quién|como|cómo|proyectos|experiencia|trabajo|contacto)\b/i.test(
    value
  );
}
