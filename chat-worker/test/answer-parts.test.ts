import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildAnswerParts,
  followupsByIntent,
} from '../src/agent/answer-parts';
import {
  buildRichCardPolicy,
  RICH_CARD_POLICY_HEADING,
} from '../src/agent/prompts';
import { runProfileAgent } from '../src/agent/run-profile-agent';
import { suggestedPromptContracts } from '../src/agent/suggested-prompts';
import { normalizeText } from '../src/agent/text';
import type { AgentContext } from '../src/agent/types';
import { profileFacts } from '../src/knowledge/profile-facts';
import { projects as knowledgeProjects } from '../src/knowledge/projects';
import { roles } from '../../cv-chat/src/data/experience';
import { projects as directoryProjects } from '../../src/data/projects';
import type { CvChatDataPart } from '../../shared/chat-parts';

function contextFor(question: string) {
  return runProfileAgent({
    question,
    inboundMessages: [{ role: 'user', content: question }],
  }).context;
}

function partsFor(question: string, context = contextFor(question)) {
  const { leading, trailing } = buildAnswerParts({ question, context });
  return { context, leading, trailing, all: [...leading, ...trailing] };
}

function findPart<T extends CvChatDataPart['type']>(
  parts: CvChatDataPart[],
  type: T
) {
  return parts.find(
    (part): part is Extract<CvChatDataPart, { type: T }> => part.type === type
  );
}

function withProjects(context: AgentContext, ids: string[]): AgentContext {
  return {
    ...context,
    selectedProjects: ids.map((id) => {
      const project = knowledgeProjects.find((entry) => entry.id === id);
      assert.ok(project, `knowledge project ${id} exists`);
      return project;
    }),
  };
}

const factValue = (id: string) =>
  profileFacts.find((fact) => fact.id === id)?.value;

describe('buildAnswerParts', () => {
  it('builds project cards from the visible directory, never from model instructions', () => {
    const { context, all } = partsFor('What projects has Miguel built?');
    const projectsPart = findPart(all, 'data-projects');
    const directorySlugs = new Set(directoryProjects.map((p) => p.slug));

    assert.equal(context.intent, 'projects');
    assert.match(
      JSON.stringify(context.selectedProjects),
      /overstate/i,
      'precondition: selected knowledge projects contain model instructions'
    );
    assert.ok(projectsPart, 'projects question emits a projects card');
    assert.deepEqual(
      projectsPart.data.items.map((item) => item.slug),
      context.selectedProjects
        .map((project) => project.id)
        .filter((id) => directorySlugs.has(id)),
      'cards follow retrieval order and use directory slugs'
    );
    assert.doesNotMatch(JSON.stringify(all), /overstate/i);

    for (const card of projectsPart.data.items) {
      const entry = directoryProjects.find((p) => p.slug === card.slug);
      assert.ok(entry);
      assert.equal(card.name, entry.displayName);
      assert.equal(card.summary, entry.summary);
      assert.deepEqual(card.capabilities, entry.capabilities);
      for (const link of card.links) {
        assert.match(link.url, /^https:\/\//, `${card.slug} link is absolute`);
      }
      if (card.image) {
        assert.match(card.image.src, /^https:\/\/miguelgarglez\.com\//);
      }
    }
  });

  it('absolutizes relative directory links', () => {
    const { all } = partsFor(
      'What projects has Miguel built?',
      withProjects(contextFor('What projects has Miguel built?'), ['cv-chat'])
    );
    const card = findPart(all, 'data-projects')?.data.items[0];

    assert.deepEqual(card?.links, [
      { kind: 'live', url: 'https://miguelgarglez.com/cv-chat' },
      { kind: 'case-study', url: 'https://miguelgarglez.com/projects/cv-chat' },
    ]);
    assert.deepEqual(card?.image, {
      src: 'https://miguelgarglez.com/projects/cv-chat/hero.webp',
      alt: 'cv-chat hero with ASCII portrait and profile intro',
    });
  });

  it('passes an image crop position through to the card', () => {
    const { all } = partsFor(
      'What projects has Miguel built?',
      withProjects(contextFor('What projects has Miguel built?'), ['xfold'])
    );
    const card = findPart(all, 'data-projects')?.data.items[0];

    assert.equal(card?.image?.position, '50% 55%', 'xfold team photo keeps faces in frame');
  });

  it('skips projects that are not in the directory', () => {
    const base = contextFor('What projects has Miguel built?');
    const onlyHidden = partsFor(
      'What projects has Miguel built?',
      withProjects(base, ['genai-intensive-capstone'])
    );
    const mixed = partsFor(
      'What projects has Miguel built?',
      withProjects(base, ['genai-intensive-capstone', 'momentum'])
    );

    assert.equal(
      findPart(onlyHidden.all, 'data-projects'),
      undefined,
      'no card when no selected project is in the directory'
    );
    assert.deepEqual(
      findPart(mixed.all, 'data-projects')?.data.items.map((i) => i.slug),
      ['momentum']
    );
  });

  it('builds the timeline from the visible cv-chat experience data', () => {
    const { context, all } = partsFor('What has Miguel built at Santander?');

    assert.equal(context.intent, 'experience');
    assert.deepEqual(
      findPart(all, 'data-timeline')?.data.items,
      roles.map((role, index) => ({
        title: role.title,
        company: role.company,
        period: role.period,
        summary: role.summary,
        current: index === 0,
      }))
    );
  });

  it('builds the contact card from profile facts', () => {
    const { context, all } = partsFor('How can I contact Miguel?');

    assert.equal(context.intent, 'contact');
    assert.deepEqual(findPart(all, 'data-contact')?.data, {
      name: factValue('name'),
      location: factValue('location'),
      email: factValue('email'),
      linkedin: factValue('linkedin'),
      x: factValue('x'),
    });
  });

  it('adds no rich card for summary or work style questions', () => {
    for (const question of [
      "Summarize Miguel's work style",
      'How does this CV chat work?',
    ]) {
      const { trailing } = partsFor(question);
      assert.deepEqual(
        trailing.map((part) => part.type),
        ['data-followups'],
        `${question} only gets follow-ups`
      );
    }
  });

  it('leads with deduplicated sources from the selected context', () => {
    const { context, leading } = partsFor('What projects has Miguel built?');
    const selectedTitles = [
      ...context.selectedProfileBlocks,
      ...context.selectedProjects,
      ...context.selectedMemories,
    ].map((item) => item.title);

    assert.deepEqual(
      leading.map((part) => part.type),
      ['data-sources']
    );
    const items = findPart(leading, 'data-sources')?.data.items ?? [];
    const labels = items.map((item) => normalizeText(item.label));
    assert.ok(items.length > 0, 'at least one source');
    assert.equal(new Set(labels).size, labels.length, 'labels are unique');
    for (const item of items) {
      assert.ok(selectedTitles.includes(item.label), `${item.label} was selected`);
    }
  });

  it('lists the selected projects before profile blocks for project questions', () => {
    const { context, leading } = partsFor('What projects has Miguel built?');
    const items = findPart(leading, 'data-sources')?.data.items ?? [];
    const projectCount = Math.min(context.selectedProjects.length, 4);

    assert.ok(projectCount > 0);
    assert.deepEqual(
      items.slice(0, projectCount).map((item) => item.id),
      context.selectedProjects
        .slice(0, projectCount)
        .map((project) => `project:${project.id}`)
    );
  });

  it('caps sources at four for every intent', () => {
    const questions = [
      ...suggestedPromptContracts.map((entry) => entry.prompt),
      'What projects has Miguel built?',
      'How can I contact Miguel?',
      'What has Miguel been up to lately?',
      "What is Miguel's expected salary?",
    ];
    const intents = new Set<string>();

    for (const question of questions) {
      const { context, leading } = partsFor(question);
      const items = findPart(leading, 'data-sources')?.data.items ?? [];
      intents.add(context.intent);
      assert.ok(items.length <= 4, `${question} has ${items.length} sources`);
    }
    assert.ok(intents.size >= 6, 'covers most intents');
  });

  it('only suggests follow-ups that are pinned suggested prompts', () => {
    const contractPrompts = new Set(
      suggestedPromptContracts.map((entry) => entry.prompt)
    );

    for (const [intent, prompts] of Object.entries(followupsByIntent)) {
      for (const prompt of prompts) {
        assert.ok(
          contractPrompts.has(prompt),
          `${intent} follow-up "${prompt}" is a suggested prompt contract`
        );
      }
    }
  });

  it('tells the model about the card exactly when a rich card is emitted', () => {
    const questions = [
      ...suggestedPromptContracts.map((entry) => entry.prompt),
      'What projects has Miguel built?',
      'What is video-digest?',
      'How can I contact Miguel?',
      'cual es su puesto actual?',
      "What is Miguel's expected salary?",
      'Has Miguel worked at Amazon?',
    ];
    const seen = new Set<string>();

    for (const question of questions) {
      const { messages, parts } = runProfileAgent({
        question,
        inboundMessages: [{ role: 'user', content: question }],
      });
      const systemPrompt = messages[0]?.content ?? '';
      const cardTypes = parts.trailing
        .map((part) => part.type)
        .filter((type) => type !== 'data-followups');

      assert.deepEqual(cardTypes, parts.richCard ? [parts.richCard.type] : []);
      assert.equal(
        systemPrompt.includes(RICH_CARD_POLICY_HEADING),
        parts.richCard !== null,
        `${question}: card policy iff rich card`
      );
      if (parts.richCard) {
        assert.ok(systemPrompt.includes(buildRichCardPolicy(parts.richCard)));
      }
      seen.add(parts.richCard?.type ?? 'none');
    }

    assert.deepEqual(
      [...seen].sort(),
      ['data-contact', 'data-projects', 'data-timeline', 'none']
    );
  });

  it('keeps the contact channels in the text but not the project links', () => {
    const contact = runProfileAgent({
      question: 'How can I contact Miguel?',
      inboundMessages: [],
    }).parts.richCard;
    const projects = runProfileAgent({
      question: 'What projects has Miguel built?',
      inboundMessages: [],
    }).parts.richCard;
    assert.ok(contact && projects);

    assert.match(buildRichCardPolicy(contact), /Still give the email and the LinkedIn link/);
    assert.match(buildRichCardPolicy(projects), /no URLs.*do not repeat them/s);
  });

  it('never suggests the question that was just asked', () => {
    const questions = [
      ...suggestedPromptContracts.map((entry) => entry.prompt),
      'what has miguel built at santander',
    ];

    for (const question of questions) {
      const prompts =
        findPart(partsFor(question).all, 'data-followups')?.data.prompts ?? [];
      assert.equal(prompts.length, 2, `${question} gets two follow-ups`);
      assert.ok(
        prompts.every((p) => normalizeText(p) !== normalizeText(question)),
        `${question} is not suggested back`
      );
    }
  });
});
