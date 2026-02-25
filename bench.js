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

function fmt(n) {
  return n.toLocaleString("en-US");
}

// ── Setup ───────────────────────────────────────

const secretKey = generateSecretKey();
const generateKey = createKeyGenerator(secretKey);
const isKeyValid = createKeyValidator(secretKey);
const date = new Date();
const validKey = generateKey(date);

// ── Benchmarks ──────────────────────────────────

const benchmarks = [
  { name: "generateSecretKey", fn: () => generateSecretKey() },
  { name: "generateKey(date)", fn: () => generateKey(date) },
  { name: "validateKey(hash,date,28)", fn: () => isKeyValid(validKey, date, 28) },
];

// ── Output ──────────────────────────────────────

const line = "═".repeat(47);
console.log(chalk.bold.cyan(`\n${line}`));
console.log(chalk.bold.cyan("  expiring-key-generator  —  Benchmark"));
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

for (const { name, fn } of benchmarks) {
  const { ops, elapsed, opsPerSec } = bench(fn);
  console.log(
    `  ${chalk.white(name.padEnd(colName))}${chalk.green(fmt(opsPerSec).padStart(colOps))}${fmt(ops).padStart(colTotal)}${(elapsed.toFixed(2) + "s").padStart(colDur)}`
  );
}

console.log();
