import chalk from "chalk";
import {
  generateSecretKey,
  createKeyGenerator,
  createKeyValidator,
} from "expiring-key-generator";

const WINDOW_DAYS = 28;

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function header(text) {
  const line = "═".repeat(47);
  console.log(chalk.bold.cyan(`\n${line}`));
  console.log(chalk.bold.cyan(`  ${text}`));
  console.log(chalk.bold.cyan(`${line}\n`));
}

function section(num, title) {
  console.log(chalk.bold.yellow(`${num}. ${title}`));
}

// ── Main ────────────────────────────────────────

header("expiring-key-generator  —  Demo");

// 1. Generate secret key
section(1, "Generate Secret Key");
const secretKey = generateSecretKey();
console.log(`   → ${chalk.green(secretKey)}  (${secretKey.length} chars)\n`);

// 2. Generate keys from dates
section(2, "Generate Keys from Dates");
const generateKey = createKeyGenerator(secretKey);

const testDates = [
  { label: "today", offset: 0 },
  { label: "14 days ago", offset: 14 },
  { label: "30 days ago", offset: 30 },
];

const entries = testDates.map(({ label, offset }) => {
  const date = daysAgo(offset);
  const key = generateKey(date);
  return { date, label, offset, key };
});

console.log(
  `   ${chalk.dim("Date".padEnd(14))}  ${chalk.dim("Offset".padEnd(14))}  ${chalk.dim("Key")}`
);
for (const { date, label, key } of entries) {
  console.log(
    `   ${formatDate(date).padEnd(14)}  ${label.padEnd(14)}  ${chalk.white(key)}`
  );
}
console.log();

// 3. Validate keys
section(3, `Validate Keys (${WINDOW_DAYS}-day window)`);
const isKeyValid = createKeyValidator(secretKey);
const now = new Date();

for (const { date, label, key } of entries) {
  const valid = isKeyValid(key, now, WINDOW_DAYS);
  const icon = valid ? chalk.green("✓ valid") : chalk.red("✗ expired");
  console.log(`   ${formatDate(date)}  (${label.padEnd(12)})  ${icon}`);
}
console.log();

// 4. Deterministic check
section(4, "Deterministic Check");
const keyA = generateKey(now);
const keyB = generateKey(now);
const match = keyA === keyB;
const result = match
  ? chalk.green("✓ identical")
  : chalk.red("✗ mismatch");
console.log(`   Same date + same secret → same key  ${result}`);
console.log(`   Key A: ${chalk.dim(keyA)}`);
console.log(`   Key B: ${chalk.dim(keyB)}\n`);
