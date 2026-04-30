import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runProfileAgent } from '../src/agent/run-profile-agent';

function run(question: string) {
  return runProfileAgent({
    question,
    inboundMessages: [{ role: 'user', content: question }],
  }).context;
}

function ids<T extends { id: string }>(items: T[]) {
  return items.map((item) => item.id);
}

describe('profile agent context retrieval', () => {
  it('includes the current role fact and current experience for Spanish role questions', () => {
    const context = run('cual es su puesto actual?');

    assert.equal(context.intent, 'experience');
    assert.ok(ids(context.selectedFacts).includes('current-role'));
    assert.equal(context.selectedProfileBlocks[0]?.id, 'experience-ods');
  });

  it('grounds contact questions in contact facts', () => {
    const context = run('How can I contact Miguel?');
    const factIds = ids(context.selectedFacts);

    assert.equal(context.intent, 'contact');
    assert.ok(factIds.includes('linkedin'));
    assert.ok(factIds.includes('x'));
  });

  it('selects cv-chat and recent AI memories for AI project questions', () => {
    const context = run('What AI projects has Miguel worked on?');

    assert.equal(context.intent, 'projects');
    assert.ok(ids(context.selectedProjects).includes('cv-chat'));
    assert.ok(ids(context.selectedMemories).includes('opencode-zen-chat-migration'));
  });

  it('frames RAG questions as lightweight GenAI Intensive capstone exposure', () => {
    const context = run('Does Miguel have experience with RAG?');

    assert.equal(context.intent, 'experience');
    assert.ok(ids(context.selectedProjects).includes('genai-intensive-capstone'));
    assert.ok(ids(context.selectedMemories).includes('google-genai-intensive-capstone'));
    assert.match(
      context.selectedMemories
        .find((memory) => memory.id === 'google-genai-intensive-capstone')
        ?.content ?? '',
      /lightweight and practical/i
    );
  });

  it('selects current experience and frontend skills for frontend questions', () => {
    const context = run('What frontend experience does Miguel have?');
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'experience');
    assert.ok(blockIds.includes('experience-ods'));
    assert.ok(blockIds.includes('skills-frontend'));
  });

  it('selects AI tooling context for AI tools questions', () => {
    const context = run('What AI tools does Miguel use in his workflow?');
    const factIds = ids(context.selectedFacts);
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'skills');
    assert.ok(factIds.includes('ai-tools-workflow'));
    assert.ok(blockIds.includes('skills-devops'));
    assert.ok(blockIds.includes('experience-ods'));
  });

  it('grounds the visible academic-background prompt in education', () => {
    const context = run("What is Miguel's academic background?");
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'education');
    assert.ok(blockIds.includes('education'));
  });

  it('grounds the visible recent-learning prompt in certifications', () => {
    const context = run('What has Miguel been learning recently?');
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'education');
    assert.ok(blockIds.includes('education-certifications'));
  });

  it('grounds the visible frontend-platform prompt in frontend and current work', () => {
    const context = run('What makes Miguel a strong frontend platform engineer?');
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'skills');
    assert.ok(blockIds.includes('skills-frontend'));
    assert.ok(blockIds.includes('experience-ods'));
  });

  it('grounds the visible MCP and AI prompt in current experience', () => {
    const context = run('How does Miguel use AI in engineering?');
    const factIds = ids(context.selectedFacts);
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'skills');
    assert.ok(factIds.includes('ai-tools-workflow'));
    assert.ok(blockIds.includes('skills-devops'));
    assert.ok(blockIds.includes('experience-ods'));
  });

  it('grounds the visible CV chat prompt in agent context', () => {
    const context = run('How does this CV chat work?');
    const factIds = ids(context.selectedFacts);
    const blockIds = ids(context.selectedProfileBlocks);

    assert.ok(['projects', 'summary'].includes(context.intent));
    assert.ok(factIds.includes('agent-context'));
    assert.ok(blockIds.includes('cv-chat-agent'));
  });

  it('does not frame mobile work as a primary specialty', () => {
    const context = run('Does Miguel have mobile or native app experience?');
    const block = context.selectedProfileBlocks.find(
      (item) => item.id === 'skills-exploratory'
    );

    assert.equal(context.intent, 'experience');
    assert.ok(block);
    assert.match(block.content, /exploratory tinkering/i);
  });
});
