import { existsSync } from 'node:fs';
import { runProfileAgent } from '../src/agent/run-profile-agent';
import {
  buildUpstreamPayload,
  buildUpstreamUrl,
  extractStreamError,
  extractStreamTextDelta,
} from '../src/agent/upstream';
import type { ChatMessage } from '../src/agent/types';
import { answerEvalCases } from './answer-cases';
import { gradeAnswer, type AnswerEvalCase, type CheckFailure } from './answer-checks';

const ENV_FILES = [new URL('../.dev.vars', import.meta.url), new URL('../.env', import.meta.url)];
const CONCURRENCY = 4;
const REQUEST_TIMEOUT_MS = 60_000;

type LlmConfig = { apiKey: string; baseUrl: string; model: string };
type EvalResult = { evalCase: AnswerEvalCase; run: number; answer: string; failures: CheckFailure[] };

function loadLlmConfig(): LlmConfig {
  const envFile = ENV_FILES.find((file) => existsSync(file));
  if (envFile) process.loadEnvFile(envFile);
  const apiKey = process.env.LLM_API_KEY?.trim();
  const baseUrl = process.env.LLM_BASE_URL?.trim();
  const model = process.env.LLM_MODEL?.trim();
  if (!apiKey || !baseUrl || !model) {
    throw new Error('Set LLM_API_KEY, LLM_BASE_URL and LLM_MODEL in chat-worker/.dev.vars, chat-worker/.env or the environment.');
  }
  return { apiKey, baseUrl, model };
}

function parseArgs(argv: string[]) {
  const value = (name: string) => argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1];
  const runs = Number(value('runs') ?? 1);
  if (!Number.isInteger(runs) || runs < 1) throw new Error('--runs must be a positive integer.');
  return { runs, caseFilter: value('case') };
}

async function askModel(config: LlmConfig, messages: ChatMessage[]) {
  const response = await fetch(buildUpstreamUrl(config.baseUrl, config.model), {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildUpstreamPayload(config.model, messages, true)),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`upstream ${response.status}: ${(await response.text()).slice(0, 300)}`);

  let answer = '';
  for (const line of (await response.text()).split('\n')) {
    const data = line.startsWith('data:') ? line.slice(5).trim() : '';
    if (!data || data === '[DONE]') continue;
    const parsed = JSON.parse(data) as Record<string, unknown>;
    const error = extractStreamError(parsed);
    if (error) throw new Error(error);
    answer += extractStreamTextDelta(parsed) ?? '';
  }
  if (!answer.trim()) throw new Error('upstream returned an empty answer');
  return answer;
}

async function evaluate(config: LlmConfig, evalCase: AnswerEvalCase, run: number): Promise<EvalResult> {
  const { messages } = runProfileAgent({
    question: evalCase.question,
    inboundMessages: [{ role: 'user', content: evalCase.question }],
  });
  const contextText = messages[0]?.content ?? '';
  try {
    const answer = await askModel(config, messages);
    return { evalCase, run, answer, failures: gradeAnswer({ evalCase, answer, contextText }) };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { evalCase, run, answer: '', failures: [{ check: 'request', detail }] };
  }
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function report(results: EvalResult[], runs: number) {
  for (const result of results.filter((item) => item.failures.length > 0)) {
    console.log(`\nFAIL ${result.evalCase.id} (run ${result.run})  ${result.evalCase.question}`);
    for (const failure of result.failures) console.log(`  - ${failure.check}: ${failure.detail}`);
    if (result.answer) console.log(`  answer: ${result.answer.replace(/\s+/g, ' ').trim()}`);
  }

  const byCase = Map.groupBy(results, (result) => result.evalCase.id);
  console.log('\ncase                          pass');
  for (const [id, caseResults] of byCase) {
    const passed = caseResults.filter((result) => result.failures.length === 0).length;
    console.log(`${id.padEnd(30)}${passed}/${runs}`);
  }
  const passed = results.filter((result) => result.failures.length === 0).length;
  console.log(`\n${passed}/${results.length} answers passed`);
  return passed === results.length;
}

async function main() {
  const config = loadLlmConfig();
  const { runs, caseFilter } = parseArgs(process.argv.slice(2));
  const cases = answerEvalCases.filter((evalCase) => !caseFilter || evalCase.id.includes(caseFilter));
  if (cases.length === 0) throw new Error(`No eval case matches --case=${caseFilter}.`);
  const jobs = cases.flatMap((evalCase) => Array.from({ length: runs }, (_, run) => ({ evalCase, run: run + 1 })));

  console.log(`Running ${jobs.length} answer evals against ${config.model} (${cases.length} cases x ${runs} runs)`);
  const results = await mapPool(jobs, CONCURRENCY, (job) => evaluate(config, job.evalCase, job.run));
  process.exitCode = report(results, runs) ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
