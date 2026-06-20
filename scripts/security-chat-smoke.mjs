#!/usr/bin/env node

const args = process.argv.slice(2);

function getArg(name, fallback = '') {
  const key = `--${name}`;
  const idx = args.indexOf(key);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return fallback;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

const mode = getArg('mode', 'notify');
const url = getArg('url', '');
const token = getArg('token', '');

if (!url) {
  console.error('Missing required --url');
  process.exit(1);
}

function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    if (mode === 'proxy') headers['x-chat-proxy-token'] = token;
    if (mode === 'notify') headers['x-chat-notify-token'] = token;
  }
  return headers;
}

async function postJson(body) {
  const start = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  const elapsedMs = Date.now() - start;
  const text = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    elapsedMs,
    body: text.slice(0, 350),
  };
}

function printResult(name, result, pass) {
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${name} -> HTTP ${result.status} (${result.elapsedMs}ms)`);
  if (!pass || hasFlag('verbose')) {
    console.log(`  body: ${result.body}`);
  }
}

async function runNotifySuite() {
  const tests = [
    {
      name: 'reject invalid email',
      body: { email: 'not-an-email', sessionId: 'sec-1', messages: [] },
      pass: (r) => r.status === 400,
    },
    {
      name: 'accept sql-like content safely',
      body: {
        email: 'security@company.com',
        sessionId: 'sec-2',
        messages: [{ role: 'user', text: "' OR 1=1; DROP TABLE users; --" }],
      },
      pass: (r) => [200, 401, 429].includes(r.status),
    },
    {
      name: 'accept xss-like content safely',
      body: {
        email: 'security2@company.com',
        sessionId: 'sec-3',
        messages: [{ role: 'user', text: '<img src=x onerror=alert(1)><script>alert(1)</script>' }],
      },
      pass: (r) => [200, 401, 429].includes(r.status),
    },
  ];

  let failed = 0;
  for (const test of tests) {
    const result = await postJson(test.body);
    const pass = test.pass(result);
    printResult(test.name, result, pass);
    if (!pass) failed += 1;
  }

  return failed;
}

async function runProxySuite() {
  const tests = [
    {
      name: 'reject empty messages',
      body: { messages: [] },
      pass: (r) => [400, 401].includes(r.status),
    },
    {
      name: 'handle sql-like prompt safely',
      body: {
        messages: [{ role: 'user', text: "' OR 1=1; SELECT * FROM users; --" }],
      },
      pass: (r) => [200, 401, 429, 502].includes(r.status),
    },
    {
      name: 'handle xss-like prompt safely',
      body: {
        messages: [{ role: 'user', text: '<script>alert(1)</script> discuss attribution auditability' }],
      },
      pass: (r) => [200, 401, 429, 502].includes(r.status),
    },
  ];

  let failed = 0;
  for (const test of tests) {
    const result = await postJson(test.body);
    const pass = test.pass(result);
    printResult(test.name, result, pass);
    if (!pass) failed += 1;
  }

  return failed;
}

(async () => {
  const failed = mode === 'proxy' ? await runProxySuite() : await runNotifySuite();
  if (failed > 0) {
    console.error(`Security smoke tests failed: ${failed}`);
    process.exit(1);
  }
  console.log('Security smoke tests passed.');
})();
