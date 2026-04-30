import type { Audience, Intent } from './types';
import { matchesAny } from './text';

export function classifyAudience(question: string): Audience {
  if (
    matchesAny(question, [
      'recruiter',
      'hire',
      'hiring',
      'candidate',
      'talent',
      'seleccion',
      'selección',
    ])
  ) {
    return 'recruiter';
  }

  if (
    matchesAny(question, [
      'architecture',
      'repo',
      'code',
      'stack',
      'technical',
      'frontend',
      'typescript',
      'arquitectura',
    ])
  ) {
    return 'engineer';
  }

  if (
    matchesAny(question, [
      'client',
      'business',
      'value',
      'product',
      'impact',
      'negocio',
      'cliente',
    ])
  ) {
    return 'client';
  }

  return 'unknown';
}

export function classifyIntent(question: string): Intent {
  if (matchesAny(question, ['project', 'projects', 'proyecto', 'proyectos', 'portfolio'])) return 'projects';
  if (
    matchesAny(question, [
      'experience',
      'career',
      'worked',
      'empresa',
      'experiencia',
      'puesto',
      'cargo',
      'rol',
      'role',
      'position',
      'current role',
      'current position',
      'puesto actual',
      'cargo actual',
    ])
  ) return 'experience';
  if (
    matchesAny(question, [
      'skills',
      'technologies',
      'stack',
      'frontend',
      'platform',
      'design system',
      'design systems',
      'react',
      'typescript',
      'mobile',
      'native',
      'ios',
      'macos',
      'swift',
      'ai',
      'artificial intelligence',
      'tools',
      'herramientas',
      'windsurf',
      'devin',
      'codex',
      'copilot',
      'mcp',
      'habilidades',
      'tecnologias',
      'tecnologías',
    ])
  ) return 'skills';
  if (matchesAny(question, ['work style', 'collaboration', 'forma de trabajar', 'metodo', 'método'])) return 'work_style';
  if (matchesAny(question, ['contact', 'linkedin', 'email', 'reach', 'contacto'])) return 'contact';
  if (matchesAny(question, ['available', 'availability', 'remote', 'hybrid', 'disponibilidad'])) return 'availability';
  if (
    matchesAny(question, [
      'education',
      'degree',
      'university',
      'certification',
      'certifications',
      'course',
      'courses',
      'learning',
      'learned',
      'academic',
      'educacion',
      'educación',
      'universidad',
      'certificacion',
      'certificación',
      'certificaciones',
      'curso',
      'cursos',
      'aprendizaje',
      'formacion',
      'formación',
      'academico',
      'académico',
    ])
  ) return 'education';
  if (matchesAny(question, ['recent', 'latest', 'now', 'actualidad', 'ultimo', 'último', 'ultimamente', 'últimamente'])) return 'recent_updates';

  return 'summary';
}
