import { useEffect, useState } from 'react';

const EN_STEPS = [
  { key: 'classify', text: 'Classifying the question' },
  { key: 'retrieve', text: "Selecting context from Miguel's profile" },
  { key: 'assemble', text: 'Assembling a grounded prompt' },
  { key: 'stream', text: 'Waiting for the first tokens' },
];

const ES_STEPS = [
  { key: 'classify', text: 'Clasificando la pregunta' },
  { key: 'retrieve', text: 'Seleccionando contexto del perfil de Miguel' },
  { key: 'assemble', text: 'Preparando un prompt con contexto' },
  { key: 'stream', text: 'Esperando los primeros tokens' },
];

type AgentActivityProps = {
  language: 'es' | 'en';
};

export function AgentActivity({ language }: AgentActivityProps) {
  const steps = language === 'es' ? ES_STEPS : EN_STEPS;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const id = window.setInterval(() => {
      setIndex((current) => Math.min(current + 1, steps.length - 1));
    }, 850);

    return () => window.clearInterval(id);
  }, [steps.length, language]);

  const step = steps[index];

  return (
    <div className="agent-activity" role="status" aria-live="polite">
      <span className="agent-activity-dot" aria-hidden="true" />
      <span key={step.key} className="agent-activity-text">
        {step.text}
      </span>
      <span className="agent-activity-count chat-mono" aria-hidden="true">
        {index + 1}/{steps.length}
      </span>
    </div>
  );
}

export function looksSpanish(value: string) {
  return /[¿¡áéíóúñ]|\b(que|quien|quién|como|cómo|proyectos|experiencia|trabajo|contacto)\b/i.test(
    value
  );
}
