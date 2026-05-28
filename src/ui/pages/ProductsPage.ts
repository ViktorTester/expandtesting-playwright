import {expect, Locator, Page} from "@playwright/test";
import {BasePage} from "@pages/BasePage";
import {productsCopy as text} from "@ui/copy/productsCopy";
import {Brand} from "@constants/brands";
import {BrandsSection} from "@pages/components/Brands";
import {step} from 'src/decorators/step'

export class ProductsPage extends BasePage {

    readonly brands: BrandsSection;

    readonly centerTitle: Locator;
    readonly saleBanner: Locator;
    readonly singleProduct: Locator;
    readonly firstProduct: Locator;

    readonly productName: Locator;
    readonly productCategory: Locator;
    readonly productPrice: Locator;
    readonly productAvailability: Locator;
    readonly productCondition: Locator;
    readonly productBrand: Locator;

    readonly searchInput: Locator;
    readonly searchBtn: Locator;
    readonly searchedProductsTitle: Locator
    readonly searchedProductCount: Locator;
    readonly searchResults: Locator;

    readonly productQty: Locator;
    readonly addToCartBtn: Locator;

    readonly womenDressCategoryTitle: Locator;
    readonly productNames: Locator;

    readonly writeReviewTitle: Locator;
    readonly reviewNameInput: Locator;
    readonly reviewEmailInput: Locator;
    readonly reviewTextInput: Locator;
    readonly submitReviewBtn: Locator;
    readonly successReviewAlertText: Locator;


    constructor(page: Page) {
        super(page);

        this.centerTitle = page.getByRole('heading', {name: 'All Products'});
        this.saleBanner = page.locator('#sale_image');
        this.singleProduct = page.getByRole('img', {name: 'ecommerce website products'});
        this.firstProduct = page.getByRole('link', {name: ' View Product'}).first();

        this.productName = page.getByRole('heading', {name: 'Blue Top'});
        this.productCategory = page.getByText('Category: Women > Tops');
        this.productPrice = page.getByText('Rs. 500');
        this.productAvailability = page.getByText('Availability: In Stock');
        this.productCondition = page.getByText('Condition: New');
        this.productBrand = page.getByText('Brand: Polo');

        this.searchInput = page.locator('#search_product');
        this.searchBtn = page.locator('#submit_search');
        this.searchedProductsTitle = page.locator('.title.text-center');

        this.searchedProductCount = page.locator('.features_items .col-sm-4');
        this.searchResults = page.locator('.productinfo.text-center > p')

        this.productQty = page.locator('#quantity');
        this.addToCartBtn = page.getByRole('button', {name: ' Add to cart'});

        this.womenDressCategoryTitle = page.getByRole('heading', {name: text.womenDressCategoryTitle})

        this.brands = new BrandsSection(page);
        this.productNames = page.locator('.single-products > div > p');

        this.writeReviewTitle = page.getByText(text.writeReviewTitle);
        this.reviewNameInput = page.locator('#name');
        this.reviewEmailInput = page.locator('#email');
        this.reviewTextInput = page.locator('#review');
        this.submitReviewBtn = page.locator('#button-review');
        this.successReviewAlertText = page.getByText(text.successReviewAlertText);

    }

    // Actions

    @step('Serch for product: {0}')
    async searchForProduct(productName: string): Promise<void> {
        await this.searchInput.fill(productName);
        await this.searchBtn.click();
    }

    @step('Check that the searched product title is visible')
    async searchedProductsTitlePresent(): Promise<void> {
        await expect(this.searchedProductsTitle).toHaveText(text.searchedProductsTitle);
    }


    @step('Click on the first product in the list')
    async clickFirstProduct(): Promise<void> {
        await this.firstProduct.click();
        await this.expectUrl('/product_details/1');
    }

    @step('Increase product quantity to: {0}')
    async increaseProductQtyTo(qty: string): Promise<void> {
        await this.productQty.fill(qty);
        await expect(this.productQty).toHaveValue(qty);
    }

    @step('Click on the "Add to cart" button')
    async addProductToCart(): Promise<void> {
        await this.addToCartBtn.click();
    }

    @step('Click on the {0} brand')
    async selectBrand(brand: Brand): Promise<void> {
        await this.brands.selectBrand(brand)
    }

    @step('Fill the review form with: {0}, {1}, {2}')
    async writeReview(name: string, email: string, message: string): Promise<void> {
        await this.reviewNameInput.fill(name);
        await this.reviewEmailInput.fill(email);
        await this.reviewTextInput.fill(message);
    }

    @step('Click on the "Submit review" button')
    async submitReview(): Promise<void> {
        await this.submitReviewBtn.click();
    }

    // Assertions
    @step('Check that the product data is visible')
    async checkProductInfo(): Promise<void> {
        await expect(this.productName).toBeVisible();
        await expect(this.productCategory).toBeVisible();
        await expect(this.productPrice).toBeVisible();
        await expect(this.productAvailability).toBeVisible();
        await expect(this.productCondition).toBeVisible();
        await expect(this.productBrand).toBeVisible();
    }

    @step('Check that the searched products count is equal to {0}')
    async checkProductsCount(count: number): Promise<void> {
        await expect(this.searchedProductCount).toHaveCount(count);
    }

    @step('Check that the searched product name is equal to {0}')
    async checkSearchOutput(productName: RegExp): Promise<void> {
        await expect(this.searchResults).toContainText(productName);
    }

    @step('Check that the page url is /products')
    async checkAllProductsSelected(): Promise<void> {
        await this.expectUrl('/products');
    }

    @step('Check that the expected sections are visible')
    async expectedSections(): Promise<void> {
        await expect(this.centerTitle).toBeVisible();
        await expect(this.saleBanner).toBeVisible();
    }

    @step('Check that the product count is equal to {0}')
    async allProductsPresent(count: number): Promise<void> {
        await expect(this.singleProduct).toHaveCount(count);
    }

    @step('Check that the product is visible')
    async productIsVisible(): Promise<void> {
        await expect(this.singleProduct.first()).toBeVisible();
    }

    @step('Check that the filter applied')
    async checkFilterApplied(categoryId: string): Promise<void> {
        await this.expectUrl('/category_products/' + categoryId);
        await expect(this.womenDressCategoryTitle).toBeVisible();
    }

    @step('Check that the brands are filtered')
    async checkBrandsFiltering(expectedNames: string[]): Promise<void> {
        const actualNames = (await this.productNames.allTextContents());

        expect(actualNames.sort()).toEqual([...expectedNames].sort());
    }

    @step('Check that the review title is visible')
    async checkReviewTitle(): Promise<void> {
        await expect(this.writeReviewTitle).toBeVisible();

    }

    @step('Check that the successful review alert is present')
    async verifySuccessReviewAlert(): Promise<void> {
        await expect(this.successReviewAlertText).toBeVisible();
    }

}