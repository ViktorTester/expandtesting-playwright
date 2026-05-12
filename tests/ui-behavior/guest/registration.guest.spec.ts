import {test} from '@fixtures/pages';
import {testUsers} from "@testdata/users/testUsers";
import {accountDeletion} from "@helpers/accountDeletion";
import {waitForDownload} from "@utils/download";

test.describe("Account Lifecycle Tests", () => {

    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
    });

    test.afterEach(async ({api}, testInfo) => {

        const hasCleanupTag = testInfo.tags.includes('@cleanup');

        if (!hasCleanupTag) return;

        await accountDeletion(api, testUsers.anotherUser2.email, testUsers.anotherUser2.password);
    })

    test.fixme("@smoke @regression Register and delete the user", async ({signup, home}) => {

        await home.openSignup();
        await signup.assertSignupLoaded();

        // Enter name + email on the signup form and move on
        await signup.startSignup(
            testUsers.validUser.firstName,
            testUsers.validUser.email
        );
        await signup.assertAccountInfoLoaded();
        await signup.assertSignupPrefilled(testUsers.validUser);

        // Fill out the main part of the form and click 'Create Account'
        await signup.registerUser({...testUsers.validUser});

        // Validate 'account created' page titles
        await signup.expectAccountCreated();

        // Exit the flow
        await signup.clickContinue();

        // Delete the account
        await home.deleteAccount();
        await home.expectAccountDeleted();

        // Return to home page
        await home.clickContinue();

    });

    test('@regression Register with existing email', async ({signup, config, home}) => {

        await home.openSignup();
        await signup.assertSignupLoaded();

        // Enter name + existing email on the signup form
        await signup.startSignup(
            testUsers.validUser.firstName,
            config.credentials.email
        );

        // Check validation message
        await signup.assertExistingEmail();

    })

    test('@regression Place Order: Register while Checkout',
        {tag: '@cleanup'}, async ({products, home, checkout, signup, cart}) => {

            // Add product to the cart and proceed to checkout
            await products.clickFirstProduct();
            await products.addProductToCart();
            await home.clickViewCart();
            await cart.proceedToCheckout();
            await cart.beginRegistration();

            // Register the user
            await signup.startSignup(
                testUsers.anotherUser2.firstName,
                testUsers.anotherUser2.email
            );

            await signup.assertAccountInfoLoaded();
            await signup.assertSignupPrefilled(testUsers.anotherUser2);
            await signup.registerUser({...testUsers.anotherUser2});
            await signup.expectAccountCreated();

            // Proceed to the home page and open the cart
            await home.clickContinue();
            await home.checkLoggedUserName(testUsers.anotherUser2.firstName);

            // Open the cart and proceed to checkout
            await home.openCart();
            await cart.proceedToCheckout();
            await checkout.checkHeadings();

            // Enter the comment and place the order
            await checkout.enterComment('Test comment');
            await checkout.clickPlaceOrder();

            // Fill card details and confirm the order
            await checkout.enterPaymentDetails();

        })

    test('@regression Place Order: Register before Checkout',
        {tag: '@cleanup'}, async ({products, home, checkout, signup, cart}) => {

            await home.openSignup();
            await signup.assertSignupLoaded();

            // Enter a name + email on the signup form and move on
            await signup.startSignup(
                testUsers.anotherUser2.firstName,
                testUsers.anotherUser2.email
            );
            await signup.assertAccountInfoLoaded();
            await signup.assertSignupPrefilled(testUsers.anotherUser2);

            // Fill out the main part of the form and click 'Create Account'
            await signup.registerUser({...testUsers.anotherUser2});

            // Validate 'account created' page titles
            await signup.expectAccountCreated();

            // Exit the flow
            await signup.clickContinue();
            await home.checkLoggedUserName(testUsers.anotherUser2.firstName);

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

    test('@regression Verify address details in checkout page',
        async ({signup, home, user, products, cart, checkout}) => {

            // Start the Signup flow
            await home.openSignup();
            await signup.assertSignupLoaded();

            // Enter a random name + email on the signup form and move on
            await signup.startSignup(
                user.firstName,
                user.email
            );
            await signup.assertAccountInfoLoaded();
            await signup.assertSignupPrefilled(user);

            // Fill out the main part of the form
            await signup.registerUser(user);
            await signup.expectAccountCreated();

            // Finish the Signup flow
            await signup.clickContinue();
            await home.checkLoggedUserName(user.firstName);

            // Add product to the cart and proceed to checkout
            await products.clickFirstProduct();
            await products.addProductToCart();
            await home.clickViewCart();
            await cart.proceedToCheckout();
            await checkout.checkTheTitles();

            // Check that the delivery address is the same address as filled in the signup form
            await checkout.deliveryAddressCheck(user.address1);
            await checkout.deliveryAddressCheck(user.address1);

            // Check that the billing address is the same address as filled in the signup form
            await checkout.billingAddressCheck(user.address1);
            await checkout.billingAddressCheck(user.address1);

            // Delete the account
            await home.deleteAccount();
            await home.expectAccountDeleted();

        })

    test('@regression Download Invoice after purchase order',
        async ({signup, home, user, products, cart, checkout}) => {

            // Add product and open the cart
            await products.clickFirstProduct();
            await products.addProductToCart();
            await home.closeTheModal();
            await home.openCart();

            // Proceed to checkout
            await cart.proceedToCheckout();
            await home.registerfromCheckoutModal();

            // Enter a random name + email on the signup form and move on
            await signup.startSignup(
                user.firstName,
                user.email
            );
            await signup.assertAccountInfoLoaded();
            await signup.assertSignupPrefilled(user);

            // Fill out the main part of the form
            await signup.registerUser(user);
            await signup.expectAccountCreated();

            // Finish the Signup flow
            await signup.clickContinue();
            await home.checkLoggedUserName(user.firstName);

            // Proceed to checkout from the cart
            await home.openCart();
            await cart.proceedToCheckout();

            // Check that the delivery address is the same address as filled in the signup form
            await checkout.deliveryAddressCheck(user.address1);
            await checkout.deliveryAddressCheck(user.address1);

            // Check that the billing address is the same address as filled in the signup form
            await checkout.billingAddressCheck(user.address1);
            await checkout.billingAddressCheck(user.address1);

            // Validate the item in the cart
            await cart.checkCartItemsQty(2);
            await cart.checkFirstProductData('Rs. 500', 'Rs. 500', '1');

            // Enter the comment and place the order
            await checkout.enterComment('Test comment');
            await checkout.clickPlaceOrder();

            // Fill card details and confirm the order
            await checkout.enterPaymentDetails();
            await checkout.clickPayConfirmOrder();

            // Download the invoice and validate it
            await waitForDownload(
                checkout,
                () => checkout.clickInvoiceDownload(),
                {fileName: /invoice.*\.txt/i}
            );

            // Exit the flow and delete the account
            await signup.clickContinue();
            await home.deleteAccount();
            await home.expectAccountDeleted();
            await home.clickContinue();
        })

})
