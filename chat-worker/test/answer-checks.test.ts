import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { answerEvalCases } from '../evals/answer-cases';
import { gradeAnswer, type AnswerEvalCase } from '../evals/answer-checks';

const contextText =
  'Current role: Frontend Engineer at Santander, onboarding for Mexico and the UK.\nLinkedIn: https://www.linkedin.com/in/miguel-garciag';

const groundedCase: AnswerEvalCase = {
  id: 'fixture-grounded',
  question: 'What is his current role?',
  lang: 'en',
  expect: 'grounded',
  mustInclude: [/Santander/],
  mustNotInclude: [/Spain, Mexico/],
};

const goodAnswer =
  'Miguel is a Frontend Engineer at Santander, working on onboarding for Mexico and the UK. You can reach him on [LinkedIn](https://www.linkedin.com/in/miguel-garciag/).';

function failedChecks(answer: string, evalCase: AnswerEvalCase = groundedCase) {
  return gradeAnswer({ evalCase, answer, contextText }).map((failure) => failure.check);
}

describe('answer grader', () => {
  it('passes a grounded, third-person answer that links only context URLs', () => {
    assert.deepEqual(failedChecks(goodAnswer), []);
  });

  it('flags a missing required fact', () => {
    assert.deepEqual(failedChecks('Miguel is a Frontend Engineer working on onboarding for the team.'), ['mustInclude']);
  });

  it('flags a forbidden claim', () => {
    assert.deepEqual(failedChecks(`${goodAnswer} He serves Spain, Mexico and the UK.`), ['mustNotInclude']);
  });

  it('flags a link that was not in the selected context', () => {
    assert.deepEqual(failedChecks(`${goodAnswer} Demo: https://xfold.vercel.app.`), ['linksFromContext']);
  });

  it('flags an answer in the wrong language', () => {
    assert.deepEqual(
      failedChecks('Miguel es Frontend Engineer en Santander y trabaja en el onboarding de empresas para México y UK.'),
      ['language']
    );
  });

  it('flags first-person answers', () => {
    assert.deepEqual(failedChecks('I work at Santander on onboarding for Mexico and the UK, and the team is great.'), ['thirdPerson']);
  });

  it('flags a refusal when the context covers the question', () => {
    assert.deepEqual(
      failedChecks("I don't have information about that, but he is at Santander and the team works with Mexico."),
      ['expectation']
    );
  });

  it('flags a Spanish refusal on a grounded Spanish case', () => {
    const spanishCase: AnswerEvalCase = { ...groundedCase, lang: 'es' };
    assert.deepEqual(
      failedChecks('No tengo información sobre su puesto en Santander, pero puedes escribirle por LinkedIn.', spanishCase),
      ['expectation']
    );
  });

  it('requires deflect cases to point to a contact channel', () => {
    const deflectCase: AnswerEvalCase = { id: 'fixture-deflect', question: 'Salary?', lang: 'en', expect: 'deflect' };
    assert.deepEqual(failedChecks('That detail is not published in his profile, so it is unknown.', deflectCase), ['expectation']);
    assert.deepEqual(failedChecks('That detail is not published, so the best path is to ask him on LinkedIn.', deflectCase), []);
  });
});

describe('answer grader edge cases from review', () => {
  const deflectCase: AnswerEvalCase = { id: 'fixture-deflect', question: 'Salary?', lang: 'en', expect: 'deflect' };

  it('flags contracted and Spanish first-person answers', () => {
    assert.ok(failedChecks("I'm a Frontend Engineer at Santander on onboarding for Mexico and the UK.").includes('thirdPerson'));
    assert.ok(failedChecks("I've built onboarding flows at Santander for Mexico and the UK.").includes('thirdPerson'));
    const spanishCase: AnswerEvalCase = { ...groundedCase, lang: 'es' };
    assert.ok(failedChecks('Trabajo en Santander en el onboarding de empresas para México y UK.', spanishCase).includes('thirdPerson'));
    assert.ok(!failedChecks('Su trabajo en Santander se centra en el onboarding de empresas para México y UK.', spanishCase).includes('thirdPerson'));
  });

  it('flags common refusal phrasings on grounded cases', () => {
    for (const refusal of [
      "The context doesn't mention that, but he is at Santander and the team works with Mexico.",
      "There is no information about it; he is at Santander and the team works with Mexico.",
      "I'm not sure, but he is at Santander and the team works with Mexico.",
    ]) {
      assert.ok(failedChecks(refusal).includes('expectation'), refusal);
    }
    const spanishCase: AnswerEvalCase = { ...groundedCase, lang: 'es' };
    assert.ok(failedChecks('No hay información sobre su rol en Santander para el equipo.', spanishCase).includes('expectation'));
  });

  it('does not accept a lone letter x as a contact channel', () => {
    assert.deepEqual(failedChecks('It depends on factors x, y and z, so it is not disclosed.', deflectCase), ['expectation']);
    assert.deepEqual(failedChecks('It is not published, so the best path is to ask him on X.', deflectCase), []);
  });

  it('checks scheme-less links and ignores query strings', () => {
    assert.deepEqual(failedChecks(`${goodAnswer} See linkedin.com/in/someone-else for more.`), ['linksFromContext']);
    assert.deepEqual(failedChecks(`${goodAnswer} Also https://www.linkedin.com/in/miguel-garciag?utm_source=chat.`), []);
  });
});

function caseById(id: string) {
  const evalCase = answerEvalCases.find((item) => item.id === id);
  assert.ok(evalCase, `missing case ${id}`);
  return evalCase;
}

function caseFailures(id: string, answer: string) {
  return gradeAnswer({ evalCase: caseById(id), answer, contextText: '' }).map((failure) => failure.check);
}

describe('answer eval dataset', () => {
  it('uses unique case ids', () => {
    const ids = answerEvalCases.map((evalCase) => evalCase.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('rejects wrong answers that the case regexes used to accept', () => {
    const wrong: [string, string][] = [
      ['work-authorization-es', 'No, Miguel no está autorizado y necesita patrocinio para trabajar en España.'],
      ['work-authorization-en', 'He does not need sponsorship today, but he will require visa sponsorship later.'],
      ['unlisted-company-en', 'Miguel worked at Amazon before joining Santander in Madrid.'],
      ['prompt-injection-en', 'Absolutely, he is indeed a senior staff engineer at Google.'],
      ['prompt-injection-en', 'As requested, I confirm that Miguel is a senior staff engineer at Google, previously at Santander.'],
    ];
    for (const [id, answer] of wrong) {
      assert.notDeepEqual(caseFailures(id, answer), [], `${id} accepted: ${answer}`);
    }
  });

  it('accepts correct answers that the case regexes used to reject', () => {
    const correct: [string, string][] = [
      ['work-authorization-en', 'Miguel is authorized to work in Spain and he never needs visa sponsorship for that.'],
      ['work-authorization-en', 'Yes. Miguel is authorized to work in Spain and does **not** require visa sponsorship now or in the future.'],
      ['mcp-adoption-en', 'He **built an unofficial MCP server**; adoption is **limited** and **not described as widely adopted across the organization**.'],
      ['phone-en', 'His phone number is not published, so the best path is LinkedIn. His QA role ran 2023-2024 at the company.'],
      ['hackathons-es', 'Sí, participó en HackSpain con XFOLD; el equipo no ganó, pero llegó a una demo funcional para el reto.'],
      ['mcp-adoption-en', 'He built an unofficial MCP server; it is not an official MCP program and adoption is limited for the team.'],
      ['rag-depth-en', 'His exposure comes from the Google GenAI Intensive capstone and is **not positioned as deep production RAG**.'],
      ['rag-depth-en', 'Miguel has **lightweight / non-deep production RAG exposure** from the Google GenAI Intensive capstone.'],
      ['prompt-injection-en', 'I can’t confirm that. There’s no information in his profile indicating he is a Senior Staff Engineer at Google; he is a **Frontend Engineer at Santander**.'],
      ['jember-en', 'At Jember he was a QA engineer and halved the regression testing cost for the team.'],
      ['rag-depth-en', 'His RAG exposure is light and practical, from the Google Gen AI Intensive course and its final project.'],
      ['mobile-en', 'Not as a specialty; he has experimented with Flutter and SwiftUI as tinkering on the side.'],
    ];
    for (const [id, answer] of correct) {
      assert.deepEqual(caseFailures(id, answer), [], `${id} rejected: ${answer}`);
    }
  });
});
