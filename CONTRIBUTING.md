# Contributing

This repository is a Playwright + TypeScript test automation scaffold. Contributions should preserve determinism, readability, and CI repeatability.

The rules below are intended to support predictable test outcomes and efficient defect analysis (test control and traceability principles).

---

## Workflow expectations

- Prefer small, reviewable pull requests.
- Keep changes isolated (docs vs. config vs. test logic) when practical.
- CI validation is authoritative; local gates are convenience only.

---

## Commit messages (Conventional Commits)

All commits must follow:

```
<type>(<scope>)?: <subject>
```

Allowed `type` values:

- `feat` — new functionality
- `fix` — bug fix
- `test` — tests (any level)
- `refactor` — refactoring without behavior change
- `docs` — documentation
- `style` — formatting, linting
- `perf` — performance improvements
- `build` — build system or dependencies
- `ci` — CI/CD changes
- `chore` — maintenance tasks
- `revert` — revert previous commit

Examples:

```
test(smoke): add login smoke test
fix(api): handle expired token
ci: upload artifacts directory
```

---

## Local quality gates (Husky)

Active hooks in `.husky/`:

- `commit-msg` — blocks invalid commit message format
- `pre-push` — runs:
  - `npm run typecheck`
  - `npm run test:smoke`

Notes:

- Hooks can be bypassed with `--no-verify`.
- CI remains the source of truth.
- If hooks change, documentation must be updated in the same pull request.

---

## CI validation

GitHub Actions runs on pull requests targeting `main` / `master`
(events: `opened`, `synchronize`, `reopened`, `ready_for_review`).

`main` is protected: merging is blocked until CI succeeds (required status checks).

Current pipeline:

1. Install dependencies
2. Lint (fail-fast)
3. Typecheck (fail-fast)
4. Restore cached Allure `history`
5. Run Playwright tests in Docker Compose
6. Inject previous history into `artifacts/allure-results/history`
7. Generate Allure HTML report from `artifacts/allure-results`
8. Refresh/save cached history from `artifacts/allure-report/history`
9. Upload `artifacts/`

Rationale:

- Static checks provide early feedback.
- Uploading both raw and rendered reports reduces defect triage time.

Allure metadata is also generated automatically:

- `environment.properties` captures runtime context such as brand, environment, URLs, branch, and worker mode
- `executor.json` identifies whether the run came from GitHub Actions or a local machine

---

## Environments, brands, and secrets

### Configuration

Tests are configured using a 2D matrix:

- `BRAND`: `brand1` | `brand2`
- `ENV`: `dev` | `staging`

Config files:

```
config/<brand>/<env>.json
```

`BASE_URL` overrides the JSON `baseUrl` value.

### Secrets

Current repository JSON files include test credentials in `credentials.username`, `credentials.email`, and `credentials.password`.

For sensitive environments:

- Store values in GitHub Actions secrets.
- Inject them at runtime instead of committing them to repo JSON.

Avoid committing any secrets or tokens.

---

## Adding tests

When adding tests, keep the following structure goals:

- Tests contain only test intent and assertions.
- Reusable actions and components live in `src/`.
- Avoid `waitForTimeout`; use Playwright’s web-first assertions and stable locators.

### State Management in Tests

To handle authentication state within test files:

- **For Authenticated tests**: Wrap tests in a `describe` block and use `test.use({ storageState: STORAGE_STATE_PATH })`.
- **For Guest tests**: Wrap tests in a `describe` block and use `test.use({ storageState: { cookies: [], origins: [] } })` to ensure a clean session.

Tagging:

- Use `@smoke` for minimal checks that can run quickly.
- Use `@regression` (optional) for broader coverage.

---

## Code style

- Keep TypeScript strict-mode clean (`npm run typecheck` must be green).
- Keep ESLint clean (`npm run lint` must be green).
- Prefer explicit environment control and deterministic behavior.

---

## Troubleshooting

### CI uploads are empty

This project writes reports under `artifacts/`. Ensure the workflow uploads `artifacts/` so Playwright HTML, Allure results, and generated reports are preserved.

### Allure report does not open

Allure CLI requires Java 8+.
Check local availability with:

```bash
java -version
```

If test execution succeeded but `npm run allure:generate` fails, verify that `artifacts/allure-results/` exists and is not empty.

### Allure trends are missing

Allure trend widgets depend on `history/`.
This project restores and saves that directory through the GitHub Actions cache, keyed by `branch + brand + env`.
If trends disappear after a workflow change, verify the cache restore/save steps in [ci.yml].

### Husky errors in non-git environments

When the repository is copied without `.git` (e.g., downloaded as a ZIP), Husky may warn. This does not occur when the project is cloned normally.

---

## CI execution

CI uses the same docker-compose.yml as local runs:

1. Lint
2. Typecheck
3. docker compose build
4. docker compose up
5. Upload artifacts/

This ensures identical runtime semantics.
