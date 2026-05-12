import {test} from '@fixtures/pages';
import {testTexts} from "@testdata/Texts/testTexts";
import {handleNextDialog} from "@helpers/dialog.helper";

test.describe('"Contact Us" Page Tests', () => {

    test.beforeEach(async ({home}) => {
        await home.open();
        await home.assertLoaded();
        await home.openContactUs();
    });

    test('@smoke @regression Submit the form with file uploading', async ({contact, page, config}) => {

        await contact.expectFormTitle();

        await contact.fillTheForm(
            config.credentials.username,
            config.credentials.email,
            testTexts.contactValidText
        );

        await contact.uploadFile(
            "src/testdata/files/test_dog.webp",
            /test_dog\.webp$/
        );

        // Handle the dialog
        await handleNextDialog(page, "accept");

        await contact.submitTheForm();
        await contact.expectSuccessMessage();
        await contact.clockHomeBtn();

    })

})
