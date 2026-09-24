import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runProfileAgent } from '../src/agent/run-profile-agent';
import { buildContextTrace } from '../src/agent/trace';

describe('context trace', () => {
  it('exposes intent, audience and every selected source without content', () => {
    const question = 'What projects has Miguel built?';
    const { context } = runProfileAgent({
      question,
      inboundMessages: [{ role: 'user', content: question }],
    });
    const trace = buildContextTrace(context);

    assert.equal(trace.intent, context.intent);
    assert.equal(trace.audience, context.audience);
    assert.equal(
      trace.sources.length,
      context.selectedFacts.length +
        context.selectedProfileBlocks.length +
        context.selectedProjects.length +
        context.selectedMemories.length
    );
    assert.ok(trace.sources.some((source) => source.kind === 'project'));
    for (const source of trace.sources) {
      assert.deepEqual(Object.keys(source).sort(), ['id', 'kind', 'title']);
      assert.ok(source.title.length > 0);
    }
  });
});
