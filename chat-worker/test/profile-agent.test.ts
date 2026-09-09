import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runProfileAgent } from '../src/agent/run-profile-agent';
import { profileAssistantPolicy } from '../src/agent/prompts';
import { suggestedPromptContracts } from '../src/agent/suggested-prompts';

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

  it('grounds the current role in Santander business onboarding', () => {
    const context = run('What is Miguel working on now at Santander?');
    const currentRole = context.selectedFacts.find(
      (fact) => fact.id === 'current-role'
    );
    const experience = context.selectedProfileBlocks.find(
      (block) => block.id === 'experience-ods'
    );

    assert.ok(currentRole);
    assert.match(currentRole.value, /business-account onboarding/i);
    assert.match(currentRole.value, /Mexico and the UK/i);
    assert.ok(experience);
    assert.match(experience.content, /final product team/i);
    assert.match(experience.content, /Mexico and the UK/i);
    assert.doesNotMatch(currentRole.value, /Spain, Mexico/i);
    assert.doesNotMatch(experience.content, /3 markets/i);
  });

  it('grounds Santander onboarding questions in Mexico and the UK only', () => {
    const context = run(
      'Does Miguel work on business-account onboarding for Mexico and the UK?'
    );
    const currentRole = context.selectedFacts.find(
      (fact) => fact.id === 'current-role'
    );
    const experience = context.selectedProfileBlocks.find(
      (block) => block.id === 'experience-ods'
    );
    const memory = context.selectedMemories.find(
      (item) => item.id === 'santander-product-onboarding-team'
    );

    assert.equal(context.intent, 'experience');
    assert.ok(currentRole);
    assert.match(currentRole.value, /Mexico and the UK/i);
    assert.doesNotMatch(currentRole.value, /Spain, Mexico/i);
    assert.doesNotMatch(currentRole.value, /3 Santander markets/i);
    assert.ok(experience);
    assert.match(experience.content, /Mexico and the UK/i);
    assert.doesNotMatch(experience.content, /3 markets/i);
    assert.ok(memory);
    assert.match(memory.content, /Mexico and the UK/i);
    assert.doesNotMatch(memory.content, /3 markets/i);
  });

  it('grounds contact questions in contact facts', () => {
    const context = run('How can I contact Miguel?');
    const factIds = ids(context.selectedFacts);

    assert.equal(context.intent, 'contact');
    assert.ok(factIds.includes('email'));
    assert.ok(factIds.includes('linkedin'));
    assert.ok(factIds.includes('x'));
  });

  it('answers availability and work-authorization questions from curated facts', () => {
    const context = run('Is Miguel authorized to work in Spain and is he available remotely?');
    const factIds = ids(context.selectedFacts);
    const availability = context.selectedProfileBlocks.find(
      (block) => block.id === 'availability'
    );

    assert.equal(context.intent, 'availability');
    assert.ok(factIds.includes('work-authorization'));
    assert.ok(factIds.includes('location'));
    assert.ok(availability);
    assert.match(availability.content, /without visa sponsorship/i);
    assert.match(availability.content, /remote, hybrid, or onsite/i);
  });

  it('keeps backend skills framed as academic and project foundations', () => {
    const context = run('Does Miguel have Python or backend experience?');
    const backend = context.selectedProfileBlocks.find(
      (block) => block.id === 'skills-backend'
    );

    assert.ok(backend);
    assert.match(backend.content, /academic and project foundations/i);
    assert.match(backend.content, /does not present professional day-to-day Python/i);
  });

  it('describes role fit as product frontend with credible T-shaped stretch', () => {
    const context = run('What roles is Miguel a good fit for?');
    const roleFit = context.selectedProfileBlocks.find(
      (block) => block.id === 'role-fit'
    );

    assert.ok(roleFit);
    assert.match(roleFit.content, /product-minded frontend/i);
    assert.match(roleFit.content, /T-shaped frontend/i);
  });

  it('surfaces the directory and wellstudio portfolio memory for recent project updates', () => {
    const context = run(
      'What has Miguel been building on his personal site directory and wellstudio recently?'
    );
    const memory = context.selectedMemories.find(
      (item) => item.id === 'directory-and-wellstudio-maturity'
    );

    assert.ok(memory);
    assert.match(memory.content, /wellstudio_platform/i);
    assert.match(memory.content, /public directory/i);
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

  it('answers QA engineer questions with Jember context', () => {
    const context = run('Tell me about Miguel as a QA engineer');
    const factIds = ids(context.selectedFacts);
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'experience');
    assert.ok(factIds.includes('qa-experience'));
    assert.ok(blockIds.includes('experience-jember'));
  });

  it('answers Jember questions with QA and automation impact', () => {
    const context = run('What did Miguel do at Jember?');
    const fact = context.selectedFacts.find(
      (item) => item.id === 'qa-experience'
    );
    const blockIds = ids(context.selectedProfileBlocks);

    assert.equal(context.intent, 'experience');
    assert.ok(fact);
    assert.match(fact.value, /test automation/i);
    assert.match(fact.value, /50%/);
    assert.ok(blockIds.includes('experience-jember'));
    assert.ok(blockIds.includes('problem-solving-example'));
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

  it('retrieves Exponential as startup learning, not founder intent', () => {
    const context = run('Why did Miguel join Exponential Fellowship?');
    const fact = context.selectedFacts.find(
      (item) => item.id === 'exponential-community'
    );
    const memory = context.selectedMemories.find(
      (item) => item.id === 'exponential-community-joined'
    );

    assert.ok(fact);
    assert.match(fact.value, /startup thinking/i);
    assert.match(fact.value, /not framing it as founder intent/i);
    assert.ok(memory);
  });

  it('grounds the visible product-minded frontend prompt in frontend and current work', () => {
    const context = run('What makes Miguel a strong product-minded frontend engineer?');
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

    assert.equal(context.intent, 'summary');
    assert.ok(factIds.includes('agent-context'));
    assert.ok(blockIds.includes('cv-chat-agent'));
  });

  it('retrieves video-digest for personal CLI tooling questions', () => {
    const context = run(
      'What personal CLI tooling has Miguel built for YouTube transcripts?'
    );
    const project = context.selectedProjects.find(
      (item) => item.id === 'video-digest'
    );
    const memory = context.selectedMemories.find(
      (item) => item.id === 'video-digest-personal-cli'
    );

    assert.equal(context.intent, 'projects');
    assert.ok(project);
    assert.match(project.shortSummary, /Linux x64/i);
    assert.match(project.shortSummary, /macOS/i);
    assert.match(project.shortSummary, /personal tooling/i);
    assert.doesNotMatch(project.shortSummary, /macOS-only/i);
    assert.ok(memory);
    assert.match(memory.content, /video-digest/i);
    assert.match(memory.content, /Linux x64/i);
  });

  it('retrieves video-digest when asked about the project by name', () => {
    const context = run('What is video-digest?');
    const projectIds = ids(context.selectedProjects);

    assert.equal(context.intent, 'projects');
    assert.ok(projectIds.includes('video-digest'));
  });

  it('keeps MCP enablement framed as unofficial limited adoption', () => {
    const context = run('How does Miguel use MCP with the component library?');
    const aiTools = context.selectedFacts.find(
      (fact) => fact.id === 'ai-tools-workflow'
    );
    const devops = context.selectedProfileBlocks.find(
      (block) => block.id === 'skills-devops'
    );

    assert.ok(aiTools);
    assert.match(aiTools.value, /unofficial MCP server/i);
    assert.match(aiTools.value, /limited\/unofficial adoption/i);
    assert.ok(devops);
    assert.match(devops.content, /limited\/unofficial adoption/i);
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

describe('visible suggested-prompt retrieval', () => {
  it('covers every unique visible suggested prompt with pinned context', () => {
    const uniquePrompts = [
      "Explain Miguel's design system experience",
      'How does Miguel use AI in engineering?',
      "Summarize Miguel's work style",
      'What makes Miguel a strong product-minded frontend engineer?',
      'What has Miguel built at Santander?',
      "Summarize Miguel's QA background",
      "How did Miguel's early role shape his product mindset?",
      "What is Miguel's academic background?",
      'What has Miguel been learning recently?',
      'How does this CV chat work?',
      'What kind of engineer is Miguel?',
    ];

    const contractPrompts = new Set(
      suggestedPromptContracts.map((entry) => entry.prompt)
    );
    for (const prompt of uniquePrompts) {
      assert.ok(contractPrompts.has(prompt), `missing contract for: ${prompt}`);
    }
  });

  it('refuses to claim missing information when selected context is present', () => {
    assert.match(profileAssistantPolicy, /MUST answer from them/i);
    assert.match(profileAssistantPolicy, /Do not say you lack information/i);
  });

  for (const contract of suggestedPromptContracts) {
    it(`grounds "${contract.prompt}"`, () => {
      const context = run(contract.prompt);
      const factIds = ids(context.selectedFacts);
      const blockIds = ids(context.selectedProfileBlocks);
      const projectIds = ids(context.selectedProjects);
      const memoryIds = ids(context.selectedMemories);

      assert.equal(context.intent, contract.intent);
      assert.ok(context.selectedProfileBlocks.length > 0);
      for (const blockId of contract.blockIds) {
        assert.ok(blockIds.includes(blockId), `missing block ${blockId}`);
      }
      for (const factId of contract.factIds ?? []) {
        assert.ok(factIds.includes(factId), `missing fact ${factId}`);
      }
      for (const projectId of contract.projectIds ?? []) {
        assert.ok(projectIds.includes(projectId), `missing project ${projectId}`);
      }
      for (const memoryId of contract.memoryIds ?? []) {
        assert.ok(memoryIds.includes(memoryId), `missing memory ${memoryId}`);
      }
    });
  }
});
