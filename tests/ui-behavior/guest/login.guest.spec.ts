import {test} from "@fixtures/pages";
import {testUsers as user} from "@testdata/users/testUsers";

test.describe('Login Lifecycle Tests', () => {

    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
    })

    test.afterEach(async ({home, cart}, testInfo) => {
        if (testInfo.tags.includes('@cleanup')) {
            await home.openCart();
            await cart.clickRemoveItem();
            await home.logout();
        }
    });

    test("@smoke @regression Login and Logout", {tag: '@Logout'},async (
        {signup, config, home}) => {

        await home.openSignup();
        await signup.assertSignupLoaded();

        // Entering email + password on the login form and moving on
        await signup.startLogin(
            config.credentials.email,
            config.credentials.password
        );
        await home.assertSectionsPresent();

    })

    test('@regression Login with incorrect credentials', async ({signup, home}) => {

        await home.openSignup();
        await signup.assertSignupLoaded();

        // Entering incorrect email + password on the login form
        await signup.startLogin(
            user.anotherUser.email,
            user.anotherUser.password
        );

        await signup.assertInvalidCreds();

    })

    test('@regression Login before Checkout', {tag: '@cleanup'}, async (
        {config, home, signup, products, cart, checkout}) => {

        await home.openSignup();
        await signup.assertSignupLoaded();

        // Entering email + password on the login form and moving on
        await signup.startLogin(
            config.credentials.email,
            config.credentials.password
        );

        await home.checkLoggedUserName(config.credentials.username);

        // Add product to the cart and proceed to checkout
        await products.clickFirstProduct();
        await products.addProductToCart();
        await home.clickViewCart();
        await cart.proceedToCheckout();
        await checkout.checkHeadings();

        // Enter the comment and place the order
        await checkout.enterComment('Test comment');
        await checkout.clickPlaceOrder();

        // Fill card details and confirm the order
        await checkout.enterPaymentDetails();

    })
});