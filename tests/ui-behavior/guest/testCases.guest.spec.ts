import {test} from '@fixtures/pages';

test.describe('"Test Cases" page tests', () => {

    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
        await home.openTestCases();
    })

    test("@smoke @regression Open the page", async ({testCases}) => {
        testCases.expectedSections();
        testCases.expectedTestListAmount(27);
    })
});
