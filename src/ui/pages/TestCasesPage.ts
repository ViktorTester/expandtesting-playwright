import {expect, Locator, Page} from "@playwright/test";

export class TestCasesPage {

    readonly centerTitle: Locator;
    readonly footerTitle: Locator;
    readonly testCasesList: Locator;


    constructor(page: Page) {
        this.centerTitle = page.locator('b');
        this.footerTitle = page.getByRole('link', {name: 'Feedback for Us'});
        this.testCasesList = page.locator('.container > .panel-group');
    }

    async expectedSections(): Promise<void> {
        expect(this.centerTitle).toBeVisible();
        expect(this.footerTitle).toBeVisible();
    }

    async expectedTestListAmount(count: number): Promise<void> {
        expect(this.testCasesList).toHaveCount(count);
    }
}