# expiring-key-generator — Demo

Terminal demo for the [`expiring-key-generator`](https://www.npmjs.com/package/expiring-key-generator) npm package.

Demonstrates secret key generation, date-based key creation, expiry validation, and deterministic output.

## Quick Start

```bash
npm install
npm start
```

## Sample Output

```
═══════════════════════════════════════════════
  expiring-key-generator  —  Demo
═══════════════════════════════════════════════

1. Generate Secret Key
   → XP1BI2NCA9VLJ8ETF37HYKMZWUS5QG6DR4  (34 chars)

2. Generate Keys from Dates
   Date            Offset          Key
   2026-02-23      today           ipo0+VA3j/IfVZGomWJBmTFY896b6nORbglXBz2bO5k=
   2026-02-09      14 days ago     Cr1k7RgROXdKmcE63A5Hqqy5t0yjaXKp9wHAM+bruZM=
   2026-01-24      30 days ago     3r5wUnehSDoU2UrHrCHkSw5D5rIHKU0tiXpCc6E8B3M=

3. Validate Keys (28-day window)
   2026-02-23  (today       )  ✓ valid
   2026-02-09  (14 days ago )  ✓ valid
   2026-01-24  (30 days ago )  ✗ expired

4. Deterministic Check
   Same date + same secret → same key  ✓ identical
```

## Benchmark

```bash
npm run bench
```

```
═══════════════════════════════════════════════════════════════
  expiring-key-generator  —  Benchmark (memo vs plain)
═══════════════════════════════════════════════════════════════

  Function                           ops/sec   total ops duration
  generateSecretKey                  334,748     669,503    2.00s

  generateKey(date)                  763,709   1,527,418    2.00s
  generateKey [memo]               1,980,576   3,961,152    2.00s  ×2.6

  validateKey(hash,date,28)          305,220     610,440    2.00s
  validateKey [memo]               1,528,303   3,056,607    2.00s  ×5.0
```

Memoization skips SHA256 hashing on cache hits, giving ~2.6x speedup for key generation and ~5x for validation.

## License

MIT
