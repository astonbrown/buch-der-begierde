import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createOllamaConfig, testOllamaConnection } from '../js/config.js';

describe('Ollama config', () => {
  it('creates config with default endpoint and model', () => {
    const config = createOllamaConfig();
    assert.equal(config.endpoint, 'http://localhost:11434');
    assert.equal(config.model, 'llama3.1');
    assert.equal(config.enabled, true);
  });

  it('falls back to 127.0.0.1 when localhost probe fails', async () => {
    const originalFetch = globalThis.fetch;
    const calls = [];
    globalThis.fetch = async (url) => {
      calls.push(url);
      if (String(url).includes('localhost')) {
        throw new Error('localhost probe failed');
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ models: [{ name: 'llama3.2' }] })
      };
    };

    try {
      const result = await testOllamaConnection({ endpoint: 'http://localhost:11434', timeout: 200 });
      assert.equal(result.ok, true);
      assert.equal(calls.length, 2);
      assert.match(calls[1], /127\.0\.0\.1/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('reports connection failure for unreachable endpoint', async () => {
    const result = await testOllamaConnection({ endpoint: 'http://127.0.0.1:1', timeout: 200 });
    assert.equal(result.ok, false);
    assert.match(result.message, /nicht erreichbar|Timeout|Fehler/i);
  });
});
