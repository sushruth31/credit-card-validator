# Credit Card Validator — Luhn checksum validation, end to end

[![CI](https://github.com/sushruth31/credit-card-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/sushruth31/credit-card-validator/actions/workflows/ci.yml)

Validates credit card numbers on the server with the Luhn checksum and reports the issuing
network, with live feedback as you type. The interesting part is not the checksum — it is
everything Luhn does **not** catch: sixteen zeros pass it, a 16-digit number beginning `37`
passes it, and a `0`/`9` transposition slips through it. Those are handled as explicit rules
and pinned down by exhaustive tests.

| Valid                                | Invalid                                  |
| ------------------------------------ | ---------------------------------------- |
| ![Valid card](screenshots/valid.png) | ![Invalid card](screenshots/invalid.png) |

## Stack

| Choice             | Why                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm workspaces     | One install, one lockfile, and a `shared` package the client and server both import their types from — a contract change is a compile error on both sides, not a runtime surprise. |
| Express 5          | Errors thrown anywhere in the request path reach the error middleware, so handlers stay free of try/catch.                                                                         |
| React 19 + Vite    | The UI is a form and a status line; anything heavier would be scaffolding for its own sake.                                                                                        |
| Vitest + Supertest | One runner for both workspaces; the client suite reuses the app's own Vite config. Supertest exercises the app factory without binding a port.                                     |
| axios              | `AxiosError.response` is what lets the UI tell a 4xx error envelope from a dead connection.                                                                                        |

Node ≥ 20.12 (the server loads its `.env` with `node --env-file-if-exists`).

## Running it

```bash
git clone https://github.com/sushruth31/credit-card-validator.git
cd credit-card-validator
npm install
cp .env.example .env   # optional in development — the defaults already work
npm run dev            # API on :3001, UI on :5173
```

```bash
npm test         # 42 tests
npm run lint     # eslint + prettier
npm run build    # set VITE_API_URL first for a real deployment
```

Config is read and validated at startup: `PORT`, `CORS_ORIGIN`, `NODE_ENV`, `VITE_API_URL`.
Every one is documented in [`.env.example`](.env.example). A bad `PORT`, or a missing
`CORS_ORIGIN` under `NODE_ENV=production`, aborts the process and names the variable.

## Architecture

```
 client/                                   server/
 ┌──────────────┐  POST /api/validate  ┌──────────────────┐
 │ App.tsx      │ ───────────────────► │ validateRequest  │  shape guard, throws
 │  debounce    │   { cardNumber }     │      ↓           │
 │  render only │                      │ validateCard     │  sanitise → rules → Luhn
 │      ▲       │ ◄─────────────────── │      ↓           │
 └──────────────┘  { valid, cardType } │ errorHandler     │  the one place an HTTP
                        ▲              └──────────────────┘  failure becomes JSON
                        │
                  shared/types.ts  ── the contract, imported by both sides
```

| Module                        | Responsibility                                                       |
| ----------------------------- | -------------------------------------------------------------------- |
| `server/src/luhn.ts`          | The checksum. Pure, dependency-free, assumes digits.                 |
| `server/src/cardType.ts`      | Issuer table: prefix rule + legal lengths per network.               |
| `server/src/cardValidator.ts` | Sanitises input and walks an ordered table of rules.                 |
| `server/src/config.ts`        | Reads and validates the environment once, at import.                 |
| `server/src/app.ts`           | App factory, separate from the `listen` call so tests skip the port. |
| `client/src/format.ts`        | Display-only grouping into blocks of four.                           |
| `client/src/App.tsx`          | Renders state. No validation logic lives here.                       |

## Design notes

- **Luhn is one right-to-left pass — O(n) time, O(1) space, n ≤ 19.** No reversal, no
  allocation. Parity is counted from the right, which is why leading zeros are checksum-neutral
  and why an implementation that doubles from the left is wrong on even-length numbers.

- **Luhn's guarantees are narrower than people assume, so the tests assert them exhaustively.**
  It catches all 144 single-digit substitutions of a 16-digit card, and every adjacent
  transposition _except_ `0`↔`9` — doubling maps `0→0` and `9→18→9`, so that one swap leaves the
  sum untouched. The suite proves both properties, blind spot included. Luhn is a typo detector,
  not an authorization check.

- **Sixteen zeros pass the checksum** (a sum of zero is a multiple of ten). This is the classic
  bug in a naive validator. The all-zeros rejection is therefore a separate structural rule, not
  a redundant one, and there is a test that says exactly that.

- **Network detection carries its own length rule.** Each network is a row holding a prefix
  predicate _and_ the digit counts it is issued at, so a 16-digit number beginning `37` is
  rejected — valid checksum, but Amex issues at 15. A table beats an `if` chain here because a
  new network cannot leave its length rule stranded in some other switch. Mastercard's 2-series
  range `2221`–`2720` is tested one digit outside each end, and Discover at each of its four
  published blocks.

- **Rule order is data, not control flow.** `RULES` is an array walked with `find`, structural
  checks first and the checksum last, so the message names the most specific thing that is wrong
  rather than a generic failure.

- **A stale response cannot overwrite a newer one.** Each debounced effect (400 ms) captures an
  `active` flag that its cleanup clears, so a slow request that resolves after the user has typed
  again is dropped instead of flashing an outdated verdict.

- **`CORS_ORIGIN` is required in production rather than defaulted.** A localhost fallback would
  fail silently in the browser and a `*` fallback would be worse, so the process refuses to
  start. Bodies are capped at 1 kb — a card payload is about 40 bytes.

## Tests

42 tests. The server suites run the real code end to end; only the client stubs the network.

| Suite                   | Covers                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `luhn.test.ts`          | Check-digit uniqueness, the doubling fold, right-to-left parity, leading zeros, exhaustive substitution and transposition sweeps, the `0`/`9` blind spot. |
| `cardType.test.ts`      | Every network prefix and both edges of every range; Amex `34`/`37` against its JCB and Diners neighbours; per-network length rules.                       |
| `cardValidator.test.ts` | Rule ordering and messages, all-zeros, separator stripping, network-length rejection.                                                                     |
| `config.test.ts`        | Defaults, overrides, and both fail-fast paths.                                                                                                            |
| `app.test.ts`           | HTTP status contract: 200 with a verdict, 400 on a bad shape or malformed JSON, 413 on an oversized body.                                                 |
| `App.test.tsx`          | Rendered states, and that an API error envelope is shown while a dead connection falls back.                                                              |

Numbers used in the tests are published test values or generated with a check-digit helper —
none are real cards.

```bash
npm test
```

## API

`POST /api/validate` — body `{ "cardNumber": "4532 0151 1283 0366" }`; spaces and dashes allowed.

```json
{ "valid": true, "cardType": "Visa" }
{ "valid": false, "error": "Card number failed the Luhn checksum." }
```

A well-formed request returns `200` with the verdict in the body — the request succeeded even
when the card did not. A malformed request returns `4xx` with `{ valid, error, code }`, where
`code` is `VALIDATION_ERROR`, `BAD_REQUEST`, or `INTERNAL_ERROR`. `cardType` is one of Visa,
Mastercard, Amex, Discover, or Unknown.

No database, no auth, no persistence — deliberately out of scope.

## License

MIT
