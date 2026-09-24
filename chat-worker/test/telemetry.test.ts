import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseChatAttempt,
  parseFailoverReason,
  resolveRequestId,
} from '../src/telemetry';

describe('resolveRequestId', () => {
  it('passes through a valid inbound request id', () => {
    assert.equal(
      resolveRequestId('test-req-12345', () => 'generated'),
      'test-req-12345'
    );
  });

  it('generates a new id when the header is missing', () => {
    assert.equal(resolveRequestId(null, () => 'generated-id'), 'generated-id');
  });

  it('generates a new id when the header is invalid', () => {
    assert.equal(
      resolveRequestId('<script>alert(1)</script>', () => 'generated-id'),
      'generated-id'
    );
    assert.equal(resolveRequestId('short', () => 'generated-id'), 'generated-id');
  });

  it('generates a new id when the header is too long', () => {
    assert.equal(
      resolveRequestId('a'.repeat(65), () => 'generated-id'),
      'generated-id'
    );
  });

  it('generates a UUID by default', () => {
    const id = resolveRequestId(null);
    assert.match(id, /^[0-9a-f-]{36}$/);
  });
});

describe('parseChatAttempt', () => {
  it('accepts primary and secondary', () => {
    assert.equal(parseChatAttempt('primary'), 'primary');
    assert.equal(parseChatAttempt('secondary'), 'secondary');
  });

  it('falls back to direct for anything else', () => {
    assert.equal(parseChatAttempt(null), 'direct');
    assert.equal(parseChatAttempt('bogus'), 'direct');
    assert.equal(parseChatAttempt('PRIMARY'), 'direct');
  });
});

describe('parseFailoverReason', () => {
  it('accepts known failover reason shapes', () => {
    assert.equal(parseFailoverReason('status:503'), 'status:503');
    assert.equal(parseFailoverReason('timeout'), 'timeout');
    assert.equal(parseFailoverReason('primary-degraded'), 'primary-degraded');
    assert.equal(parseFailoverReason('network'), 'network');
  });

  it('rejects missing or malformed values', () => {
    assert.equal(parseFailoverReason(null), null);
    assert.equal(parseFailoverReason('<script>'), null);
    assert.equal(parseFailoverReason('status:ABC'), null);
    assert.equal(parseFailoverReason('a'.repeat(40)), null);
  });
});
