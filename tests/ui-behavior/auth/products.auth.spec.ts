import {test} from '@fixtures/pages';

test.describe('"Products" page tests with logged-in user', () => {
    // Login is performed through the storageState

    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
    })

    test.afterEach(async ({cart}, testInfo) => {
        const hasCleanupTag = testInfo.tags.includes('@cleanup');

        if (!hasCleanupTag) return;

        await cart.clickRemoveItem();

    })

    test('@regression Search Products and Verify Cart After Login (logged-in)', {tag: '@cleanup'}, async (
        {home, products, cart}) => {

        await home.openProducts();

        // Search for a product and check that it's visible'
        await products.searchForProduct('Winter Top');
        await products.searchedProductsTitlePresent();
        await products.checkProductsCount(1);
        await products.checkSearchOutput(/Winter Top/);

        // Add the product to the cart and open the cart
        await home.addFirstProductToCart();
        await home.closeTheModal();
        await home.openCart();

        // Validate the item in the cart
        await cart.checkCartItemsQty(1);
        await cart.checkFirstProductData('Rs. 600', 'Rs. 600', '1');

        // Go to the cart and validate the item in the cart
        await home.openCart();
        await cart.checkCartItemsQty(1);
        await cart.checkFirstProductData('Rs. 600', 'Rs. 600', '1');

    })
})