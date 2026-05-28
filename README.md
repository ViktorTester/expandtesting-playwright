# Automationexercise Playwright (TypeScript)

End-to-end and API test automation project built on **Playwright** and **TypeScript**.

The repository includes UI + API fixtures, strict quality gates (lint/typecheck), environment loading, and CI execution through Docker Compose.

---

## Technology stack

- **@playwright/test** (test runner)
- **TypeScript** (strict mode)
- **ESLint** + **eslint-plugin-playwright**
- **Allure Report** (`allure-playwright` + `allure-commandline`)
- **Husky** (local Git hooks)
- **Docker** + **Docker Compose**
- **GitHub Actions** (CI)

---

## Quick start

### Prerequisites

- Node.js 20.x
- `npm`

### Install

```bash
npm install
npx playwright install
```

Allure CLI requires Java 8+ for local report generation/opening.

### Run tests

```bash
# default: BRAND=brand1, ENV=dev
npm test

# explicit environment
BRAND=brand2 ENV=staging npm test

# cross-browser (adds firefox + webkit)
CROSS_BROWSER=1 BRAND=brand1 ENV=dev npm test
```

---

## Run tests with Docker Compose (local & CI)

Docker Compose is the canonical way to run tests.
```bash
docker compose up --build
```
With explicit parameters:
```bash
ENV=staging BRAND=brand2 CROSS_BROWSER=1 PW_WORKERS=2 docker compose up --build
```
Stop containers:
```bash
docker compose down
```
---

## Environments and brands

This project uses a **2D matrix**:

- `BRAND`: `brand1` | `brand2`
- `ENV`: `dev` | `staging`

Config files:

```
config/
  brand1/
    dev.json
    staging.json
  brand2/
    dev.json
    staging.json
```

Resolution rules:

1. If `BASE_URL` is set, it overrides `baseUrl` from the JSON file.
2. Otherwise the config is loaded from `config/<brand>/<env>.json`.
3. The run fails fast if the file is missing or values are invalid.

More details: see `ENVIRONMENT_SETUP.md`.

---

## API usage notes

- `apiBaseUrl` is read from `config/<brand>/<env>.json`.
- Endpoint values in `src/api/endpoints.ts` must be **relative** (for example `deleteAccount`, without leading `/`).
- API block usage in tests:

```ts
const response = await api.account().deleteAccount(
  TestUsers.validUser.email,
  TestUsers.validUser.password
).withLogs().send();
```

---

## Reports and artifacts

Playwright outputs are intentionally consolidated under `artifacts/`:

- `artifacts/playwright-report/` — HTML report
- `artifacts/allure-results/` — raw Allure results
- `artifacts/allure-report/` — generated Allure HTML report
- `artifacts/test-output/` — Playwright test output directory
- `artifacts/junit.xml` — JUnit report
- `artifacts/results.json` — JSON results

The same structure is used locally and in CI.

CI generates the Allure HTML report before uploading `artifacts/`, so the downloadable workflow artifact already contains both raw results and a ready-to-open report.
The test run also writes Allure metadata automatically:

- `artifacts/allure-results/environment.properties` - runtime context like brand, env, URLs, branch, and worker mode
- `artifacts/allure-results/executor.json` - run source metadata for local runs or GitHub Actions

In CI, Allure `history` is restored and saved per `branch + brand + env`, so trend widgets survive between workflow runs.

### Allure workflow

Every `npm test` run also writes Allure result files.

```bash
npm test
npm run allure:generate   # build artifacts/allure-report from artifacts/allure-results
npm run allure:open       # open the generated report in a browser
npm run allure:serve      # start a temporary local web server for the report
```

---

## Quality gates

### Local gates (Husky)

Local hooks provide fast feedback before push:

- `commit-msg` — enforces Conventional Commit format
- `pre-push` — runs `npm run typecheck` and `npm run test:smoke`

> Hooks can be bypassed with `--no-verify`. CI remains the source of truth.

### CI gates (GitHub Actions)

CI runs on pull requests targeting `main` / `master` only
(events: `opened`, `synchronize`, `reopened`, `ready_for_review`).

`main` branch is protected: a pull request cannot be merged until the CI checks pass.

1. Install dependencies
2. ESLint (fail-fast)
3. TypeScript typecheck (fail-fast)
4. Build Docker image
5. Run Playwright tests in Docker Compose
6. Upload artifacts

Husky is disabled in CI to avoid side effects:

```yaml
env:
  HUSKY: 0
```

---

## Common commands

```bash
npm run lint         # static analysis
npm run lint:fix     # auto-fix where possible
npm run typecheck    # TypeScript compilation checks
npm test             # all tests
npm run test:allure  # all tests with Allure results (same test run, explicit alias)
npm run test:smoke   # subset tagged with @smoke
npm run allure:generate
npm run allure:open
npm run allure:serve

# Convenience scripts
npm run test:brand1:dev
npm run test:brand1:staging
npm run test:brand2:dev
npm run test:brand2:staging
```

---

## Authentication and State Management

This project uses **Playwright Storage State** to manage user sessions:

- **Global Setup**: The `tests/helpers/auth.setup.ts` performs login once and saves the authentication state to a file.
- **Session Reuse**: Tests that require an authenticated session use `test.use({ storageState: STORAGE_STATE_PATH })` within a `test.describe` block.
- **Session Isolation (Guest Mode)**: Tests that must run without authentication (as a Guest) explicitly clear the state using `test.use({ storageState: { cookies: [], origins: [] } })`.

This allows combining guest and authenticated tests within the same file while maintaining strict state isolation.

---

## Design rationale (testing perspective)

The setup aligns with standard test-control and risk-reduction practices:

- **Fail-fast**: inexpensive checks (lint/typecheck/config validation) run before costly execution.
- **Determinism**: environment resolution is explicit and validated before tests start.
- **Traceability**: CI artifacts provide evidence for investigation and audit.

---

## License

Internal / educational use.
