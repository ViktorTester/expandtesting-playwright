import {test} from "@fixtures/pages";

test.describe('Page scroller scenarios', () => {

    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
    });

    test('@smoke @regression Scroll Up and Down functionality with "arrow" buton', async ({home}) => {

        await home.scrollToFooter();
        await home.verifySubsriptionVisible();

        // Press the scroller arrow and validate the title
        await home.pressArrowUpScroll();
        await home.checkMainPageCarouselTitle();

    })

    test('@regression Scroll Up and Down functionality without "arrow" button', async ({home}) => {

        await home.scrollToFooter();
        await home.verifySubsriptionVisible();

        // Scroll the page up and validate the title
        await home.scrollToHeader();
        await home.checkMainPageCarouselTitle();

    })
});