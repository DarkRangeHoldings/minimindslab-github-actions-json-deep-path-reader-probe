import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

if (typeof payloadRaw !== 'string') throw new Error('Invalid input');
if (typeof outputPath !== 'string' || outputPath.length === 0) throw new Error('Invalid output');

let payload;
try {
  payload = JSON.parse(payloadRaw);
} catch {
  throw new Error('Invalid input');
}

if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid input');

const keys = Object.keys(payload);
if (keys.length !== 2 || !Object.prototype.hasOwnProperty.call(payload, 'value') || !Object.prototype.hasOwnProperty.call(payload, 'path')) {
  throw new Error('Invalid input');
}

const { value, path } = payload;

if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid input');
if (typeof path !== 'string' || path.length === 0) throw new Error('Invalid input');

const segments = path.split('.');
if (segments.length === 0) throw new Error('Invalid input');

const segRe = /^[A-Za-z0-9_-]+$/;
for (const s of segments) {
  if (s.length === 0 || !segRe.test(s)) throw new Error('Invalid input');
}

let current = value;
for (let i = 0; i < segments.length; i += 1) {
  const seg = segments[i];
  if (
    current === null ||
    typeof current !== 'object' ||
    !Object.prototype.hasOwnProperty.call(current, seg)
  ) {
    appendFileSync(outputPath, `result=${JSON.stringify({ exists: false, value: null })}\n`);
    process.exit(0);
  }
  current = current[seg];
}

appendFileSync(outputPath, `result=${JSON.stringify({ exists: true, value: current })}\n`);