import {defineConfig, devices} from '@playwright/test';
import {loadEnvConfig} from 'src/utils/envLoader';
import {validateConfig} from 'src/utils/configValidator';
import {STORAGE_STATE_PATH} from "@constants/paths";

/**
 * Environment-driven configuration (2-dimensional):
 * - BRAND: brand1 | brand2
 * - ENV: dev | staging
 *
 * Resolution:
 * - If BASE_URL is provided, it overrides config files.
 * - Otherwise config is loaded from: config/<brand>/<env>.json
 *
 * Examples:
 *   BRAND=brand1 ENV=dev npm test
 *   BRAND=brand2 ENV=staging npm test
 *   BASE_URL=https://custom.example.com BRAND=brand1 ENV=dev npm test
 */

const envConfig = loadEnvConfig();
validateConfig(envConfig);

const workerOverride = process["env"].PW_WORKERS ? Number(process["env"].PW_WORKERS) : undefined;

export default defineConfig({
    // Where tests live
    testDir: './tests',
    globalSetup: require.resolve('./src/utils/allureGlobalSetup'),

    // Global timeouts
    timeout: 50_000,
    expect: {timeout: 5_000},

    // Setup projects for authentication
    testMatch: /(.+\.)?(test|spec)\.[jt]sx?$/,

    // CI safety net: fail if test.only is present
    forbidOnly: !!process["env"].CI,

    // Basic flakiness control: retry on CI only
    retries: process["env"].CI ? 2 : 0,

    /**
     * Parallelism control:
     * - Prefer controlling workers from CI without code changes.
     * - If PW_WORKERS is not set, Playwright decides based on CPU.
     */
    ...(workerOverride !== undefined ? {workers: workerOverride} : {}),

    /**
     * Artifacts:
     * Keep all outputs under artifacts/ so CI can upload a single directory.
     */
    outputDir: 'artifacts/test-output',

    /**
     * Reporters:
     * - HTML: human-friendly (CI artifact)
     * - JUnit: CI integration
     * - JSON: analytics / custom tooling
     * - Allure: rich local and CI report for trends / drill-down
     */
    reporter: [
        ['html', {open: 'never', outputFolder: 'artifacts/playwright-report'}],
        ['junit', {outputFile: 'artifacts/junit.xml'}],
        ['json', {outputFile: 'artifacts/results.json'}],
        ['allure-playwright', {resultsDir: 'artifacts/allure-results', detail: true, suiteTitle: false}]
    ],

    /**
     * Shared settings for all tests/projects.
     * baseURL is resolved from:
     * - BASE_URL (override) OR
     * - config/<brand>/<env>.json
     */
    use: {
        baseURL: envConfig.baseUrl,

        // Headless in CI is typical; locally you can override via PW_HEADLESS=0 if needed
        headless: process["env"].PW_HEADLESS ? process["env"].PW_HEADLESS !== '0' : true,
        viewport: {width: 1280, height: 720},
        deviceScaleFactor: 1,
        locale: 'en-US',
        timezoneId: 'UTC',

        // Making a screenshot only on failure
        screenshot: 'only-on-failure',
        trace: 'on',

        // Wait for an element
        actionTimeout: 10_000,

        // Navigation custom timeout
        navigationTimeout: 30_000,
        testIdAttribute: 'data-qa',

    },

    /**
     * Test projects:
     * - setup: authenticates once and saves storage state
     * - guest projects: run tests without authentication
     * - auth projects: reuse saved authenticated session via storageState
     * - Chromium runs by default
     * - Firefox/WebKit run only when CROSS_BROWSER=1 (keeps CI fast)
     */
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium-guest',
            testMatch: /.*\.guest\.spec\.ts/,
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'chromium-auth',
            testMatch: /.*\.auth\.spec\.ts/,
            use: {
                ...devices['Desktop Chrome'],
                storageState: STORAGE_STATE_PATH,
            },
            dependencies: ['setup'],
        },
        ...(process.env.CROSS_BROWSER === '1'
            ? [
                {
                    name: 'firefox-guest',
                    testMatch: /.*\.guest\.spec\.ts/,
                    use: {
                        ...devices['Desktop Firefox'],
                    },
                },
                {
                    name: 'firefox-auth',
                    testMatch: /.*\.auth\.spec\.ts/,
                    use: {
                        ...devices['Desktop Firefox'],
                        storageState: STORAGE_STATE_PATH,
                    },
                    dependencies: ['setup'],
                },
                {
                    name: 'webkit-guest',
                    testMatch: /.*\.guest\.spec\.ts/,
                    use: {
                        ...devices['Desktop Safari'],
                    },
                },
                {
                    name: 'webkit-auth',
                    testMatch: /.*\.auth\.spec\.ts/,
                    use: {
                        ...devices['Desktop Safari'],
                        storageState: STORAGE_STATE_PATH,
                    },
                    dependencies: ['setup'],
                },
            ]
            : []),
    ]
});
