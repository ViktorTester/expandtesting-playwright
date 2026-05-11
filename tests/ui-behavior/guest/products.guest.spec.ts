import {test} from '@fixtures/pages';
import {categories} from "@constants/categories";
import {brands} from "@constants/brands";
import {poloProducts} from "@constants/products/poloProducts";
import {madameProducts} from "@constants/products/madameProducts";
import {testTexts} from "@testdata/Texts/testTexts";

test.describe('"Products" page tests', () => {

    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
    })

    test.afterEach(async ({cart}, testInfo) => {
        const hasCleanupTag = testInfo.tags.includes('@cleanup');

        if (!hasCleanupTag) return;

        await cart.clickRemoveItem();

    })

    test('@smoke @regression Open the Products page and reach the PDP', async ({home, products}) => {

        await home.openProducts();

        await products.checkAllProductsSelected();
        await products.expectedSections();
        await products.productIsVisible();
        await products.allProductsPresent(34);
        await products.clickFirstProduct();
        await products.checkProductInfo();

    })

    test('@regression Search for a product', async ({home, products}) => {

        await home.openProducts();

        await products.checkAllProductsSelected();
        await products.searchForProduct('Winter Top');
        await products.searchedProductsTitlePresent();
        await products.checkProductsCount(1);
        await products.checkSearchOutput(/Winter Top/);

    })

    test('@regression Add products in cart', async ({home, cart}) => {

        await home.openProducts();

        await home.hoverOverFirstProduct();
        await home.addFirstProductToCart();
        await home.closeTheModal();

        await home.hoverOverSecondProduct();
        await home.addSecondProductToCart();
        await home.clickViewCart();

        await cart.checkCartItemsQty(2);
        await cart.checkFirstProductData('Rs. 500', 'Rs. 500', '1');
        await cart.checkSecondProductData('Rs. 400', '1');

    })

    test('@regression Verify product quantity in cart', async ({home, products, cart}) => {

        await products.clickFirstProduct();
        await products.increaseProductQtyTo('4');
        await products.addProductToCart();
        await home.clickViewCart();
        await cart.checkCartItemsQty(1);
        await cart.checkFirstProductData('Rs. 500','Rs. 2000', '4');

    })

    test('@regression Remove products from cart', async ({home, cart}) => {

        await home.openProducts();

        await home.hoverOverFirstProduct();
        await home.addFirstProductToCart();
        await home.closeTheModal();
        await home.openCart();

        await cart.clickRemoveItem();

    })

    test('@regression View category products', async ({home}) => {

        // Choose a category filter and validate it
        await home.checkCategoriesPresent(3);
        await home.selectCategory(categories.WOMEN_DRESS);

        // Choose another category and validate it
        await home.selectCategory(categories.KIDS_DRESS);

    })

    test('@regression View & Cart brand products', async ({home, products}) => {

        await home.openProducts();

        // Check that all brands are present
        await home.checkBrandsPresent(8);

        // Select a brand and check that products are filtered by it
        await products.selectBrand(brands.POLO);
        await products.checkBrandsFiltering(poloProducts);

        // Select a brand and check that products are filtered by it
        await products.selectBrand(brands.MADAME);
        await products.checkBrandsFiltering(madameProducts);

    })

    test('@regression Search Products and Verify Cart After Login', {tag: '@cleanup'}, async (
        {home, products, cart, signup, config}) => {

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
        await cart.checkFirstProductData('Rs. 600','Rs. 600', '1');

        // Login
        await home.openSignup();
        await signup.startLogin(
            config.credentials.email,
            config.credentials.password
        );

        // Go to the cart and validate the item in the cart
        await home.openCart();
        await cart.checkCartItemsQty(1);
        await cart.checkFirstProductData('Rs. 600','Rs. 600', '1');

    })

    test('@regression Add review on product', async ({home, products, config}) => {

        await home.openProducts();

        // Open the PDP
        await products.checkAllProductsSelected();
        await products.clickFirstProduct();

        await products.checkReviewTitle();

        // Write the review
        await products.writeReview(
            config.credentials.username,
            config.credentials.email,
            testTexts.contactValidText
        );

        // Submit the review and validate the alert
        await products.submitReview();
        await products.verifySuccessReviewAlert();

    })

    test('@regression Add to cart from the recommended items', async ({home, cart}) => {

        await home.scrollToFooter();
        await home.recommendedItemsPresent();
        await home.addToCartReccomendedItem();
        await home.clickViewCart();
        await cart.checkCartItemsQty(1);

    })
});
