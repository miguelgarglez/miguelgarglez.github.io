import { useEffect, useState } from 'react';
import { Loader } from '@/components/ai-elements/loader';

const EN_MESSAGES = [
  "Reviewing Miguel's profile...",
  'Checking relevant projects...',
  'Looking for recent updates...',
  'Preparing a grounded answer...',
];

const ES_MESSAGES = [
  'Revisando el perfil de Miguel...',
  'Consultando proyectos relevantes...',
  'Buscando actualizaciones recientes...',
  'Preparando una respuesta basada en contexto...',
];

type AgentActivityProps = {
  language: 'es' | 'en';
};

export function AgentActivity({ language }: AgentActivityProps) {
  const messages = language === 'es' ? ES_MESSAGES : EN_MESSAGES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 900);

    return () => window.clearInterval(id);
  }, [messages.length, language]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader className="size-4" />
      <span>{messages[index]}</span>
    </div>
  );
}

export function looksSpanish(value: string) {
  return /[¿¡áéíóúñ]|\b(que|quien|quién|como|cómo|proyectos|experiencia|trabajo|contacto)\b/i.test(
    value
  );
}
