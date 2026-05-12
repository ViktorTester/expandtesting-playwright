import {test as setup} from '@fixtures/pages';
import {STORAGE_STATE_PATH} from '@constants/paths';

/**
 * Global authentication setup
 * Performs login once and saves authentication state
 * to be reused across all tests that need authentication
 */
setup('authenticate', async ({signup, home, config, page}) => {
    await home.open();
    await home.assertLoaded();
    await home.openSignup();
    await signup.assertSignupLoaded();

    // Perform login
    await signup.startLogin(
        config.credentials.email,
        config.credentials.password
    );

    // Wait for successful navigation after login
    await home.assertSectionsPresent();

    // Save signed-in state
    await page.context().storageState({path: STORAGE_STATE_PATH});
});
