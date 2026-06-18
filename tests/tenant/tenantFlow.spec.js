import { test, expect } from '@playwright/test';

let page;
let tenantPage;

const timestamp = Date.now();

const extensionNumber = `6${timestamp.toString().slice(-5)}`;
const extensionName = `EXT${timestamp}`;
const email = `ext${timestamp}@testmail.com`;

test.describe.serial('Kaleyra Tenant Complete Flow', () => {

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        console.log('Starting Tenant Flow');
    });

    test.afterAll(async () => {
        await tenantPage?.close();
        await page?.close();
        console.log('Tenant Flow Completed');
    });

    test('Admin Login', async () => {

        await page.goto('https://adminqa.ecosmob.net:3006/login');

        await page.getByRole('textbox', { name: '*Email ID' })
            .fill('rohini.kamble@ecosmob.com');

        await page.getByRole('textbox', { name: '*Password' })
            .fill('Admin@123');

        await page.getByRole('button', { name: 'Sign-in' }).click();

        await page.waitForLoadState('networkidle');

        console.log('Admin Login Successful');
    });

    test('Open Tenant Module', async () => {

        await page.getByText('Tenant', { exact: true }).click();

        await page.waitForTimeout(1000);

        console.log('Tenant Module Opened');
    });

    test('Open Tenant Login', async () => {

    await page.waitForLoadState('networkidle');

    // Open Search Panel

    await page.locator(
        "//span[contains(@class,'MuiAccordionSummary-content')]"
    ).click();

    // Wait for Search Field

    await expect(
        page.locator("//input[@id='name']")
    ).toBeVisible({
        timeout: 30000
    });

    // Search Tenant096

    await page.locator("//input[@id='name']")
        .fill('TENANT096');

    await page.locator("//button[@type='submit']")
        .click();

    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(3000);

    console.log('Tenant096 Found');

    // Locate Login Icon

    const loginIcon =
        page.getByTestId('ArrowCircleRightIcon')
            .first();

    await expect(loginIcon)
        .toBeVisible({
            timeout: 30000
        });

    // Open Popup

    const [tenantPopup] =
        await Promise.all([

            page.waitForEvent('popup', {
                timeout: 60000
            }),

            loginIcon.click()

        ]);

    tenantPage = tenantPopup;

    await tenantPage.waitForLoadState(
        'networkidle'
    );

    console.log('Tenant Login Opened');
});

    test('Open Telephony Module', async () => {

        await tenantPage.getByRole('link', {
            name: 'radio_button_unchecked'
        }).click();

        await tenantPage.getByText('perm_identity Telephony').click();

        console.log('Telephony Module Opened');
    });

    test('Open Extensions Module', async () => {

        await tenantPage.getByRole('link', {
            name: 'Extensions'
        }).click();

        console.log('Extensions Page Opened');
    });

    test('Open Add Extension Page', async () => {

        await tenantPage.getByRole('link', {
            name: 'Add New'
        }).click();

        console.log('Add Extension Page Opened');
    });

    test('Fill Basic Extension Details', async () => {

        await tenantPage.getByRole('textbox', {
            name: 'Extension Number *'
        }).fill(extensionNumber);

        await tenantPage.getByRole('textbox', {
            name: 'Extension Name *'
        }).fill(extensionName);

        await tenantPage.getByRole('textbox', {
            name: 'Email *'
        }).fill(email);

        console.log('Basic Details Filled');
    });

    test('Select Group Language Timezone', async () => {

        await tenantPage.getByRole('textbox', {
            name: '-- Select Group --'
        }).click();

        await tenantPage.getByRole('treeitem', {
            name: 'grp1'
        }).click();

        await tenantPage.getByRole('textbox', {
            name: '-- Select Language --'
        }).click();

        await tenantPage.getByRole('treeitem', {
            name: 'English'
        }).click();

        await tenantPage.getByRole('textbox', {
            name: '-- Select Timezone --'
        }).click();

        await tenantPage.locator('input[type="search"]').nth(2)
            .fill('asia/kol');

        await tenantPage.getByRole('treeitem', {
            name: 'Asia/Kolkata'
        }).click();

        console.log('Group Language Timezone Selected');
    });

    test('Fill Call Settings', async () => {

        await tenantPage.mouse.wheel(0, 1200);

        await tenantPage.getByText('Call Settings').click();

        await tenantPage.getByRole('textbox', {
            name: 'Simultaneous External Call *'
        }).fill('3');

        await tenantPage.getByRole('textbox', {
            name: 'SIP Password'
        }).fill('Admin@123');

        await tenantPage.locator(
            '#select2-callsettings-ecs_dial_out-container'
        ).click();

        await tenantPage.getByRole('treeitem', {
            name: 'Inactive'
        }).click();

        console.log('Call Settings Filled');
    });

    test('Create Extension', async () => {

        await tenantPage.getByRole('button', {
            name: 'Create'
        }).click();

        await tenantPage.waitForLoadState('networkidle');

        console.log('Extension Created');
    });

    // ✅ FIXED: NO getByText (strict-mode safe)
    test('Verify Extension Creation', async () => {

        const createdRow = tenantPage.locator('tr').filter({
            hasText: extensionNumber
        });

        await expect(createdRow).toBeVisible({
            timeout: 15000
        });

        console.log(`Extension ${extensionNumber} Created Successfully`);
    });

    test('Search Created Extension', async () => {

        console.log(`Searching Extension ${extensionNumber}`);

        await tenantPage.waitForURL(/extension.*index/, {
            timeout: 30000
        });

        console.log('Current URL:', await tenantPage.url());

        const searchAccordion = tenantPage.locator(
            "//div[@class='collapsible-header']"
        );

        await searchAccordion.scrollIntoViewIfNeeded();
        await searchAccordion.click();

        console.log('Search Accordion Opened');

        const extensionNumberField =
            tenantPage.getByRole('textbox', {
                name: 'Extension Number'
            });

        await expect(extensionNumberField).toBeVisible({
            timeout: 30000
        });

        const extensionNameField =
            tenantPage.getByRole('textbox', {
                name: 'Extension Name'
            });

        if (await extensionNameField.isVisible().catch(() => false)) {
            await extensionNameField.fill('');
        }

        await extensionNumberField.fill(extensionNumber);

        console.log(`Entered Extension Number: ${extensionNumber}`);

        const searchButton = tenantPage.getByRole('button', {
            name: /^Search$/
        });

        await expect(searchButton).toBeVisible({
            timeout: 30000
        });

        await searchButton.click();

        await tenantPage.waitForLoadState('networkidle');
        await tenantPage.waitForTimeout(2000);

        // ✅ FIXED: stable locator instead of strict getByText
        const searchedRow = tenantPage.locator('tr').filter({
            hasText: extensionNumber
        });

        await expect(searchedRow).toBeVisible({
            timeout: 30000
        });

        console.log(`Extension ${extensionNumber} found successfully`);
    });
});