#!/usr/bin/env node

const args = process.argv.slice(2);

function getArg(name, fallback = '') {
  const key = `--${name}`;
  const idx = args.indexOf(key);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return fallback;
}

const mode = getArg('mode', 'notify');
const url = getArg('url', '');
const token = getArg('token', '');
const total = Number(getArg('total', '100'));
const concurrency = Number(getArg('concurrency', '20'));

if (!url) {
  console.error('Missing required --url');
  process.exit(1);
}

if (!Number.isInteger(total) || total <= 0) {
  console.error('--total must be a positive integer');
  process.exit(1);
}

if (!Number.isInteger(concurrency) || concurrency <= 0) {
  console.error('--concurrency must be a positive integer');
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

function buildBody(index) {
  const attackText = `payload-${index} <img src=x onerror=alert(1)> ' OR 1=1 --`;
  if (mode === 'proxy') {
    return {
      messages: [
        { role: 'user', text: attackText },
      ],
    };
  }

  return {
    email: `loadtest-${index}@example.com`,
    sessionId: `load-${Date.now()}-${index}`,
    messages: [
      { role: 'user', text: attackText },
      { role: 'assistant', text: 'ack' },
    ],
  };
}

async function hitEndpoint(index) {
  const start = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(buildBody(index)),
  });
  const elapsedMs = Date.now() - start;
  return { status: response.status, elapsedMs };
}

(async () => {
  console.log(`Stress test start: mode=${mode} total=${total} concurrency=${concurrency}`);
  console.log(`Target: ${url}`);

  const statusCounts = new Map();
  const latencies = [];
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= total) return;

      try {
        const result = await hitEndpoint(index);
        latencies.push(result.elapsedMs);
        statusCounts.set(result.status, (statusCounts.get(result.status) || 0) + 1);
      } catch {
        statusCounts.set('ERR', (statusCounts.get('ERR') || 0) + 1);
      }
    }
  }

  const startedAt = Date.now();
  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => worker()));
  const totalMs = Date.now() - startedAt;

  latencies.sort((a, b) => a - b);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length * 0.5)] : 0;
  const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
  const p99 = latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0;

  console.log('Status counts:');
  for (const [status, count] of [...statusCounts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])))) {
    console.log(`  ${status}: ${count}`);
  }

  console.log(`Latency ms -> p50=${p50} p95=${p95} p99=${p99}`);
  console.log(`Duration: ${totalMs}ms`);
})();
