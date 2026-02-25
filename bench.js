import { performance } from "node:perf_hooks";
import chalk from "chalk";
import {
  generateSecretKey,
  createKeyGenerator,
  createKeyValidator,
} from "expiring-key-generator";

const DURATION_MS = 2000;

function bench(fn, durationMs = DURATION_MS) {
  let ops = 0;
  const start = performance.now();
  while (performance.now() - start < durationMs) {
    fn();
    ops++;
  }
  const elapsed = (performance.now() - start) / 1000;
  const opsPerSec = Math.round(ops / elapsed);
  return { ops, elapsed, opsPerSec };
}

function memoize(fn, keyFn = (...args) => args.join("|")) {
  const cache = new Map();
  return (...args) => {
    const k = keyFn(...args);
    if (cache.has(k)) return cache.get(k);
    const result = fn(...args);
    cache.set(k, result);
    return result;
  };
}

function fmt(n) {
  return n.toLocaleString("en-US");
}

// ── Setup ───────────────────────────────────────

const secretKey = generateSecretKey();
const generateKey = createKeyGenerator(secretKey);
const isKeyValid = createKeyValidator(secretKey);

const datePool = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return d;
});

const validKeys = datePool.map((d) => ({ hash: generateKey(d), date: d }));

const memoGenerateKey = memoize(generateKey, (d) => d.toISOString().slice(0, 10));
const memoIsKeyValid = memoize(isKeyValid, (hash, d, days) =>
  `${hash}|${d.toISOString().slice(0, 10)}|${days}`
);

// warm memo caches with all 30 dates
for (const d of datePool) memoGenerateKey(d);
for (const { hash, date } of validKeys) memoIsKeyValid(hash, date, 28);

// ── Benchmark definitions ───────────────────────

let idx = 0;
function nextIdx() {
  idx = (idx + 1) % datePool.length;
  return idx;
}

const groups = [
  {
    rows: [
      { name: "generateSecretKey", fn: () => generateSecretKey() },
    ],
  },
  {
    rows: [
      { name: "generateKey(date)", fn: () => generateKey(datePool[nextIdx()]) },
      { name: "generateKey [memo]", fn: () => memoGenerateKey(datePool[nextIdx()]), memo: true },
    ],
  },
  {
    rows: [
      {
        name: "validateKey(hash,date,28)",
        fn: () => { const e = validKeys[nextIdx()]; isKeyValid(e.hash, e.date, 28); },
      },
      {
        name: "validateKey [memo]",
        fn: () => { const e = validKeys[nextIdx()]; memoIsKeyValid(e.hash, e.date, 28); },
        memo: true,
      },
    ],
  },
];

// ── Output ──────────────────────────────────────

const width = 63;
const line = "═".repeat(width);
console.log(chalk.bold.cyan(`\n${line}`));
console.log(chalk.bold.cyan("  expiring-key-generator  —  Benchmark (memo vs plain)"));
console.log(chalk.bold.cyan(`${line}\n`));

const colName = 28;
const colOps = 14;
const colTotal = 12;
const colDur = 9;

console.log(
  chalk.dim(
    `  ${"Function".padEnd(colName)}${"ops/sec".padStart(colOps)}${"total ops".padStart(colTotal)}${"duration".padStart(colDur)}`
  )
);

for (const group of groups) {
  let plainOpsPerSec = null;

  for (const { name, fn, memo } of group.rows) {
    const { ops, elapsed, opsPerSec } = bench(fn);

    if (!memo) plainOpsPerSec = opsPerSec;

    const speedup =
      memo && plainOpsPerSec
        ? chalk.magenta(`  ×${(opsPerSec / plainOpsPerSec).toFixed(1)}`)
        : "";

    const nameCol = memo ? chalk.magenta(name.padEnd(colName)) : chalk.white(name.padEnd(colName));

    console.log(
      `  ${nameCol}${chalk.green(fmt(opsPerSec).padStart(colOps))}${fmt(ops).padStart(colTotal)}${(elapsed.toFixed(2) + "s").padStart(colDur)}${speedup}`
    );
  }

  console.log();
}
