import {test} from '@fixtures/pages'

test.describe('Subsription tests', () => {
    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
    })

    test('@smoke @regression Successfull subscription through the main page', async ({home, config}) => {
        await home.scrollToFooter();
        await home.verifySubsriptionVisible();
        await home.subscribe(config.credentials.email);
        await home.checkSubscriptionSuccessAlert();
    })

    test('@regression Successfull subscription through the cart', async ({home, config}) => {
        await home.openCart();
        await home.scrollToFooter();
        await home.verifySubsriptionVisible();
        await home.subscribe(config.credentials.email);
        await home.checkSubscriptionSuccessAlert();
    })
})
