# CV Chat Agent Maintenance

This guide defines how to keep the `cv-chat` page, suggested prompts, and
`chat-worker` knowledge base aligned.

## Mental Model

`cv-chat` is the canonical public profile. The Worker should answer from the
same professional story that appears on the page.

The runtime is deliberately simple:

```text
user question
  -> classify audience and intent
  -> retrieve facts, profile blocks, projects, and memories
  -> build one grounded prompt
  -> make one LLM call
```

The deterministic retrieval layer is the maintainability boundary. If a visible
prompt or important profile question selects the wrong context, fix retrieval or
knowledge first, then rely on the LLM second.

## Source Of Truth

- Visible profile content: `cv-chat/src/components/welcome/*`
- Critical facts: `chat-worker/src/knowledge/profile-facts.ts`
- Longer profile blocks: `chat-worker/src/knowledge/profile-data.ts`
- Projects: `chat-worker/src/knowledge/projects.ts`
- Curated updates and learning notes: `chat-worker/src/knowledge/memories.ts`
- Retrieval tests: `chat-worker/test/profile-agent.test.ts`

## When To Update Knowledge

Update `chat-worker/src/knowledge/*` when any of these change in the visible
site:

- current role, title, company, or dates;
- work achievements or positioning;
- skills hierarchy;
- education, certifications, or learning;
- visible suggested prompts;
- project descriptions;
- contact information;
- claims about AI, MCP, RAG, or production experience.

Keep claims conservative. Do not turn exploratory work into professional
specialization. For this profile, mobile/native work is exploratory tinkering,
frontend platform work is the strongest professional area, and backend/data is a
solid academic and project foundation.

## Prompt Alignment Checklist

For every `data-chat-prompt` in `cv-chat`, check:

- The prompt maps to a clear intent: `experience`, `skills`, `education`,
  `projects`, `work_style`, `contact`, or `summary`.
- The selected profile blocks include the expected source material.
- The selected facts include critical facts when needed.
- The wording does not invite overstated answers.
- Similar prompts are not redundant unless they intentionally appear in
  different page contexts.

Current high-value prompt families:

- trajectory and current role;
- frontend platform and design systems;
- AI-assisted engineering and MCP support tooling;
- education and recent learning;
- QA background and early product/customer exposure;
- how the CV chat agent works.

## Retrieval Test Policy

Run from the repository root:

```bash
npm run test:profile-agent
```

Add or update tests when:

- adding a visible suggested prompt;
- changing professional positioning;
- adding a new knowledge category;
- changing classifier keywords;
- changing retrieval scoring;
- discovering a question that retrieves the wrong context.

Good tests assert selected context, not final prose. They should verify facts,
profile block ids, project ids, and memory ids.

Example shape:

```ts
const context = run('What makes Miguel a strong frontend platform engineer?');
const blockIds = ids(context.selectedProfileBlocks);

assert.equal(context.intent, 'skills');
assert.ok(blockIds.includes('skills-frontend'));
assert.ok(blockIds.includes('experience-ods'));
```

## Maintenance Workflow

1. Inventory changed visible content and prompts.
2. Update the relevant `chat-worker/src/knowledge/*` files.
3. Add or update retrieval tests for changed prompts and claims.
4. If tests fail, prefer improving classifier keywords, tags, or knowledge ids
   over weakening the test.
5. Run:

```bash
npm run test:profile-agent
npm run build --prefix cv-chat
```

6. If the drawer UI changed, manually check prompt opening, prefill behavior,
   focus, mobile layout, loading, and error states.

## Future Robustness Ideas

- Add a small script that extracts every `data-chat-prompt` from `cv-chat` and
  compares it against explicit regression tests.
- Store expected retrieval ids beside each prompt, then generate tests from that
  contract.
- Add language-pair tests for important Spanish and English questions.
- Add response-level smoke tests with a mocked LLM once the answer contract is
  stable.
- Keep the static knowledge approach until the knowledge base becomes too large
  or too dynamic for versioned files.
